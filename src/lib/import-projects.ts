import { read, utils } from "@e965/xlsx";
import type { NewProject, Status } from "./projects";
import { normalizeUpcA } from "./upc";

export const IMPORT_ACCEPT = ".xls,.xlsx,.xlsm,.csv";

type Field = "name" | "brand" | "barcode" | "status";

// Header names (lowercased, letters and digits only) that map to each field,
// most specific first.
const FIELD_HEADERS: Record<Field, string[]> = {
  brand: ["labelbrand", "brandname", "brand", "label"],
  name: ["productname", "projectname", "itemname", "name", "title", "product", "item"],
  barcode: ["upca", "upc", "upccode", "barcode", "gtin", "ean"],
  status: ["status", "stage"],
};
// Too generic to match inside longer headers ("ean" in "Ocean Blue").
const EXACT_ONLY = new Set(["ean", "label", "item", "name", "title", "stage"]);

export interface ImportResult {
  fileName: string;
  sheetName: string;
  projects: NewProject[];
  /** Which spreadsheet header fed each field. */
  mapping: Partial<Record<Field, string>>;
}

const normalizeHeader = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, "");

function findColumn(headers: string[], field: Field, taken: Set<number>): number {
  const keys = headers.map(normalizeHeader);
  for (const candidate of FIELD_HEADERS[field]) {
    const exact = keys.findIndex((k, i) => !taken.has(i) && k === candidate);
    if (exact !== -1) return exact;
  }
  for (const candidate of FIELD_HEADERS[field]) {
    if (EXACT_ONLY.has(candidate)) continue;
    const partial = keys.findIndex((k, i) => !taken.has(i) && k.includes(candidate));
    if (partial !== -1) return partial;
  }
  return -1;
}

function toStatus(value: string): Status {
  const v = value.toLowerCase();
  if (/done|complete|finished|shipped|live/.test(v)) return "Done";
  if (/progress|active|working|started|review/.test(v)) return "In progress";
  return "Not started";
}

function uniqueHeaders(row: unknown[]): string[] {
  const seen = new Map<string, number>();
  return row.map((cell, i) => {
    const base = String(cell ?? "").trim() || `Column ${i + 1}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base} (${n})`;
  });
}

/**
 * Reads the first sheet of a spreadsheet: one project per row, headers in the
 * first row. Name, brand, barcode and status are detected from the headers;
 * every other column becomes project metadata. Runs entirely in the browser.
 */
export async function importProjects(file: File): Promise<ImportResult> {
  const workbook = read(await file.arrayBuffer());
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("That file has no sheets.");
  const sheet = workbook.Sheets[sheetName];

  const options = { header: 1, defval: "", blankrows: false } as const;
  // Formatted text for display ("$4.99", "1/2/26"), raw values for barcodes,
  // which Excel often formats as "3.6E+10".
  const text = utils.sheet_to_json<string[]>(sheet, { ...options, raw: false });
  const raw = utils.sheet_to_json<unknown[]>(sheet, { ...options, raw: true });
  if (text.length < 2) throw new Error("Add a header row and at least one project row.");

  const headers = uniqueHeaders(text[0]);
  const taken = new Set<number>();
  const columns = {} as Record<Field, number>;
  for (const field of ["brand", "barcode", "status", "name"] as const) {
    columns[field] = findColumn(headers, field, taken);
    if (columns[field] !== -1) taken.add(columns[field]);
  }
  // No obvious name column: use the first column not claimed by another field.
  if (columns.name === -1) {
    columns.name = headers.findIndex((_, i) => !taken.has(i));
    if (columns.name !== -1) taken.add(columns.name);
  }

  const cell = (row: unknown[] | undefined, i: number) =>
    i === -1 ? "" : String(row?.[i] ?? "").trim();

  const projects: NewProject[] = [];
  text.slice(1).forEach((row, r) => {
    if (row.every((v) => String(v).trim() === "")) return;
    const rawRow = raw[r + 1];
    const rawBarcode = rawRow?.[columns.barcode];

    const metadata: Record<string, string> = {};
    headers.forEach((header, i) => {
      const value = cell(row, i);
      if (!taken.has(i) && value) metadata[header] = value;
    });

    projects.push({
      name: cell(row, columns.name) || "Untitled project",
      brand: cell(row, columns.brand),
      barcode: normalizeUpcA(
        typeof rawBarcode === "number" ? Math.round(rawBarcode).toString() : cell(row, columns.barcode),
      ),
      status: columns.status === -1 ? undefined : toStatus(cell(row, columns.status)),
      metadata,
    });
  });

  const mapping: ImportResult["mapping"] = {};
  for (const field of Object.keys(columns) as Field[]) {
    if (columns[field] !== -1) mapping[field] = headers[columns[field]];
  }

  return { fileName: file.name, sheetName, projects, mapping };
}
