import Link from "next/link";
import { navItems, site, type NavIcon } from "@/lib/site";
import { AccountMenu } from "./account-menu";
import { NavLink } from "./nav-link";
import { SidebarToggle } from "./sidebar-toggle";
import { BandIcon, HomeIcon, ProjectsIcon, ReceiptIcon } from "./icons";

const icons: Record<NavIcon, typeof HomeIcon> = {
  home: HomeIcon,
  projects: ProjectsIcon,
  purchaseOrders: ReceiptIcon,
  bellyband: BandIcon,
};

export function Sidebar() {
  return (
    <aside className="sticky top-0 z-30 flex shrink-0 items-center gap-1 border-b border-ink/15 bg-sun-deep px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 sm:gap-2 sm:px-4 md:static md:h-dvh md:pt-5 md:w-64 md:flex-col md:transition-[width] md:duration-200 collapsed:w-[4.5rem] md:items-stretch md:border-r md:border-b-0 md:px-3 md:py-5">
      <Link
        href="/"
        aria-label={`${site.name} — home`}
        className="flex min-h-11 items-center rounded-md px-2 text-2xl font-bold tracking-[-0.06em] md:mb-8 md:block md:min-h-0 md:text-[2rem] collapsed:px-0 collapsed:text-center collapsed:text-base"
      >
        {site.initials}
      </Link>

      <nav aria-label="Main" className="min-w-0 flex-1">
        <ul className="flex gap-1 md:flex-col">
          {navItems.map(({ href, label, icon, match }) => {
            const ItemIcon = icons[icon];
            return (
              <li key={href}>
                <NavLink href={href} match={match} icon={<ItemIcon />}>
                  {label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <SidebarToggle />
      <AccountMenu />
    </aside>
  );
}
