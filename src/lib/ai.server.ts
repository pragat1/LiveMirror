const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.8-flash";

export class AiUnavailableError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "AiUnavailableError";
    this.status = status;
  }
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new AiUnavailableError("The AI interviewer returned an unreadable response.");
  }
}

/** Calls the Lovable AI Gateway and parses a JSON object response. */
export async function chatJson(system: string, user: string): Promise<Record<string, unknown>> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new AiUnavailableError(
      "The AI service is not configured. LOVABLE_API_KEY is missing on the server.",
      500,
    );
  }

  let response: Response;
  try {
    response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });
  } catch {
    throw new AiUnavailableError("We couldn't reach the AI interviewer. Please try again.");
  }

  if (response.status === 429) {
    throw new AiUnavailableError("The AI interviewer is busy right now. Please try again in a moment.", 429);
  }
  if (response.status === 402) {
    throw new AiUnavailableError("AI credits are exhausted for this workspace. Add credits to continue.", 402);
  }
  if (!response.ok) {
    throw new AiUnavailableError("We couldn't connect to the AI interviewer. Please try again.");
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new AiUnavailableError("The AI interviewer returned an empty response.");
  }
  return extractJson(content) as Record<string, unknown>;
}
