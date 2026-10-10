import type {
  MatchesResponse,
  ProfileFacts,
  ProfileSession,
} from "@/lib/api/contracts";

export function dashboardSummary({
  facts,
  confirmed,
  session,
  matches,
  matchKey,
  now,
}: {
  facts: ProfileFacts;
  confirmed: boolean;
  session: ProfileSession | null;
  matches: MatchesResponse | null;
  matchKey: string;
  now: number;
}) {
  const provided = Object.values(facts).filter(
    (value) => value !== null,
  ).length;
  const active = Boolean(
    confirmed && session && Date.parse(session.expires_at) > now,
  );
  const current =
    active &&
    matchKey === JSON.stringify({ sessionId: session?.session_id, facts })
      ? matches
      : null;
  return {
    provided,
    totalFields: Object.keys(facts).length,
    active,
    expired: Boolean(session && Date.parse(session.expires_at) <= now),
    current,
    needsInformation:
      current?.results.filter((match) => match.status === "needs_information")
        .length ?? null,
    manualReview:
      current?.results.filter((match) => match.status === "manual_review")
        .length ?? null,
  };
}

export function profileDisplay(value: ProfileFacts[keyof ProfileFacts]) {
  if (value === null) return "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === "not_sure") return "Not sure";
  return String(value);
}
