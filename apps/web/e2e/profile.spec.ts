import { test, expect } from "@playwright/test";
test("review, correct, confirm and clear a profile", async ({ page }) => {
  await page.goto("/discover");
  await expect(page.getByText("Mock mode", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("button", { name: "Find my schemes" }).click();
  await expect(page.getByLabel("Age", { exact: true })).toHaveValue("24");
  await expect(page.getByLabel("Annual family income")).toHaveValue("");
  await page.getByLabel("Age", { exact: true }).fill("40");
  await page.getByRole("button", { name: "Find my schemes" }).click();
  await expect(page.getByLabel("Age", { exact: true })).toHaveValue("40");
  await page.getByRole("button", { name: "Confirm my details" }).click();
  await expect(
    page.getByText("Confirmed by you", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear my details" }).click();
  await expect(page.getByLabel("Tell us about yourself")).toHaveValue("");
  await expect(page.getByLabel("Age", { exact: true })).not.toBeVisible();
});
test("manual entry preserves null instead of inventing facts", async ({
  page,
}) => {
  await page.goto("/discover");
  await page.getByRole("button", { name: "Enter details manually" }).click();
  await expect(page.getByLabel("Age", { exact: true })).toHaveValue("");
  await page.getByLabel("Age", { exact: true }).fill("25");
  await page.getByRole("button", { name: "Confirm my details" }).click();
  await expect(
    page.getByText("Confirmed by you", { exact: true }),
  ).toBeVisible();
});
