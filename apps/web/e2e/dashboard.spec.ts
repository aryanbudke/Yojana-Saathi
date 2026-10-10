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
      page.getByRole("heading", { name: "Your scheme journey, together." }),
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
    .locator(".dashboard-heading")
    .getByRole("link", { name: "Create my profile", exact: true })
    .click();
  await expect(page.getByLabel("Age", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("button", { name: "Find my schemes" }).click();
  await expect(page.getByLabel("Age", { exact: true })).toHaveValue("24");
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
  ).toBeVisible({ timeout: 20_000 });
});

test("dashboard removes stale matches after profile edits and preserves guest privacy on refresh", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto("/discover");
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("button", { name: "Find my schemes" }).click();
  await expect(page.getByLabel("Age", { exact: true })).toHaveValue("24");
  await page.getByRole("button", { name: "Confirm my details" }).click();
  await page.getByRole("link", { name: "See my recommendations" }).click();
  await expect(page.locator(".match-card")).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Dashboard", exact: true })
    .click();
  await page
    .locator(".dashboard-profile")
    .getByRole("link", { name: "Edit details", exact: true })
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
    .locator(".dashboard-heading")
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

test("dashboard bookmarks are reversible, persistent in this browser and never counted as matches", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/dashboard");
  const catalogue = page.locator(".dashboard-catalogue");
  const saved = page.locator("#dashboard-saved");
  await catalogue
    .getByRole("button", { name: "Save scheme", exact: true })
    .click();
  await expect(
    saved.getByRole("link", { name: "Contract Fixture Scheme", exact: true }),
  ).toBeVisible();
  await expect(
    catalogue.getByRole("button", { name: "Remove saved scheme", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.locator(".dashboard-stats > div").nth(1).locator("strong"),
  ).toHaveText("—");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(
    saved.getByRole("link", { name: "Contract Fixture Scheme", exact: true }),
  ).toBeVisible();
  await saved.getByRole("link", { name: "View saved schemes" }).click();
  await expect(page).toHaveURL(/\/saved$/);
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await page
    .locator(".site-nav")
    .getByRole("link", { name: "Dashboard" })
    .click();
  await expect(saved).toContainText("Save schemes while exploring");
  await expect(
    catalogue.getByRole("button", { name: "Save scheme", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  expect(errors).toEqual([]);
});

test("dashboard ignores corrupt bookmarks and reports unavailable browser storage", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("yojana_saathi_saved_schemes", '{"unexpected":true}');
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage unavailable", "QuotaExceededError");
    };
  });
  await page.goto("/dashboard");
  await expect(page.locator("#dashboard-saved")).toContainText(
    "Save schemes while exploring",
  );
  await page
    .locator(".dashboard-catalogue")
    .getByRole("button", { name: "Save scheme", exact: true })
    .click();
  await expect(
    page.locator(".dashboard-catalogue").getByRole("alert"),
  ).toBeVisible();
  await expect(
    page.locator("#dashboard-saved .dashboard-saved-list"),
  ).toHaveCount(0);
});

for (const [locale, title, label] of [
  ["hi", "आपकी योजना यात्रा, एक जगह।", "डैशबोर्ड"],
  ["kn", "ನಿಮ್ಮ ಯೋಜನೆಗಳ ಪಯಣ, ಒಂದೇ ಕಡೆ.", "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್"],
]) {
  test(`dashboard is translated and fits narrow and wide screens in ${locale}`, async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "locale",
        value: locale,
        url: test.info().project.use.baseURL as string,
      },
    ]);
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/dashboard");
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await expect(page.locator(".dashboard-breadcrumb")).toContainText(label);
      await expect(page.locator(".dashboard-catalogue-list")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (width === 375 || width === 1440) {
        const scan = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(scan.violations).toEqual([]);
      }
    }
  });
}

test("dashboard uses the pushed theme consistently across the user journey", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/discover",
    "/dashboard",
    "/profile",
    "/saved",
    "/guide",
  ]) {
    await page.goto(path);
    expect(
      await page.evaluate(() => {
        const tokens = getComputedStyle(document.documentElement);
        return [
          tokens.getPropertyValue("--primary").trim(),
          getComputedStyle(document.body).backgroundColor,
        ];
      }),
    ).toEqual(["#035352", "rgb(243, 232, 188)"]);
  }
});

test("signed-in dashboard restores confirmed facts through the existing account and session providers", async ({
  page,
}) => {
  test.skip(
    process.env.DASHBOARD_TEST_AUTH !== "1",
    "Requires the explicitly configured isolated Supabase fixture server.",
  );
  const { default: fixture } = await import(
    "../src/lib/api/fixtures/profile-extract.response.json",
    { with: { type: "json" } }
  );
  const user = {
    id: "10000000-0000-4000-8000-000000000001",
    aud: "authenticated",
    role: "authenticated",
    email: "citizen@example.invalid",
    created_at: "2026-01-01T00:00:00Z",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {
      full_name: "Browser test citizen",
      yojana_profile: {
        version: 1,
        facts: fixture.facts,
        confirmed_at: "2026-10-10T00:00:00Z",
      },
    },
  };
  await page.route("https://dashboard-ui-check.supabase.co/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(user),
    }),
  );
  const token = `${Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.fixture`;
  await page.addInitScript(
    ({ user, token }) => {
      localStorage.setItem(
        "sb-dashboard-ui-check-auth-token",
        JSON.stringify({
          access_token: token,
          refresh_token: "fixture-only",
          token_type: "bearer",
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user,
        }),
      );
    },
    { user, token },
  );
  await page.goto("/dashboard");
  await expect(page.locator(".dashboard-profile")).toContainText(
    "Browser test citizen",
  );
  await expect(page.locator(".dashboard-profile")).toContainText("Maharashtra");
  await expect(page.locator(".dashboard-profile")).toContainText(
    "Confirmed by you",
  );
  await expect(page.locator(".dashboard-privacy")).toContainText(
    "saved with your account",
  );
  await expect(page.locator(".dashboard-account")).toHaveCount(0);
  await expect(
    page.locator(".dashboard-stats > div").nth(1).locator("strong"),
  ).toHaveText("—");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator(".dashboard-profile")).toContainText(
    "Confirmed by you",
  );
  await expect(page.locator(".dashboard-profile dd").first()).toHaveText("24");
  await page
    .locator(".site-actions")
    .getByRole("button", { name: "Sign out", exact: true })
    .click();
  await expect(page).toHaveURL(/\/signin$/);
  await page
    .locator(".site-nav")
    .getByRole("link", { name: "Dashboard", exact: true })
    .click();
  await expect(page.locator(".dashboard-profile")).toContainText(
    "Guest profile",
  );
  await expect(page.locator(".dashboard-profile")).not.toContainText(
    "Browser test citizen",
  );
  await expect(page.locator(".dashboard-stats")).toContainText("0 / 11");
});
