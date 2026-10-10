import type {
  MatchesResponse,
  NextQuestion,
  ProfileFacts,
  ProfileField,
} from "@/lib/api/contracts";
import { fields } from "@/features/profile/types";
import { fieldValue } from "@/features/profile/model";
import { format } from "@/i18n/config";
import { en, type Messages } from "@/i18n/messages/en";
export function answerValue(
  question: NextQuestion,
  value: string,
  m: Messages = en,
): { field: ProfileField; value: ProfileFacts[ProfileField] } {
  const meta = fields.find((f) => f.key === question.field);
  if (!meta) throw new Error(m.followUp.unsupported);
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
  m: Messages = en,
) {
  const changed = after.results.flatMap((next) => {
    const scheme = next.scheme_name;
    const old = before.results.find((r) => r.scheme_id === next.scheme_id);
    if (!old) return [format(m.changes.added, { scheme })];
    if (old.status !== next.status)
      return [
        format(m.changes.status, {
          scheme,
          from: m.verdicts[old.status],
          to: m.verdicts[next.status],
        }),
      ];
    if (
      JSON.stringify(old.unknown_rules) !== JSON.stringify(next.unknown_rules)
    )
      return [format(m.changes.unresolved, { scheme })];
    return [];
  });
  return changed.length ? changed.join(" ") : m.changes.none;
}
