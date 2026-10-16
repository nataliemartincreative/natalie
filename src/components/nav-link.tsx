"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

interface NavLinkProps {
  href: string;
  /** Other path prefixes that should mark this link active. */
  match?: readonly string[];
  icon: ReactNode;
  children: ReactNode;
}

/**
 * The active state depends on the URL, which dynamic routes only know at
 * request time, so the static shell renders an inactive link that the
 * active one streams in over.
 */
export function NavLink(props: NavLinkProps) {
  return (
    <Suspense fallback={<NavLinkView {...props} active={false} />}>
      <ActiveNavLink {...props} />
    </Suspense>
  );
}

function ActiveNavLink(props: NavLinkProps) {
  const pathname = usePathname();
  const { href, match = [] } = props;
  const within = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  const active = href === "/" ? pathname === "/" : [href, ...match].some(within);
  return <NavLinkView {...props} active={active} />;
}

function NavLinkView({ href, icon, children, active }: NavLinkProps & { active: boolean }) {
  return (
    <Link
      href={href}
      title={typeof children === "string" ? children : undefined}
      aria-current={active ? "page" : undefined}
      className="group flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-[15px] font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-sun"
    >
      {icon}
      {/* Icons only in the narrow mobile top bar. */}
      <span className="max-md:sr-only collapsed:sr-only">{children}</span>
    </Link>
  );
}
