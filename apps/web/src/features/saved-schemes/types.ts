import type { SchemeSummary } from "@/lib/api/contracts";

export interface SavedSchemeItem extends SchemeSummary {
  savedAt: string;
}
