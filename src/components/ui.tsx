import { Fragment } from "react";

/** Page-width wrapper with the site's side margins. */
export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[82rem] px-5 sm:px-8 lg:px-16 ${className}`}>{children}</div>;
}

/** Name set as a stacked, lowercase serif wordmark. */
export function Wordmark({ name, className = "" }: { name: string; className?: string }) {
  const words = name.toLowerCase().split(" ");
  return (
    <span className={`block font-serif text-[1.7rem] leading-[0.8] tracking-[-0.02em] ${className}`}>
      {words.map((w, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {w}
        </Fragment>
      ))}
    </span>
  );
}

/** A label followed by a full-width rule. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="kicker border-b border-ink/80 pb-3">{children}</h2>;
}
