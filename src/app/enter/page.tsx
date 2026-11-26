import type { Metadata } from "next";
import { Suspense } from "react";
import { Container, Wordmark } from "@/components/ui";
import { site } from "@/content/site";
import { EnterForm } from "./enter-form";

export const metadata: Metadata = { title: "Private" };

export default function EnterPage() {
  return (
    <Container className="grid min-h-dvh grid-rows-[auto_1fr]">
      <div className="border-b border-rule py-6 md:py-8">
        <Wordmark name={site.name} />
      </div>
      <div className="fade-up grid content-center gap-12 py-16 md:grid-cols-[1.3fr_1fr] md:items-end md:gap-16">
        <h1 className="headline text-4xl sm:text-5xl md:text-6xl">
          This site is <span className="text-accent underline decoration-2 underline-offset-[0.14em]">private</span> for now.
        </h1>
        <div className="w-full max-w-sm">
          <p className="text-mute">Enter the password to see the work.</p>
          {/* Reads ?next= from the URL, which is only known at request time. */}
          <Suspense>
            <EnterForm />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
