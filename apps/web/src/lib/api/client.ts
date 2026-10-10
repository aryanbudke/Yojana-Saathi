import { z } from "zod";
import { containsReservedSource } from "@/lib/urls";
import { en, type Messages } from "@/i18n/messages/en";
import {
  answerSchema,
  detailSchema,
  extractSchema,
  guidanceSchema,
  matchesSchema,
  profileSchema,
  questionSchema,
  schemeListSchema,
  sessionSchema,
  type ProfileFacts,
  type ProfileField,
} from "./contracts";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 0,
    public requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export type SpeechLanguage = "en-IN" | "hi-IN" | "kn-IN";
const transcriptionSchema = z.object({
  transcript: z.string().min(1).max(4000),
  language_code: z.enum(["en-IN", "hi-IN", "kn-IN"]),
  needs_review: z.literal(true),
});
/** Error text for the reader's language; backend-supplied 4xx messages pass through as sent. */
export function errorMessage(
  error: unknown,
  text: Messages["errors"] = en.errors,
): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return text.rateLimited;
    if (error.status === 404 && error.code === "SESSION_EXPIRED")
      return text.sessionExpired;
    // Codes the client raises itself say more than the HTTP status; HTTP_ERROR is the generic one.
    if (error.code !== "HTTP_ERROR" && text.codes[error.code])
      return text.codes[error.code];
    if (error.status >= 500) return text.unavailable;
    return text.codes[error.code] ?? error.message;
  }
  return text.generic;
}
export function createLiveApi(baseUrl: string, fetcher: typeof fetch = fetch) {
  function endpoint(path: string) {
    if (!baseUrl)
      throw new ApiError("CONFIGURATION", "The API URL is not configured.");
    return `${baseUrl.replace(/\/$/, "")}/api/v1${path}`;
  }
  async function publicError(response: Response): Promise<ApiError> {
    const data: unknown = await response.json().catch(() => null);
    const parsed = z
      .object({
        error: z.object({
          code: z.string(),
          message: z.string(),
          request_id: z.string().optional(),
        }),
      })
      .safeParse(data);
    return new ApiError(
      parsed.success ? parsed.data.error.code : "HTTP_ERROR",
      response.status >= 500
        ? "The service is temporarily unavailable. Please try again."
        : parsed.success
          ? parsed.data.error.message
          : "The request could not be completed. Check your details and try again.",
      response.status,
      parsed.success ? parsed.data.error.request_id : undefined,
    );
  }
  async function request<T>(
    path: string,
    schema: z.ZodType<T>,
    body?: unknown,
    method?: string,
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetcher(endpoint(path), {
        method: method ?? (body === undefined ? "GET" : "POST"),
        headers: {
          Accept: "application/json",
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: controller.signal,
        cache: "no-store",
      });
      if (response.status === 204) return schema.parse(undefined);
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const e = await publicError(
          new Response(JSON.stringify(data), {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          }),
        );
        if (response.status >= 500)
          e.message =
            "The service is temporarily unavailable. Try again or enter your details manually.";
        throw e;
      }
      const parsed = schema.safeParse(data);
      if (!parsed.success)
        throw new ApiError(
          "INVALID_RESPONSE",
          "The service returned an incomplete response. Please try again.",
        );
      if (containsReservedSource(parsed.data))
        throw new ApiError(
          "UNVERIFIED_SOURCE",
          "The service returned placeholder sources. Scheme guidance cannot be verified.",
        );
      return parsed.data;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(
        "NETWORK_ERROR",
        "We couldn’t reach the service. Check your connection and try again.",
      );
    } finally {
      clearTimeout(timer);
    }
  }
  return {
    extract: (text: string, locale: SpeechLanguage = "en-IN") =>
      request("/profiles/extract", extractSchema, { text, locale }),
    async transcribe(audio: Blob, language: SpeechLanguage) {
      if (!audio.size)
        throw new ApiError("EMPTY_AUDIO", "No speech was recorded.", 422);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45_000);
      try {
        const response = await fetcher(
          endpoint(
            `/speech/transcribe?language_code=${encodeURIComponent(language)}`,
          ),
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": audio.type || "audio/webm",
            },
            body: audio,
            signal: controller.signal,
            cache: "no-store",
          },
        );
        if (!response.ok) throw await publicError(response);
        const data: unknown = await response.json();
        const parsed = transcriptionSchema.safeParse(data);
        if (!parsed.success)
          throw new ApiError(
            "INVALID_RESPONSE",
            "The transcription response was incomplete.",
          );
        return parsed.data;
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
          "NETWORK_ERROR",
          "We couldn’t reach the voice service.",
        );
      } finally {
        clearTimeout(timer);
      }
    },
    async synthesize(
      text: string,
      target_language_code: SpeechLanguage,
      source_language_code: SpeechLanguage = "en-IN",
    ) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45_000);
      try {
        const response = await fetcher(endpoint("/speech/synthesize"), {
          method: "POST",
          headers: { Accept: "audio/wav", "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            source_language_code,
            target_language_code,
          }),
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw await publicError(response);
        const audio = await response.blob();
        if (!audio.size)
          throw new ApiError(
            "INVALID_RESPONSE",
            "The voice response was empty.",
          );
        return audio;
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
          "NETWORK_ERROR",
          "We couldn’t reach the voice service.",
        );
      } finally {
        clearTimeout(timer);
      }
    },
    createSession: () => request("/profiles/sessions", sessionSchema, {}),
    deleteSession: (id: string) =>
      request(
        `/profiles/sessions/${encodeURIComponent(id)}`,
        z.undefined(),
        undefined,
        "DELETE",
      ),
    answer: (
      session_id: string,
      field: ProfileField,
      value: ProfileFacts[ProfileField],
    ) =>
      request("/profiles/answers", answerSchema, { session_id, field, value }),
    matches: (session_id: string, facts: ProfileFacts) =>
      request("/matches", matchesSchema, {
        session_id,
        facts: profileSchema.parse(facts),
        limit: 5,
      }),
    nextQuestion: (session_id: string, run_id: string) =>
      request("/questions/next", questionSchema, { session_id, run_id }),
    schemes: (query: URLSearchParams) =>
      request(
        `/schemes${query.size ? "?" + query.toString() : ""}`,
        schemeListSchema,
      ),
    detail: (id: string) =>
      request(`/schemes/${encodeURIComponent(id)}`, detailSchema),
    guidance: (id: string, session_id?: string) =>
      request(
        `/guidance/${encodeURIComponent(id)}${session_id ? "?session_id=" + encodeURIComponent(session_id) : ""}`,
        guidanceSchema,
      ),
  };
}
export type Api = ReturnType<typeof createLiveApi>;
