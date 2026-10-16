"use client";

import { setSidebarCollapsed, useSidebarCollapsed } from "@/lib/sidebar";
import { SidebarIcon } from "./icons";

export function SidebarToggle() {
  const collapsed = useSidebarCollapsed();
  return (
    <button
      type="button"
      onClick={() => setSidebarCollapsed(!collapsed)}
      aria-pressed={collapsed}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="hidden items-center gap-3 rounded-lg px-3 py-2 text-[15px] font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink md:flex"
    >
      <SidebarIcon className="shrink-0 collapsed:rotate-180" />
      <span className="collapsed:sr-only">{collapsed ? "Expand" : "Collapse"}</span>
      <span className="sr-only">sidebar</span>
    </button>
  );
}
