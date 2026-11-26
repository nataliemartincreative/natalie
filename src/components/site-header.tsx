"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Work" },
  { href: "/about", label: "About" },
];

/** One thin bar: name on the left, two links on the right. Fits every width. */
export function SiteHeader({ name, role }: { name: string; role: string }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" || pathname.startsWith("/work/") : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-ink bg-paper">
      <div className="label flex h-12 items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-h-11 items-center gap-3">
          <span className="font-medium text-ink">{name}</span>
          <span className="hidden text-ink-soft sm:inline">{role}</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-5 sm:gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active(l.href) ? "page" : undefined}
              className="flex min-h-11 items-center text-ink-soft transition-colors hover:text-ink aria-[current=page]:text-ink"
            >
              <span aria-hidden className="mr-1.5 inline-block w-2 text-signal">
                {active(l.href) ? "●" : ""}
              </span>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
