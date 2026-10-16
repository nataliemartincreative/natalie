"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { deleteFile, dielineKey, getFile, putFile } from "@/lib/files";
import { updateProject, type Project } from "@/lib/projects";

const ACCEPT = ".pdf,.ai,.svg,application/pdf,image/svg+xml";

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** This project's own dieline: upload, preview, download, replace. */
export function DielineCard({ project }: { project: Project }) {
  const [url, setUrl] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const { dieline } = project;

  // Load the stored file into an object URL for preview and download.
  useEffect(() => {
    if (!dieline) return;
    let objectUrl: string | undefined;
    let cancelled = false;
    getFile(dielineKey(project.id))
      .then((blob) => {
        if (cancelled || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => setError("Couldn't load the stored dieline."));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setUrl(undefined);
    };
  }, [project.id, dieline]);

  function upload(file: File) {
    setError(undefined);
    startTransition(async () => {
      try {
        await putFile(dielineKey(project.id), file);
        updateProject(project.id, {
          dieline: {
            fileName: file.name,
            type: file.type || (file.name.toLowerCase().endsWith(".ai") ? "application/pdf" : ""),
            size: file.size,
            uploadedAt: new Date().toISOString(),
          },
        });
      } catch {
        setError("Couldn't save that file in this browser.");
      }
    });
  }

  function remove() {
    if (!confirm("Remove this dieline?")) return;
    startTransition(async () => {
      await deleteFile(dielineKey(project.id));
      updateProject(project.id, { dieline: undefined });
    });
  }

  const isSvg = dieline?.type === "image/svg+xml" || dieline?.fileName.toLowerCase().endsWith(".svg");

  return (
    <section aria-labelledby="dieline-heading" className="rounded-2xl border border-ink/15 bg-sun-pale/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="dieline-heading" className="text-sm font-semibold">
          Dieline{" "}
          {dieline && (
            <span className="font-normal text-ink-soft">
              {dieline.fileName} · {formatSize(dieline.size)}
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          {dieline && url && (
            <a
              href={url}
              download={dieline.fileName}
              className="rounded-lg border border-ink/20 px-3 py-1.5 text-sm font-semibold hover:bg-ink/5"
            >
              Download
            </a>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg bg-ink px-3 py-1.5 text-sm font-semibold text-sun hover:bg-ink/85 disabled:opacity-60"
          >
            {pending ? "Saving…" : dieline ? "Replace" : "Upload dieline"}
          </button>
          {dieline && (
            <button
              type="button"
              onClick={remove}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-800 hover:bg-red-700/10"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {dieline ? (
        url && (
          <div className="mt-4 overflow-hidden rounded-lg border border-ink/10 bg-white">
            {isSvg ? (
              // eslint-disable-next-line @next/next/no-img-element -- local file preview
              <img src={url} alt={`Dieline ${dieline.fileName}`} className="h-auto w-full" />
            ) : (
              <object data={url} type="application/pdf" aria-label="Dieline preview" className="h-[28rem] w-full">
                <p className="p-4 text-sm text-ink-soft">
                  Preview isn&apos;t available for this file. Use Download to open it.
                </p>
              </object>
            )}
          </div>
        )
      ) : (
        <p className="mt-3 text-sm text-ink-soft">
          Upload this project&apos;s dieline (PDF, AI or SVG). Each project keeps its own copy.
        </p>
      )}
    </section>
  );
}
