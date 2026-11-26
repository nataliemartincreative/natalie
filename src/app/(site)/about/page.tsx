import type { Metadata } from "next";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="fade-up px-4 pt-10 sm:px-6 md:pt-16">
      <p className="label text-ink-soft">About</p>
      <h1 className="display mt-6 max-w-5xl text-5xl leading-[0.95] md:text-8xl">{site.about[0]}</h1>

      <div className="mt-16 grid gap-12 border-t border-ink pt-8 md:grid-cols-[1fr_1.4fr] md:gap-16">
        <div className="grid content-start gap-10">
          <div>
            <h2 className="label text-ink-soft">Disciplines</h2>
            <ul className="mt-3 grid gap-1 text-lg">
              {site.disciplines.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          {site.contact.length > 0 && (
            <div>
              <h2 className="label text-ink-soft">Contact</h2>
              <ul className="mt-3 grid gap-1 text-lg">
                {site.contact.map((c) => (
                  <li key={c.href}>
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="underline decoration-1 underline-offset-4 hover:text-signal"
                    >
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="grid max-w-2xl content-start gap-5 text-lg leading-relaxed">
          {site.about.slice(1).map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
