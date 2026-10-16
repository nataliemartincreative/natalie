import Anthropic from "@anthropic-ai/sdk";
import type { ReadDielinesRequest } from "@/lib/dieline-types";
import { readDielines } from "@/lib/server/read-dielines";

export const maxDuration = 90;

const MAX_IMAGES = 40;
const JPEG_DATA_URL = /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/;

/** POST { dielines: [{ index, image }], knownStyleNumbers } → { readings } */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<ReadDielinesRequest> | null;
  const dielines = Array.isArray(body?.dielines)
    ? body.dielines
        .filter((d) => Number.isInteger(d?.index) && typeof d?.image === "string" && JPEG_DATA_URL.test(d.image))
        .slice(0, MAX_IMAGES)
    : [];
  if (!dielines.length) return Response.json({ error: "No dieline images." }, { status: 400 });
  const knownStyleNumbers = Array.isArray(body?.knownStyleNumbers)
    ? body.knownStyleNumbers.filter((s): s is string => typeof s === "string").map((s) => s.slice(0, 40)).slice(0, 500)
    : [];

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Reading dielines needs ANTHROPIC_API_KEY. Assign them by hand." }, { status: 503 });
  }

  try {
    return Response.json({ readings: await readDielines({ dielines, knownStyleNumbers }) });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "Too many requests right now. Try again in a minute." }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json({ error: `Claude API error (${error.status}).` }, { status: 502 });
    }
    return Response.json({ error: error instanceof Error ? error.message : "Reading failed." }, { status: 500 });
  }
}
