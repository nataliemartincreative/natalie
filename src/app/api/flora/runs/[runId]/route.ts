import type { RunStatus } from "@/lib/bellyband";
import { flora, floraErrorResponse, missingFloraKey } from "@/lib/server/flora";

/** GET → status of a Flora run, with its first image URL when complete. */
export async function GET(_request: Request, ctx: RouteContext<"/api/flora/runs/[runId]">) {
  const missing = missingFloraKey();
  if (missing) return missing;
  const { runId } = await ctx.params;
  if (!/^[\w-]{1,100}$/.test(runId)) return Response.json({ error: "Bad run ID." }, { status: 400 });
  try {
    const run = await flora().generations.retrieve({ runId });
    const image = run.outputs?.find((o) => o.type === "imageUrl");
    const body: RunStatus = {
      status: run.status,
      progress: run.progress,
      imageUrl: image?.url,
      error: run.error_message,
    };
    return Response.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return floraErrorResponse(error);
  }
}
