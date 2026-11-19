"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface NavItem {
  href: string;
  label: string;
}

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/** Wordmark, brand links and secondary links; collapses to a menu on phones. */
export function SiteHeader({
  name,
  brands,
  secondary,
}: {
  name: string;
  brands: NavItem[];
  secondary: NavItem[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);

  // Close the phone menu after navigating.
  if (open && openedAt !== pathname) setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const link = (item: NavItem, className: string) => (
    <Link
      key={item.href}
      href={item.href}
      aria-current={isActive(pathname, item.href) ? "page" : undefined}
      className={className}
    >
      {item.label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="display text-[1.65rem] leading-none" aria-current={pathname === "/" ? "page" : undefined}>
          {name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 text-[13px] md:flex">
          {brands.map((item) =>
            link(item, "text-ink-soft transition-colors hover:text-ink aria-[current=page]:text-ink"),
          )}
          <span aria-hidden className="h-4 w-px bg-line" />
          {secondary.map((item) =>
            link(item, "text-ink-soft transition-colors hover:text-ink aria-[current=page]:text-ink"),
          )}
        </nav>

        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            setOpenedAt(pathname);
          }}
          aria-expanded={open}
          aria-controls="site-menu"
          className="-mr-2 flex h-11 items-center px-2 text-[13px] font-medium tracking-wide md:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="site-menu" aria-label="Main" className="border-t border-line/80 px-5 pt-4 pb-8 md:hidden">
          <p className="eyebrow">Brands</p>
          <ul className="mt-2">
            {brands.map((item) => (
              <li key={item.href}>
                {link(item, "display block py-2 text-4xl aria-[current=page]:italic")}
              </li>
            ))}
          </ul>
          <ul className="mt-6 grid gap-1 border-t border-line pt-5 text-base">
            {secondary.map((item) => (
              <li key={item.href}>{link(item, "block py-2 aria-[current=page]:underline")}</li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
