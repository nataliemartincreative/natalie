import { Flora, FloraClient } from "@flora-ai/flora";

/** Reads FLORA_API_KEY; created per call so builds without the key still work. */
export const flora = () => new FloraClient();

export type FloraModel = Flora.ListModelsResponse.Models.Item;

let target: Promise<{ workspaceId: string; projectId: string; }> | undefined;

/**
 * The workspace (FLORA_WORKSPACE_ID, or the first one the key can see) and a
 * project with this name in it, created if needed. Cached per server instance.
 */
export function floraProject(name: string) {
  target ??= (async () => {
    const client = flora();
    let workspaceId = process.env.FLORA_WORKSPACE_ID;
    if (!workspaceId) {
      const { workspaces } = await client.workspaces.list();
      workspaceId = workspaces[0]?.workspace_id;
      if (!workspaceId) throw new Error("This Flora key can't see any workspaces.");
    }
    for await (const project of await client.projects.list({ workspace_id: workspaceId, query: name })) {
      if (project.name === name) return { workspaceId, projectId: project.project_id };
    }
    const created = await client.projects.create({ workspace_id: workspaceId, name });
    return { workspaceId, projectId: created.project_id };
  })().catch((error) => {
    target = undefined; // Retry on the next request.
    throw error;
  });
  return target;
}

/** Featured models of a type first (Flora's curated best), then the rest. */
export async function rankedModels(type: Flora.ListModelsRequestType): Promise<FloraModel[]> {
  const { models, featured = [] } = await flora().models.list({ type });
  const ofType = models.filter((m) => m.type === type);
  const byId = new Map(ofType.map((m) => [m.model_id, m]));
  const top = featured.filter((f) => f.type === type).map((f) => byId.get(f.model_id)).filter((m): m is FloraModel => !!m);
  return [...new Set([...top, ...ofType.filter((m) => !m.beta)])];
}

/** Sets an aspect-ratio parameter when the model accepts one of the wanted ratios. */
export function aspectParams(model: FloraModel, wanted: string[]): Record<string, unknown> {
  const param = model.params.find((p) => /aspect/i.test(p.name));
  const options = (param?.options ?? []).map((o) => String((o as { value?: unknown }).value ?? o));
  const match = wanted.find((ratio) => options.includes(ratio));
  return param && match ? { [param.name]: match } : {};
}

/** Maps Flora SDK errors to a short message and HTTP status for API routes. */
export function floraErrorResponse(error: unknown) {
  if (error instanceof Flora.UnauthorizedError) {
    return Response.json({ error: "The Flora API key was rejected." }, { status: 502 });
  }
  if (error instanceof Flora.PaymentRequiredError) {
    return Response.json({ error: "The Flora account is out of credits." }, { status: 402 });
  }
  if (error instanceof Flora.TooManyRequestsError) {
    return Response.json({ error: "Flora is rate limiting requests. Try again shortly." }, { status: 429 });
  }
  const message = error instanceof Error ? error.message : "Flora request failed.";
  return Response.json({ error: message }, { status: 502 });
}

export const missingFloraKey = () =>
  process.env.FLORA_API_KEY
    ? null
    : Response.json({ error: "FLORA_API_KEY isn't set for this deployment." }, { status: 503 });
