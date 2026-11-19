import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Facts, ProductCard, SectionHeading, WorkCard } from "@/components/blocks";
import { Figure } from "@/components/figure";
import { brands, getBrand, getTechnique, productsFor, workFor } from "@/content/portfolio";

// Only the brands in the content file exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return brands.map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[brand]">): Promise<Metadata> {
  const brand = getBrand((await params).brand);
  return brand ? { title: brand.name, description: brand.tagline } : {};
}

export default async function BrandPage({ params }: PageProps<"/[brand]">) {
  const brand = getBrand((await params).brand);
  if (!brand) notFound();

  const range = productsFor(brand.slug);
  const brandWork = workFor(brand.slug);
  const packaging = [...new Set(range.map((p) => p.packaging))].map((slug) => getTechnique(slug)!);

  return (
    <>
      <Container className="pt-16 pb-14 md:pt-24">
        <div className="fade-up grid gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-end md:gap-16">
          <div>
            <p className="eyebrow">A Diamond Home brand</p>
            <h1 className="display mt-5 text-7xl md:text-[8.5rem]" style={{ color: brand.accent }}>
              {brand.name}
            </h1>
            <p className="display mt-6 max-w-xl text-2xl italic md:text-3xl">{brand.tagline}</p>
          </div>
          <div className="grid gap-4 text-ink-soft">
            {brand.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </Container>

      <Container>
        <Figure image={brand.hero} tint={brand.tint} aspect="16 / 8" sizes="100vw" priority />
      </Container>

      {(brand.categories.length > 0 || packaging.length > 0) && (
        <Container className="mt-14 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:gap-16">
          <h2 className="display text-3xl md:text-4xl">At a glance</h2>
          <div>
            <Facts
              items={[
                ...(brand.categories.length ? [{ label: "Categories", value: brand.categories.join(", ") }] : []),
                ...(range.length ? [{ label: "Range", value: `${range.length} ${range.length === 1 ? "piece" : "pieces"}` }] : []),
                ...(packaging.length
                  ? [
                      {
                        label: "Packaging",
                        value: packaging.map((t, i) => (
                          <span key={t.slug}>
                            {i > 0 && ", "}
                            <Link href={`/techniques#${t.slug}`} className="underline underline-offset-4 hover:no-underline">
                              {t.name}
                            </Link>
                          </span>
                        )),
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        </Container>
      )}

      {range.length > 0 && (
        <Container className="mt-28">
          <SectionHeading eyebrow={brand.name} title="The range" />
          <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {range.map((p) => (
              <li key={p.styleNumber}>
                <ProductCard product={p} tint={brand.tint} />
              </li>
            ))}
          </ul>
        </Container>
      )}

      {brandWork.length > 0 && (
        <Container className="mt-28">
          <SectionHeading eyebrow={brand.name} title="Work" />
          <ul className="mt-10 grid gap-16">
            {brandWork.map((item) => (
              <li key={item.slug}>
                <WorkCard item={item} />
              </li>
            ))}
          </ul>
        </Container>
      )}
    </>
  );
}
