import Link from "next/link";
import { site } from "@/content/site";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh content-center px-4 sm:px-6">
      <p className="label text-ink-soft">404 · {site.name}</p>
      <h1 className="display mt-6 text-[18vw] leading-[0.82] md:text-[11vw]">
        Not <em>here.</em>
      </h1>
      <Link href="/" className="label mt-10 underline underline-offset-4 hover:text-signal">
        Back to the work →
      </Link>
    </main>
  );
}
