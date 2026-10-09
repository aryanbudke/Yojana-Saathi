import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const output = fileURLToPath(
  new URL("../artifacts/screenshots/", import.meta.url),
);
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  reducedMotion: "reduce",
});
const base = process.env.CAPTURE_URL || "http://127.0.0.1:3000";
async function capture(name, width) {
  await page.setViewportSize({ width, height: 1100 });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `${output}${name}-${width}.png`,
    fullPage: true,
    style: "nextjs-portal { visibility: hidden; }",
  });
}
try {
  await page.goto(base);
  await page
    .getByRole("heading", { name: "Contract Fixture Scheme" })
    .waitFor();
  await capture("discover", 1440);
  await capture("discover", 375);
  await page.getByRole("button", { name: "Try an example" }).click();
  await page.getByRole("button", { name: "Find my schemes" }).click();
  await page.getByLabel("Age", { exact: true }).waitFor();
  await capture("profile-review", 1440);
  await page.getByRole("button", { name: "Confirm my details" }).click();
  await page.getByRole("link", { name: "See my recommendations" }).click();
  await page
    .getByText("Is the land registered to your family?", { exact: true })
    .waitFor();
  await page
    .getByText("Land registration has not been confirmed.", { exact: true })
    .waitFor();
  await capture("recommendations", 1440);
  await capture("recommendations", 375);
  await page.getByRole("link", { name: "Explore this scheme" }).click();
  await page
    .getByRole("heading", { name: "Official sources", exact: true })
    .waitFor();
  await capture("scheme-detail", 1440);
  await page.getByRole("link", { name: "Prepare my checklist" }).click();
  await page
    .getByRole("heading", { name: "Your personal checklist" })
    .waitFor();
  await capture("guidance", 1440);
  console.log(`Captured 7 actual mock-mode screenshots in ${output}`);
} finally {
  await browser.close();
}
