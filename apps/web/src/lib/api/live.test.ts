/**
 * Live contract check against a real backend. Skipped unless LIVE_API_URL is set:
 *   LIVE_API_URL=https://yojana-saathi-api.onrender.com npx vitest run src/lib/api/live.test.ts
 * Drives the same typed client the app uses, so every response is validated by the
 * frontend's zod contracts. Creates one anonymous session and deletes it afterwards.
 */
import { afterAll, describe, expect, test } from "vitest";
import { ApiError, createLiveApi } from "./client";
import { blankFacts, type ProfileFacts } from "./contracts";

const base = process.env.LIVE_API_URL ?? "";
// Free Render instances sleep; the first request can take ~30s.
const COLD_START_MS = 90_000;

describe.skipIf(!base)("live API contract", { timeout: COLD_START_MS }, () => {
  const api = createLiveApi(base);
  let sessionId = "";
  let runId = "";
  const facts: ProfileFacts = { ...blankFacts, age: 24, state_code: "MH" };

  afterAll(async () => {
    if (sessionId) await api.deleteSession(sessionId);
  });

  test("lists published schemes", async () => {
    const page = await api.schemes(new URLSearchParams({ limit: "20" }));
    expect(Array.isArray(page.items)).toBe(true);
  });

  test("extracts profile facts, or reports extraction as unavailable", async () => {
    try {
      const result = await api.extract(
        "I am a 24-year-old farmer from Maharashtra with 1.5 acres.",
      );
      expect(Object.keys(result.facts)).toEqual(Object.keys(blankFacts));
    } catch (e) {
      // No Gemini key or rate limit: the UI falls back to manual entry.
      expect(e).toBeInstanceOf(ApiError);
      expect([429, 503]).toContain((e as ApiError).status);
    }
  });

  test("creates a session and saves confirmed answers", async () => {
    sessionId = (await api.createSession()).session_id;
    for (const field of ["age", "state_code"] as const) {
      const saved = await api.answer(sessionId, field, facts[field]);
      expect(saved.facts[field]).toBe(facts[field]);
    }
  });

  test("matches the confirmed profile", async () => {
    const result = await api.matches(sessionId, facts);
    runId = result.run_id;
    expect(Array.isArray(result.results)).toBe(true);
  });

  test("returns a next question or a valid 'no more questions'", async () => {
    const question = await api.nextQuestion(sessionId, runId);
    expect(question.question === null || typeof question.question === "string").toBe(
      true,
    );
  });
});
