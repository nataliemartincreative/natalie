import type { BrandCandidate, BrandElements } from "./brand-types";
import { brandHints, updateBrand, type HintSource } from "./projects";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? `Request failed (${response.status}).`);
  return data as T;
}

/**
 * Searches the web for brands with this name. Progress and results are kept
 * on the brand record, so the search survives navigating away.
 */
export async function searchBrand(name: string, projects: readonly HintSource[]) {
  updateBrand(name, { researching: true, researchError: undefined });
  try {
    const { candidates } = await postJson<{ candidates: BrandCandidate[] }>("/api/brands/research", {
      name,
      hints: brandHints(projects, name),
    });
    updateBrand(name, { researching: false, candidates });
  } catch (error) {
    updateBrand(name, {
      researching: false,
      researchError: error instanceof Error ? error.message : "Search failed.",
    });
  }
}

/** Reads the chosen website's logo, colors and fonts onto the brand. */
export async function confirmBrandWebsite(name: string, website: string) {
  const elements = await postJson<BrandElements>("/api/brands/elements", { url: website });
  updateBrand(name, { status: "confirmed", website: elements.url, elements });
}
