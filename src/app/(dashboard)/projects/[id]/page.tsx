import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectDetail } from "@/components/projects/project-detail";

export const metadata: Metadata = { title: "Project" };

export default function ProjectPage() {
  // Reads the URL and browser storage, so it renders after the static shell.
  return (
    <Suspense>
      <ProjectDetail />
    </Suspense>
  );
}
