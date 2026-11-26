import { WorkIndex } from "@/components/work-index";
import { projects, site } from "@/content/site";

export default function HomePage() {
  const [first, ...rest] = site.name.split(" ");
  return (
    <>
      <section className="fade-up px-4 pt-10 pb-14 sm:px-6 md:pt-16 md:pb-24">
        <h1 className="display text-[19vw] leading-[0.82] md:text-[15vw]">
          {first}
          {rest.length > 0 && (
            <>
              <br />
              <em className="ml-[8vw]">{rest.join(" ")}</em>
            </>
          )}
        </h1>
        <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-[1fr_1fr] md:gap-16">
          <p className="max-w-md text-lg leading-snug md:text-xl">{site.intro}</p>
          <ul className="label flex flex-wrap gap-x-5 gap-y-1 text-ink-soft md:justify-end md:self-end">
            {site.disciplines.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="work-heading" className="border-t border-ink">
        <h2 id="work-heading" className="label px-4 pt-3 pb-8 sm:px-6">
          Selected work ({String(projects.length).padStart(2, "0")})
        </h2>
        <WorkIndex projects={projects} />
      </section>
    </>
  );
}
