import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <Container className="fade-up grid gap-14 pt-16 md:grid-cols-2 md:gap-12 lg:grid-cols-[1fr_minmax(0,1.1fr)_minmax(0,1.3fr)] md:pt-24">
      {/* Left column stays empty on wide screens, as on the reference site. */}
      <div className="hidden lg:block" aria-hidden />
      <section aria-labelledby="capabilities">
        <h1 id="capabilities" className="headline text-3xl text-mute md:text-4xl">
          Capabilities
        </h1>
        <ul className="mt-8 grid gap-1">
          {site.capabilities.map((c) => (
            <li key={c} className="headline text-4xl leading-tight md:text-[2.75rem]">
              {c}
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="about-me">
        <h2 id="about-me" className="headline text-3xl text-mute md:text-4xl">
          About Me
        </h2>
        <p className="headline mt-8 text-2xl leading-snug md:text-[1.75rem]">
          {site.aboutOpening.map((line, i) => (
            <span key={line} className="block">
              {line}
              {i < site.aboutOpening.length - 1 && " "}
            </span>
          ))}
        </p>
        <div className="mt-6 grid gap-5 leading-relaxed">
          {site.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        {site.contact.length > 0 && (
          <ul className="mt-8 grid gap-1">
            {site.contact.map((c) => (
              <li key={c.href}>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="font-medium transition-opacity hover:opacity-60"
                >
                  {c.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
