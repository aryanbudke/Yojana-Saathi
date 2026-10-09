import type {
  MatchesResponse,
  NextQuestion,
  ProfileFacts,
  ProfileField,
} from "@/lib/api/contracts";
import { fields } from "@/features/profile/types";
import { fieldValue } from "@/features/profile/model";
import { verdictLabels } from "@/features/matching/types";
export function answerValue(
  question: NextQuestion,
  value: string,
): { field: ProfileField; value: ProfileFacts[ProfileField] } {
  const meta = fields.find((f) => f.key === question.field);
  if (!meta)
    throw new Error(
      "This question is not a supported profile field. Please use manual verification.",
    );
  return {
    field: meta.key,
    value:
      value === "not_sure" && meta.kind !== "choice"
        ? null
        : fieldValue(meta.kind, value),
  };
}
export function describeChanges(
  before: MatchesResponse,
  after: MatchesResponse,
) {
  const changed = after.results.flatMap((next) => {
    const old = before.results.find((r) => r.scheme_id === next.scheme_id);
    if (!old) return [`${next.scheme_name}: added to your shortlist.`];
    if (old.status !== next.status)
      return [
        `${next.scheme_name}: ${verdictLabels[old.status].text} → ${verdictLabels[next.status].text}.`,
      ];
    if (
      JSON.stringify(old.unknown_rules) !== JSON.stringify(next.unknown_rules)
    )
      return [`${next.scheme_name}: its unresolved conditions changed.`];
    return [];
  });
  return changed.length
    ? changed.join(" ")
    : "Your answer was saved. No scheme status changed; unresolved conditions still need verification.";
}
