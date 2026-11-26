import Link from "next/link";
import type { Project } from "@/content/site";
import { Figure } from "./figure";

/**
 * Two columns of square covers. On wide screens with a mouse, hovering zooms
 * the cover slightly and slides the title up over it; elsewhere the title
 * sits under the image.
 */
export function WorkGrid({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 md:gap-5">
      {projects.map((p, i) => (
        <li key={p.slug}>
          <Link href={`/work/${p.slug}`} className="group block">
            <div className="relative overflow-hidden">
              <Figure
                image={p.cover ?? p.images[0]}
                aspect="1 / 1"
                sizes="(min-width: 640px) 50vw, 100vw"
                priority={i < 2}
                showCaption={false}
                imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-2 bg-gradient-to-t from-black/75 to-transparent p-6 pt-16 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:hover)_and_(min-width:48rem)]:block">
                <p className="headline text-2xl">{p.title}</p>
                <p className="mt-1 text-sm text-white/80">{p.disciplines.join(", ")}</p>
              </div>
            </div>
            <div className="mt-3 [@media(hover:hover)_and_(min-width:48rem)]:sr-only">
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm text-mute">{p.disciplines.join(", ")}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
