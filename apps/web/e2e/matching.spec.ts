import { test, expect } from "@playwright/test";
test("only matches after confirmation and explains source-linked unknowns without percentages", async ({
  page,
}) => {
  await page.goto("/recommendations");
  await expect(
    page.getByRole("heading", { name: "Start with your details" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Create my profile" }).click();
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("button", { name: "Find my schemes" }).click();
  await page.getByRole("button", { name: "Confirm my details" }).click();
  await page.getByRole("link", { name: "See my recommendations" }).click();
  await expect(
    page.getByText("Needs verification", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Land registration has not been confirmed.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByText("Why this match?", { exact: true }).click();
  await expect(
    page.getByText("Version 30000000", { exact: false }),
  ).toBeVisible();
  await expect(page.locator("main")).not.toContainText("84%");
});
