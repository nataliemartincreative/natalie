/**
 * Runs `html` synchronously while the browser parses the page, before first
 * paint. On the client the tag becomes inert `text/plain`, so React doesn't
 * warn about rendering scripts and it never runs twice.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
