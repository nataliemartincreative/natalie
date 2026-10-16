"use client";

import { useState, useTransition, type FormEvent } from "react";
import { confirmBrandWebsite, searchBrand } from "@/lib/brand-actions";
import type { BrandCandidate } from "@/lib/brand-types";
import { brandSlug, useBrands, useProjects } from "@/lib/projects";

const hostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const CONFIDENCE: Record<BrandCandidate["confidence"], string> = {
  high: "bg-emerald-700 text-white",
  medium: "bg-orange-500 text-white",
  low: "bg-ink/15 text-ink",
};

/**
 * Finds a brand on the web: lists every brand using the name, best match
 * first, and lets the user pick the right one (or paste a website). Picking
 * reads the site's logo, colors and fonts onto the brand.
 */
export function BrandResearch({ name, onDone }: { name: string; onDone?: () => void }) {
  const brand = useBrands()?.find((b) => b.slug === brandSlug(name));
  const projects = useProjects() ?? [];
  const [error, setError] = useState<string>();
  const [selected, setSelected] = useState<string>();
  const [reading, startRead] = useTransition();

  const candidates = brand?.candidates;
  const searching = !!brand?.researching;
  // Default to the best match until the user picks.
  const chosen = selected ?? candidates?.[0]?.website;
  const shownError = error ?? brand?.researchError;

  function search() {
    setError(undefined);
    setSelected(undefined);
    void searchBrand(name, projects);
  }

  function choose(website: string) {
    setError(undefined);
    startRead(async () => {
      try {
        await confirmBrandWebsite(name, website);
        onDone?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't read that site.");
      }
    });
  }

  function onManual(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const url = String(new FormData(e.currentTarget).get("url") ?? "").trim();
    if (url) choose(url);
  }

  const busy = searching || reading;

  return (
    <div className="grid gap-4">
      {searching ? (
        <p role="status" className="flex items-center gap-3 text-sm">
          <span className="size-4 animate-spin rounded-full border-2 border-ink/20 border-t-ink" aria-hidden />
          Searching the web for brands named “{name}”…
        </p>
      ) : candidates ? (
        candidates.length ? (
          <fieldset className="grid gap-2" disabled={busy}>
            <legend className="mb-2 text-sm text-ink-soft">
              Found {candidates.length} {candidates.length === 1 ? "brand" : "brands"} named “{name}”. Pick the one on
              these products.
            </legend>
            {candidates.map((c) => (
              <label
                key={c.website}
                className="flex cursor-pointer gap-3 rounded-xl border border-ink/15 bg-white/50 p-3 has-checked:border-ink has-checked:bg-white"
              >
                <input
                  type="radio"
                  name={`brand-${brandSlug(name)}`}
                  value={c.website}
                  checked={chosen === c.website}
                  onChange={() => setSelected(c.website)}
                  className="mt-1 accent-ink"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-xs text-ink-soft">{hostname(c.website)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${CONFIDENCE[c.confidence]}`}>
                      {c.confidence}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-sm">{c.description}</span>
                  <span className="mt-0.5 block text-xs text-ink-soft">{c.evidence}</span>
                </span>
              </label>
            ))}
          </fieldset>
        ) : (
          <p className="text-sm text-ink-soft">No brands named “{name}” turned up. Paste their website below.</p>
        )
      ) : (
        <p className="text-sm text-ink-soft">
          Search the web for “{name}”, then pick the right brand to bring its logo, colors and fonts in.
        </p>
      )}

      {shownError && !searching && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">
          {shownError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {candidates?.length ? (
          <button
            type="button"
            disabled={busy || !chosen}
            onClick={() => chosen && choose(chosen)}
            className="rounded-lg bg-ink px-3.5 py-2 text-sm font-semibold text-sun hover:bg-ink/85 disabled:opacity-60"
          >
            {reading ? "Reading their site…" : "Use this brand"}
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={search}
          className="rounded-lg border border-ink/20 px-3.5 py-2 text-sm font-semibold hover:bg-ink/5 disabled:opacity-60"
        >
          {candidates ? "Search again" : "Search the web"}
        </button>
      </div>

      <form onSubmit={onManual} className="flex flex-wrap gap-2 border-t border-ink/10 pt-4">
        <label className="sr-only" htmlFor={`url-${brandSlug(name)}`}>
          Brand website
        </label>
        <input
          id={`url-${brandSlug(name)}`}
          name="url"
          type="text"
          inputMode="url"
          placeholder="Or paste their website, e.g. alta-home.com"
          className="min-w-0 flex-1 rounded-lg border border-ink/20 bg-white/70 px-3 py-2 text-sm outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg border border-ink/20 px-3.5 py-2 text-sm font-semibold hover:bg-ink/5 disabled:opacity-60"
        >
          Use website
        </button>
      </form>
    </div>
  );
}
