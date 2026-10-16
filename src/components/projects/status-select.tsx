"use client";

import { STATUSES, updateProject, type Status } from "@/lib/projects";

const DOT: Record<Status, string> = {
  "Not started": "bg-ink/30",
  "In progress": "bg-orange-500",
  Done: "bg-emerald-600",
};

/** A status pill that is a native <select> underneath. */
export function StatusSelect({ id, status }: { id: string; status: Status }) {
  return (
    <span className="relative inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white/50 py-0.5 pr-2.5 pl-2 text-xs pointer-coarse:py-2 pointer-coarse:pr-3.5 pointer-coarse:pl-3 pointer-coarse:text-sm font-medium whitespace-nowrap focus-within:outline-2 focus-within:outline-ink hover:bg-white/80">
      <span className={`size-2 rounded-full ${DOT[status]}`} aria-hidden />
      {status}
      <select
        aria-label="Status"
        value={status}
        onChange={(e) => updateProject(id, { status: e.target.value as Status })}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0"
      >
        {STATUSES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
    </span>
  );
}
