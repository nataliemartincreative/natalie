"use client";

import Link from "next/link";
import { usePurchaseOrders, useProjects } from "@/lib/projects";

export function PurchaseOrdersList() {
  const purchaseOrders = usePurchaseOrders();
  const projects = useProjects() ?? [];
  if (purchaseOrders === null) return null;

  const count = (id: string) => projects.filter((p) => p.purchaseOrderId === id).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
      <h1 className="text-4xl font-bold tracking-[-0.04em] md:text-5xl">Purchase orders</h1>
      <p className="mt-1 mb-6 text-sm text-ink-soft">
        Created when you import a factory sheet. Its header block becomes the purchase order and each row a project.
      </p>

      {purchaseOrders.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-2xl border-2 border-dashed border-ink/25 px-6 py-16 text-center">
          <p className="text-2xl font-bold tracking-tight">No purchase orders yet</p>
          <p className="text-sm text-ink-soft">
            <Link href="/projects" className="font-semibold underline underline-offset-4">
              Import a spreadsheet
            </Link>{" "}
            on the Projects page.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {purchaseOrders.map((po) => {
            const facts = Object.entries(po.details).filter(([, v]) => v).slice(0, 3);
            return (
              <li key={po.id}>
                <Link
                  href={`/purchase-orders/${po.id}`}
                  className="block h-full rounded-2xl border border-ink/15 bg-sun-pale/70 p-5 transition-colors hover:bg-white/60"
                >
                  <p className="text-lg font-bold tracking-tight">{po.name}</p>
                  <p className="text-sm text-ink-soft">
                    {count(po.id)} {count(po.id) === 1 ? "project" : "projects"} · {po.sourceFile}
                  </p>
                  <dl className="mt-3 grid gap-1 text-xs">
                    {facts.map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <dt className="shrink-0 text-ink-soft">{k}</dt>
                        <dd className="truncate">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
