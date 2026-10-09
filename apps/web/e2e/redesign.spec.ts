import { test, expect } from "@playwright/test";

test("sticky navigation, active route and keyboard mobile menu", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page
      .getByRole("navigation")
      .getByRole("link", { name: "Discover", exact: true }),
  ).toHaveAttribute("aria-current", "page");
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
