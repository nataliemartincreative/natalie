import { WorkGrid } from "@/components/work-grid";
import { Container, Highlighted, SectionLabel } from "@/components/ui";
import { projects, site } from "@/content/site";

export default function HomePage() {
  return (
    <Container>
      <p className="headline fade-up max-w-[52rem] pt-14 pb-20 text-[1.85rem] sm:text-4xl md:pt-20 md:pb-28 md:text-[2.75rem]">
        <Highlighted text={site.statement} />
      </p>
      <section aria-label="Featured work">
        <SectionLabel>Featured Work</SectionLabel>
        <div className="mt-5">
          <WorkGrid projects={projects} />
        </div>
      </section>
    </Container>
  );
}
