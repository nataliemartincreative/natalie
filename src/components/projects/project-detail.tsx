"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  brandSlug,
  deleteProject,
  usePurchaseOrders,
  useProjects,
  type Dims,
  type Project,
} from "@/lib/projects";
import { site } from "@/lib/site";
import { parseUpcA } from "@/lib/upc";
import { DielineCard } from "./dieline-card";
import { StatusSelect } from "./status-select";

// Detail columns that describe the product itself (and feed the artwork),
// versus ordering and shipping. Anything unmatched lands in "Other".
const PRODUCT = /description|account|categor|color|pantone|material|finish|unit packaging|weight|capacity|test/i;
const ORDER = /fob|qty|order|carton|ctn|g\.w|packing|cbm|total|hts|port|lead time|usd|price|cost/i;

function groupDetails(details: Project["details"]) {
  const groups = { product: [] as [string, string][], order: [] as [string, string][], other: [] as [string, string][] };
  for (const entry of Object.entries(details)) {
    const [label] = entry;
    if (PRODUCT.test(label)) groups.product.push(entry);
    else if (ORDER.test(label)) groups.order.push(entry);
    else groups.other.push(entry);
  }
  return groups;
}

const card = "rounded-2xl border border-ink/15 bg-sun-pale/70 p-5";

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const projects = useProjects();
  const purchaseOrders = usePurchaseOrders();
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

  const po = purchaseOrders?.find((p) => p.id === project.purchaseOrderId);
  const upc = project.barcode ? parseUpcA(project.barcode) : undefined;
  const groups = groupDetails(project.details);

  return (
    <article className="mx-auto max-w-6xl px-6 py-8 md:px-12 md:py-12">
      <title>{`${project.styleNumber ? `${project.styleNumber} · ` : ""}${project.name} · ${site.initials}`}</title>

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-soft">
        <Link href="/projects" className="hover:underline">
          Projects
        </Link>
        {po && (
          <>
            <span aria-hidden> / </span>
            <Link href={`/purchase-orders/${po.id}`} className="hover:underline">
              {po.name}
            </Link>
          </>
        )}
        <span aria-hidden> / </span>
        <span aria-current="page">{project.styleNumber || project.name}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-[0.25em] text-ink-soft uppercase">
            {project.brand && (
              <Link href={`/brands/${brandSlug(project.brand)}`} className="hover:text-ink hover:underline">
                {project.brand}
              </Link>
            )}
            {project.styleNumber && <span className="font-mono tracking-normal">#{project.styleNumber}</span>}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-balance md:text-6xl">{project.name}</h1>
          {project.shortDescription && <p className="mt-2 text-ink-soft">{project.shortDescription}</p>}
        </div>
        <StatusSelect id={project.id} status={project.status} />
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <section aria-labelledby="barcode-heading" className={card}>
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
              {upc ? `“${project.barcode}” isn't a valid UPC-A code. ${upc.error}` : "No barcode on this project."}
            </p>
          )}
        </section>

        <section aria-labelledby="dims-heading" className={card}>
          <h2 id="dims-heading" className="text-sm font-semibold">
            Dimensions <span className="font-normal text-ink-soft">unit size, without packaging</span>
          </h2>
          <DimensionsTable dimensions={project.dimensions} />
        </section>
      </div>

      <div className="mt-6">
        <DielineCard project={project} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DetailList title="Product" entries={groups.product} />
        <DetailList title="Order & shipping" entries={groups.order} />
        {groups.other.length > 0 && <DetailList title="Other" entries={groups.other} />}
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

function DimensionsTable({ dimensions }: { dimensions: Project["dimensions"] }) {
  const units = [
    ["in", "Inches"],
    ["cm", "Centimeters"],
  ] as const;
  if (!dimensions.in && !dimensions.cm) {
    return <p className="mt-3 text-sm text-ink-soft">No dimensions on this project.</p>;
  }
  const axes: [keyof Dims, string][] = [
    ["l", "Length"],
    ["w", "Width"],
    ["h", "Height"],
  ];
  return (
    <table className="mt-3 w-full text-sm tabular-nums">
      <thead>
        <tr className="text-left text-xs text-ink-soft">
          <th scope="col" className="py-1.5 font-medium">
            <span className="sr-only">Axis</span>
          </th>
          {units.map(([key, label]) => (
            <th key={key} scope="col" className="py-1.5 font-medium">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-ink/10">
        {axes.map(([axis, label]) => (
          <tr key={axis}>
            <th scope="row" className="py-2 text-left font-normal text-ink-soft">
              {label}
            </th>
            {units.map(([key, unit]) => (
              <td key={key} className="py-2 text-lg font-semibold">
                {dimensions[key]?.[axis] || "—"}
                {dimensions[key]?.[axis] && (
                  <span className="ml-1 text-xs font-normal text-ink-soft">{unit === "Inches" ? "in" : "cm"}</span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DetailList({ title, entries }: { title: string; entries: [string, string][] }) {
  return (
    <section className={card}>
      <h2 className="text-sm font-semibold">{title}</h2>
      {entries.length ? (
        <dl className="mt-3 divide-y divide-ink/10">
          {entries.map(([key, value]) => (
            <div key={key} className="grid grid-cols-[minmax(0,14rem)_1fr] gap-4 py-2 text-sm">
              <dt className="text-ink-soft">{key}</dt>
              <dd className="break-words">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-3 text-sm text-ink-soft">Nothing here yet.</p>
      )}
    </section>
  );
}
