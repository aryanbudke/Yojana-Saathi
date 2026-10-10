import { test, expect } from "@playwright/test";

test("navbar links, active route, CTA and keyboard mobile drawer", async ({
  page,
}) => {
  const destinations = ["Home", "Discover", "Matches", "Profile", "Saved"];
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  const nav = page.getByRole("banner").getByRole("navigation", {
    name: "Main navigation",
  });
  await expect(nav.getByRole("link")).toHaveText(destinations);
  await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(
    page.locator(".site-actions").getByRole("link", { name: "Find my schemes" }),
  ).toHaveAttribute("href", "/discover");

  for (const [name, url] of [
    ["Discover", /\/discover$/],
    ["Matches", /\/recommendations$/],
    ["Profile", /\/profile$/],
    ["Saved", /\/saved$/],
  ] as const) {
    await nav.getByRole("link", { name }).click();
    await expect(page).toHaveURL(url);
    await expect(nav.locator("[aria-current]")).toHaveText(name);
  }
  await page
    .getByRole("banner")
    .getByRole("link", { name: "yojana saathi home" })
    .click();
  await expect(page).toHaveURL(/\/$/);

  await page.evaluate(() => window.scrollTo(0, 400));
  await expect(page.locator("header.site-header")).toHaveAttribute(
    "data-scrolled",
    "true",
  );
  expect((await page.locator("header.site-header").boundingBox())?.y).toBe(0);

  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole("button", { name: "Open navigation" });
  const drawer = page.getByRole("dialog", { name: "Menu" });
  await menu.click();
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("link")).toHaveText([
    ...destinations,
    "Find my schemes",
  ]);
  await expect
    .poll(() =>
      page.evaluate(() => getComputedStyle(document.documentElement).overflow),
    )
    .toBe("hidden");
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(menu).toBeFocused();
  await menu.click();
  await drawer.getByRole("link", { name: "Saved" }).click();
  await expect(page).toHaveURL(/\/saved$/);
  await expect(drawer).toBeHidden();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBe(0);
});

test("language selector translates the page and keeps working state", async ({
  page,
}) => {
  await page.goto("/discover");
  await page.getByRole("button", { name: "Try an example" }).click();
  const text = await page.locator("#profile-text").inputValue();
  const banner = page.getByRole("banner");
  await banner.getByRole("combobox", { name: "Language" }).selectOption("hi");
  await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  await expect(
    page
      .getByRole("banner")
      .getByRole("navigation", { name: "मुख्य नेविगेशन" })
      .getByRole("link"),
  ).toHaveText(["होम", "खोजें", "मिलान", "प्रोफ़ाइल", "सहेजी गई"]);
  // A refresh, not a reload: the description typed before switching is still there.
  await expect(page.locator("#profile-text")).toHaveValue(text);
  // Voice input follows the interface language until the person picks one.
  await expect(page.getByRole("button", { name: "बोलकर बताएँ" })).toBeVisible();
  await expect(page.getByLabel("बोलने की भाषा")).toHaveValue("hi-IN");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  await banner.getByRole("combobox", { name: "भाषा" }).selectOption("kn");
  await expect(page.locator("html")).toHaveAttribute("lang", "kn");
  await banner.getByRole("combobox", { name: "ಭಾಷೆ" }).selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("primary action stays in initial laptop viewport and workspace never overflows", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    // The hero's primary action must be visible without scrolling on laptops.
    const heroCta = page
      .locator("main")
      .getByRole("link", { name: "Find my schemes" });
    await expect(heroCta).toHaveAttribute("href", "/discover");
    if (width >= 1024) {
      const cta = await heroCta.boundingBox();
      expect(cta!.y + cta!.height).toBeLessThanOrEqual(720);
    }
  }
});

test("recommendation status filter and clear use the actual matches", async ({
  page,
}) => {
  await page.goto("/discover");
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
