"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { usePurchaseOrders, useProjects } from "@/lib/projects";
import { site } from "@/lib/site";
import { ProjectsTable } from "./projects-table";

export function PurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const purchaseOrders = usePurchaseOrders();
  const projects = useProjects();
  if (purchaseOrders === null || projects === null) return null;

  const po = purchaseOrders.find((p) => p.id === id);
  if (!po) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 md:px-12">
        <h1 className="text-4xl font-bold tracking-tight">Purchase order not found</h1>
        <p className="mt-3">
          <Link href="/purchase-orders" className="font-semibold underline underline-offset-4">
            All purchase orders
          </Link>
        </p>
      </div>
    );
  }

  const poProjects = projects.filter((p) => p.purchaseOrderId === po.id);
  const details = Object.entries(po.details);

  return (
    <div className="mx-auto max-w-[100rem] px-6 py-8 md:px-10 md:py-10">
      <title>{`${po.name} · ${site.initials}`}</title>
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-soft">
        <Link href="/purchase-orders" className="-my-2 inline-block py-2 hover:underline">
          Purchase orders
        </Link>
        <span aria-hidden> / </span>
        <span aria-current="page">{po.name}</span>
      </nav>

      <p className="text-xs font-semibold tracking-[0.25em] text-ink-soft uppercase">Purchase order</p>
      <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] md:text-6xl">{po.name}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {poProjects.length} {poProjects.length === 1 ? "project" : "projects"} · from {po.sourceFile}
      </p>

      {details.length > 0 && (
        <dl className="mt-6 grid gap-x-8 gap-y-3 rounded-2xl border border-ink/15 bg-sun-pale/70 p-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {details.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-ink-soft">{k}</dt>
              <dd className="mt-0.5 font-medium break-words">{v || "—"}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-6">
        <ProjectsTable projects={poProjects} showPurchaseOrder={false} />
      </div>
    </div>
  );
}
