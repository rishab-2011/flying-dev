/**
 * Form controls must never be smaller than 16px.
 *
 * iOS Safari zooms the page whenever a focused input has a font-size below
 * 16px. There is no way to opt out short of disabling pinch-zoom, which breaks
 * accessibility, so the only fix is the type itself. The damage is invisible
 * on a desktop runner -- the form works perfectly -- which is exactly why it
 * needs asserting rather than eyeballing.
 */
import { launchChromium } from "./browser.mjs";

const BASE = process.env.BASE || "http://localhost:3000";
const PAGES = ["/login", "/signup", "/quote", "/track"];

let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
  if (!ok) failed++;
};

const browser = await launchChromium();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

for (const path of PAGES) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });

  const small = await page.evaluate(() =>
    [...document.querySelectorAll("input, select, textarea")]
      .filter((el) => {
        const type = (el.getAttribute("type") || "").toLowerCase();
        // Hidden inputs and checkboxes/radios are not typed into.
        return !["hidden", "checkbox", "radio", "submit"].includes(type);
      })
      .map((el) => ({
        id: el.id || el.name || el.tagName.toLowerCase(),
        size: parseFloat(getComputedStyle(el).fontSize),
      }))
      .filter((f) => f.size < 16)
  );

  check(
    `${path}: every control is at least 16px`,
    small.length === 0,
    small.length ? small.map((f) => `${f.id} at ${f.size}px`).join(", ") : "no zoom on focus"
  );
}

// The booking form is the one that matters and has no direct URL, so walk in
// through the funnel the way a customer does.
await page.goto(`${BASE}/repair/apple/iphone-13`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Screen replacement/i }).first().click();
await page.getByRole("button", { name: /Continue to booking/i }).click();
await page.waitForURL(/\/book/, { timeout: 15000 });
await page.waitForLoadState("networkidle");

const bookingSmall = await page.evaluate(() =>
  [...document.querySelectorAll("input, select, textarea")]
    .filter((el) => {
      const type = (el.getAttribute("type") || "").toLowerCase();
      return !["hidden", "checkbox", "radio", "submit"].includes(type);
    })
    .map((el) => ({
      id: el.id || el.name || el.tagName.toLowerCase(),
      size: parseFloat(getComputedStyle(el).fontSize),
    }))
    .filter((f) => f.size < 16)
);
check(
  "/book: every control is at least 16px",
  bookingSmall.length === 0,
  bookingSmall.length
    ? bookingSmall.map((f) => `${f.id} at ${f.size}px`).join(", ")
    : "the booking form never zooms"
);

await browser.close();
console.log(failed === 0 ? "\nNo control small enough to make iOS zoom." : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
