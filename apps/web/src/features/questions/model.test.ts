import { expect, it } from "vitest";
import { answerValue, describeChanges } from "./model";
import { questionSchema, matchesSchema } from "@/lib/api/contracts";
import question from "@/lib/api/fixtures/question-next.response.json";
import matches from "@/lib/api/fixtures/matches.response.json";
it("keeps not sure distinct from no and rejects unsupported sensitive questions", () => {
  expect(answerValue(questionSchema.parse(question), "not_sure").value).toBe(
    "not_sure",
  );
  expect(() =>
    answerValue({ ...questionSchema.parse(question), field: "aadhaar" }, "123"),
  ).toThrow();
  expect(
    answerValue(
      { ...questionSchema.parse(question), field: "has_disability" },
      "not_sure",
    ).value,
  ).toBe(null);
});
it("announces returned status changes rather than deriving eligibility", () => {
  const a = matchesSchema.parse(matches);
  const b = structuredClone(a);
  b.results[0].status = "not_eligible";
  expect(describeChanges(a, b)).toContain("Needs verification → Not eligible");
  expect(describeChanges(a, a)).toContain("No scheme status changed");
});
