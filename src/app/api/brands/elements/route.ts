import { readSiteElements } from "@/lib/server/site-elements";

/** POST { url } → brand elements read from that site. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  if (!url) return Response.json({ error: "Missing website." }, { status: 400 });

  try {
    return Response.json(await readSiteElements(url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't read that site.";
    return Response.json({ error: message }, { status: 422 });
  }
}
