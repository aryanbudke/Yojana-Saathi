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

test("guidance, footer routes and FAQ are functional", async ({ page }) => {
  await page.goto("/");
  const guidance = page.getByRole("region", { name: "Application guidance" });
  await expect(guidance.getByRole("listitem")).toHaveCount(4);
  const footer = page.getByRole("contentinfo");
  await expect(footer).toContainText(String(new Date().getFullYear()));
  await footer.screenshot({ path: "test-results/footer-1280.png" });
  await guidance.screenshot({ path: "test-results/guidance-1280.png" });
  for (const [link, title] of [
    ["About", "Support starts with understanding."],
    ["Privacy policy", "Privacy and your profile"],
    ["Disclaimer", "Preliminary guidance, clear limits."],
  ]) {
    await footer.getByRole("link", { name: link, exact: true }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
  }
  await footer.getByRole("link", { name: "FAQ", exact: true }).click();
  await expect(page).toHaveURL(/\/help#faq$/);
  await page
    .getByText("Does a match mean I am officially eligible?", { exact: true })
    .click();
  await expect(
    page.getByText("No. Results explain checked conditions.", { exact: false }),
  ).toBeVisible();
});

test("landing finder confirms, asks and rematches without leaving the page", async ({
  page,
}) => {
  await page.goto("/");
  const finder = page.locator("#finder");
  await expect(
    finder.locator(".preview-facts").getByText("Unknown"),
  ).toHaveCount(6);
  await finder.getByRole("button", { name: "Try an example" }).click();
  await finder.getByRole("button", { name: "Find my schemes" }).click();
  await expect(finder.getByLabel("Age", { exact: true })).toHaveValue("24");
  await expect(finder.locator(".match-card")).toHaveCount(0);
  await finder.getByLabel("Age", { exact: true }).fill("25");
  await finder.getByRole("button", { name: "Confirm my details" }).click();
  await expect(
    finder
      .locator(".match-card")
      .getByText("Needs verification", { exact: true }),
  ).toBeVisible();
  await finder.getByRole("radio", { name: "Yes", exact: true }).check();
  await finder.getByRole("button", { name: "Update my matches" }).click();
  await expect(
    finder
      .locator(".match-card")
      .getByText("All checked conditions met", { exact: true }),
  ).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/");
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    (document.activeElement as HTMLElement)?.blur();
  });
  await page.screenshot({
    path: "test-results/finder-1280.png",
    fullPage: true,
  });
  await finder.getByRole("button", { name: "Clear my details" }).click();
  await expect(finder.locator(".match-card")).toHaveCount(0);
});

test("support category does not infer gender or student status", async ({
  page,
}) => {
  await page.goto("/");
  const finder = page.locator("#finder");
  await finder.getByRole("button", { name: "Women", exact: true }).click();
  await finder.getByRole("button", { name: "Enter details manually" }).click();
  await expect(
    finder.getByLabel("Support category", { exact: true }),
  ).toHaveValue("women");
  await expect(
    finder.getByLabel("Gender (only if needed)", { exact: true }),
  ).toHaveValue("");
  await expect(
    finder.getByLabel("Currently a student", { exact: true }),
  ).toHaveValue("");
});

for (const width of [375, 1280]) {
  test(`category discovery and official sources at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 2000 });
    await page.goto("/");
    const categories = page.getByRole("region", { name: "Popular categories" });
    await expect(categories.getByRole("link")).toHaveCount(6);
    const sources = page.getByRole("region", {
      name: "Trusted official sources",
    });
    const links = sources.getByRole("link");
    await expect(links).toHaveCount(4);
    for (const link of await links.all()) {
      expect(await link.getAttribute("href")).toMatch(
        /^https:\/\/.*\.gov\.in\//,
      );
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      await expect(link).toHaveAttribute("target", "_blank");
    }
    await categories.screenshot({
      path: `test-results/categories-${width}.png`,
    });
    await sources.screenshot({ path: `test-results/sources-${width}.png` });
    await categories.getByRole("link", { name: /^Agriculture/ }).click();
    await expect(page).toHaveURL(/\/discover\?category=agriculture#browse$/);
    await expect(
      page.getByRole("heading", { name: "Contract Fixture Scheme" }),
    ).toBeVisible();
  });
}
