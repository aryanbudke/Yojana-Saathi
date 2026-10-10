import { describe, it, expect, test } from "vitest";
import { createLiveApi, ApiError, errorMessage } from "./client";
import { messages } from "@/i18n/messages";
import { createMockApi } from "./mock";
import {
  blankFacts,
  detailSchema,
  extractSchema,
  guidanceSchema,
  matchesSchema,
  questionSchema,
  schemeListSchema,
} from "./contracts";
import detail from "./fixtures/scheme-detail.response.json";
import extraction from "./fixtures/profile-extract.response.json";
import guidance from "./fixtures/guidance.response.json";
import matches from "./fixtures/matches.response.json";
import question from "./fixtures/question-next.response.json";
import schemes from "./fixtures/schemes-list.response.json";
import { safeOfficialUrl } from "@/components/ui";
describe("contract boundary", () => {
  it("rejects fabricated citation IDs in detail and guidance", () => {
    const altered = structuredClone(guidance);
    altered.documents[0].source_id = "40000000-0000-4000-8000-000000000099";
    expect(guidanceSchema.safeParse(altered).success).toBe(false);
    const changed = structuredClone(detail);
    changed.eligibility_rules[0].source.id =
      "40000000-0000-4000-8000-000000000099";
    expect(detailSchema.safeParse(changed).success).toBe(false);
  });
  it("refuses reserved placeholder sources over the live transport", async () => {
    const api = createLiveApi(
      "https://api.test",
      async () => new Response(JSON.stringify(schemes)),
    );
    await expect(api.schemes(new URLSearchParams())).rejects.toMatchObject({
      code: "UNVERIFIED_SOURCE",
    });
  });
  it("validates frozen backend fixtures without modifying fields", () => {
    expect(detailSchema.parse(detail).id).toBe(detail.id);
    extractSchema.parse(extraction);
    guidanceSchema.parse(guidance);
    matchesSchema.parse(matches);
    questionSchema.parse(question);
    schemeListSchema.parse(schemes);
  });
  it("rejects malformed responses", async () => {
    const api = createLiveApi(
      "https://api.test",
      async () => new Response("{}"),
    );
    await expect(api.extract("hello")).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });
  it.each([400, 422, 429, 503])(
    "keeps HTTP error status %s and request correlation",
    async (status) => {
      const api = createLiveApi(
        "https://api.test",
        async () =>
          new Response(
            JSON.stringify({
              error: {
                code: "FAILED",
                message: "Check the request",
                request_id: "r-1",
              },
            }),
            { status },
          ),
      );
      await expect(api.extract("hello")).rejects.toMatchObject({
        status,
        requestId: "r-1",
      });
    },
  );
  it("normalizes offline failures", async () => {
    await expect(
      createLiveApi("https://api.test", async () => {
        throw new TypeError("offline");
      }).extract("hello"),
    ).rejects.toBeInstanceOf(ApiError);
  });
  it("uses the agreed session and answer body", async () => {
    let sent = "";
    const api = createLiveApi("https://api.test", async (input, init) => {
      sent = String(input) + " " + init?.body;
      return new Response(
        JSON.stringify({
          session_id: "10000000-0000-4000-8000-000000000001",
          facts: blankFacts,
          requires_rematch: true,
        }),
      );
    });
    await api.answer("10000000-0000-4000-8000-000000000001", "age", 24);
    expect(sent).toContain("/api/v1/profiles/answers");
    expect(sent).toContain('"field":"age","value":24');
  });
  it("sends speech audio and locale to the server-only Sarvam proxy", async () => {
    let sentUrl = "";
    let sentType = "";
    const api = createLiveApi("https://api.test", async (input, init) => {
      sentUrl = String(input);
      sentType = new Headers(init?.headers).get("Content-Type") ?? "";
      return new Response(
        JSON.stringify({
          transcript: "ನಾನು ರೈತ",
          language_code: "kn-IN",
          needs_review: true,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    });
    const result = await api.transcribe(
      new Blob(["audio"], { type: "audio/webm" }),
      "kn-IN",
    );
    expect(sentUrl).toContain("/api/v1/speech/transcribe?language_code=kn-IN");
    expect(sentType).toBe("audio/webm");
    expect(result.transcript).toBe("ನಾನು ರೈತ");
  });
  it("requests translated speech and returns playable audio", async () => {
    let body = "";
    const api = createLiveApi("https://api.test", async (_input, init) => {
      body = String(init?.body);
      return new Response(new Blob(["wave"], { type: "audio/wav" }), {
        headers: { "Content-Type": "audio/wav" },
      });
    });
    const audio = await api.synthesize("Scheme information", "hi-IN", "en-IN");
    expect(JSON.parse(body)).toEqual({
      text: "Scheme information",
      source_language_code: "en-IN",
      target_language_code: "hi-IN",
    });
    expect(audio.size).toBeGreaterThan(0);
  });
  it("plays mock responses and preserves unknown on not sure, without repeated questions", async () => {
    const api = createMockApi(0);
    const s = await api.createSession();
    await api.answer(s.session_id, "land_registration", "not_sure");
    expect(
      (await api.matches(s.session_id, blankFacts)).results[0].status,
    ).toBe("needs_information");
    expect((await api.nextQuestion(s.session_id, "unused")).question).toBe(
      null,
    );
    await api.deleteSession(s.session_id);
    await expect(api.matches(s.session_id, blankFacts)).rejects.toMatchObject({
      code: "SESSION_EXPIRED",
    });
  });
  it("blocks synthetic, insecure and lookalike source links", () => {
    for (const u of [
      "javascript:alert(1)",
      "http://gov.in",
      "https://gov.in.attacker.com",
      "https://example.invalid/source",
      "https://user:pass@nic.in",
    ])
      expect(safeOfficialUrl(u)).toBe(null);
    expect(safeOfficialUrl("https://pmkisan.gov.in/")).toBe(
      "https://pmkisan.gov.in/",
    );
  });
  it("treats an explicit null answer as answered, matching the backend contract", async () => {
    const api = createMockApi(0);
    const s = await api.createSession();
    expect((await api.nextQuestion(s.session_id, "unused")).question).not.toBe(
      null,
    );
    await api.answer(s.session_id, "land_registration", null);
    expect((await api.nextQuestion(s.session_id, "unused")).question).toBe(
      null,
    );
  });
});

test("errorMessage words known client codes in the reader's language", () => {
  const hiErrors = messages.hi.errors;
  const live = new ApiError("LIVE_API_REQUIRED", "Voice input requires the live API.", 503);
  expect(errorMessage(live, hiErrors)).toBe(hiErrors.codes.LIVE_API_REQUIRED);
  // Server failures stay generic; backend wording for 4xx passes through.
  expect(errorMessage(new ApiError("SERVICE_UNAVAILABLE", "x", 503), hiErrors)).toBe(
    hiErrors.unavailable,
  );
  expect(errorMessage(new ApiError("HTTP_ERROR", "x", 502), hiErrors)).toBe(
    hiErrors.unavailable,
  );
  expect(errorMessage(new ApiError("VALIDATION", "Age is too high", 422), hiErrors)).toBe(
    "Age is too high",
  );
  expect(errorMessage(new Error("boom"), hiErrors)).toBe(hiErrors.generic);
});
