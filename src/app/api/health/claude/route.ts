import Anthropic from "@anthropic-ai/sdk";

/**
 * GET /api/health/claude: checks that ANTHROPIC_API_KEY is set and accepted,
 * by looking up a model (no tokens are generated or billed).
 */
export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ ok: false, problem: "ANTHROPIC_API_KEY isn't set for this deployment." }, { status: 503 });
  }
  try {
    const model = await new Anthropic().models.retrieve("claude-opus-5-5");
    return Response.json({ ok: true, model: model.id });
  } catch (error) {
    const problem =
      error instanceof Anthropic.AuthenticationError
        ? "The key was rejected. Check it was copied in full."
        : error instanceof Anthropic.PermissionDeniedError
          ? "The key works but can't use this model."
          : error instanceof Anthropic.APIError
            ? `Anthropic API error (${error.status}).`
            : "Couldn't reach the Anthropic API.";
    return Response.json({ ok: false, problem }, { status: 502 });
  }
}
