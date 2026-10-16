import { useSyncExternalStore } from "react";

export const STATUSES = ["Not started", "In progress", "Done"] as const;
export type Status = (typeof STATUSES)[number];

export interface Project {
  id: string;
  name: string;
  brand: string;
  status: Status;
  /** UPC-A digits as entered or imported; may be invalid. */
  barcode: string;
  /** Every other spreadsheet column, keyed by its original header. */
  metadata: Record<string, string>;
  createdAt: string;
}

export type NewProject = Pick<Project, "name" | "brand" | "barcode" | "metadata"> & {
  status?: Status;
};

export function brandSlug(brand: string): string {
  return (
    brand
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "unbranded"
  );
}

/** Metadata columns across projects, in order of first appearance. */
export function metadataColumns(projects: readonly Project[]): string[] {
  const seen = new Set<string>();
  for (const p of projects) for (const key of Object.keys(p.metadata)) seen.add(key);
  return [...seen];
}

// ---------------------------------------------------------------------------
// Store. Projects live in this browser's localStorage for now; swap this
// section for a database (e.g. Supabase) without touching the UI.

const STORAGE_KEY = "nfwe:projects:v1";
const listeners = new Set<() => void>();
let cache: Project[] | undefined;

function load(): Project[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Project[];
  } catch {
    cache = [];
  }
  return cache;
}

function save(next: Project[]) {
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

/** All projects, newest first. `null` until loaded in the browser. */
export function useProjects(): Project[] | null {
  return useSyncExternalStore(subscribe, load, () => null);
}

export function addProjects(items: readonly NewProject[]): Project[] {
  const now = new Date().toISOString();
  const created = items.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
    status: item.status ?? "Not started",
    createdAt: now,
  }));
  save([...created, ...load()]);
  return created;
}

export function updateProject(id: string, patch: Partial<Omit<Project, "id">>) {
  save(load().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

export function deleteProject(id: string) {
  save(load().filter((p) => p.id !== id));
}
