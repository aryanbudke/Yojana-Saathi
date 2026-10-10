import { test, expect } from "@playwright/test";

for (const hostname of ["localhost", "127.0.0.1"]) {
  const origin = `http://${hostname}:${process.env.PLAYWRIGHT_PORT ?? "3000"}`;
  test(`server-rendered navigation includes the dashboard on ${hostname}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      await page.setViewportSize({ width: 1440, height: 900 });
      for (const [path, active] of [
        ["/dashboard", "Dashboard"],
        ["/discover", "Discover"],
        ["/profile", "Dashboard"],
      ]) {
        await page.goto(`${origin}${path}`);
        const nav = page.locator(".site-nav");
        await expect(nav.getByRole("link")).toHaveText([
          "Home",
          "Discover",
          "Matches",
          "Dashboard",
          "Saved",
        ]);
        await expect(
          nav.getByRole("link", { name: active, exact: true }),
        ).toHaveAttribute("aria-current", "page");
      }
    } finally {
      await context.close();
    }
  });

  test(`dashboard hydrates on direct load, reload and navigation on ${hostname}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        /hydration|hydrating|server rendered|didn't match|cached to avoid an infinite loop/i.test(
          message.text(),
        )
      )
        errors.push(message.text());
    });
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(`${origin}/dashboard#dashboard-profile`);
    const drawer = page.getByRole("dialog", { name: "Menu" });
    const assertDashboard = async () => {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await expect(drawer).toBeVisible();
      await expect(
        drawer.getByRole("link", { name: "Dashboard", exact: true }),
      ).toHaveAttribute("aria-current", "page");
      await page.keyboard.press("Escape");
      await expect(drawer).toBeHidden();
      expect(errors).toEqual([]);
    };
    await assertDashboard();
    await page.reload({ waitUntil: "domcontentloaded" });
    await assertDashboard();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await drawer.getByRole("link", { name: "Discover", exact: true }).click();
    await expect(page).toHaveURL(/\/discover$/);
    await page.getByRole("button", { name: "Open navigation" }).click();
    await drawer.getByRole("link", { name: "Dashboard", exact: true }).click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/dashboard");
    await assertDashboard();
  });
}
