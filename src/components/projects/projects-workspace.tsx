"use client";

import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import { IMPORT_ACCEPT, importProjects, type ImportResult } from "@/lib/import-projects";
import { upsertProjects, useProjects, type ImportOutcome } from "@/lib/projects";
import Link from "next/link";
import { NewBrandsDialog } from "@/components/brands/new-brands-dialog";
import { searchBrand } from "@/lib/brand-actions";
import { NewProjectDialog } from "./new-project-dialog";
import { ProjectsTable } from "./projects-table";

type Notice =
  | { kind: "imported"; result: ImportResult; outcome: ImportOutcome }
  | { kind: "error"; message: string };

const FIELD_LABELS: Record<string, string> = {
  styleNumber: "Style #",
  name: "Name",
  shortDescription: "Short description",
  brand: "Brand",
  barcode: "Barcode",
  status: "Status",
  dimensions: "Dimensions",
};

const isSpreadsheet = (file: File) =>
  IMPORT_ACCEPT.split(",").some((ext) => file.name.toLowerCase().endsWith(ext));

export function ProjectsWorkspace() {
  const projects = useProjects();
  const [notice, setNotice] = useState<Notice>();
  const [dragging, setDragging] = useState(false);
  const [newBrands, setNewBrands] = useState<string[]>([]);
  const [importing, startImport] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function importFile(file: File) {
    if (!isSpreadsheet(file)) {
      setNotice({ kind: "error", message: `${file.name} isn't a spreadsheet (XLS, XLSX or CSV).` });
      return;
    }
    startImport(async () => {
      try {
        const result = await importProjects(file);
        const outcome = upsertProjects(result.projects, result.purchaseOrder);
        setNotice({ kind: "imported", result, outcome });
        // Research every new brand in parallel while the user reviews the first.
        for (const brand of outcome.newBrands) void searchBrand(brand.name, result.projects);
        setNewBrands(outcome.newBrands.map((b) => b.name));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error.";
        setNotice({ kind: "error", message: `Couldn't import ${file.name}: ${message}` });
      }
    });
  }

  // Drop a spreadsheet anywhere on the page to import it.
  const onDropFile = useEffectEvent(importFile);
  useEffect(() => {
    let depth = 0;
    const hasFiles = (e: DragEvent) => e.dataTransfer?.types.includes("Files");
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth++;
      setDragging(true);
    };
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      if (--depth <= 0) {
        depth = 0;
        setDragging(false);
      }
    };
    const onOver = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      setDragging(false);
      const file = e.dataTransfer?.files[0];
      if (file) onDropFile(file);
    };
    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("dragover", onOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  const brands = [...new Set((projects ?? []).map((p) => p.brand).filter(Boolean))].sort();

  return (
    <div className="mx-auto max-w-[100rem] px-6 py-8 md:px-10 md:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-[-0.04em] md:text-5xl">Projects</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {projects ? `${projects.length} ${projects.length === 1 ? "project" : "projects"}` : " "}
            {brands.length > 0 && ` · ${brands.length} ${brands.length === 1 ? "brand" : "brands"}`}
          </p>
        </div>
        <div className="flex gap-2">
          <NewProjectDialog brands={brands} />
          <button
            type="button"
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
            className="tap rounded-lg bg-ink px-3.5 py-2 text-sm font-semibold text-sun hover:bg-ink/85 disabled:opacity-60"
          >
            {importing ? "Importing…" : "Import"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={IMPORT_ACCEPT}
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importFile(file);
              e.target.value = "";
            }}
          />
        </div>
      </header>

      <div aria-live="polite">
        {notice && <NoticeBanner notice={notice} onDismiss={() => setNotice(undefined)} />}
      </div>

      {projects === null ? null : projects.length === 0 ? (
        <EmptyState onImport={() => fileInputRef.current?.click()} />
      ) : (
        <ProjectsTable projects={projects} />
      )}

      {newBrands.length > 0 && <NewBrandsDialog brands={newBrands} onClose={() => setNewBrands([])} />}

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-40 grid place-items-center bg-ink/80 p-6 backdrop-blur-sm">
          <div className="grid place-items-center gap-2 rounded-3xl border-2 border-dashed border-sun px-12 py-16 text-center text-sun">
            <p className="text-3xl font-bold tracking-tight md:text-5xl">Drop to import</p>
            <p className="text-sm opacity-80">Each row becomes a project · XLS, XLSX or CSV</p>
          </div>
        </div>
      )}
    </div>
  );
}

function NoticeBanner({ notice, onDismiss }: { notice: Notice; onDismiss: () => void }) {
  const isError = notice.kind === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`mb-4 flex animate-rise items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${
        isError ? "border-red-700/30 bg-red-50 text-red-900" : "border-ink/15 bg-white/50"
      }`}
    >
      {isError ? (
        <p>{notice.message}</p>
      ) : (
        <div>
          <p className="font-semibold">
            Imported {notice.result.fileName}: {notice.outcome.created} new,{" "}
            {notice.outcome.updated} updated
            {notice.outcome.purchaseOrder && (
              <>
                {" "}
                into{" "}
                <Link
                  href={`/purchase-orders/${notice.outcome.purchaseOrder.id}`}
                  className="underline underline-offset-4"
                >
                  {notice.outcome.purchaseOrder.name}
                </Link>
              </>
            )}
          </p>
          <p className="mt-0.5 text-ink-soft">
            {Object.entries(notice.result.mapping)
              .map(([field, header]) => `${FIELD_LABELS[field] ?? field} ← “${header}”`)
              .join(" · ") || "No name, brand or barcode columns found"}
            . Other columns were kept as project details.
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="-m-1 rounded p-1 leading-none hover:bg-ink/10 pointer-coarse:-m-3 pointer-coarse:p-3"
      >
        ✕
      </button>
    </div>
  );
}

function EmptyState({ onImport }: { onImport: () => void }) {
  return (
    <div className="grid place-items-center gap-3 rounded-2xl border-2 border-dashed border-ink/25 px-6 py-20 text-center">
      <p className="text-2xl font-bold tracking-tight">No projects yet</p>
      <p className="max-w-sm text-sm text-ink-soft">
        <span className="pointer-coarse:hidden">Drag a spreadsheet anywhere on this page, or </span>
        <button type="button" onClick={onImport} className="font-semibold underline underline-offset-4">
          <span className="pointer-coarse:hidden">import a file</span>
          <span className="hidden pointer-coarse:inline">Import a spreadsheet</span>
        </button>
        . Each row becomes a project.
      </p>
    </div>
  );
}
