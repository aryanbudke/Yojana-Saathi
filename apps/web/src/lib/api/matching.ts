import { api } from "./index";
import type { ProfileFacts, MatchesResponse, NextQuestion } from "./contracts";

export async function fetchMatches(
  sessionId: string,
  facts: ProfileFacts,
): Promise<MatchesResponse> {
  return api.matches(sessionId, facts);
}

export async function fetchNextQuestion(
  sessionId: string,
  runId: string,
): Promise<NextQuestion> {
  return api.nextQuestion(sessionId, runId);
}
