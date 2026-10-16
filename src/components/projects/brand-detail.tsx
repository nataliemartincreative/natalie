"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { brandSlug, useProjects } from "@/lib/projects";
import { site } from "@/lib/site";
import { ProjectsTable } from "./projects-table";

export function BrandDetail() {
  const { slug } = useParams<{ slug: string }>();
  const projects = useProjects();
  if (projects === null) return null;

  const brandProjects = projects.filter((p) => p.brand && brandSlug(p.brand) === slug);
  const name = brandProjects[0]?.brand;

  return (
    <div className="mx-auto max-w-[100rem] px-6 py-8 md:px-10 md:py-10">
      {name && <title>{`${name} · ${site.initials}`}</title>}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-soft">
        <Link href="/projects" className="hover:underline">
          Projects
        </Link>
        <span aria-hidden> / </span>
        <span aria-current="page">{name ?? "Brand"}</span>
      </nav>

      {name ? (
        <>
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-ink-soft">Brand</p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] md:text-6xl">{name}</h1>
          <p className="mt-1 mb-6 text-sm text-ink-soft">
            {brandProjects.length} {brandProjects.length === 1 ? "project" : "projects"}
          </p>
          <ProjectsTable projects={brandProjects} showBrand={false} />
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold tracking-tight">Brand not found</h1>
          <p className="mt-3 text-ink-soft">No projects use this brand.</p>
        </>
      )}
    </div>
  );
}
