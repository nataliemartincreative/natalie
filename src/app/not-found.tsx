import Link from "next/link";
import { company } from "@/content/portfolio";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <p className="eyebrow">{company.name}</p>
        <h1 className="display mt-4 text-6xl">Page not found</h1>
        <p className="mt-4 text-ink-soft">This page doesn&apos;t exist or has moved.</p>
        <Link href="/" className="mt-8 inline-block text-sm underline underline-offset-4 hover:no-underline">
          Back to {company.name}
        </Link>
      </div>
    </main>
  );
}
