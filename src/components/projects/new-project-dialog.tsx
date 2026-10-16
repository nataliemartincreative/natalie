"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { STATUSES, upsertProjects, type Status } from "@/lib/projects";
import { parseUpcA } from "@/lib/upc";

const input =
  "w-full rounded-lg border border-ink/20 bg-white/70 px-3 py-2 text-sm outline-none focus:border-ink focus:bg-white";

export function NewProjectDialog({ brands }: { brands: readonly string[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [barcodeError, setBarcodeError] = useState<string>();
  const brandListId = useId();

  function close() {
    dialogRef.current?.close();
    setBarcodeError(undefined);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const field = (name: string) => String(data.get(name) ?? "").trim();

    let barcode = field("barcode");
    if (barcode) {
      const result = parseUpcA(barcode);
      if (!result.ok) return setBarcodeError(result.error);
      barcode = result.code;
    }

    upsertProjects([
      {
        styleNumber: field("styleNumber"),
        name: field("name"),
        shortDescription: "",
        brand: field("brand"),
        status: field("status") as Status,
        barcode,
        dimensions: {},
        details: {},
      },
    ]);
    e.currentTarget.reset();
    close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-lg border border-ink/20 px-3.5 py-2 text-sm font-semibold hover:bg-ink/5"
      >
        New project
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setBarcodeError(undefined)}
        aria-labelledby={`${brandListId}-title`}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-ink/15 bg-sun-pale p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm open:animate-rise"
      >
        <form onSubmit={onSubmit} className="grid gap-4 p-6">
          <h2 id={`${brandListId}-title`} className="text-xl font-bold tracking-tight">
            New project
          </h2>

          <div className="grid grid-cols-[8rem_1fr] gap-3">
            <label className="grid gap-1.5 text-sm font-medium">
              Style #
              <input name="styleNumber" className={`${input} font-mono`} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Name
              <input name="name" required autoFocus className={input} />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-medium">
            Brand
            <input name="brand" list={brandListId} className={input} />
            <datalist id={brandListId}>
              {brands.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm font-medium">
              Status
              <select name="status" className={input}>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              UPC-A <span className="sr-only">(optional)</span>
              <input
                name="barcode"
                inputMode="numeric"
                placeholder="11 or 12 digits"
                aria-invalid={!!barcodeError}
                onChange={() => setBarcodeError(undefined)}
                className={`${input} font-mono aria-invalid:border-red-600`}
              />
            </label>
          </div>
          {barcodeError && (
            <p role="alert" className="-mt-2 text-sm text-red-700">
              {barcodeError}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-ink/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-ink px-3.5 py-2 text-sm font-semibold text-sun hover:bg-ink/85"
            >
              Add project
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
