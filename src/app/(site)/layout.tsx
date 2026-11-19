import Link from "next/link";
import { Container } from "@/components/blocks";
import { SiteHeader } from "@/components/site-header";
import { brands, company } from "@/content/portfolio";
import { signOut } from "../enter/actions";

const secondary = [
  { href: "/techniques", label: "Techniques" },
  { href: "/work", label: "Work" },
];

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader
        name={company.name}
        brands={brands.map((b) => ({ href: `/${b.slug}`, label: b.name }))}
        secondary={secondary}
      />
      <main>{children}</main>
      <footer className="mt-28 border-t border-line pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-12">
        <Container className="grid gap-10 md:grid-cols-[1fr_auto_auto] md:gap-16">
          <div>
            <Link href="/" className="display text-3xl">
              {company.name}
            </Link>
            <p className="mt-3 max-w-sm text-[13px] text-ink-soft">{company.confidentiality}</p>
          </div>
          <nav aria-label="Brands" className="text-[13px]">
            <p className="eyebrow">Brands</p>
            <ul className="mt-3 grid gap-1.5">
              {brands.map((b) => (
                <li key={b.slug}>
                  <Link href={`/${b.slug}`} className="hover:underline">
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="text-[13px]">
            <p className="eyebrow">More</p>
            <ul className="mt-3 grid gap-1.5">
              {secondary.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="hover:underline">
                    {s.label}
                  </Link>
                </li>
              ))}
              <li>
                <form action={signOut}>
                  <button type="submit" className="text-ink-soft hover:text-ink hover:underline">
                    Sign out
                  </button>
                </form>
              </li>
            </ul>
          </div>
        </Container>
      </footer>
    </>
  );
}
