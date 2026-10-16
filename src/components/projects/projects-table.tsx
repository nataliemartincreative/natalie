"use client";

import Link from "next/link";
import {
  brandSlug,
  detailColumns,
  formatDims,
  usePurchaseOrders,
  type Project,
} from "@/lib/projects";
import { parseUpcA } from "@/lib/upc";
import { StatusSelect } from "./status-select";

const th =
  "sticky top-0 z-10 border-b border-r border-ink/15 bg-sun-deep px-3 py-2 text-left text-xs font-semibold whitespace-nowrap text-ink-soft";
const td = "border-b border-r border-ink/10 px-3 py-2 align-middle whitespace-nowrap";
const empty = <span className="text-ink-soft/60">—</span>;

/** Spreadsheet-style grid: fixed columns, then every imported column. */
export function ProjectsTable({
  projects,
  showBrand = true,
  showPurchaseOrder = true,
}: {
  projects: readonly Project[];
  showBrand?: boolean;
  showPurchaseOrder?: boolean;
}) {
  const purchaseOrders = usePurchaseOrders() ?? [];
  const poName = new Map(purchaseOrders.map((po) => [po.id, po.name]));
  const extraColumns = detailColumns(projects);

  return (
    <>
      <ProjectCards
        projects={projects}
        poName={poName}
        showBrand={showBrand}
        showPurchaseOrder={showPurchaseOrder}
      />
      <div className="hidden overflow-auto rounded-xl border border-ink/15 bg-sun-pale/60 [max-height:calc(100dvh-14rem)] md:block">
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th scope="col" className={`${th} w-10 text-right`}>
              <span className="sr-only">Row</span>#
            </th>
            <th scope="col" className={th}>
              Style #
            </th>
            <th scope="col" className={`${th} left-0 z-20 min-w-56 md:sticky`}>
              Name
            </th>
            {showBrand && (
              <th scope="col" className={th}>
                Brand
              </th>
            )}
            <th scope="col" className={th}>
              Status
            </th>
            <th scope="col" className={th}>
              UPC-A
            </th>
            <th scope="col" className={th}>
              Dieline
            </th>
            <th scope="col" className={th}>
              Size (in)
            </th>
            <th scope="col" className={th}>
              Size (cm)
            </th>
            {showPurchaseOrder && (
              <th scope="col" className={th}>
                Purchase order
              </th>
            )}
            {extraColumns.map((col) => (
              <th key={col} scope="col" className={th}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => (
            <tr key={p.id} className="group hover:bg-white/40">
              <td className={`${td} text-right text-xs text-ink-soft tabular-nums`}>{i + 1}</td>
              <td className={`${td} font-mono text-xs tabular-nums`}>{p.styleNumber || empty}</td>
              <th
                scope="row"
                className={`${td} left-0 bg-sun-pale text-left font-semibold group-hover:bg-sun-hover md:sticky`}
              >
                <Link
                  href={`/projects/${p.id}`}
                  className="block max-w-80 truncate underline-offset-4 hover:underline"
                >
                  {p.name}
                </Link>
              </th>
              {showBrand && (
                <td className={td}>
                  {p.brand ? (
                    <Link href={`/brands/${brandSlug(p.brand)}`} className="underline-offset-4 hover:underline">
                      {p.brand}
                    </Link>
                  ) : (
                    empty
                  )}
                </td>
              )}
              <td className={td}>
                <StatusSelect id={p.id} status={p.status} />
              </td>
              <td className={`${td} font-mono text-xs tabular-nums`}>
                <BarcodeCell value={p.barcode} />
              </td>
              <td className={`${td} text-xs`}>
                {p.dieline ? <span title={p.dieline.fileName}>✓ Uploaded</span> : empty}
              </td>
              <td className={`${td} tabular-nums`}>{formatDims(p.dimensions.in, "in") || empty}</td>
              <td className={`${td} tabular-nums`}>{formatDims(p.dimensions.cm, "cm") || empty}</td>
              {showPurchaseOrder && (
                <td className={td}>
                  {p.purchaseOrderId && poName.has(p.purchaseOrderId) ? (
                    <Link
                      href={`/purchase-orders/${p.purchaseOrderId}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {poName.get(p.purchaseOrderId)}
                    </Link>
                  ) : (
                    empty
                  )}
                </td>
              )}
              {extraColumns.map((col) => (
                <td key={col} className={td}>
                  <span className="block max-w-72 truncate" title={p.details[col]}>
                    {p.details[col]}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}

/** Phones: one card per project with the key fields; tap the name to open it. */
function ProjectCards({
  projects,
  poName,
  showBrand,
  showPurchaseOrder,
}: {
  projects: readonly Project[];
  poName: Map<string, string>;
  showBrand: boolean;
  showPurchaseOrder: boolean;
}) {
  return (
    <ul className="grid gap-3 md:hidden">
      {projects.map((p) => {
        const sizeIn = formatDims(p.dimensions.in, "in");
        const sizeCm = formatDims(p.dimensions.cm, "cm");
        const po = p.purchaseOrderId && poName.get(p.purchaseOrderId);
        return (
          <li key={p.id} className="rounded-xl border border-ink/15 bg-sun-pale/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {p.styleNumber && <p className="font-mono text-xs text-ink-soft">#{p.styleNumber}</p>}
                <Link
                  href={`/projects/${p.id}`}
                  className="-my-1.5 block py-1.5 text-base leading-snug font-semibold underline-offset-4 hover:underline"
                >
                  {p.name}
                </Link>
                {showBrand && p.brand && (
                  <Link
                    href={`/brands/${brandSlug(p.brand)}`}
                    className="-my-2 inline-block py-2 text-sm text-ink-soft underline-offset-4 hover:underline"
                  >
                    {p.brand}
                  </Link>
                )}
              </div>
              <StatusSelect id={p.id} status={p.status} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="col-span-2">
                <dt className="text-xs text-ink-soft">UPC-A</dt>
                <dd className="font-mono text-sm tabular-nums">
                  <BarcodeCell value={p.barcode} />
                </dd>
              </div>
              {(sizeIn || sizeCm) && (
                <div className="col-span-2">
                  <dt className="text-xs text-ink-soft">Size</dt>
                  <dd className="tabular-nums">{[sizeIn, sizeCm].filter(Boolean).join(" · ")}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-ink-soft">Dieline</dt>
                <dd>{p.dieline ? "✓ Uploaded" : empty}</dd>
              </div>
              {showPurchaseOrder && po && (
                <div className="min-w-0">
                  <dt className="text-xs text-ink-soft">Purchase order</dt>
                  <dd className="truncate">
                    <Link href={`/purchase-orders/${p.purchaseOrderId}`} className="py-2 underline-offset-4 hover:underline">
                      {po}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </li>
        );
      })}
    </ul>
  );
}

function BarcodeCell({ value }: { value: string }) {
  if (!value) return empty;
  const result = parseUpcA(value);
  return result.ok ? (
    value
  ) : (
    <span className="text-red-700" title={result.error}>
      {value} ⚠
    </span>
  );
}
