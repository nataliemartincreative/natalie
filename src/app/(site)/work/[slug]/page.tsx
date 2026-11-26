import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Figure } from "@/components/figure";
import { getProject, nextProject, projects } from "@/content/site";

// Only projects in the content file exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const index = projects.indexOf(project);
  const next = nextProject(project.slug);

  const meta = [
    { label: "Year", value: project.year },
    { label: "Discipline", value: project.disciplines.join(", ") },
    ...(project.client ? [{ label: "Client", value: project.client }] : []),
  ];

  return (
    <article>
      <header className="fade-up px-4 pt-10 pb-12 sm:px-6 md:pt-16">
        <p className="label text-ink-soft">
          <span className="text-signal">{String(index + 1).padStart(2, "0")}</span> / {String(projects.length).padStart(2, "0")}
        </p>
        <h1 className="display mt-6 text-[17vw] leading-[0.85] md:text-[11vw]">{project.title}</h1>
      </header>

      <div className="grid gap-10 border-y border-ink px-4 py-8 sm:px-6 md:grid-cols-[1fr_1.4fr] md:gap-16">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 self-start sm:grid-cols-3 md:grid-cols-1">
          {meta.map((m) => (
            <div key={m.label}>
              <dt className="label text-ink-soft">{m.label}</dt>
              <dd className="mt-1">{m.value}</dd>
            </div>
          ))}
        </dl>
        <div className="grid gap-4">
          <p className="display text-3xl leading-tight md:text-4xl">{project.summary}</p>
          {project.body.map((p) => (
            <p key={p} className="max-w-2xl text-ink-soft">
              {p}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 px-4 sm:grid-cols-2 sm:px-6">
        {project.images.map((img, i) => (
          <Figure
            key={`${img.alt}-${i}`}
            image={img}
            priority={i === 0}
            // Landscape images span both columns; portrait ones pair up.
            className={(img.aspect ?? "3 / 2") === "3 / 2" || project.images.length === 1 ? "sm:col-span-2" : ""}
            sizes="(min-width: 640px) 50vw, 100vw"
          />
        ))}
      </div>

      {projects.length > 1 && (
        <Link href={`/work/${next.slug}`} className="group mt-24 block border-t border-ink px-4 pt-4 pb-10 hover:bg-ink hover:text-paper sm:px-6">
          <span className="label text-ink-soft group-hover:text-signal">Next project →</span>
          <span className="display mt-4 block text-[14vw] leading-[0.85] group-hover:italic md:text-[9vw]">{next.title}</span>
        </Link>
      )}
    </article>
  );
}
