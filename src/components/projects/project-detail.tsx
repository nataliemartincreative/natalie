"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { brandSlug, deleteProject, useProjects } from "@/lib/projects";
import { parseUpcA } from "@/lib/upc";
import { site } from "@/lib/site";
import { StatusSelect } from "./status-select";

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const projects = useProjects();
  if (projects === null) return null;

  const project = projects.find((p) => p.id === id);
  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 md:px-12">
        <h1 className="text-4xl font-bold tracking-tight">Project not found</h1>
        <p className="mt-3 text-ink-soft">
          It may have been deleted.{" "}
          <Link href="/projects" className="font-semibold underline underline-offset-4">
            Back to projects
          </Link>
        </p>
      </div>
    );
  }

  const upc = project.barcode ? parseUpcA(project.barcode) : undefined;
  const details = Object.entries(project.metadata);

  return (
    <article className="mx-auto max-w-5xl px-6 py-8 md:px-12 md:py-12">
      <title>{`${project.name} · ${site.initials}`}</title>

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-soft">
        <Link href="/projects" className="hover:underline">
          Projects
        </Link>
        <span aria-hidden> / </span>
        <span aria-current="page">{project.name}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {project.brand && (
            <Link
              href={`/brands/${brandSlug(project.brand)}`}
              className="text-xs font-semibold tracking-[0.25em] uppercase text-ink-soft hover:text-ink hover:underline"
            >
              {project.brand}
            </Link>
          )}
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-balance md:text-6xl">
            {project.name}
          </h1>
        </div>
        <StatusSelect id={project.id} status={project.status} />
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <section aria-labelledby="barcode-heading" className="rounded-2xl border border-ink/15 bg-sun-pale/70 p-5">
          <h2 id="barcode-heading" className="text-sm font-semibold">
            Barcode <span className="font-normal text-ink-soft">UPC-A</span>
          </h2>
          {upc?.ok ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- generated SVG */}
              <img
                src={`/api/barcode?code=${upc.code}`}
                alt={`UPC-A barcode ${upc.code}`}
                className="mt-4 w-full rounded-lg bg-white"
              />
              <a
                href={`/api/barcode?code=${upc.code}&download=1`}
                className="mt-4 inline-block rounded-lg bg-ink px-3.5 py-2 text-sm font-semibold text-sun hover:bg-ink/85"
              >
                Download SVG
              </a>
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">
              {upc
                ? `“${project.barcode}” isn't a valid UPC-A code. ${upc.error}`
                : "No barcode on this project."}
            </p>
          )}
        </section>

        <section aria-labelledby="details-heading" className="rounded-2xl border border-ink/15 bg-sun-pale/70 p-5">
          <h2 id="details-heading" className="text-sm font-semibold">
            Details
          </h2>
          {details.length ? (
            <dl className="mt-3 divide-y divide-ink/10">
              {details.map(([key, value]) => (
                <div key={key} className="grid grid-cols-[minmax(0,12rem)_1fr] gap-4 py-2 text-sm">
                  <dt className="text-ink-soft">{key}</dt>
                  <dd className="break-words">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">
              Imported spreadsheet columns show up here.
            </p>
          )}
        </section>
      </div>

      <button
        type="button"
        onClick={() => {
          if (!confirm(`Delete “${project.name}”?`)) return;
          deleteProject(project.id);
          router.push("/projects");
        }}
        className="mt-10 rounded-lg px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-700/10"
      >
        Delete project
      </button>
    </article>
  );
}
