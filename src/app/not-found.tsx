import Link from "next/link";
import { Container, Wordmark } from "@/components/ui";
import { site } from "@/content/site";

export default function NotFound() {
  return (
    <Container className="grid min-h-dvh grid-rows-[auto_1fr]">
      <div className="border-b border-rule py-6 md:py-8">
        <Wordmark name={site.name} />
      </div>
      <div className="grid content-center">
        <p className="text-mute">404</p>
        <h1 className="headline mt-3 text-5xl md:text-7xl">
          Nothing <span className="text-accent">here.</span>
        </h1>
        <Link href="/" className="mt-8 underline underline-offset-4 hover:text-accent">
          Back to the work →
        </Link>
      </div>
    </Container>
  );
}
