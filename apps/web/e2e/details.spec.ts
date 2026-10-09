import { test, expect } from "@playwright/test";
const id = "20000000-0000-4000-8000-000000000001";
test("details carry sources, verification date and functional document/application disclosures", async ({
  page,
}) => {
  await page.goto(`/schemes/${id}`);
  await expect(
    page.getByRole("heading", { name: "Contract Fixture Scheme" }),
  ).toBeVisible();
  await expect(
    page.getByText("Last verified on 20 Sept 2026", { exact: false }),
  ).toBeVisible();
  await page.locator("summary").filter({ hasText: "Documents" }).click();
  await expect(
    page.getByText("Example supporting record", { exact: true }),
  ).toBeVisible();
  await page.locator("summary").filter({ hasText: "How to apply" }).click();
  await expect(
    page.getByText(
      "Review the requirements on the official application page.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.locator('a[href*=".invalid"]')).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Official sources", exact: true }),
  ).toBeVisible();
});
test("unknown scheme has an error and retry rather than invented content", async ({
  page,
}) => {
  await page.goto("/schemes/not-a-real-id");
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Scheme not found",
  );
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});
