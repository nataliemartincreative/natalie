import Anthropic from "@anthropic-ai/sdk";
import type { DielineReading, ReadDielinesRequest } from "@/lib/dieline-types";

const REPORT_TOOL: Anthropic.Beta.BetaTool = {
  name: "report_dielines",
  description: "Report what is printed on each dieline image. Call this exactly once, covering every image.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      dielines: {
        type: "array",
        items: {
          type: "object",
          properties: {
            index: { type: "integer", description: "The number from the image's label, e.g. 3 for 'Dieline 3'." },
            styleNumbers: {
              type: "array",
              items: { type: "string" },
              description: "Style / SKU numbers printed inside the dieline, exactly as printed.",
            },
            panelWidthsCm: {
              type: "array",
              items: { type: "number" },
              description: "Panel width labels along the top edge, left to right, in cm.",
            },
            heightCm: {
              anyOf: [{ type: "number" }, { type: "null" }],
              description: "The height label (usually at the left edge) in cm, or null if not labelled.",
            },
          },
          required: ["index", "styleNumbers", "panelWidthsCm", "heightCm"],
          additionalProperties: false,
        },
      },
    },
    required: ["dielines"],
    additionalProperties: false,
  },
};

const SYSTEM = `You read packaging dielines from a factory. Each image is one flat dieline (for example a bellyband or sleeve) drawn as panels, with dimension labels in cm above the panels and one or more product style numbers printed inside.

For each image, report only what is printed: the style numbers, the panel widths along the top from left to right, and the height if labelled. Do not invent values that aren't visible. A list of the client's known style numbers is given to help you read unclear digits; never report a known number that doesn't appear on the image.`;

/** Reads style numbers and panel dimensions off rendered dieline images. */
export async function readDielines({ dielines, knownStyleNumbers }: ReadDielinesRequest): Promise<DielineReading[]> {
  const client = new Anthropic();
  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  for (const d of dielines) {
    const data = d.image.replace(/^data:image\/jpeg;base64,/, "");
    content.push({ type: "text", text: `Dieline ${d.index}:` });
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data } });
  }
  content.push({
    type: "text",
    text: `Known style numbers: ${knownStyleNumbers.join(", ") || "(none)"}\n\nRead every dieline above, then call report_dielines.`,
  });

  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content }];
  for (let turn = 0; turn < 2; turn++) {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium" },
      system: SYSTEM,
      tools: [REPORT_TOOL],
      messages,
    });
    const report = response.content.find(
      (b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use" && b.name === REPORT_TOOL.name,
    );
    if (report) return (report.input as { dielines: DielineReading[] }).dielines;
    if (response.stop_reason === "refusal") throw new Error("The request was declined.");
    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: "Call report_dielines with what you read." });
  }
  throw new Error("Couldn't read the dielines. Assign them by hand.");
}
