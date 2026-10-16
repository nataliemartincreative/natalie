import { RENDER_BRIEFS, type PlannedRender } from "@/lib/bellyband";
import { rankedModels } from "./flora";

/** One brief per model, using Flora's top image models in order. */
export async function planRenders(): Promise<PlannedRender[]> {
  const models = await rankedModels("image");
  if (!models.length) throw new Error("No image models are available to this Flora key.");
  return RENDER_BRIEFS.map((brief, i) => {
    const model = models[i % models.length];
    return { briefId: brief.id, modelId: model.model_id, modelName: model.name, costUsd: model.estimated_cost_usd };
  });
}
