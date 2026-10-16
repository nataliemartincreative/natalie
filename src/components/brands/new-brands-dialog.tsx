"use client";

import { useEffect, useRef, useState } from "react";
import { updateBrand } from "@/lib/projects";
import { BrandResearch } from "./brand-research";

/**
 * Shown after an import that introduced new brands: walks through each one,
 * searching the web and asking the user to pick the right brand.
 */
export function NewBrandsDialog({ brands, onClose }: { brands: string[]; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const name = brands[index];

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function next() {
    if (index + 1 < brands.length) setIndex(index + 1);
    else dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="new-brand-title"
      className="m-auto w-[min(40rem,calc(100vw-2rem))] rounded-2xl border border-ink/15 bg-sun-pale p-0 text-ink shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm open:animate-rise"
    >
      {name && (
        <div className="grid max-h-[85dvh] gap-4 overflow-y-auto p-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-ink-soft uppercase">
              New brand {brands.length > 1 && `· ${index + 1} of ${brands.length}`}
            </p>
            <h2 id="new-brand-title" className="mt-1 text-3xl font-bold tracking-tight">
              {name}
            </h2>
          </div>
          <BrandResearch key={name} name={name} onDone={next} />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                updateBrand(name, { status: "skipped" });
                next();
              }}
              className="tap rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-ink/5"
            >
              {index + 1 < brands.length ? "Skip for now" : "Skip and finish"}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
