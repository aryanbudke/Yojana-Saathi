import type { ProfileFacts } from "@/lib/api/contracts";
import type { ProfileDraft } from "./types";

/** Sample description used by "Try an example" and the How it works illustration. */
export const example =
  "I’m a 24-year-old farmer from Maharashtra helping my family farm 1.5 acres.";
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
