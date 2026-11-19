import Link from "next/link";
import {
  formatSize,
  getBrand,
  type Brand,
  type Product,
  type Technique,
  type Work,
} from "@/content/portfolio";
import { Figure } from "./figure";
import { TechniqueArt } from "./technique-art";

/** Page-width wrapper with the site's side margins. */
export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

/** Section title row: eyebrow + serif heading, with an optional link on the right. */
export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-line pb-5">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="display mt-2 text-4xl md:text-5xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="shrink-0 py-2 text-[13px] text-ink-soft underline-offset-4 hover:text-ink hover:underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

export function BrandCard({ brand, priority }: { brand: Brand; priority?: boolean }) {
  return (
    <Link href={`/${brand.slug}`} className="group block">
      <Figure image={brand.hero} tint={brand.tint} aspect="4 / 5" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" priority={priority} />
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="display text-4xl group-hover:italic">{brand.name}</h3>
        <span aria-hidden className="text-ink-soft transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
      <p className="mt-2 max-w-sm text-sm text-ink-soft">{brand.tagline}</p>
    </Link>
  );
}

export function WorkCard({ item }: { item: Work }) {
  const brand = getBrand(item.brand)!;
  return (
    <Link href={`/work/${item.slug}`} className="group grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:items-center sm:gap-10">
      <Figure image={item.hero} tint={brand.tint} aspect="3 / 2" sizes="(min-width: 640px) 45vw, 100vw" />
      <div>
        <p className="eyebrow">{brand.name}</p>
        <h3 className="display mt-2 text-3xl group-hover:italic md:text-4xl">{item.title}</h3>
        <p className="mt-3 max-w-md text-sm text-ink-soft">{item.summary}</p>
        <p className="mt-4 text-[13px] underline-offset-4 group-hover:underline">View work →</p>
      </div>
    </Link>
  );
}

export function TechniqueTile({ technique }: { technique: Technique }) {
  return (
    <Link href={`/techniques#${technique.slug}`} className="group block">
      <div className="grid aspect-[4/3] place-items-center bg-paper-deep/70 px-6 transition-colors group-hover:bg-paper-deep">
        <TechniqueArt slug={technique.slug} className="w-full max-w-44 text-ink" />
      </div>
      <h3 className="mt-4 text-sm font-medium">{technique.name}</h3>
      <p className="mt-1 text-[13px] leading-snug text-ink-soft">{technique.summary}</p>
    </Link>
  );
}

export function ProductCard({ product, tint }: { product: Product; tint: string }) {
  return (
    <article>
      <Figure image={product.image} tint={tint} aspect="1 / 1" sizes="(min-width: 768px) 25vw, 50vw" />
      <h3 className="mt-4 text-sm font-medium">{product.name}</h3>
      <dl className="mt-1.5 grid gap-0.5 text-[13px] text-ink-soft">
        <div className="flex gap-2">
          <dt className="sr-only">Style number</dt>
          <dd className="font-mono text-xs tracking-tight">#{product.styleNumber}</dd>
        </div>
        <div>
          <dt className="sr-only">Size</dt>
          <dd className="tabular-nums">{formatSize(product.sizeIn, "in")}</dd>
          <dd className="tabular-nums">{formatSize(product.sizeCm, "cm")}</dd>
        </div>
      </dl>
    </article>
  );
}

/** Label / value pairs in a ruled list. */
export function Facts({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {items.map(({ label, value }) => (
        <div key={label} className="grid grid-cols-[8rem_1fr] gap-4 py-3.5 text-sm">
          <dt className="eyebrow pt-0.5">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
