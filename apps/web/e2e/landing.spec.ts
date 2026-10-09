import { expect, test } from "@playwright/test";

for (const width of [375, 1280]) {
  test(`How it works section at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const section = page.locator("#how-it-works");
    await expect(section.getByRole("listitem")).toHaveCount(3);
    await expect(
      section.getByRole("heading", { name: /Share your needs/ }),
    ).toBeVisible();
    await section.screenshot({ path: `test-results/how-${width}.png` });
    await section
      .getByRole("link", { name: "Describe your situation" })
      .click();
    await expect(page).toHaveURL(/#finder$/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBe(0);
  });
}
