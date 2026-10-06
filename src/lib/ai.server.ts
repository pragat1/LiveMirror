import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, Output, NoObjectGeneratedError, streamText } from "ai";
import type { z } from "zod";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
} from "./ai-gateway-run-id.ts";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

export class AiUnavailableError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "AiUnavailableError";
    this.status = status;
  }
}

export class AiRequestBlockedError extends AiUnavailableError {
  constructor(message: string, status: number) {
    super(message, status);
    this.name = "AiRequestBlockedError";
  }
}

type GatewayErrorShape = { message?: unknown; type?: unknown; props?: { retryable?: unknown; requires?: unknown } };

function readGatewayError(body: string): GatewayErrorShape | undefined {
  try {
    const value: unknown = JSON.parse(body);
    if (typeof value !== "object" || value === null) return undefined;
    const outer = value as Record<string, unknown>;
    const error = typeof outer.error === "object" && outer.error !== null
      ? outer.error as Record<string, unknown>
      : outer;
    const props = typeof error.props === "object" && error.props !== null
      ? error.props as GatewayErrorShape["props"]
      : undefined;
    return { message: error.message, type: error.type, props };
  } catch {
    return undefined;
  }
}

function errorMessageFromBody(body: string, status: number): string {
  const message = readGatewayError(body)?.message;
  return typeof message === "string" && message.trim()
    ? message
    : `The AI service returned an error (${status}). Please try again later.`;
}

function jsonObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new AiUnavailableError("The AI interviewer returned an invalid response. Please try again.");
  }
  return value as Record<string, unknown>;
}

function getDeniedReason(data: unknown): { message: string; type?: string } | null {
  if (typeof data !== "object" || data === null) return null;
  const record = data as Record<string, unknown>;
  const nested = typeof record.error === "object" && record.error !== null
    ? record.error as Record<string, unknown>
    : record;
  const type = typeof nested.type === "string" ? nested.type : undefined;
  if (type !== "provider_not_available_in_region" && type !== "model_requires_retention_consent") return null;
  const message = typeof nested.message === "string"
    ? nested.message
    : "AI access is currently unavailable for this workspace.";
  return { message, type };
}

async function setProviderBlocked(type: string, message: string): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("ai_gateway_access_state").upsert({
      id: 1,
      is_blocked: true,
      block_type: type,
      safe_message: message,
      updated_at: new Date().toISOString(),
    });
  } catch {
    console.error("Could not persist the AI provider access state.");
  }
}

async function assertProviderAvailable(): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("ai_gateway_access_state")
      .select("is_blocked, safe_message")
      .eq("id", 1)
      .maybeSingle();
    if (!error && data?.is_blocked) {
      throw new AiRequestBlockedError(data.safe_message ?? "AI access is currently unavailable for this workspace.", 403);
    }
  } catch (error) {
    if (error instanceof AiRequestBlockedError) throw error;
    // Fail closed only when a durable provider block is already known; no row is the initial state.
    console.error("Could not check the AI provider access state.");
  }
}

function unavailableFrom(error: unknown): AiUnavailableError {
  if (error instanceof AiUnavailableError) return error;

  if (APICallError.isInstance(error)) {
    const status = error.statusCode ?? 502;
    const body = error.responseBody ?? "";
    const parsed = readGatewayError(body);
    const message = errorMessageFromBody(body, status);
    const denied = status === 403 ? getDeniedReason(parsed) : null;

    if (denied) {
      void setProviderBlocked(denied.type ?? "provider_access_denied", denied.message);
      return new AiRequestBlockedError(denied.message, 403);
    }
    if (status === 402 || status === 403) return new AiRequestBlockedError(message, status);
    if (status === 401) return new AiUnavailableError(`AI service configuration error: ${message}`, 401);
    if (status === 400 || status === 404) return new AiUnavailableError(message, status);
    if (status === 429 || status >= 500) return new AiUnavailableError(message, status);
    return new AiUnavailableError(message, status);
  }

  if (NoObjectGeneratedError.isInstance(error)) {
    if (error.finishReason === "content-filter") {
      return new AiRequestBlockedError("The AI provider declined this coaching request. Start a new request after access is restored.", 403);
    }
    return new AiUnavailableError("The AI interviewer returned an unreadable response. Please try again.");
  }

  return new AiUnavailableError(error instanceof Error ? error.message : "We couldn't connect to the AI interviewer. Please try again.");
}

/** Each request streams the Responses API call, then validates the completed object before returning it. */
export async function chatJson<T extends z.ZodType>(
  request: Request,
  system: string,
  user: string,
  schema: T,
): Promise<z.infer<T>> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiUnavailableError("The AI service is not configured. The server key is missing.", 500);
  await assertProviderAvailable();

  const gateway = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: gateway.fetch,
  });

  try {
    const result = streamText({
      model: provider.responses(MODEL),
      instructions: system,
      prompt: user,
      abortSignal: request.signal,
      output: Output.object({ schema }),
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    const output: unknown = await result.output;
    await gateway.waitForRunId();
    return schema.parse(jsonObject(output));
  } catch (error) {
    if (request.signal.aborted && error instanceof Error && error.name === "AbortError") {
      throw new AiUnavailableError("This AI request was stopped.", 499);
    }
    throw unavailableFrom(error);
  }
}