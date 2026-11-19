"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { enter, type EnterState } from "./actions";

export function EnterForm() {
  const next = useSearchParams().get("next") ?? "/";
  const [state, action, pending] = useActionState<EnterState, FormData>(enter, {});

  return (
    <form action={action} className="mt-10 grid gap-3 text-left">
      <input type="hidden" name="next" value={next} />
      <label htmlFor="password" className="eyebrow">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        aria-invalid={!!state.error}
        aria-describedby={state.error ? "password-error" : undefined}
        className="h-12 rounded-none border-0 border-b border-ink/30 bg-transparent px-0 text-base outline-none transition-colors placeholder:text-ink-soft/60 focus:border-ink aria-invalid:border-red-800"
      />
      {state.error && (
        <p id="password-error" role="alert" className="text-sm text-red-800">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 h-12 bg-ink text-sm font-medium tracking-wide text-paper transition-opacity hover:opacity-85 disabled:opacity-60"
      >
        {pending ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}
