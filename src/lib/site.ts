export const site = {
  name: "Natalie's Favorite Website Ever",
  initials: "NFWE",
  description: "Natalie's dashboard.",
  user: { name: "Natalie", initial: "N" },
} as const;

export const navItems = [
  { href: "/", label: "Home", icon: "home", match: [] },
  // Brand pages are reached from projects, so they highlight Projects too.
  { href: "/projects", label: "Projects", icon: "projects", match: ["/brands"] },
  { href: "/purchase-orders", label: "Purchase orders", icon: "purchaseOrders", match: [] },
  // Temporary: the Oasis cutting board belly band contest.
  { href: "/bellyband", label: "Belly Band", icon: "bellyband", match: [] },
] as const;

export type NavIcon = (typeof navItems)[number]["icon"];
