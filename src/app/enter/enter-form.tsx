"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { enter, type EnterState } from "./actions";

export function EnterForm() {
  const next = useSearchParams().get("next") ?? "/";
  const [state, action, pending] = useActionState<EnterState, FormData>(enter, {});

  return (
    <form action={action} className="mt-8 grid gap-3 text-left">
      <input type="hidden" name="next" value={next} />
      <label htmlFor="password" className="text-sm font-medium">
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
        className="h-12 rounded-none border-0 border-b border-ink/60 bg-transparent px-0 text-base outline-none focus:border-accent aria-invalid:border-accent"
      />
      {state.error && (
        <p id="password-error" role="alert" className="text-sm text-accent">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 h-12 bg-ink font-semibold text-paper transition-colors hover:bg-accent disabled:opacity-60"
      >
        {pending ? "Checking…" : "Enter →"}
      </button>
    </form>
  );
}
