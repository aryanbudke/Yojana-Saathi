import { api } from "./index";
import type { ProfileField, ProfileFacts, ProfileSession } from "./contracts";

export async function extractProfile(text: string) {
  return api.extract(text);
}

export async function createSession(): Promise<ProfileSession> {
  return api.createSession();
}

export async function deleteSession(sessionId: string): Promise<void> {
  return api.deleteSession(sessionId);
}

export async function submitAnswer(
  sessionId: string,
  field: ProfileField,
  value: ProfileFacts[ProfileField],
) {
  return api.answer(sessionId, field, value);
}
