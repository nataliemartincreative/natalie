import { BELLYBAND_PROJECT, RENDER_BRIEFS, type StartedRender } from "@/lib/bellyband";
import { planRenders } from "@/lib/server/bellyband-renders";
import { aspectParams, flora, floraErrorResponse, floraProject, missingFloraKey, rankedModels } from "@/lib/server/flora";

/** GET → the planned renders (model per board) and estimated cost. */
export async function GET() {
  const missing = missingFloraKey();
  if (missing) return missing;
  try {
    const plan = await planRenders();
    return Response.json({ plan, totalUsd: plan.reduce((sum, r) => sum + r.costUsd, 0) });
  } catch (error) {
    return floraErrorResponse(error);
  }
}

/** POST → starts the five renders in the Oasis Belly Band Flora project. */
export async function POST() {
  const missing = missingFloraKey();
  if (missing) return missing;
  try {
    const [plan, models, { workspaceId, projectId }] = await Promise.all([
      planRenders(),
      rankedModels("image"),
      floraProject(BELLYBAND_PROJECT),
    ]);
    const client = flora();
    let canvasUrl: string | null | undefined;
    const renders: StartedRender[] = await Promise.all(
      plan.map(async (planned) => {
        const brief = RENDER_BRIEFS.find((b) => b.id === planned.briefId)!;
        const model = models.find((m) => m.model_id === planned.modelId)!;
        const run = await client.generations.create({
          type: "image",
          prompt: brief.prompt,
          model: planned.modelId,
          workspace_id: workspaceId,
          project_id: projectId,
          params: aspectParams(model, ["4:3", "3:2", "16:9"]),
        });
        canvasUrl ??= run.canvas_url;
        return { ...planned, runId: run.run_id, nodeId: run.node_id };
      }),
    );
    return Response.json({ renders, canvasUrl });
  } catch (error) {
    return floraErrorResponse(error);
  }
}
