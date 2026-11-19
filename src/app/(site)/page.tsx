import { BrandCard, Container, SectionHeading, TechniqueTile, WorkCard } from "@/components/blocks";
import { brands, company, techniques, work } from "@/content/portfolio";

export default function HomePage() {
  return (
    <>
      <Container className="pt-20 pb-24 md:pt-32 md:pb-36">
        <div className="fade-up max-w-4xl">
          <p className="eyebrow">{company.eyebrow}</p>
          <h1 className="display mt-6 text-[2.9rem] sm:text-6xl md:text-[5.5rem]">{company.headline}</h1>
          <p className="mt-8 max-w-xl text-base text-ink-soft md:text-lg">{company.intro}</p>
        </div>
      </Container>

      <Container>
        <SectionHeading eyebrow="Our brands" title="Brands" />
        <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {brands.map((brand, i) => (
            <li key={brand.slug}>
              <BrandCard brand={brand} priority={i === 0} />
            </li>
          ))}
        </ul>
      </Container>

      <Container className="mt-32">
        <SectionHeading eyebrow="How we brand" title="Branding techniques" href="/techniques" linkLabel="All techniques" />
        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-5">
          {techniques.map((t) => (
            <li key={t.slug}>
              <TechniqueTile technique={t} />
            </li>
          ))}
        </ul>
      </Container>

      <Container className="mt-32">
        <SectionHeading eyebrow="Selected work" title="Work" href="/work" linkLabel="All work" />
        <ul className="mt-10 grid gap-16">
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
