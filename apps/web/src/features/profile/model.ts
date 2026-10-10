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

/** Determines whether a specific field is extracted, corrected, user added, confirmed, or unknown. */
export function getFieldStatus(
  field: ProfileField,
  draft: ProfileDraft,
  extractedSnapshot: ProfileFacts | null,
  isConfirmed = false,
): import("./types").FieldStatus {
  if (isConfirmed && draft.facts[field] !== null) return "confirmed";

  const currentValue = draft.facts[field];
  const originalExtracted = extractedSnapshot
    ? extractedSnapshot[field]
    : draft.origins[field] === "model_extracted"
      ? currentValue
      : null;

  if (currentValue === null) {
    if (originalExtracted !== null && originalExtracted !== undefined) {
      return "user_corrected";
    }
    return "unknown";
  }

  if (originalExtracted !== null && originalExtracted !== undefined) {
    return currentValue === originalExtracted ? "extracted" : "user_corrected";
  }

  if (draft.origins[field] === "model_extracted") {
    return "extracted";
  }

  return "user_added";
}

/** Returns the list of fields that were actually extracted by the AI from user input. */
export function getExtractedFields(
  extractedSnapshot: ProfileFacts | null,
  draft: ProfileDraft,
): ProfileField[] {
  if (extractedSnapshot) {
    return (Object.keys(extractedSnapshot) as ProfileField[]).filter(
      (f) => extractedSnapshot[f] !== null,
    );
  }
  return (Object.keys(draft.facts) as ProfileField[]).filter(
    (f) => draft.origins[f] === "model_extracted" && draft.facts[f] !== null,
  );
}

/** Returns missing essential fields (age, family_income_inr, category) that weren't extracted. */
export function getMissingEssentialFields(
  extractedFields: ProfileField[],
): ProfileField[] {
  const essentials: ProfileField[] = ["age", "family_income_inr", "category"];
  return essentials.filter((f) => !extractedFields.includes(f));
}

/** Returns additional fields that were not extracted into Section A. */
export function getAdditionalFields(
  extractedFields: ProfileField[],
): ProfileField[] {
  const additionals: ProfileField[] = [
    "land_area_acres",
    "land_registration",
    "is_student",
    "gender",
    "social_category",
    "has_disability",
  ];
  return additionals.filter((f) => !extractedFields.includes(f));
}
