import type { ProfileFacts, ProfileField } from "@/lib/api/contracts";
import type { ProfileDraft } from "./types";
import type { Messages } from "@/i18n/messages/en";

export function fieldsToConfirm(facts: ProfileFacts, previous: ProfileFacts) {
  // Unanswered blanks must remain available for follow-up; clearing a known fact still needs a write.
  return (Object.keys(facts) as ProfileField[]).filter(
    (field) => facts[field] !== null || previous[field] !== null,
  );
}
export function mergeExtraction(
  previous: ProfileDraft,
  incoming: ProfileFacts,
): ProfileDraft {
  const facts = { ...incoming };
  const origins = { ...previous.origins };
  for (const field of Object.keys(incoming) as (keyof ProfileFacts)[]) {
    if (origins[field] === "user")
      Object.assign(facts, { [field]: previous.facts[field] });
    else origins[field] = "model_extracted";
  }
  return { facts, origins };
}
export function fieldValue(
  kind: string,
  value: string,
): string | number | boolean | null {
  if (value === "") return null;
  if (kind === "number") return Number(value);
  if (kind === "boolean") return value === "yes";
  return value;
}
/** A profile value as the reader sees it: state names, yes/no and "Unknown" in their language. */
export function factLabel(
  field: ProfileField,
  value: ProfileFacts[ProfileField],
  m: Messages,
): string {
  if (value === null) return m.common.unknown;
  if (typeof value === "boolean") return value ? m.common.yes : m.common.no;
  if (field === "state_code") return m.states[value] ?? String(value);
  if (field === "land_registration") return m.answers[value] ?? String(value);
  return String(value);
}
