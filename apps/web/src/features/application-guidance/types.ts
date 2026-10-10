import type { Guidance } from "@/lib/api/contracts";

export interface ApplicationGuidanceState {
  guidance: Guidance | null;
  loading: boolean;
  error?: string;
}
