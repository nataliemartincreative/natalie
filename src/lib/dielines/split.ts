/**
 * Splits a sheet of dielines (one PDF, many dielines laid out with space
 * between them) into one vector PDF per dieline. Browser-only.
 *
 * Regions are found by rendering each page and cutting along empty rows,
 * then empty columns within each row (a one-level XY cut), which fits the
 * usual factory layout of dielines stacked or tiled on a big artboard.
 */
import { PDFDocument } from "pdf-lib";

/** A region in PDF points, origin at the page's bottom-left. */
export interface PdfBox {
  left: number;
  bottom: number;
  right: number;
  top: number;
}

export interface DetectedDieline {
  index: number;
  pageIndex: number;
  box: PdfBox;
  /** JPEG data URL, sized for display and for reading labels. */
  image: string;
}

const DETECT_WIDTH = 2400; // px the whole page is rendered at for detection
const READ_WIDTH = 1568; // px per region: the largest Claude reads without downscaling
const INK = 225; // luminance below this counts as ink

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc ||= new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  return pdfjs;
}

/** Runs of `true` in a profile, merging runs separated by gaps under `minGap`. */
function runs(profile: boolean[], minGap: number): [number, number][] {
  const out: [number, number][] = [];
  let start = -1;
  let lastInk = -1;
  profile.forEach((ink, i) => {
    if (!ink) return;
    if (start === -1) start = i;
    else if (i - lastInk > minGap) {
      out.push([start, lastInk]);
      start = i;
    }
    lastInk = i;
  });
  if (start !== -1) out.push([start, lastInk]);
  return out;
}

interface PixelBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function findRegions(data: Uint8ClampedArray, width: number, height: number): PixelBox[] {
  const ink = new Uint8Array(width * height);
  for (let i = 0, p = 0; p < ink.length; i += 4, p++) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    ink[p] = data[i + 3] > 0 && lum < INK ? 1 : 0;
  }
  const rowHasInk = (y: number, x0 = 0, x1 = width - 1) => {
    for (let x = x0; x <= x1; x++) if (ink[y * width + x]) return true;
    return false;
  };
  const colHasInk = (x: number, y0: number, y1: number) => {
    for (let y = y0; y <= y1; y++) if (ink[y * width + x]) return true;
    return false;
  };

  const rowGap = Math.max(8, Math.round(height * 0.015));
  const colGap = Math.max(8, Math.round(width * 0.03));
  const regions: PixelBox[] = [];
  for (const [y0, y1] of runs(Array.from({ length: height }, (_, y) => rowHasInk(y)), rowGap)) {
    const cols = Array.from({ length: width }, (_, x) => colHasInk(x, y0, y1));
    for (const [x0, x1] of runs(cols, colGap)) {
      // Tighten vertically to this column span.
      let top = y0;
      let bottom = y1;
      while (top < bottom && !rowHasInk(top, x0, x1)) top++;
      while (bottom > top && !rowHasInk(bottom, x0, x1)) bottom--;
      regions.push({ x0, y0: top, x1, y1: bottom });
    }
  }
  // Drop specks (stray marks, registration dots).
  const minArea = width * height * 0.002;
  return regions.filter((r) => (r.x1 - r.x0) * (r.y1 - r.y0) >= minArea);
}

function canvas(width: number, height: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(width));
  c.height = Math.max(1, Math.round(height));
  return c;
}

/** Finds every dieline in the PDF and renders an image of each. */
export async function detectDielines(bytes: ArrayBuffer): Promise<DetectedDieline[]> {
  const pdfjs = await loadPdfJs();
  const task = pdfjs.getDocument({ data: new Uint8Array(bytes.slice(0)) });
  const pdf = await task.promise;
  const found: DetectedDieline[] = [];

  for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex++) {
    const page = await pdf.getPage(pageIndex + 1);
    const base = page.getViewport({ scale: 1 });
    const scale = DETECT_WIDTH / base.width;
    const viewport = page.getViewport({ scale });
    const c = canvas(viewport.width, viewport.height);
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    await page.render({ canvas: c, canvasContext: ctx, viewport }).promise;

    const pad = Math.round(Math.min(c.width, c.height) * 0.01);
    for (const r of findRegions(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height)) {
      const px = {
        x0: Math.max(0, r.x0 - pad),
        y0: Math.max(0, r.y0 - pad),
        x1: Math.min(c.width, r.x1 + pad),
        y1: Math.min(c.height, r.y1 + pad),
      };
      // Viewport pixels → PDF points (bottom-left origin).
      const [vx0, vy0, vx1, vy1] = viewport.convertToPdfPoint(px.x0, px.y0).concat(viewport.convertToPdfPoint(px.x1, px.y1));
      const box: PdfBox = {
        left: Math.min(vx0, vx1),
        right: Math.max(vx0, vx1),
        bottom: Math.min(vy0, vy1),
        top: Math.max(vy0, vy1),
      };

      // Re-render just this region, sharp enough to read small labels.
      const regionWidth = (px.x1 - px.x0) / scale;
      const readScale = Math.min(4, READ_WIDTH / regionWidth);
      const regionViewport = page.getViewport({
        scale: readScale,
        offsetX: (-px.x0 / scale) * readScale,
        offsetY: (-px.y0 / scale) * readScale,
      });
      const rc = canvas(regionWidth * readScale, ((px.y1 - px.y0) / scale) * readScale);
      const rctx = rc.getContext("2d")!;
      rctx.fillStyle = "#fff";
      rctx.fillRect(0, 0, rc.width, rc.height);
      await page.render({ canvas: rc, canvasContext: rctx, viewport: regionViewport }).promise;

      found.push({ index: found.length, pageIndex, box, image: rc.toDataURL("image/jpeg", 0.88) });
    }
  }
  await task.destroy();
  return found;
}

/** Cuts one region out of the source PDF as its own vector PDF. */
export async function cropDieline(bytes: ArrayBuffer, pageIndex: number, box: PdfBox): Promise<Blob> {
  const source = await PDFDocument.load(bytes);
  const out = await PDFDocument.create();
  const [embedded] = await out.embedPages([source.getPage(pageIndex)], [box]);
  const page = out.addPage([box.right - box.left, box.top - box.bottom]);
  page.drawPage(embedded, { x: 0, y: 0 });
  out.setTitle("Dieline");
  out.setProducer("NFWE");
  const saved = await out.save();
  return new Blob([saved.slice().buffer as ArrayBuffer], { type: "application/pdf" });
}
