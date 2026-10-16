import type { Metadata } from "next";
import { ProjectsWorkspace } from "@/components/projects/projects-workspace";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div className="theme-inverse min-h-full">
      <ProjectsWorkspace />
    </div>
  );
}
