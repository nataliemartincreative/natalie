/** The Oasis acacia cutting board belly band contest. Shared client/server. */

export const BELLYBAND_PROJECT = "Oasis Belly Band";

const BASE =
  "Photorealistic commercial product photograph of a single handcrafted acacia wood cutting board. " +
  "Rich warm acacia grain with dramatic natural color variation from honey to deep chocolate, " +
  "satin oiled finish, crisp eased edges. The board is completely bare: no text, no logo, no label, " +
  "no packaging, no props on top of it. Shot so the middle of the board is fully visible, because a " +
  "printed paper belly band will later be wrapped around its center. High-end catalog quality, sharp focus, true-to-life color.";

/** Five distinct boards, one per model, so the team can pick a base. */
export const RENDER_BRIEFS = [
  {
    id: "classic",
    title: "Classic rectangle",
    prompt: `${BASE} A large rectangular edge-grain board with a juice groove around the top surface, three-quarter view from above on a seamless warm off-white background, soft diffused studio light, gentle shadow.`,
  },
  {
    id: "paddle",
    title: "Paddle with handle",
    prompt: `${BASE} A long paddle-shaped board with an integrated rounded handle and a leather hanging loop, lying at a slight angle on pale travertine stone, soft window light from the left.`,
  },
  {
    id: "endgrain",
    title: "End-grain butcher block",
    prompt: `${BASE} A thick heavy end-grain butcher block with a checkerboard grain pattern and recessed hand grips on the sides, low three-quarter view on a matte charcoal surface, dramatic warm key light.`,
  },
  {
    id: "round",
    title: "Round serving board",
    prompt: `${BASE} A round serving board with a short handle, viewed from above at an angle, on natural linen in a bright airy kitchen with soft morning light and shallow depth of field.`,
  },
  {
    id: "liveedge",
    title: "Live edge",
    prompt: `${BASE} A rectangular board with one natural live edge showing the organic outline of the tree, three-quarter view on a white oak countertop, soft daylight, minimal Scandinavian setting.`,
  },
] as const;

export type RenderBriefId = (typeof RENDER_BRIEFS)[number]["id"];

export interface PlannedRender {
  briefId: RenderBriefId;
  modelId: string;
  modelName: string;
  costUsd: number;
}

export interface StartedRender extends PlannedRender {
  runId: string;
  nodeId: string;
}

export interface RunStatus {
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  imageUrl?: string;
  error?: string;
}
