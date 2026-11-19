import type { Metadata } from "next";
import { Container, WorkCard } from "@/components/blocks";
import { work } from "@/content/portfolio";

export const metadata: Metadata = { title: "Work", description: "Selected work across Diamond Home brands." };

export default function WorkIndexPage() {
  return (
    <>
      <Container className="pt-16 pb-14 md:pt-24">
        <div className="fade-up max-w-3xl">
          <p className="eyebrow">Selected work</p>
          <h1 className="display mt-5 text-6xl md:text-8xl">Work</h1>
          <p className="mt-6 max-w-xl text-base text-ink-soft md:text-lg">
            Ranges we have developed and brought to shelf, from product to packaging.
          </p>
        </div>
      </Container>
      <Container>
        <ul className="grid gap-16 border-t border-line pt-14">
          {work.map((item) => (
            <li key={item.slug}>
              <WorkCard item={item} />
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
