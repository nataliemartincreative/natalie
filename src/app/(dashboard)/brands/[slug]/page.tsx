import type { Metadata } from "next";
import { Suspense } from "react";
import { BrandDetail } from "@/components/projects/brand-detail";

export const metadata: Metadata = { title: "Brand" };

export default function BrandPage() {
  // Reads the URL and browser storage, so it renders after the static shell.
  return (
    <Suspense>
      <BrandDetail />
    </Suspense>
  );
}
