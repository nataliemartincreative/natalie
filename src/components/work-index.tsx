import Link from "next/link";
import type { Project } from "@/content/site";
import { Figure } from "./figure";

/** The cover (or first image) cropped to a portrait card for the hover preview. */
const preview = (p: Project) => {
  const img = p.cover ?? p.images[0];
  return img ? { ...img, aspect: "4 / 5" } : undefined;
};

/**
 * The work as a numbered index. On hover a row flips to black, and on wide
 * screens its cover floats in beside the title.
 */
export function WorkIndex({ projects }: { projects: Project[] }) {
  return (
    <div>
      <div className="label hidden grid-cols-[4rem_1fr_14rem_5rem] gap-6 border-b border-ink px-4 pb-2 text-ink-soft sm:px-6 md:grid">
        <span>No.</span>
        <span>Project</span>
        <span>Discipline</span>
        <span className="text-right">Year</span>
      </div>
      <ol>
        {projects.map((p, i) => (
          <li key={p.slug} className="border-b border-ink">
            <Link
              href={`/work/${p.slug}`}
              className="group relative grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-3 px-4 py-5 transition-colors hover:bg-ink hover:text-paper sm:px-6 md:grid-cols-[4rem_1fr_14rem_5rem] md:items-baseline md:gap-6 md:py-6"
            >
              <span className="label pt-1 text-ink-soft group-hover:text-signal md:pt-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="display text-4xl group-hover:italic sm:text-5xl md:text-6xl">{p.title}</span>
              <span className="label col-start-2 text-ink-soft group-hover:text-paper/70 md:col-start-auto">
                {p.disciplines.join(", ")}
                <span className="md:hidden"> · {p.year}</span>
              </span>
              <span className="label hidden text-right text-ink-soft group-hover:text-paper/70 md:block">{p.year}</span>

              {/* Desktop: cover preview floats in on hover. */}
              <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-[25rem] z-10 hidden w-48 -translate-y-1/2 rotate-2 opacity-0 transition-all duration-300 group-hover:rotate-0 group-hover:opacity-100 lg:block"
              >
                <Figure image={preview(p)} sizes="192px" showCaption={false} />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
