import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Facts, ProductCard, SectionHeading } from "@/components/blocks";
import { Figure } from "@/components/figure";
import { getBrand, getTechnique, getWork, productsByStyle, work } from "@/content/portfolio";

export const dynamicParams = false;

export function generateStaticParams() {
  return work.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const item = getWork((await params).slug);
  return item ? { title: item.title, description: item.summary } : {};
}

export default async function WorkPage({ params }: PageProps<"/work/[slug]">) {
  const item = getWork((await params).slug);
  if (!item) notFound();
  const brand = getBrand(item.brand)!;
  const items = productsByStyle(item.products);
  const materials = [...new Set(items.map((p) => p.material))];

  return (
    <>
      <Container className="pt-16 pb-14 md:pt-24">
        <div className="fade-up max-w-4xl">
          <p className="eyebrow">
            <Link href={`/${brand.slug}`} className="hover:text-ink hover:underline">
              {brand.name}
            </Link>{" "}
            · Work
          </p>
          <h1 className="display mt-5 text-6xl md:text-8xl">{item.title}</h1>
          <p className="display mt-6 max-w-2xl text-2xl italic text-ink-soft md:text-3xl">{item.summary}</p>
        </div>
      </Container>

      <Container>
        <Figure image={item.hero} tint={brand.tint} aspect="16 / 8" sizes="100vw" priority />
      </Container>

      <Container className="mt-14 grid gap-12 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-20">
        <div className="grid content-start gap-5 text-base md:text-[17px] md:leading-relaxed">
          {item.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <Facts
          items={[
            {
              label: "Brand",
              value: (
                <Link href={`/${brand.slug}`} className="underline underline-offset-4 hover:no-underline">
                  {brand.name}
                </Link>
              ),
            },
            { label: "Pieces", value: String(items.length) },
            ...(materials.length ? [{ label: "Material", value: materials.join(", ") }] : []),
            {
              label: "Packaging",
              value: item.techniques.map((slug, i) => (
                <span key={slug}>
                  {i > 0 && ", "}
                  <Link href={`/techniques#${slug}`} className="underline underline-offset-4 hover:no-underline">
                    {getTechnique(slug)?.name}
                  </Link>
                </span>
              )),
            },
          ]}
        />
      </Container>

      {item.gallery.length > 0 && (
        <Container className="mt-20 grid gap-5 sm:grid-cols-2 md:gap-8">
          {item.gallery.map((img) => (
            <Figure key={img.alt} image={img} tint={brand.tint} aspect="4 / 5" caption={img.alt} />
          ))}
        </Container>
      )}

      {items.length > 0 && (
        <Container className="mt-28">
          <SectionHeading eyebrow={brand.name} title="Pieces" />
          <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {items.map((p) => (
              <li key={p.styleNumber}>
                <ProductCard product={p} tint={brand.tint} />
              </li>
            ))}
          </ul>
        </Container>
      )}
    </>
  );
}
