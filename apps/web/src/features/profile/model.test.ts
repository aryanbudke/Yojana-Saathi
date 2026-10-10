import { expect, it } from "vitest";
import { blankFacts, profileSchema } from "@/lib/api/contracts";
import {
  fieldsToConfirm,
  fieldValue,
  mergeExtraction,
  getFieldStatus,
  getExtractedFields,
  getMissingEssentialFields,
  getAdditionalFields,
} from "./model";
it("leaves new unknowns unanswered while saving false, zero and cleared known facts", () => {
  expect(fieldsToConfirm(blankFacts, blankFacts)).toEqual([]);
  expect(
    fieldsToConfirm(
      {
        ...blankFacts,
        age: 0,
        is_student: false,
        land_registration: "not_sure",
      },
      blankFacts,
    ),
  ).toEqual(["age", "land_registration", "is_student"]);
  expect(
    fieldsToConfirm(blankFacts, {
      ...blankFacts,
      age: 0,
      is_student: false,
      land_registration: "yes",
    }),
  ).toEqual(["age", "land_registration", "is_student"]);
});
it("keeps citizen corrections, including explicit unknown, over repeat extraction", () => {
  const draft = {
    facts: { ...blankFacts, age: 40, family_income_inr: null },
    origins: { age: "user" as const, family_income_inr: "user" as const },
  };
  const next = mergeExtraction(draft, {
    ...blankFacts,
    age: 24,
    family_income_inr: 90000,
    state_code: "MH",
  });
  expect(next.facts.age).toBe(40);
  expect(next.facts.family_income_inr).toBe(null);
  expect(next.facts.state_code).toBe("MH");
});
it("does not coerce blank and zero to the same fact", () => {
  expect(fieldValue("number", "")).toBe(null);
  expect(fieldValue("number", "0")).toBe(0);
  expect(fieldValue("boolean", "no")).toBe(false);
  expect(fieldValue("choice", "not_sure")).toBe("not_sure");
  expect(fieldValue("list", " Education, housing, education ")).toEqual([
    "education",
    "housing",
  ]);
});
it("validates bounded structured support needs", () => {
  expect(
    profileSchema.safeParse({
      ...blankFacts,
      support_needs: ["education", "housing"],
    }).success,
  ).toBe(true);
  expect(
    profileSchema.safeParse({
      ...blankFacts,
      support_needs: Array.from({ length: 11 }, (_, index) => `need-${index}`),
    }).success,
  ).toBe(false);
});
it("rejects out of range manual entries", () => {
  expect(profileSchema.safeParse({ ...blankFacts, age: 121 }).success).toBe(
    false,
  );
  expect(
    profileSchema.safeParse({ ...blankFacts, age: 24, family_income_inr: 0 })
      .success,
  ).toBe(true);
});

it("correctly classifies field statuses across extracted, corrected, user_added, confirmed, and unknown", () => {
  const snapshot = {
    ...blankFacts,
    state_code: "MH",
    occupation: "farmer",
    age: 24,
  };
  const draft = {
    facts: {
      ...blankFacts,
      state_code: "MH",
      occupation: "organic farmer", // corrected
      age: 24, // extracted
      family_income_inr: 0, // user_added (zero is not unknown!)
      category: null, // unknown
    },
    origins: {
      state_code: "model_extracted" as const,
      occupation: "user" as const,
      age: "model_extracted" as const,
      family_income_inr: "user" as const,
    },
  };

  expect(getFieldStatus("state_code", draft, snapshot)).toBe("extracted");
  expect(getFieldStatus("occupation", draft, snapshot)).toBe("user_corrected");
  expect(getFieldStatus("age", draft, snapshot)).toBe("extracted");
  expect(getFieldStatus("family_income_inr", draft, snapshot)).toBe(
    "user_added",
  );
  expect(getFieldStatus("category", draft, snapshot)).toBe("unknown");

  // Confirmed status
  expect(getFieldStatus("state_code", draft, snapshot, true)).toBe("confirmed");

  // Extracted fields
  const extracted = getExtractedFields(snapshot, draft);
  expect(extracted).toEqual(["age", "state_code", "occupation"]);

  // Missing essentials
  const missingEssentials = getMissingEssentialFields(extracted);
  expect(missingEssentials).toEqual(["family_income_inr", "category"]);

  // Additional fields
  const additional = getAdditionalFields(extracted);
  expect(additional).toEqual([
    "land_area_acres",
    "land_registration",
    "is_student",
    "gender",
    "social_category",
    "has_disability",
  ]);
});

it("does not treat false, zero, and unknown null as interchangeable", () => {
  // age: null is unknown
  expect(profileSchema.parse({ ...blankFacts, age: null }).age).toBe(null);
  // age: 0 is baby / newborn, valid 0
  expect(profileSchema.parse({ ...blankFacts, age: 0 }).age).toBe(0);
  // income: 0 is zero income, not null
  expect(
    profileSchema.parse({ ...blankFacts, family_income_inr: 0 })
      .family_income_inr,
  ).toBe(0);
  // is_student: false is explicitly not a student, not null
  expect(
    profileSchema.parse({ ...blankFacts, is_student: false }).is_student,
  ).toBe(false);
  // is_student: null is unknown
  expect(
    profileSchema.parse({ ...blankFacts, is_student: null }).is_student,
  ).toBe(null);
});
