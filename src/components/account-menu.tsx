"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { site } from "@/lib/site";
import { ChevronUpDownIcon, SettingsIcon, SignOutIcon, UserIcon } from "./icons";

const items = [
  { label: "Account", icon: UserIcon },
  { label: "Settings", icon: SettingsIcon },
  { label: "Sign out", icon: SignOutIcon },
] as const;

export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Roving focus with arrow keys, Home and End, per the WAI-ARIA menu pattern.
  function onMenuKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const menuItems = [
      ...e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    ];
    const current = menuItems.indexOf(document.activeElement as HTMLElement);
    const next = {
      ArrowDown: (current + 1) % menuItems.length,
      ArrowUp: (current - 1 + menuItems.length) % menuItems.length,
      Home: 0,
      End: menuItems.length - 1,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    menuItems[next]?.focus();
  }

  return (
    <div ref={rootRef} className="relative">
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          onKeyDown={onMenuKeyDown}
          ref={(el) => el?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()}
          className="absolute right-0 top-full z-20 mt-2 w-60 origin-top-right animate-rise rounded-xl border border-ink/10 bg-sun-pale p-1.5 shadow-[0_18px_40px_-12px_rgb(60_45_0/0.45)] md:left-0 md:right-auto md:top-auto md:bottom-full md:mt-0 md:mb-2 md:w-60 md:origin-bottom-left"
        >
          <div className="px-3 pt-2 pb-2.5">
            <p className="text-sm font-semibold">{site.user.name}</p>
            <p className="text-xs text-ink-soft">Personal account</p>
          </div>
          <div className="mb-1 h-px bg-ink/10" />
          {items.map(({ label, icon: ItemIcon }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-soft outline-none hover:bg-ink/5 hover:text-ink focus-visible:bg-ink focus-visible:text-sun"
            >
              <ItemIcon width={18} height={18} />
              {label}
            </button>
          ))}
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-ink/5 aria-expanded:bg-ink/5"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-sun">
          {site.user.initial}
        </span>
        <span className="hidden min-w-0 flex-1 md:block collapsed:hidden">
          <span className="block truncate text-sm font-semibold">{site.user.name}</span>
          <span className="block truncate text-xs text-ink-soft">Account</span>
        </span>
        <ChevronUpDownIcon width={16} height={16} className="hidden text-ink-soft md:block collapsed:hidden" />
        <span className="sr-only">Open account menu</span>
      </button>
    </div>
  );
}
