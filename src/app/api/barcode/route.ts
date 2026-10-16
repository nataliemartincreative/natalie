import bwipjs from "bwip-js/node";
import { parseUpcA } from "@/lib/upc";

/**
 * GET /api/barcode?code=03600029145&download=1
 * Returns a UPC-A barcode as SVG. `download=1` serves it as a file.
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = parseUpcA(searchParams.get("code") ?? "");

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  const svg = bwipjs.toSVG({
    bcid: "upca",
    text: result.code,
    includetext: true,
    scale: 3,
    paddingwidth: 8,
    paddingheight: 6,
    backgroundcolor: "FFFFFF",
  });

  const headers = new Headers({
    "Content-Type": "image/svg+xml",
    // The same code always produces the same image.
    "Cache-Control": "public, max-age=31536000, immutable",
  });
  if (searchParams.get("download") === "1") {
    headers.set("Content-Disposition", `attachment; filename="upc-a-${result.code}.svg"`);
  }

  return new Response(svg, { headers });
}
