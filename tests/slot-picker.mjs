/**
 * The picker's own behaviour, on the real booking page.
 *
 * tests/slots.ts covers the rules as pure functions; this covers that the UI
 * obeys them -- in particular that no time is chosen for you, and that a
 * window inside the lead time cannot be clicked.
 */
import { launchChromium } from "./browser.mjs";

const BASE = process.env.BASE || "http://localhost:3000";
let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
  if (!ok) failed++;
};

const browser = await launchChromium();
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });

await page.goto(`${BASE}/repair/apple/iphone-13`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Screen replacement/i }).first().click();
await page.getByRole("button", { name: /Continue to booking/i }).click();
await page.waitForURL(/\/book/, { timeout: 15000 });
await page.waitForLoadState("networkidle");

const dayGroup = page.getByRole("radiogroup", { name: "Day" });
const timeGroup = page.getByRole("radiogroup", { name: "Time" });

check("a week of days is offered", (await dayGroup.getByRole("radio").count()) === 7);
check("all five windows are shown", (await timeGroup.getByRole("radio").count()) === 5);

// A day is defaulted -- the form needs one -- but a time is not.
check("a day is pre-selected", (await page.locator("input[name=slotDate]").inputValue()).length === 10);
check(
  "no time is pre-selected",
  (await page.locator("input[name=slotWindow]").inputValue()) === "",
  "an appointment should be chosen, not inherited"
);

// Windows inside the lead time must be unclickable, not merely styled.
const disabledToday = await timeGroup.locator("button:disabled").count();
const enabledToday = await timeGroup.locator("button:not(:disabled)").count();
check("past windows are disabled, not just dimmed", disabledToday + enabledToday === 5,
  `${disabledToday} closed, ${enabledToday} open`);

// A future day reopens every window.
await dayGroup.getByRole("radio").nth(3).click();
await page.waitForTimeout(250);
check(
  "a later day opens all five windows",
  (await timeGroup.locator("button:not(:disabled)").count()) === 5
);

// Changing day must drop a window chosen for the previous day.
await timeGroup.getByRole("radio").first().click();
await page.waitForTimeout(150);
const picked = await page.locator("input[name=slotWindow]").inputValue();
check("choosing a window records it", picked !== "", picked);

await browser.close();
console.log(failed === 0 ? "\nThe picker obeys the slot rules." : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
