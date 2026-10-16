import { useSyncExternalStore } from "react";
import { SIDEBAR_STORAGE_KEY } from "./storage-keys";

const listeners = new Set<() => void>();

const isCollapsed = () => document.documentElement.dataset.sidebar === "collapsed";

export function useSidebarCollapsed(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    isCollapsed,
    () => false,
  );
}

/** The layout reads `data-sidebar` on <html>, so this restyles without a re-render. */
export function setSidebarCollapsed(collapsed: boolean) {
  if (collapsed) document.documentElement.dataset.sidebar = "collapsed";
  else delete document.documentElement.dataset.sidebar;
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? "collapsed" : "expanded");
  } catch {
    // Storage blocked: the choice lasts until reload.
  }
  listeners.forEach((l) => l());
}
