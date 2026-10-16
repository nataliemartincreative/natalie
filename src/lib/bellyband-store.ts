import { useSyncExternalStore } from "react";
import type { RunStatus, StartedRender } from "./bellyband";

export interface BellyBandState {
  renders: StartedRender[];
  statuses: Record<string, RunStatus>;
  /** Run ID of the board chosen as the contest base. */
  chosenRunId?: string;
  canvasUrl?: string | null;
}

const KEY = "nfwe:bellyband:v1";
const EMPTY: BellyBandState = { renders: [], statuses: {} };
const listeners = new Set<() => void>();
let cache: BellyBandState | undefined;

function load(): BellyBandState {
  if (cache) return cache;
  try {
    cache = { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) ?? "null") };
  } catch {
    cache = EMPTY;
  }
  return cache!;
}

export function updateBellyBand(patch: (state: BellyBandState) => Partial<BellyBandState>) {
  const current = load();
  cache = { ...current, ...patch(current) };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Storage blocked: keep working in memory.
  }
  listeners.forEach((l) => l());
}

export function useBellyBand(): BellyBandState | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    load,
    () => null,
  );
}
