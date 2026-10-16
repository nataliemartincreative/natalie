import { read, utils } from "@e965/xlsx";
import {
  brandDisplayName,
  type Dims,
  type ProjectInput,
  type PurchaseOrderInput,
  type Status,
} from "./projects";
import { normalizeUpcA } from "./upc";

export const IMPORT_ACCEPT = ".xls,.xlsx,.xlsm,.csv";

type Field = "styleNumber" | "name" | "shortDescription" | "brand" | "barcode" | "status";

export interface ImportResult {
  fileName: string;
  sheetName: string;
  projects: ProjectInput[];
  /** Present when the sheet has a header block (factory, quote date, PO #…). */
  purchaseOrder?: PurchaseOrderInput;
  /** Which spreadsheet column fed each field. */
  mapping: Partial<Record<Field | "dimensions", string>>;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const clean = (s: unknown) => String(s ?? "").replace(/\s+/g, " ").trim().replace(/:$/, "").trim();

// Normalized column labels for each field. A two-row header is matched on its
// top label (group) and, where given, its sub-label.
const FIELD_GROUPS: Record<Exclude<Field, "shortDescription">, string[]> = {
  styleNumber: ["stylenumber", "styleno", "style", "sku", "itemnumber", "itemno", "modelnumber", "model"],
  barcode: ["upca", "upc", "upccode", "barcode", "gtin", "ean"],
  brand: ["labelbrand", "brandname", "brand"],
  status: ["status", "stage"],
  name: ["productname", "projectname", "itemname", "name", "title", "description", "productdescription", "product"],
};

interface Column {
  index: number;
  group: string;
  sub: string;
  label: string;
}

/** Index of the header row: the first row naming at least two known fields. */
function findHeaderRow(rows: string[][]): number {
  const known = new Set(Object.values(FIELD_GROUPS).flat());
  const limit = Math.min(rows.length, 60);
  for (let r = 0; r < limit; r++) {
    const hits = rows[r].filter((c) => known.has(norm(clean(c)))).length;
    if (hits >= 2) return r;
  }
  return rows.findIndex((row) => row.some((c) => clean(c)));
}

/** A second header row holds units or sub-labels ("L (CM)", "USD") rather than data. */
function isSubHeader(header: string[], next: string[] | undefined): boolean {
  if (!next) return false;
  const cells = next.map(clean);
  const filled = cells.filter(Boolean);
  if (filled.length < 2) return false;
  const underBlank = cells.some((c, i) => c && !clean(header[i]));
  const unitLike = filled.filter((c) => /\((cm|in|inches)\)|^(usd|pcs|ctns|kg|grams?|ml|oz|qt|cbm)$/i.test(c)).length;
  const numeric = filled.filter((c) => /^[$\d.,%\s-]+$/.test(c)).length;
  return numeric === 0 && (underBlank || unitLike >= 2);
}

function buildColumns(header: string[], sub: string[] | undefined): Column[] {
  const width = Math.max(header.length, sub?.length ?? 0);
  const columns: Column[] = [];
  let group = "";
  for (let i = 0; i < width; i++) {
    const top = clean(header[i]);
    const below = clean(sub?.[i]);
    // A blank top cell under a merged header continues the group to its left.
    if (top) group = top;
    else if (!below) group = "";
    const g = top || (below ? group : "");
    if (!g && !below) continue;
    columns.push({ index: i, group: g, sub: below, label: [g, below].filter(Boolean).join(" · ") });
  }
  return columns;
}

function findField(columns: Column[], field: Exclude<Field, "shortDescription">, taken: Set<number>) {
  const candidates = FIELD_GROUPS[field];
  const free = columns.filter((c) => !taken.has(c.index));
  for (const candidate of candidates) {
    const hit = free.find((c) => norm(c.group) === candidate && (!c.sub || /long/i.test(c.sub)));
    if (hit) return hit;
  }
  return undefined;
}

const DIM_SUB = /^([LWH])\s*\((cm|in|inch|inches)\)$/i;
const isCartonGroup = (g: string) => /ctn|carton|master|inner/i.test(g);

function toStatus(value: string): Status {
  const v = value.toLowerCase();
  if (/done|complete|finished|shipped|live/.test(v)) return "Done";
  if (/progress|active|working|started|review/.test(v)) return "In progress";
  return "Not started";
}

/** "FACTORY NAME:" → value pairs from the rows above the table. */
function readHeaderBlock(rows: string[][]): Record<string, string> {
  const details: Record<string, string> = {};
  for (const row of rows) {
    const cells = row.map((c) => String(c ?? "").trim());
    const k = cells.findIndex((c) => c.endsWith(":"));
    if (k === -1) continue;
    const key = clean(cells[k]);
    details[key] = cells.slice(k + 1).find(Boolean) ?? "";
  }
  return details;
}

function purchaseOrderName(details: Record<string, string>, fileName: string): string {
  const entries = Object.entries(details);
  const find = (re: RegExp) => entries.find(([k, v]) => re.test(k) && v)?.[1];
  const po = find(/(^|\s)po\s*#|po number|purchase order/i);
  if (po) return `PO ${po}`;
  const factory = find(/factory name|vendor|supplier/i);
  const date = find(/quote date|order date|date/i);
  if (factory) return [factory.replace(/\s*co\.?,?\s*ltd\.?$/i, ""), date].filter(Boolean).join(" · ");
  return fileName.replace(/\.[^.]+$/, "");
}

/**
 * Reads the first sheet of a spreadsheet as projects, one per row. Handles
 * plain tables and vendor forms with a header block (which becomes the
 * purchase order) and two-row headers. Values are kept exactly as displayed
 * in Excel. Runs entirely in the browser.
 */
export async function importProjects(file: File): Promise<ImportResult> {
  const workbook = read(await file.arrayBuffer());
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("That file has no sheets.");
  const sheet = workbook.Sheets[sheetName];

  // Keep blank rows so the two reads line up by index. Formatted text keeps
  // values as shown in Excel; raw values recover barcodes stored as numbers.
  const options = { header: 1, defval: "", blankrows: true } as const;
  const text = utils.sheet_to_json<string[]>(sheet, { ...options, raw: false });
  const raw = utils.sheet_to_json<unknown[]>(sheet, { ...options, raw: true });

  const headerRow = findHeaderRow(text);
  if (headerRow === -1) throw new Error("The first sheet is empty.");
  const hasSub = isSubHeader(text[headerRow], text[headerRow + 1]);
  const columns = buildColumns(text[headerRow], hasSub ? text[headerRow + 1] : undefined);
  const firstDataRow = headerRow + (hasSub ? 2 : 1);

  const taken = new Set<number>();
  const fields: Partial<Record<Field, Column>> = {};
  for (const field of ["styleNumber", "barcode", "brand", "status", "name"] as const) {
    const column = findField(columns, field, taken);
    if (column) {
      fields[field] = column;
      taken.add(column.index);
    }
  }
  const short = columns.find((c) => !taken.has(c.index) && /^short\s*desc/i.test(c.sub || c.group));
  if (short) {
    fields.shortDescription = short;
    taken.add(short.index);
  }

  const dimColumns = columns.filter((c) => DIM_SUB.test(c.sub) && !isCartonGroup(c.group));
  for (const c of dimColumns) taken.add(c.index);

  if (!fields.name && !fields.styleNumber && !fields.barcode) {
    const first = columns.find((c) => !taken.has(c.index));
    if (first) {
      fields.name = first;
      taken.add(first.index);
    }
  }

  const cell = (row: unknown[] | undefined, column?: Column) =>
    column ? String(row?.[column.index] ?? "").trim() : "";

  const projects: ProjectInput[] = [];
  for (let r = firstDataRow; r < text.length; r++) {
    const row = text[r];
    const styleNumber = cell(row, fields.styleNumber);
    const name = cell(row, fields.name);
    const barcodeText = cell(row, fields.barcode);
    // Skip blank rows and summary rows (totals) that name no product.
    if (!styleNumber && !name && !barcodeText) continue;

    const rawBarcode = fields.barcode ? raw[r]?.[fields.barcode.index] : undefined;
    const barcode = normalizeUpcA(
      typeof rawBarcode === "number" ? Math.round(rawBarcode).toString() : barcodeText,
    );

    const dimensions: ProjectInput["dimensions"] = {};
    for (const c of dimColumns) {
      const [, axis, unit] = c.sub.match(DIM_SUB)!;
      const key = unit.toLowerCase() === "cm" ? "cm" : "in";
      const dims: Dims = (dimensions[key] ??= { l: "", w: "", h: "" });
      dims[axis.toLowerCase() as keyof Dims] = cell(row, c);
    }

    const details: Record<string, string> = {};
    for (const c of columns) {
      const value = cell(row, c);
      if (!taken.has(c.index) && value) details[c.label] = value;
    }

    const shortDescription = cell(row, fields.shortDescription);
    projects.push({
      styleNumber,
      name: name || shortDescription || (styleNumber ? `Style ${styleNumber}` : "Untitled project"),
      shortDescription,
      brand: brandDisplayName(cell(row, fields.brand)),
      barcode,
      status: fields.status ? toStatus(cell(row, fields.status)) : undefined,
      dimensions,
      details,
    });
  }
  if (projects.length === 0) throw new Error("No project rows found under the header.");

  const mapping: ImportResult["mapping"] = {};
  for (const [field, column] of Object.entries(fields)) mapping[field as Field] = column.label;
  if (dimColumns.length) mapping.dimensions = [...new Set(dimColumns.map((c) => c.group))].join(" + ");

  const headerBlock = readHeaderBlock(text.slice(0, headerRow));
  const purchaseOrder = Object.keys(headerBlock).length
    ? { name: purchaseOrderName(headerBlock, file.name), details: headerBlock, sourceFile: file.name }
    : undefined;

  return { fileName: file.name, sheetName, projects, purchaseOrder, mapping };
}
