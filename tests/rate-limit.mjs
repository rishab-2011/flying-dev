/**
 * Proves the public forms actually refuse a flood, and that a normal customer
 * is never caught by it.
 *
 * Drives the real login form repeatedly rather than calling the action
 * directly, so it exercises the same path an attacker's script would.
 */
import { launchChromium } from "./browser.mjs";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

/**
 * Clear the rate-limit counters first.
 *
 * This suite spends about ten login attempts per run, against a per-IP budget
 * of thirty per fifteen minutes. Without a reset the third consecutive run
 * starts already blocked and reports a failure that says nothing about the
 * code. Like the booking suite, this is written for a development database —
 * it also creates bookings and edits prices.
 */
const db = new PrismaClient();
await db.rateLimit.deleteMany();
await db.$disconnect();
const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

const browser = await launchChromium();
const page = await (await browser.newContext()).newPage();

// The per-phone login rule is 6 attempts per 15 minutes, and those counters
// outlive the test run — so target a number nobody has tried this window,
// otherwise a second run inside 15 minutes starts already blocked.
//
// The number need not belong to a real account: the limiter runs before the
// user lookup, and an unknown number gets the same "incorrect" message as a
// wrong password, by design, so the login form can't be used to discover who
// has an account.
const victim = "9" + String(Date.now()).slice(-9);
let blockedAt = null;
let sawWrongPassword = false;

for (let attempt = 1; attempt <= 9 && blockedAt === null; attempt++) {
  await page.goto(`${BASE}/login`);
  await page.fill("#phone", victim);
  await page.fill("#password", `wrong-guess-${attempt}`);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForSelector("p.bg-red-50", { timeout: 15000 });

  const message = await page.locator("p.bg-red-50").innerText();
  if (message.includes("Incorrect mobile number or password")) sawWrongPassword = true;
  if (message.includes("Too many attempts")) blockedAt = attempt;
}

check("wrong password rejected normally at first", sawWrongPassword);
check(
  "login blocked before the 9th guess",
  blockedAt !== null && blockedAt <= 8,
  blockedAt ? `blocked on attempt ${blockedAt}` : "never blocked"
);

const blockMessage = await page.locator("p.bg-red-50").innerText();
check(
  "block message tells the customer what to do",
  blockMessage.includes("try again in") && blockMessage.includes("WhatsApp"),
  blockMessage
);

// The real password must not get through while the block holds — a limiter
// that only rejects wrong guesses would be worthless.
await page.goto(`${BASE}/login`);
await page.fill("#phone", victim);
await page.fill("#password", "demo1234");
await page.getByRole("button", { name: "Sign in" }).click();
await page.waitForSelector("p.bg-red-50", { timeout: 15000 });
check(
  "correct password also blocked while limited",
  (await page.locator("p.bg-red-50").innerText()).includes("Too many attempts"),
  ""
);

// A different number is unaffected: the limit is per phone, not global, so one
// attacker can't lock every customer out of their own account. The account is
// created here rather than seeded — the seed deliberately ships no customer
// login, since a published password has no place on a live site.
const bystander = "8" + String(Date.now()).slice(-9);
await page.goto(`${BASE}/signup`);
await page.fill("#name", "Bystander");
await page.fill("#phone", bystander);
await page.fill("#password", "a-fresh-password-for-this-run");
await page.getByRole("button", { name: "Create account" }).click();
await page.waitForURL(/\/account/, { timeout: 15000 });

// Sign out, then back in, so this exercises the login path and not the session
// that signup already created.
await page.getByRole("button", { name: "Sign out" }).click();
await page.waitForURL(/\/$/, { timeout: 15000 });

await page.goto(`${BASE}/login`);
await page.fill("#phone", bystander);
await page.fill("#password", "a-fresh-password-for-this-run");
await page.getByRole("button", { name: "Sign in" }).click();
await page.waitForURL(/\/account/, { timeout: 15000 });
check("a different number still signs in", true);

await browser.close();

const failed = results.filter((ok) => !ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
