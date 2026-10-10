import { describe, expect, it } from "vitest";
import {
  blankFacts,
  matchesSchema,
  type ProfileSession,
} from "@/lib/api/contracts";
import fixture from "@/lib/api/fixtures/matches.response.json";
import { dashboardSummary, profileDisplay } from "./model";

const now = Date.parse("2026-10-10T10:00:00Z");
const session: ProfileSession = {
  session_id: "50000000-0000-4000-8000-000000000001",
  expires_at: "2026-10-10T11:00:00Z",
  facts: blankFacts,
};
const matches = matchesSchema.parse(fixture);
const input = {
  facts: blankFacts,
  confirmed: true,
  session,
  matches,
  matchKey: JSON.stringify({
    sessionId: session.session_id,
    facts: blankFacts,
  }),
  now,
};

describe("dashboard summaries respect reviewed session state", () => {
  it("never counts unknown facts, but preserves false and zero", () => {
    expect(
      dashboardSummary({
        ...input,
        facts: { ...blankFacts, age: 0, is_student: false },
      }).provided,
    ).toBe(2);
    expect(profileDisplay(null)).toBe("Not provided");
    expect(profileDisplay(false)).toBe("No");
    expect(profileDisplay(0)).toBe("0");
  });
  it("counts returned verdicts without evaluating eligibility", () => {
    const summary = dashboardSummary(input);
    expect(summary.current?.results).toEqual(matches.results);
    expect(summary.needsInformation).toBe(1);
    expect(summary.manualReview).toBe(0);
  });
  it("hides stale matches when facts are edited or confirmation is missing", () => {
    expect(
      dashboardSummary({ ...input, facts: { ...blankFacts, age: 40 } }).current,
    ).toBeNull();
    expect(dashboardSummary({ ...input, confirmed: false }).current).toBeNull();
    expect(dashboardSummary({ ...input, session: null }).current).toBeNull();
  });
  it("expires matches at the session deadline without erasing profile facts", () => {
    const summary = dashboardSummary({
      ...input,
      now: Date.parse(session.expires_at),
    });
    expect(summary.expired).toBe(true);
    expect(summary.active).toBe(false);
    expect(summary.current).toBeNull();
    expect(summary.needsInformation).toBeNull();
  });
});
