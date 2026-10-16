import type { Metadata } from "next";
import { BellyBandStudio } from "@/components/bellyband/bellyband-studio";

export const metadata: Metadata = { title: "Belly Band" };

export default function BellyBandPage() {
  return <BellyBandStudio />;
}
