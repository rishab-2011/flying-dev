/**
 * Every issue in the catalogue must mark something on the device.
 *
 * The diagram keys off issue slugs, and four of them differ from the icon
 * names they resemble -- charging-port, back-panel, speaker-mic, water-damage.
 * Reading the icon names instead (which is how this was first written) makes
 * those four select silently: the price updates, the diagram does not, and
 * nothing errors. So this drives the real page and asserts, per issue, that
 * selecting it changes what the diagram says it is showing.
 */
import { launchChromium } from "./browser.mjs";

const BASE = process.env.BASE || "http://localhost:3000";
const URL = `${BASE}/repair/apple/iphone-13`;

let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
  if (!ok) failed++;
};

const browser = await launchChromium();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await page.goto(URL, { waitUntil: "networkidle" });

const svg = page.locator("aside svg[role=img]").first();
check("the diagram renders before anything is selected", await svg.isVisible());
check(
  "it does not claim to highlight anything yet",
  (await svg.getAttribute("aria-label")) === "Diagram of a phone"
);

// Every issue button on the page, whatever the catalogue happens to contain.
const buttons = page.locator('ul li button[aria-pressed]');
const count = await buttons.count();
check("there are issues to select", count > 0, `${count} issues`);

for (let i = 0; i < count; i++) {
  const button = buttons.nth(i);
  const name = (await button.innerText()).split("\n")[0].trim();

  const before = (await svg.getAttribute("aria-label")) || "";
  await button.click();
  await page.waitForTimeout(150);
  const after = (await svg.getAttribute("aria-label")) || "";

  check(`selecting "${name}" marks the device`, after !== before && after.length > before.length);

  // Leave it as found, so each issue is judged on its own.
  await button.click();
  await page.waitForTimeout(100);
}

await browser.close();
console.log(failed === 0 ? `\nEvery issue marks the diagram.` : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
