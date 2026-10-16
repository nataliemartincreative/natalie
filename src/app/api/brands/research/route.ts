import Anthropic from "@anthropic-ai/sdk";
import type { ResearchRequest } from "@/lib/brand-types";
import { researchBrand } from "@/lib/server/brand-research";

// Web research can take a while.
export const maxDuration = 120;

/** POST { name, hints } → { candidates } */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<ResearchRequest> | null;
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 100) : "";
  if (!name) return Response.json({ error: "Missing brand name." }, { status: 400 });
  const hints = Array.isArray(body?.hints)
    ? body.hints.filter((h): h is string => typeof h === "string").map((h) => h.slice(0, 200)).slice(0, 12)
    : [];

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Brand research needs ANTHROPIC_API_KEY set in Vercel. You can still paste the brand's website." },
      { status: 503 },
    );
  }

  try {
    return Response.json({ candidates: await researchBrand({ name, hints }) });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "Too many requests right now. Try again in a minute." }, { status: 429 });
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: "The Claude API key was rejected." }, { status: 502 });
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json({ error: `Claude API error (${error.status}).` }, { status: 502 });
    }
    const message = error instanceof Error ? error.message : "Research failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
