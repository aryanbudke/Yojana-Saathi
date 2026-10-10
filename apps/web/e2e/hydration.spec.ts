import { test, expect } from "@playwright/test";

for (const hostname of ["localhost", "127.0.0.1"]) {
  const origin = `http://${hostname}:${process.env.PLAYWRIGHT_PORT ?? "3000"}`;
  test(`server-rendered header contains the current links and active route on ${hostname}`, async ({
    request,
  }) => {
    for (const [path, active] of [
      ["/dashboard", "Dashboard"],
      ["/discover", "Discover"],
      ["/help", "How it works"],
    ]) {
      const response = await request.get(`${origin}${path}`);
      expect(response.ok()).toBe(true);
      const html = await response.text();
      const header = html.match(
        /<nav[^>]*aria-label="Main navigation"[^>]*>(.*?)<\/nav>/s,
      )?.[1];
      expect(header).toBeDefined();
      expect(header).toContain('href="/dashboard"');
      expect(header).toContain(
        `aria-current="page" href="${path}">${active}</a>`,
      );
      expect(header?.match(/<a\b/g)).toHaveLength(3);
    }
  });

  test(`dashboard hydrates cleanly on direct load, reload and client navigation on ${hostname}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        /hydration|hydrating|server rendered|didn't match/i.test(message.text())
      ) {
        errors.push(message.text());
      }
    });
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(`${origin}/dashboard#dashboard-profile`);
    const navigation = page.getByRole("navigation", {
      name: "Main navigation",
    });
    const assertDashboard = async () => {
      // Opening the menu also proves that React attached the event handlers.
      await page.getByRole("button", { name: "Open navigation" }).click();
      await expect(navigation.getByRole("link")).toHaveCount(3);
      await expect(
        navigation.getByRole("link", { name: "Dashboard", exact: true }),
      ).toHaveAttribute("aria-current", "page");
      expect(errors).toEqual([]);
    };
    await assertDashboard();
    await page.reload({ waitUntil: "domcontentloaded" });
    await assertDashboard();
    await navigation.getByRole("link", { name: "How it works" }).click();
    await expect(page).toHaveURL(/\/help$/);
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(
      navigation.getByRole("link", { name: "How it works" }),
    ).toHaveAttribute("aria-current", "page");
    await navigation
      .getByRole("link", { name: "Dashboard", exact: true })
      .click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await assertDashboard();
    expect(errors).toEqual([]);
  });
}
