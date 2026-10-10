import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`guest dashboard is accessible without overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Your next step starts here." }),
    ).toBeVisible();
    await expect(page.locator(".dashboard-catalogue-list")).toBeVisible();
    await expect(page.locator(".dashboard-stats")).toContainText("0 / 11");
    await expect(page.locator(".dashboard-stats")).toContainText(
      "Confirm your profile to begin",
    );
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
    if (width === 375 || width === 1440)
      await page.screenshot({
        path: `artifacts/dashboard/guest-${width}.png`,
        fullPage: true,
        style: "nextjs-portal { visibility: hidden; }",
      });
  });
}

test("dashboard connects profile review, scheme checks and official guidance", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page
    .getByRole("link", { name: "Create my profile", exact: true })
    .click();
  await expect(page.getByLabel("Age", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("button", { name: "Find my schemes" }).click();
  await page.getByRole("button", { name: "Confirm my details" }).click();
  await page.getByRole("link", { name: "Open my dashboard" }).click();
  await expect(page.locator(".dashboard-profile")).toContainText("Maharashtra");
  await expect(page.locator(".dashboard-profile")).toContainText(
    "Confirmed by you",
  );
  await expect(page.locator(".dashboard-profile dd").first()).toHaveText("24");
  await page
    .getByRole("link", { name: "Check my schemes", exact: true })
    .click();
  await expect(
    page
      .locator(".match-card")
      .getByText("Needs verification", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Dashboard", exact: true })
    .click();
  await expect(
    page.locator("#dashboard-recommendations .match-card"),
  ).toHaveCount(1);
  await expect(
    page.locator(".dashboard-stats > div").nth(1).locator("strong"),
  ).toHaveText("1");
  await expect(
    page.locator(".dashboard-stats > div").nth(2).locator("strong"),
  ).toHaveText("1");
  await expect(page.locator("main")).not.toContainText("84%");
  await expect(
    page.locator("#dashboard-recommendations .benefit-line"),
  ).toBeVisible();
  await expect(page.locator(".dashboard-catalogue-list")).toBeVisible();
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({
    path: "artifacts/dashboard/with-profile-1440.png",
    fullPage: true,
    style: "nextjs-portal { visibility: hidden; }",
  });
  await page.getByRole("link", { name: "Open guidance", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your personal checklist" }),
  ).toBeVisible();
});

test("dashboard removes stale matches after profile edits and preserves guest privacy on refresh", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto("/discover");
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("button", { name: "Find my schemes" }).click();
  await page.getByRole("button", { name: "Confirm my details" }).click();
  await page.getByRole("link", { name: "See my recommendations" }).click();
  await expect(page.locator(".match-card")).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Dashboard", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Edit my profile", exact: true })
    .click();
  await page.getByLabel("Age", { exact: true }).fill("40");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Dashboard", exact: true })
    .click();
  await expect(page.locator(".dashboard-profile")).toContainText(
    "Awaiting your confirmation",
  );
  await expect(
    page.locator("#dashboard-recommendations .match-card"),
  ).toHaveCount(0);
  await expect(
    page.locator(".dashboard-stats > div").nth(1).locator("strong"),
  ).toHaveText("—");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator(".dashboard-profile")).toContainText("Not started");
  await expect(page.locator(".dashboard-stats")).toContainText("0 / 11");
});

test("dashboard navigation works with keyboard and category filters", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page
    .getByRole("link", { name: "Create my profile", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Age", { exact: true })).toBeVisible();
  await page.goBack();
  await page
    .locator(".dashboard-categories")
    .getByRole("link", { name: "Student" })
    .click();
  await expect(page).toHaveURL(/\/discover\?category=education#browse$/);
  await expect(
    page.getByRole("heading", { name: "No schemes found for these filters" }),
  ).toBeVisible();
});
