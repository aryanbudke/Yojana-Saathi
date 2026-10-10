import { test, expect, type Locator } from "@playwright/test";
test("complete the core journey using Tab, text input, Enter and Space", async ({
  page,
}) => {
  await page.goto("/discover");
  async function tabTo(target: Locator) {
    // Extracted fields can appear while the session answers are still saving.
    // Wait for the real control to become available before testing Tab order.
    await expect(target).toBeVisible();
    await expect(target).toBeEnabled();
    for (let n = 0; n < 60; n++) {
      if (
        await target
          .evaluate((el) => el === document.activeElement)
          .catch(() => false)
      ) {
        const focus = await target.evaluate((el) => {
          const style = getComputedStyle(el);
          return {
            visible: el.matches(":focus-visible"),
            outline: style.outlineStyle,
            width: parseFloat(style.outlineWidth),
          };
        });
        expect(focus.visible).toBe(true);
        expect(focus.outline).not.toBe("none");
        expect(focus.width).toBeGreaterThan(0);
        return;
      }
      await page.keyboard.press("Tab");
    }
    throw new Error("Target not reachable by Tab");
  }
  await tabTo(page.getByRole("textbox", { name: "Tell us about yourself" }));
  await page.keyboard.insertText("I am 24 and farm in Maharashtra.");
  await tabTo(page.getByRole("button", { name: "Find my schemes" }));
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Age", { exact: true })).toHaveValue("24");
  await tabTo(page.getByRole("button", { name: "Confirm my details" }));
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("link", { name: "See my recommendations" }),
  ).toBeVisible();
  await tabTo(page.getByRole("link", { name: "See my recommendations" }));
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("radio", { name: "Yes", exact: true }),
  ).toBeVisible();
  await tabTo(page.getByRole("radio", { name: "Yes", exact: true }));
  await page.keyboard.press("Space");
  await tabTo(page.getByRole("button", { name: "Update my matches" }));
  await page.keyboard.press("Enter");
  await expect(
    page
      .locator(".match-card")
      .getByText("All checked conditions met", { exact: true }),
  ).toBeVisible();
  await tabTo(page.getByRole("link", { name: "Explore this scheme" }));
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("link", { name: "Prepare my checklist" }),
  ).toBeVisible();
  await tabTo(page.getByRole("link", { name: "Prepare my checklist" }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("checkbox")).toBeVisible();
  await tabTo(page.getByRole("checkbox"));
  await page.keyboard.press("Space");
  await expect(
    page.getByText("1 / 1 marked ready", { exact: true }),
  ).toBeVisible();
});
