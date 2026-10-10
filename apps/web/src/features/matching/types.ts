import type { SchemeMatch } from "@/lib/api/contracts";
/** Badge tone per verdict; the label text lives in messages `verdicts`. */
export const verdictTones: Record<SchemeMatch["status"], string> = {
  all_checked_conditions_met: "success",
  needs_information: "warning",
  not_eligible: "danger",
  manual_review: "info",
};
