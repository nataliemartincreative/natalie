import Anthropic from "@anthropic-ai/sdk";
import type { BrandCandidate, ResearchRequest } from "@/lib/brand-types";

const SUBMIT_TOOL: Anthropic.Beta.BetaTool = {
  name: "submit_candidates",
  description:
    "Submit the brands found for the requested name, best match first. Call this exactly once, after searching.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      candidates: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "The brand or company name as it presents itself." },
            website: { type: "string", description: "Official homepage URL, https://…" },
            description: { type: "string", description: "One sentence: what they make or sell." },
            evidence: {
              type: "string",
              description: "Why this is or isn't likely the brand on these products.",
            },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
          },
          required: ["name", "website", "description", "evidence", "confidence"],
          additionalProperties: false,
        },
      },
    },
    required: ["candidates"],
    additionalProperties: false,
  },
};

const SYSTEM = `You help a packaging design studio identify the brands printed on products they design for.

Given a brand name and context from a factory purchase order, search the web for companies and brands that use that name. Many names are shared by unrelated companies, so return every plausible distinct match (up to 10), with the one most likely to be this brand first. Use the context to rank: product categories, product types, retailers and the fact that these are mass-market consumer goods.

Only list official websites you actually found. Give each candidate's homepage, not a product or social media page. When you are done searching, call submit_candidates.`;

/** Searches the web for brands matching a name, best match first. */
export async function researchBrand({ name, hints }: ResearchRequest): Promise<BrandCandidate[]> {
  // Created per call so builds and pages without ANTHROPIC_API_KEY still work.
  const client = new Anthropic();
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    {
      role: "user",
      content: `Brand name: ${name}\n\nContext from the purchase order:\n${
        hints.map((h) => `- ${h}`).join("\n") || "- (none)"
      }`,
    },
  ];

  for (let turn = 0; turn < 6; turn++) {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium" },
      system: SYSTEM,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }, SUBMIT_TOOL],
      messages,
    });

    const submit = response.content.find(
      (b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use" && b.name === SUBMIT_TOOL.name,
    );
    if (submit) {
      const { candidates } = submit.input as { candidates: BrandCandidate[] };
      return candidates.filter((c) => /^https?:\/\//i.test(c.website));
    }

    if (response.stop_reason === "refusal") throw new Error("The research request was declined.");
    messages.push({ role: "assistant", content: response.content });
    // pause_turn: re-send as-is and the server resumes its search. Otherwise
    // the model finished without submitting; ask for the result.
    if (response.stop_reason !== "pause_turn") {
      messages.push({ role: "user", content: "Call submit_candidates with what you found." });
    }
  }
  throw new Error("Research didn't finish. Try again.");
}
