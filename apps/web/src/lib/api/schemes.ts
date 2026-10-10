import { api } from "./index";
import type { SchemeDetail, Guidance } from "./contracts";

export async function fetchSchemes(query: URLSearchParams) {
  return api.schemes(query);
}

export async function fetchSchemeDetail(schemeId: string): Promise<SchemeDetail> {
  return api.detail(schemeId);
}

export async function fetchSchemeGuidance(
  schemeId: string,
  sessionId?: string,
): Promise<Guidance> {
  return api.guidance(schemeId, sessionId);
}
