import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const output = fileURLToPath(
  new URL("../artifacts/redesign/after/", import.meta.url),
);
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ reducedMotion: "reduce" });
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
}
try {
  await page.goto(base);
  await page
    .getByRole("heading", { name: "Contract Fixture Scheme" })
    .waitFor();
  for (const width of [320, 390, 768, 1024, 1280, 1440]) {
    await capture("discover", width, 720);
    const cta = await page
      .getByRole("button", { name: "Find my schemes" })
      .boundingBox();
    metrics.at(-1).ctaBottom = cta.y + cta.height;
  }
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("button", { name: "Find my schemes" }).click();
  await page.getByLabel("Age", { exact: true }).waitFor();
  for (const width of [1440, 390]) await capture("profile-review", width);
  await page.getByRole("button", { name: "Confirm my details" }).click();
  await page.getByRole("link", { name: "See my recommendations" }).click();
  await page
    .getByText("Is the land registered to your family?", { exact: true })
    .waitFor();
  await page
    .getByText("Land registration has not been confirmed.", { exact: true })
    .waitFor();
  for (const width of [1440, 390]) await capture("recommendations", width);
  await page.getByRole("link", { name: "Explore this scheme" }).click();
  await page
    .getByRole("heading", { name: "Official sources", exact: true })
    .waitFor();
  for (const width of [1440, 390]) await capture("scheme-detail", width);
  await page.getByRole("link", { name: "Prepare my checklist" }).click();
  await page
    .getByRole("heading", { name: "Your personal checklist" })
    .waitFor();
  for (const width of [1440, 390]) await capture("guidance", width);
  await writeFile(`${output}metrics.json`, JSON.stringify(metrics, null, 2));
  console.log(JSON.stringify(metrics));
} finally {
  await browser.close();
}
