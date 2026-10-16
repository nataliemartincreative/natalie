"use client";

import { useEffect, useState, useTransition } from "react";
import { RENDER_BRIEFS, type PlannedRender, type RunStatus, type StartedRender } from "@/lib/bellyband";
import { updateBellyBand, useBellyBand } from "@/lib/bellyband-store";

const STEPS = [
  "Choose the base board",
  "Round 1: 30 designers",
  "Judges pick the top 3",
  "Final round: 10 improvements each",
  "Winner: 3D model and 20-second ad",
];

const POLL_MS = 4000;

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const briefTitle = (id: string) => RENDER_BRIEFS.find((b) => b.id === id)?.title ?? id;
/** Flora reports progress as 0–1 or 0–100 depending on the model. */
const percent = (p = 0) => Math.max(5, Math.min(100, Math.round(p <= 1 ? p * 100 : p)));
const isDone = (s?: RunStatus) => s?.status === "completed" || s?.status === "failed";

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? `Request failed (${response.status}).`);
  return data as T;
}

export function BellyBandStudio() {
  const state = useBellyBand();
  const [plan, setPlan] = useState<{ plan: PlannedRender[]; totalUsd: number }>();
  const [error, setError] = useState<string>();
  const [starting, startRenders] = useTransition();

  const hasRenders = !!state?.renders.length;

  // Load the plan (models and cost) until renders exist.
  useEffect(() => {
    if (state === null || hasRenders) return;
    let cancelled = false;
    getJson<{ plan: PlannedRender[]; totalUsd: number }>("/api/bellyband/renders")
      .then((p) => !cancelled && setPlan(p))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [state === null, hasRenders]); // eslint-disable-line react-hooks/exhaustive-deps -- only re-plan when renders appear/clear

  // Poll unfinished runs.
  const pending = state?.renders.filter((r) => !isDone(state.statuses[r.runId])).map((r) => r.runId) ?? [];
  const pendingKey = pending.join(",");
  useEffect(() => {
    if (!pendingKey) return;
    const timer = setInterval(() => {
      for (const runId of pendingKey.split(",")) {
        getJson<RunStatus>(`/api/flora/runs/${runId}`)
          .then((status) => updateBellyBand((s) => ({ statuses: { ...s.statuses, [runId]: status } })))
          .catch(() => {});
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [pendingKey]);

  function start() {
    setError(undefined);
    startRenders(async () => {
      try {
        const { renders, canvasUrl } = await getJson<{ renders: StartedRender[]; canvasUrl?: string | null }>(
          "/api/bellyband/renders",
          { method: "POST" },
        );
        updateBellyBand(() => ({ renders, canvasUrl, statuses: {}, chosenRunId: undefined }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't start the renders.");
      }
    });
  }

  if (state === null) return null;
  const chosen = state.renders.find((r) => r.runId === state.chosenRunId);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
      <p className="text-xs font-semibold tracking-[0.25em] text-ink-soft uppercase">Oasis · Acacia cutting board</p>
      <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] md:text-6xl">Belly Band</h1>

      <ol className="-mx-6 mt-6 flex snap-x scroll-px-6 gap-2 overflow-x-auto px-6 pb-1 text-xs font-semibold [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {STEPS.map((step, i) => {
          const active = i === 0 ? !chosen : false;
          const done = i === 0 && !!chosen;
          return (
            <li
              key={step}
              className={`shrink-0 snap-start rounded-full border px-3 py-1.5 whitespace-nowrap ${
                active ? "border-ink bg-ink text-sun" : done ? "border-ink/30 bg-white/60" : "border-ink/15 text-ink-soft"
              }`}
            >
              {done ? "✓ " : `${i + 1}. `}
              {step}
            </li>
          );
        })}
      </ol>

      <section className="mt-8 rounded-2xl border border-ink/15 bg-sun-pale/70 p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">1. Choose the base board</h2>
            <p className="mt-1 max-w-2xl text-sm text-ink-soft">
              Five bare acacia boards, each from a different top Flora image model. The one you pick is the board every
              designer wraps their belly band around.
            </p>
          </div>
          {hasRenders && (
            <div className="flex gap-2">
              {state.canvasUrl && (
                <a
                  href={state.canvasUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap inline-flex items-center rounded-lg border border-ink/20 px-3.5 py-2 text-sm font-semibold hover:bg-ink/5"
                >
                  Open in Flora ↗
                </a>
              )}
              <button
                type="button"
                disabled={starting || pending.length > 0}
                onClick={() => confirm("Generate five new renders? This uses Flora credits again.") && start()}
                className="tap rounded-lg border border-ink/20 px-3.5 py-2 text-sm font-semibold hover:bg-ink/5 disabled:opacity-60"
              >
                Regenerate all
              </button>
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">
            {error}
          </p>
        )}

        {!hasRenders ? (
          <div className="mt-5">
            {plan ? (
              <>
                <table className="w-full max-w-2xl text-sm">
                  <thead>
                    <tr className="text-left text-xs text-ink-soft">
                      <th className="py-1.5 font-medium">Board</th>
                      <th className="py-1.5 font-medium">Model</th>
                      <th className="py-1.5 text-right font-medium">Est. cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {plan.plan.map((r) => (
                      <tr key={r.briefId}>
                        <td className="py-2 font-medium">{briefTitle(r.briefId)}</td>
                        <td className="py-2">{r.modelName}</td>
                        <td className="py-2 text-right tabular-nums">{usd(r.costUsd)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2} className="pt-3 font-semibold">
                        Total (estimate)
                      </td>
                      <td className="pt-3 text-right font-semibold tabular-nums">{usd(plan.totalUsd)}</td>
                    </tr>
                  </tfoot>
                </table>
                <button
                  type="button"
                  disabled={starting}
                  onClick={start}
                  className="mt-5 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-sun hover:bg-ink/85 disabled:opacity-60"
                >
                  {starting ? "Starting…" : "Generate 5 renders"}
                </button>
              </>
            ) : (
              !error && <p className="text-sm text-ink-soft">Checking Flora&apos;s models…</p>
            )}
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {state.renders.map((r) => (
              <RenderCard
                key={r.runId}
                render={r}
                status={state.statuses[r.runId]}
                chosen={r.runId === state.chosenRunId}
              />
            ))}
          </ul>
        )}
      </section>

      {chosen && (
        <p className="mt-6 text-sm">
          <span className="font-semibold">Base board:</span> {briefTitle(chosen.briefId)} ({chosen.modelName}). Next up:
          the designer round.
        </p>
      )}
    </div>
  );
}

function RenderCard({ render, status, chosen }: { render: StartedRender; status?: RunStatus; chosen: boolean }) {
  const ready = status?.status === "completed" && status.imageUrl;
  return (
    <li
      className={`overflow-hidden rounded-xl border bg-white/60 ${chosen ? "border-ink ring-2 ring-ink" : "border-ink/15"}`}
    >
      <div className="grid aspect-[4/3] place-items-center bg-white">
        {ready ? (
          <a href={status.imageUrl} target="_blank" rel="noopener noreferrer" className="block size-full">
            {/* eslint-disable-next-line @next/next/no-img-element -- Flora-hosted render */}
            <img src={status.imageUrl} alt={`${briefTitle(render.briefId)} acacia cutting board`} className="size-full object-cover" />
          </a>
        ) : status?.status === "failed" ? (
          <p className="p-4 text-center text-sm text-red-800">{status.error ?? "This render failed."}</p>
        ) : (
          <div className="w-2/3">
            <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
              <div
                className="h-full rounded-full bg-ink transition-[width] duration-700"
                style={{ width: `${percent(status?.progress)}%` }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-ink-soft">{status?.status === "running" ? "Rendering…" : "Queued…"}</p>
          </div>
        )}
      </div>
      <div className="grid gap-2 p-3">
        <div>
          <p className="text-sm font-semibold">{briefTitle(render.briefId)}</p>
          <p className="text-xs text-ink-soft">{render.modelName}</p>
        </div>
        <button
          type="button"
          disabled={!ready}
          onClick={() => updateBellyBand(() => ({ chosenRunId: render.runId }))}
          aria-pressed={chosen}
          className="tap rounded-lg border border-ink/20 px-3 py-1.5 text-sm font-semibold hover:bg-ink/5 disabled:opacity-50 aria-pressed:bg-ink aria-pressed:text-sun"
        >
          {chosen ? "✓ Base board" : "Use this board"}
        </button>
      </div>
    </li>
  );
}
