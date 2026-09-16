/**
 * The estimate bar on phones.
 *
 * Below lg the estimate card follows every repair option, which put the
 * Continue button about 1700px below the fold on a 390x844 screen -- two
 * screens of scrolling past choices the customer had already rejected, right
 * after they picked one. The bar carries the total and the action with them.
 *
 * It also has to share the bottom of the screen with the floating WhatsApp
 * button, so the overlap check here is not decorative: without it the two
 * controls sit on top of each other and one of them stops being tappable.
 */
import { launchChromium } from "./browser.mjs";

const BASE = process.env.BASE || "http://localhost:3000";
let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
  if (!ok) failed++;
};

const browser = await launchChromium();
const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
await phone.goto(`${BASE}/repair/apple/iphone-13`, { waitUntil: "networkidle" });

const bar = phone.locator("div.fixed.inset-x-0.bottom-0");
const issue = phone.locator("ul li button[aria-pressed]").first();

check("no bar before anything is selected", !(await bar.isVisible().catch(() => false)));

await issue.click();
await phone.waitForTimeout(350);
check("the bar appears on selection", await bar.isVisible());
check(
  "Continue is reachable without scrolling",
  await bar.getByRole("button", { name: "Continue" }).isVisible()
);
check("the bar carries the total", /₹/.test(await bar.innerText()));

const barBox = await bar.boundingBox();
const waBox = await phone.locator('a[href*="wa.me"]').first().boundingBox();
check(
  "the WhatsApp button clears the bar",
  waBox.y + waBox.height <= barBox.y,
  `whatsapp ends ${Math.round(waBox.y + waBox.height)}px, bar starts ${Math.round(barBox.y)}px`
);

await issue.click();
await phone.waitForTimeout(350);
check("deselecting puts the bar away", !(await bar.isVisible().catch(() => false)));

// Desktop keeps the sticky card beside the list and needs no bar.
const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await desktop.goto(`${BASE}/repair/apple/iphone-13`, { waitUntil: "networkidle" });
await desktop.locator("ul li button[aria-pressed]").first().click();
await desktop.waitForTimeout(300);
check(
  "desktop is untouched",
  !(await desktop.locator("div.fixed.inset-x-0.bottom-0").isVisible().catch(() => false))
);

await browser.close();
console.log(failed === 0 ? "\nThe estimate bar behaves." : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
