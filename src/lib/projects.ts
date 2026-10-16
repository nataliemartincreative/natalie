import { useSyncExternalStore } from "react";
import type { BrandCandidate, BrandElements } from "./brand-types";

export const STATUSES = ["Not started", "In progress", "Done"] as const;
export type Status = (typeof STATUSES)[number];

/** L × W × H exactly as written in the source spreadsheet. */
export interface Dims {
  l: string;
  w: string;
  h: string;
}

export interface PurchaseOrder {
  id: string;
  name: string;
  /** Header-block fields from the spreadsheet (factory, quote date, PO #…), in order. */
  details: Record<string, string>;
  sourceFile: string;
  createdAt: string;
  updatedAt: string;
}

export interface DielineFile {
  fileName: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface Project {
  /** The style number when there is one, so URLs read /projects/101243. */
  id: string;
  styleNumber: string;
  name: string;
  shortDescription: string;
  brand: string;
  status: Status;
  /** UPC-A digits as entered or imported; may be invalid. */
  barcode: string;
  purchaseOrderId?: string;
  dimensions: { cm?: Dims; in?: Dims };
  /** Every other spreadsheet column, keyed by its header label, values verbatim. */
  details: Record<string, string>;
  dieline?: DielineFile;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  slug: string;
  name: string;
  /** new: just seen on an import; confirmed: website chosen; skipped: not researched. */
  status: "new" | "confirmed" | "skipped";
  candidates?: BrandCandidate[];
  /** A web search for candidates is running. */
  researching?: boolean;
  researchError?: string;
  website?: string;
  elements?: BrandElements;
  updatedAt: string;
}

export type ProjectInput = Pick<
  Project,
  "styleNumber" | "name" | "shortDescription" | "brand" | "barcode" | "dimensions" | "details"
> & { status?: Status; purchaseOrderId?: string };

export type PurchaseOrderInput = Pick<PurchaseOrder, "name" | "details" | "sourceFile">;

export function slugify(text: string, fallback = "untitled"): string {
  return (
    text
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || fallback
  );
}

export const brandSlug = (brand: string) => slugify(brand, "unbranded");

/**
 * "OASIS_HOME" → "Oasis Home", "ALTA" → "Alta". Names already in mixed case
 * are kept as written.
 */
export function brandDisplayName(raw: string): string {
  const name = raw.trim().replace(/_+/g, " ").replace(/\s+/g, " ");
  if (name !== name.toUpperCase()) return name;
  return name.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
}

/** Detail columns across projects, in order of first appearance. */
export function detailColumns(projects: readonly Project[]): string[] {
  const seen = new Set<string>();
  for (const p of projects) for (const key of Object.keys(p.details)) seen.add(key);
  return [...seen];
}

export const formatDims = (d: Dims | undefined, unit: string) =>
  d && (d.l || d.w || d.h) ? `${d.l} × ${d.w} × ${d.h} ${unit}` : "";

// ---------------------------------------------------------------------------
// Store. Data lives in this browser's localStorage for now; swap this section
// for a database (e.g. Supabase) without touching the UI.

interface State {
  projects: Project[];
  purchaseOrders: PurchaseOrder[];
  brands: Brand[];
}

const STORAGE_KEY = "nfwe:data:v2";
const EMPTY: State = { projects: [], purchaseOrders: [], brands: [] };
const listeners = new Set<() => void>();
let cache: State | undefined;

function load(): State {
  if (cache) return cache;
  try {
    cache = { ...EMPTY, ...(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") ?? {}) };
  } catch {
    cache = EMPTY;
  }
  return cache!;
}

function save(next: State) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota exceeded or storage blocked: keep working in memory.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cache = undefined; // Another tab changed it.
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** `null` until loaded in the browser. */
function useStore(): State | null {
  return useSyncExternalStore(subscribe, load, () => null);
}

/** All projects, newest first. */
export const useProjects = () => useStore()?.projects ?? null;
export const usePurchaseOrders = () => useStore()?.purchaseOrders ?? null;
export const useBrands = () => useStore()?.brands ?? null;

function uniqueId(base: string, taken: Set<string>): string {
  let id = slugify(base, "project");
  for (let n = 2; taken.has(id); n++) id = `${slugify(base, "project")}-${n}`;
  return id;
}

export interface ImportOutcome {
  purchaseOrder?: PurchaseOrder;
  created: number;
  updated: number;
  /** Brands seen for the first time, which should be researched. */
  newBrands: Brand[];
}

/**
 * Adds or updates projects. A project whose style number already exists is
 * updated in place, keeping its status, dieline and URL.
 */
export function upsertProjects(
  inputs: readonly ProjectInput[],
  purchaseOrder?: PurchaseOrderInput,
): ImportOutcome {
  const state = load();
  const now = new Date().toISOString();
  let purchaseOrders = state.purchaseOrders;
  let po: PurchaseOrder | undefined;

  if (purchaseOrder) {
    const id = slugify(purchaseOrder.name, "purchase-order");
    const existing = purchaseOrders.find((p) => p.id === id);
    po = existing
      ? { ...existing, ...purchaseOrder, updatedAt: now }
      : { ...purchaseOrder, id, createdAt: now, updatedAt: now };
    purchaseOrders = existing
      ? purchaseOrders.map((p) => (p.id === id ? po! : p))
      : [po, ...purchaseOrders];
  }

  const projects = [...state.projects];
  const ids = new Set(projects.map((p) => p.id));
  let created = 0;
  let updated = 0;
  const fresh: Project[] = [];

  for (const input of inputs) {
    const withPo = po ? { ...input, purchaseOrderId: po.id } : input;
    const index = input.styleNumber
      ? projects.findIndex((p) => p.styleNumber === input.styleNumber)
      : -1;
    if (index !== -1) {
      const { status, ...rest } = withPo;
      projects[index] = {
        ...projects[index],
        ...rest,
        status: status ?? projects[index].status,
        updatedAt: now,
      };
      updated++;
    } else {
      const id = uniqueId(input.styleNumber || crypto.randomUUID().slice(0, 8), ids);
      ids.add(id);
      fresh.push({ ...withPo, id, status: input.status ?? "Not started", createdAt: now, updatedAt: now });
      created++;
    }
  }

  const known = new Set(state.brands.map((b) => b.slug));
  const newBrands: Brand[] = [];
  for (const { brand } of inputs) {
    const slug = brandSlug(brand);
    if (!brand || known.has(slug)) continue;
    known.add(slug);
    newBrands.push({ slug, name: brand, status: "new", updatedAt: now });
  }

  save({ projects: [...fresh, ...projects], purchaseOrders, brands: [...state.brands, ...newBrands] });
  return { purchaseOrder: po, created, updated, newBrands };
}

export function updateProject(id: string, patch: Partial<Omit<Project, "id">>) {
  const state = load();
  save({
    ...state,
    projects: state.projects.map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
    ),
  });
}

/** Creates the brand record if needed, then applies the patch. */
export function updateBrand(name: string, patch: Partial<Omit<Brand, "slug">>) {
  const state = load();
  const slug = brandSlug(name);
  const now = new Date().toISOString();
  const exists = state.brands.some((b) => b.slug === slug);
  const brands = exists
    ? state.brands.map((b) => (b.slug === slug ? { ...b, ...patch, updatedAt: now } : b))
    : [...state.brands, { slug, name, status: "new" as const, ...patch, updatedAt: now }];
  save({ ...state, brands });
}

/** Context for brand research: what this brand's products are. */
export type HintSource = Pick<Project, "brand" | "name" | "details">;

export function brandHints(projects: readonly HintSource[], brand: string): string[] {
  const mine = projects.filter((p) => p.brand === brand);
  const pick = (re: RegExp) =>
    [...new Set(mine.flatMap((p) => Object.entries(p.details).filter(([k]) => re.test(k)).map(([, v]) => v)))];
  const hints = [
    ...pick(/^categor|sub-?categor/i).slice(0, 4).map((c) => `Category: ${c.replace(/_/g, " ").toLowerCase()}`),
    ...mine.slice(0, 5).map((p) => `Product: ${p.name}`),
    ...pick(/material/i).slice(0, 2).map((m) => `Material: ${m}`),
  ];
  return hints;
}

export function deleteProject(id: string) {
  const state = load();
  save({ ...state, projects: state.projects.filter((p) => p.id !== id) });
}
