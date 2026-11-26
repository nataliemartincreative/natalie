import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/content/site";
import { EnterForm } from "./enter-form";

export const metadata: Metadata = { title: "Private" };

export default function EnterPage() {
  return (
    <main className="grid min-h-dvh grid-rows-[auto_1fr_auto] px-4 sm:px-6">
      <p className="label flex h-12 items-center justify-between border-b border-ink">
        <span>{site.name}</span>
        <span className="text-ink-soft">Private</span>
      </p>
      <div className="fade-up grid content-center gap-10 py-16 md:grid-cols-[1.4fr_1fr] md:items-end md:gap-16">
        <h1 className="display text-[18vw] leading-[0.82] md:text-[11vw]">
          Work in
          <br />
          <em>progress.</em>
        </h1>
        <div className="w-full max-w-sm">
          <p className="text-ink-soft">This site is private for now. Enter the password to continue.</p>
          {/* Reads ?next= from the URL, which is only known at request time. */}
          <Suspense>
            <EnterForm />
          </Suspense>
        </div>
      </div>
      <p className="label border-t border-ink pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] text-ink-soft">{site.role}</p>
    </main>
  );
}
