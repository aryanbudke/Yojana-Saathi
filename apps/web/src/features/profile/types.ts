import type {
  ProfileFacts,
  ProfileField,
  FactOrigin,
} from "@/lib/api/contracts";
export type Origins = Partial<Record<ProfileField, FactOrigin>>;
export type ProfileDraft = { facts: ProfileFacts; origins: Origins };
/** State and union-territory codes; names live in messages `states`. */
export const states = [
  "AP",
  "AR",
  "AS",
  "BR",
  "CG",
  "GA",
  "GJ",
  "HR",
  "HP",
  "JH",
  "KA",
  "KL",
  "MP",
  "MH",
  "MN",
  "ML",
  "MZ",
  "NL",
  "OD",
  "PB",
  "RJ",
  "SK",
  "TN",
  "TS",
  "TR",
  "UP",
  "UK",
  "WB",
  "AN",
  "CH",
  "DN",
  "DL",
  "JK",
  "LA",
  "LD",
  "PY",
] as const;
/** Labels live in messages `fields`, keyed by `key`. */
export const fields: {
  key: ProfileField;
  kind: "number" | "text" | "state" | "choice" | "boolean";
  max?: number;
}[] = [
  { key: "age", kind: "number", max: 120 },
  { key: "state_code", kind: "state" },
  { key: "occupation", kind: "text" },
  {
    key: "family_income_inr",
    kind: "number",
    max: 1_000_000_000,
  },
  {
    key: "land_area_acres",
    kind: "number",
    max: 1_000_000,
  },
  {
    key: "land_registration",
    kind: "choice",
  },
  { key: "category", kind: "text" },
  { key: "is_student", kind: "boolean" },
  { key: "gender", kind: "text" },
  {
    key: "social_category",
    kind: "text",
  },
  {
    key: "has_disability",
    kind: "boolean",
  },
];

export type FieldStatus =
  | "extracted"
  | "user_corrected"
  | "user_added"
  | "confirmed"
  | "unknown";

export const essentialFields: ProfileField[] = [
  "age",
  "family_income_inr",
  "category",
];

export const additionalFields: ProfileField[] = [
  "land_area_acres",
  "land_registration",
  "is_student",
  "gender",
  "social_category",
  "has_disability",
];

export const supportCategoryOptions = [
  { value: "agriculture", label: "Agriculture & Farming" },
  { value: "education", label: "Education & Student Aid" },
  { value: "housing", label: "Housing & Shelter" },
  { value: "health", label: "Health & Wellness" },
  { value: "business", label: "Small Business & Entrepreneurship" },
  { value: "social_welfare", label: "Social Welfare & Security" },
  { value: "employment", label: "Skill Development & Employment" },
] as const;
