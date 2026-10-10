import { describe, expect, it } from "vitest";
import { conciseSchemeText } from "./concise-text";

describe("conciseSchemeText", () => {
  it("keeps only the first two sentences", () => {
    expect(
      conciseSchemeText("First benefit. Second benefit. Third detail."),
    ).toBe("First benefit. Second benefit.");
  });

  it("removes a redundant benefit label", () => {
    expect(
      conciseSchemeText("Key benefits: Free training. Monthly stipend."),
    ).toBe("Free training. Monthly stipend.");
  });

  it("truncates long unstructured text on a word boundary", () => {
    const result = conciseSchemeText("word ".repeat(100), {
      maxLength: 60,
      maxSentences: 2,
    });

    expect(result.length).toBeLessThanOrEqual(61);
    expect(result.endsWith("…")).toBe(true);
    expect(result).not.toContain("wordw");
  });

  it("normalizes imported whitespace", () => {
    expect(conciseSchemeText("  Free\n\ntraining   and support.  ")).toBe(
      "Free training and support.",
    );
  });
});
