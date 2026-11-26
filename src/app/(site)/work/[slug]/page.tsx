import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Figure } from "@/components/figure";
import { Container } from "@/components/ui";
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
  const next = nextProject(project.slug);
  const [hero, ...rest] = project.cover ? [project.cover, ...project.images] : project.images;

  const details = [
    { label: "Project scope", value: project.disciplines.join(", ") },
    ...(project.client ? [{ label: "Client", value: project.client }] : []),
    { label: "Year", value: project.year },
    ...(project.tools?.length ? [{ label: "Tools used", value: project.tools.join(", ") }] : []),
  ];

  return (
    <article>
      <Figure image={hero} aspect="16 / 8" priority sizes="100vw" showCaption={false} className="mt-6 md:mt-8" />

      <Container className="fade-up grid gap-10 pt-14 md:grid-cols-2 md:gap-16 md:pt-20">
        <div>
          <h1 className="headline text-4xl md:text-6xl">{project.title}</h1>
          <p className="mt-6 max-w-lg text-lg text-ink/85">{project.summary}</p>
        </div>
        <div className="grid content-start gap-6">
          <dl className="grid gap-2">
            {details.map((d) => (
              <div key={d.label}>
                <dt className="inline text-sm font-medium tracking-wide uppercase underline underline-offset-4">{d.label}:</dt>{" "}
                <dd className="inline">{d.value}</dd>
              </div>
            ))}
          </dl>
          <div className="grid gap-4 text-mute">
            {project.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </Container>

      {rest.length > 0 && (
        <Container className="mt-16 grid gap-4 sm:grid-cols-2 md:mt-24 md:gap-5">
          {rest.map((img, i) => (
            <Figure
              key={`${img.alt}-${i}`}
              image={img}
              sizes="(min-width: 640px) 50vw, 100vw"
              // Landscape images span both columns; portrait ones pair up.
              className={(img.aspect ?? "3 / 2") === "3 / 2" || rest.length === 1 ? "sm:col-span-2" : ""}
            />
          ))}
        </Container>
      )}

      {projects.length > 1 && (
        <Container className="mt-24">
          <Link href={`/work/${next.slug}`} className="group flex items-end justify-between gap-6 border-t border-rule pt-8">
            <span>
              <span className="text-sm text-mute">Next project</span>
              <span className="headline mt-2 block text-4xl group-hover:text-accent md:text-6xl">{next.title}</span>
            </span>
            <span aria-hidden className="headline text-4xl transition-transform group-hover:translate-x-2 group-hover:text-accent md:text-6xl">
              →
            </span>
          </Link>
        </Container>
      )}
    </article>
  );
}
