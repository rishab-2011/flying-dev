/**
 * The header's navigation at phone width.
 *
 * Everything in the desktop nav -- prices, tracking, the FAQ, sign in -- used
 * to disappear below the md breakpoint with no replacement, leaving the footer
 * as the only route to any of it. On a site whose visitors are by definition
 * holding a broken phone, that is the wrong half of the audience to hide the
 * navigation from, and it is the kind of thing that silently regresses the
 * next time the header is touched.
 *
 * Also pins the two claims a first-time visitor most needs to see, and that
 * the desktop header is unchanged by any of it.
 */
import { launchChromium } from "./browser.mjs";
const BASE = "http://localhost:3000";
const b = await launchChromium();
let bad = 0;
const check = (n, ok, d = "") => { console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? `  — ${d}` : ""}`); if (!ok) bad++; };

// --- Phone width: the case that was broken ---
const phone = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await phone.newPage();
await p.goto(BASE, { waitUntil: "networkidle" });

const toggle = p.getByRole("button", { name: /open menu/i });
check("menu button is visible on a phone", await toggle.isVisible());
check("menu starts closed", (await toggle.getAttribute("aria-expanded")) === "false");

await toggle.click();
await p.waitForTimeout(300);
const panel = p.locator("#mobile-menu");
check("menu opens", await panel.isVisible());

for (const label of ["Get a repair price", "Track a booking", "Why Flying Dev", "Questions", "Reviews", "Sign in"]) {
  check(`  reachable on mobile: ${label}`, await panel.getByRole("link", { name: label }).isVisible().catch(() => false));
}

check("Escape closes it", await (async () => {
  await p.keyboard.press("Escape");
  await p.waitForTimeout(250);
  return !(await panel.isVisible().catch(() => false));
})());

// Navigating must close the panel, not leave it hanging over the new page.
await p.getByRole("button", { name: /open menu/i }).click();
await p.waitForTimeout(250);
await p.locator("#mobile-menu").getByRole("link", { name: "Questions" }).click();
await p.waitForURL(/\/faq/, { timeout: 10000 });
await p.waitForTimeout(400);
check("menu closes after navigating", !(await p.locator("#mobile-menu").isVisible().catch(() => false)));

// The header CTA must stay on one line. Raising button type from 14px to 15px
// once pushed "Book a repair" onto two lines here, which reads as broken.
const cta = p.locator("header a.btn-primary").first();
const ctaBox = await cta.boundingBox();
check(
  "header CTA does not wrap at 390px",
  ctaBox !== null && ctaBox.height < 50,
  `${Math.round(ctaBox?.height ?? 0)}px tall`
);

// --- The hero guarantee ---
await p.goto(BASE, { waitUntil: "networkidle" });
const hero = await p.locator("section").first().innerText();
check("hero states the payment guarantee", /Nothing to pay until the repair is done/i.test(hero));
check("hero states the warranty", /6-month warranty/i.test(hero));

// --- /repair trust strip ---
await p.goto(`${BASE}/repair`, { waitUntil: "networkidle" });
const repair = await p.locator("main").innerText();
for (const claim of ["6-month warranty", "Doorstep or pickup", "Pay after the repair"]) {
  check(`/repair now states: ${claim}`, repair.includes(claim));
}

// --- Desktop must be unchanged ---
const desk = await b.newContext({ viewport: { width: 1280, height: 900 } });
const d = await desk.newPage();
await d.goto(BASE, { waitUntil: "networkidle" });
check("no menu button on desktop", !(await d.getByRole("button", { name: /open menu/i }).isVisible().catch(() => false)));
check("desktop nav still present", await d.locator("header").getByRole("link", { name: "Repair", exact: true }).isVisible());
check("desktop Sign in still present", await d.locator("header").getByRole("link", { name: "Sign in" }).isVisible());

// --- No horizontal overflow at phone width ---
const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
check("no horizontal scroll at 390px", !overflow);

await b.close();
console.log(bad === 0 ? "\nAll UX checks passed." : `\n${bad} FAILED`);
process.exit(bad === 0 ? 0 : 1);
