"use client";

import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import { IMPORT_ACCEPT, importProjects, type ImportResult } from "@/lib/import-projects";
import { addProjects, useProjects } from "@/lib/projects";
import { NewProjectDialog } from "./new-project-dialog";
import { ProjectsTable } from "./projects-table";

type Notice =
  | { kind: "imported"; result: ImportResult }
  | { kind: "error"; message: string };

const isSpreadsheet = (file: File) =>
  IMPORT_ACCEPT.split(",").some((ext) => file.name.toLowerCase().endsWith(ext));

export function ProjectsWorkspace() {
  const projects = useProjects();
  const [notice, setNotice] = useState<Notice>();
  const [dragging, setDragging] = useState(false);
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
        addProjects(result.projects);
        setNotice({ kind: "imported", result });
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
            className="rounded-lg bg-ink px-3.5 py-2 text-sm font-semibold text-sun hover:bg-ink/85 disabled:opacity-60"
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
            Imported {notice.result.projects.length} projects from {notice.result.fileName}
          </p>
          <p className="mt-0.5 text-ink-soft">
            {Object.entries(notice.result.mapping)
              .map(([field, header]) => `${field[0].toUpperCase()}${field.slice(1)} ← “${header}”`)
              .join(" · ") || "No name, brand or barcode columns found"}
            . Other columns were saved as project details.
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="-m-1 rounded p-1 leading-none hover:bg-ink/10"
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
        Drag a spreadsheet anywhere on this page, or{" "}
        <button type="button" onClick={onImport} className="font-semibold underline underline-offset-4">
          import a file
        </button>
        . Each row becomes a project.
      </p>
    </div>
  );
}
