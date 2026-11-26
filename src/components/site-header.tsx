"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ContactLink } from "@/content/site";
import { Container, Wordmark } from "./ui";

const links = [
  { href: "/", label: "Work" },
  { href: "/about", label: "About" },
];

/** Wordmark left, links and social links right, a rule underneath. */
export function SiteHeader({ name, social }: { name: string; social: ContactLink[] }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" || pathname.startsWith("/work/") : pathname.startsWith(href));

  return (
    <header>
      <Container>
        <div className="flex items-center justify-between gap-6 border-b border-rule py-6 md:py-8">
          <Link href="/" aria-label={`${name}, home`}>
            <Wordmark name={name} />
          </Link>
          <nav aria-label="Main" className="flex items-center gap-5 text-[15px] font-medium sm:gap-7">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active(l.href) ? "page" : undefined}
                className="flex min-h-11 items-center text-mute transition-colors hover:text-ink aria-[current=page]:text-ink"
              >
                {l.label}
              </Link>
            ))}
            {social.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="hidden min-h-11 items-center text-mute transition-colors hover:text-ink sm:flex"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </Container>
    </header>
  );
}
