import type { Metadata } from "next";
import { PurchaseOrdersList } from "@/components/projects/purchase-orders-list";

export const metadata: Metadata = { title: "Purchase orders" };

export default function PurchaseOrdersPage() {
  return <PurchaseOrdersList />;
}
