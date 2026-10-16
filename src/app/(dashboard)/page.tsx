import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-12 md:py-16">
      <p className="animate-rise text-xs font-semibold tracking-[0.3em] text-ink-soft uppercase">
        {site.name}
      </p>
      <h1 className="mt-4 animate-rise text-5xl font-bold tracking-[-0.045em] [animation-delay:80ms] md:text-7xl">
        This is the homepage.
      </h1>
    </div>
  );
}
