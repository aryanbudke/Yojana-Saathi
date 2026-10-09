import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const scheme = "20000000-0000-4000-8000-000000000001";
for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
  test(`accessible full journey at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    async function check() {
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        )
        .toBe(true);
      const results = await new AxeBuilder({ page })
        .include("main")
        .include("header")
        .include("footer")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    }
    await expect(
      page.getByRole("heading", { name: "Contract Fixture Scheme" }),
    ).toBeVisible();
    await check();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: "Try an example" }).click();
    await page.getByRole("button", { name: "Find my schemes" }).click();
    await expect(page.getByLabel("Age", { exact: true })).toBeVisible();
    await check();
    await page.getByRole("button", { name: "Confirm my details" }).click();
    await page.getByRole("link", { name: "See my recommendations" }).click();
    await expect(
      page
        .locator(".match-card")
        .getByText("Needs verification", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Is the land registered to your family?", { exact: true }),
    ).toBeVisible();
    await check();
    await page.getByRole("radio", { name: "Yes", exact: true }).focus();
    await page.keyboard.press("Space");
    await page.getByRole("button", { name: "Update my matches" }).focus();
    await page.keyboard.press("Enter");
    await expect(
      page
        .locator(".match-card")
        .getByText("All checked conditions met", { exact: true }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Explore this scheme" }).click();
    await expect(
      page.getByRole("heading", { name: "Official sources", exact: true }),
    ).toBeVisible();
    await check();
    await page.getByRole("link", { name: "Prepare my checklist" }).click();
    await expect(
      page.getByRole("heading", { name: "Your personal checklist" }),
    ).toBeVisible();
    await check();
    expect(page.url()).toContain(`/schemes/${scheme}/apply`);
  });
}
