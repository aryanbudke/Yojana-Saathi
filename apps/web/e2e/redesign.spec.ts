import { test, expect } from "@playwright/test";

test("sticky navigation, active route and keyboard mobile menu", async ({
  page,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation");
  await expect(
    nav.getByRole("link", { name: "Home", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.locator(".header-actions").getByRole("link", {
      name: "Find my schemes",
    }),
  ).toHaveAttribute("href", "/#finder");
  await page.goto("/discover");
  await expect(
    nav.getByRole("link", { name: "Discover schemes", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    nav.getByRole("link", { name: "Home", exact: true }),
  ).not.toHaveAttribute("aria-current", "page");
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.click();
  await expect(page.getByRole("navigation")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(page.getByRole("navigation")).toBeHidden();
  await menu.click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "How it works" })
    .click();
  await expect(page).toHaveURL(/\/help$/);
  await expect(page.getByRole("navigation")).toBeHidden();
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "How it works" }),
  ).toHaveAttribute("aria-current", "page");
  await page.evaluate(() => window.scrollTo(0, 400));
  expect((await page.locator("header.header").boundingBox())?.y).toBe(0);
});

test("primary action stays in initial laptop viewport and workspace never overflows", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Tell us about your situation" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (width >= 1024) {
      const cta = await page
        .getByRole("button", { name: "Find my schemes" })
        .boundingBox();
      expect(cta!.y + cta!.height).toBeLessThanOrEqual(720);
    }
  }
});

test("recommendation status filter and clear use the actual matches", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("button", { name: "Find my schemes" }).click();
  await page.getByRole("button", { name: "Confirm my details" }).click();
  await page.getByRole("link", { name: "See my recommendations" }).click();
  await expect(
    page.getByRole("heading", { name: "Contract Fixture Scheme" }),
  ).toBeVisible();
  await page.getByLabel("Show conditions").selectOption("not_eligible");
  await expect(page.getByText("No schemes with this status")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Contract Fixture Scheme" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Show all statuses" }).click();
  await expect(
    page.getByRole("heading", { name: "Contract Fixture Scheme" }),
  ).toBeVisible();
  await expect(page.getByText("Mock mode", { exact: true })).toBeVisible();
});

test("empty state clears filters and reduced motion disables transitions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/discover?category=education");
  await expect(
    page.getByRole("heading", { name: "No schemes found for these filters" }),
  ).toBeVisible();
  await page
    .locator(".empty")
    .getByRole("button", { name: "Clear filters" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Contract Fixture Scheme" }),
  ).toBeVisible();
  expect(
    await page
      .getByRole("button", { name: "Find my schemes" })
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
});
