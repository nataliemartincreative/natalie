import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/blocks";
import { TechniqueArt } from "@/components/technique-art";
import { brandsUsing, techniques } from "@/content/portfolio";

export const metadata: Metadata = {
  title: "Branding techniques",
  description: "The packaging formats behind Diamond Home brands.",
};

export default function TechniquesPage() {
  return (
    <>
      <Container className="pt-16 pb-12 md:pt-24">
        <div className="fade-up max-w-3xl">
          <p className="eyebrow">How we brand</p>
          <h1 className="display mt-5 text-6xl md:text-8xl">Branding techniques</h1>
          <p className="mt-6 max-w-xl text-base text-ink-soft md:text-lg">
            The packaging formats we use to put our brands on shelf, from a single printed band to a full window box.
          </p>
          <nav aria-label="Techniques" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
            {techniques.map((t) => (
              <a key={t.slug} href={`#${t.slug}`} className="py-1 text-ink-soft underline-offset-4 hover:text-ink hover:underline">
                {t.name}
              </a>
            ))}
          </nav>
        </div>
      </Container>

      <Container>
        <ol className="divide-y divide-line border-t border-line">
          {techniques.map((t, i) => {
            const users = brandsUsing(t.slug);
            return (
              <li
                key={t.slug}
                id={t.slug}
                className="grid scroll-mt-24 gap-8 py-14 md:grid-cols-2 md:gap-16 md:py-20"
              >
                <div className={`grid aspect-[4/3] place-items-center bg-paper-deep/70 px-10 ${i % 2 ? "md:order-last" : ""}`}>
                  <TechniqueArt slug={t.slug} className="w-full max-w-sm text-ink" />
                </div>
                <div className="md:self-center">
                  <p className="eyebrow">{String(i + 1).padStart(2, "0")}</p>
                  <h2 className="display mt-3 text-5xl">{t.name}</h2>
                  <p className="display mt-4 text-xl italic text-ink-soft">{t.summary}</p>
                  <div className="mt-6 grid gap-4">
                    {t.description.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                  <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="eyebrow">Good for</p>
                      <ul className="mt-2 grid gap-1 text-sm">
                        {t.goodFor.map((g) => (
                          <li key={g}>{g}</li>
                        ))}
                      </ul>
                    </div>
                    {users.length > 0 && (
                      <div>
                        <p className="eyebrow">Used by</p>
                        <ul className="mt-2 grid gap-1 text-sm">
                          {users.map((b) => (
                            <li key={b.slug}>
                              <Link href={`/${b.slug}`} className="underline underline-offset-4 hover:no-underline">
                                {b.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </>
  );
}
