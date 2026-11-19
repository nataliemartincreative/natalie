import type { Metadata } from "next";
import { Suspense } from "react";
import { company } from "@/content/portfolio";
import { EnterForm } from "./enter-form";

export const metadata: Metadata = { title: "Welcome" };

export default function EnterPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="fade-up w-full max-w-sm text-center">
        <p className="eyebrow">{company.eyebrow}</p>
        <h1 className="display mt-4 text-5xl">{company.name}</h1>
        <p className="mx-auto mt-4 max-w-xs text-sm text-ink-soft">
          This site is for our retail partners. Enter the password you were given to continue.
        </p>
        {/* Reads ?next= from the URL, which is only known at request time. */}
        <Suspense>
          <EnterForm />
        </Suspense>
      </div>
    </main>
  );
}
