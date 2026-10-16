import type { Metadata } from "next";
import { Suspense } from "react";
import { PurchaseOrderDetail } from "@/components/projects/purchase-order-detail";

export const metadata: Metadata = { title: "Purchase order" };

export default function PurchaseOrderPage() {
  // Reads the URL and browser storage, so it renders after the static shell.
  return (
    <Suspense>
      <PurchaseOrderDetail />
    </Suspense>
  );
}
