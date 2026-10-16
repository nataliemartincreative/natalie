"use client";

import { useState } from "react";
import type { Brand } from "@/lib/projects";

const hostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** The brand elements read from its website: logo, colors, fonts. */
export function BrandIdentity({ brand }: { brand: Brand }) {
  const [copied, setCopied] = useState<string>();
  const el = brand.elements;
  if (!el) return null;
  const mark = el.logo ?? el.icon;

  return (
    <section aria-label="Brand elements" className="grid gap-6 rounded-2xl border border-ink/15 bg-sun-pale/70 p-5 md:grid-cols-[14rem_1fr]">
      <div className="grid place-items-center rounded-xl border border-ink/10 bg-white p-6">
        {mark ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote brand asset
          <img src={mark} alt={`${brand.name} logo`} className="max-h-24 w-auto max-w-full object-contain" />
        ) : (
          <span className="text-4xl font-bold">{brand.name[0]}</span>
        )}
      </div>

      <div className="grid content-start gap-4">
        <div>
          {el.siteName && <p className="font-semibold">{el.siteName}</p>}
          {el.description && <p className="mt-1 max-w-2xl text-sm text-ink-soft">{el.description}</p>}
          {brand.website && (
            <a
              href={brand.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-semibold underline underline-offset-4"
            >
              {hostname(brand.website)} ↗
            </a>
          )}
        </div>

        {el.colors.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] text-ink-soft uppercase">Colors</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {el.colors.map((hex) => (
                <li key={hex}>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(hex).catch(() => {});
                      setCopied(hex);
                    }}
                    className="flex items-center gap-2 rounded-lg border border-ink/15 bg-white/70 py-1 pr-3 pl-1 font-mono text-xs hover:bg-white"
                    aria-label={`Copy ${hex}`}
                  >
                    <span className="size-6 rounded-md border border-ink/10" style={{ background: hex }} aria-hidden />
                    {copied === hex ? "Copied" : hex}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {el.fonts.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] text-ink-soft uppercase">Fonts</h3>
            <ul className="mt-2 flex flex-wrap gap-2 text-sm">
              {el.fonts.map((font) => (
                <li key={font} className="rounded-lg border border-ink/15 bg-white/70 px-3 py-1">
                  {font}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
