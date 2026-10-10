import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
const output = fileURLToPath(
  new URL("../artifacts/full-site/", import.meta.url),
);
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ reducedMotion: "reduce" });
const browserErrors = [];
page.on("pageerror", (error) => browserErrors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") browserErrors.push(message.text());
});
const base = process.env.CAPTURE_URL || "http://127.0.0.1:3000";
const metrics = [];
async function capture(name, width, height = 900) {
  await page.setViewportSize({ width, height });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await page.screenshot({
    path: `${output}${name}-${width}.png`,
    fullPage: true,
    style: "nextjs-portal { visibility: hidden; }",
  });
  const metric = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    width: innerWidth,
  }));
  metrics.push({ name, ...metric });
  assert.equal(metric.overflow, false, `${name} overflows at ${width}px`);
}
try {
  await page.goto(base);
  await page.getByText("Mock mode", { exact: true }).waitFor();
  await page
    .getByRole("heading", {
      name: "The support you deserve is closer than you think.",
    })
    .waitFor();
  for (const width of [375, 1280]) {
    await capture("home", width, 720);
    const cta = await page
      .locator('a[href="#finder"]')
      .filter({ hasText: "Find my schemes" })
      .boundingBox();
    metrics.at(-1).ctaBottom = cta.y + cta.height;
    if (width === 1280)
      assert(cta.y + cta.height <= 720, "Desktop CTA below the fold");
    await page.screenshot({
      path: `${output}hero-${width}.png`,
      style: "nextjs-portal { visibility: hidden; }",
    });
    await page.setViewportSize({ width, height: 2000 });
    for (const [name, selector] of [
      ["finder", "#finder"],
      ["categories", '[aria-labelledby="categories-title"]'],
    ]) {
      await page
        .locator(selector)
        .screenshot({ path: `${output}${name}-${width}.png` });
    }
  }
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("button", { name: "Find my schemes" }).click();
  await page.getByLabel("Age", { exact: true }).waitFor();
  for (const width of [1280, 375]) await capture("profile-review", width);
  await page.getByRole("button", { name: "Confirm my details" }).click();
  await page.getByRole("link", { name: "See my recommendations" }).click();
  await page
    .getByText("Is the land registered to your family?", { exact: true })
    .waitFor();
  await page
    .getByText("Land registration has not been confirmed.", { exact: true })
    .waitFor();
  for (const width of [1280, 375]) await capture("recommendations", width);
  await page.getByRole("link", { name: "Explore this scheme" }).click();
  await page
    .getByRole("heading", { name: "Official sources", exact: true })
    .waitFor();
  for (const width of [1280, 375]) await capture("scheme-detail", width);
  await page.getByRole("link", { name: "Prepare my checklist" }).click();
  await page
    .getByRole("heading", { name: "Your personal checklist" })
    .waitFor();
  for (const width of [1280, 375]) await capture("guidance", width);
  await page.goto(`${base}/help`);
  for (const width of [1280, 375]) await capture("help", width);
  await page.goto(`${base}/discover`);
  await page
    .getByRole("heading", { name: "Contract Fixture Scheme" })
    .waitFor();
  for (const width of [1280, 375]) await capture("discover", width);
  assert.deepEqual(browserErrors, [], "Browser runtime/console errors");
  await writeFile(`${output}metrics.json`, JSON.stringify(metrics, null, 2));
  console.log(JSON.stringify(metrics));
} finally {
  await browser.close();
}
