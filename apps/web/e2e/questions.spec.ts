import { test, expect } from "@playwright/test";
async function begin(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("button", { name: "Find my schemes" }).click();
  await page.getByRole("button", { name: "Confirm my details" }).click();
  await page.getByRole("link", { name: "See my recommendations" }).click();
  await expect(
    page.getByText("Is the land registered to your family?", { exact: true }),
  ).toBeVisible();
}
test("answer, rematch, explain change and edit previous answer", async ({
  page,
}) => {
  await begin(page);
  await page.getByRole("radio", { name: "Yes", exact: true }).check();
  await page.getByRole("button", { name: "Update my matches" }).click();
  await expect(
    page
      .locator(".match-card")
      .getByText("All checked conditions met", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Needs verification → All checked conditions met", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit my previous answer" }).click();
  await page.getByRole("radio", { name: "No", exact: true }).check();
  await page.getByRole("button", { name: "Update my matches" }).click();
  await expect(
    page.locator(".match-card").getByText("Not eligible", { exact: true }),
  ).toBeVisible();
});
test("not sure stays unknown and does not repeat the question", async ({
  page,
}) => {
  await begin(page);
  await page.getByRole("radio", { name: "Not sure" }).check();
  await page.getByRole("button", { name: "Update my matches" }).click();
  await expect(
    page.getByText("No scheme status changed", { exact: false }),
  ).toBeVisible();
  await expect(
    page
      .locator(".match-card")
      .getByText("Needs verification", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(0);
});
