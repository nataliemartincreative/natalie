"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { BrandIdentity } from "@/components/brands/brand-identity";
import { BrandResearch } from "@/components/brands/brand-research";
import { brandSlug, useBrands, useProjects } from "@/lib/projects";
import { site } from "@/lib/site";
import { ProjectsTable } from "./projects-table";

export function BrandDetail() {
  const { slug } = useParams<{ slug: string }>();
  const projects = useProjects();
  const brands = useBrands();
  const [editing, setEditing] = useState(false);
  if (projects === null || brands === null) return null;

  const brandProjects = projects.filter((p) => p.brand && brandSlug(p.brand) === slug);
  const brand = brands.find((b) => b.slug === slug);
  const name = brandProjects[0]?.brand ?? brand?.name;
  const accent = brand?.elements?.colors[0];

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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-ink-soft">Brand</p>
              <h1
                className="mt-2 border-b-8 pb-1 text-4xl font-bold tracking-[-0.04em] md:text-6xl"
                style={{ borderColor: accent ?? "transparent" }}
              >
                {name}
              </h1>
              <p className="mt-2 text-sm text-ink-soft">
                {brandProjects.length} {brandProjects.length === 1 ? "project" : "projects"}
              </p>
            </div>
            {brand?.status === "confirmed" && !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-lg border border-ink/20 px-3.5 py-2 text-sm font-semibold hover:bg-ink/5"
              >
                Change brand match
              </button>
            )}
          </div>

          <div className="mt-6">
            {brand?.status === "confirmed" && !editing ? (
              <BrandIdentity brand={brand} />
            ) : (
              <section className="rounded-2xl border border-ink/15 bg-sun-pale/70 p-5">
                <h2 className="mb-3 text-sm font-semibold">Find {name} online</h2>
                <BrandResearch name={name} onDone={() => setEditing(false)} />
              </section>
            )}
          </div>

          <h2 className="mt-10 mb-3 text-sm font-semibold">Projects</h2>
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
