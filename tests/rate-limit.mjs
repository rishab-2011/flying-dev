/**
 * Proves the public forms actually refuse a flood, and that a normal customer
 * is never caught by it.
 *
 * Drives the real login form repeatedly rather than calling the action
 * directly, so it exercises the same path an attacker's script would.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await (await browser.newContext()).newPage();

// The per-phone login rule is 6 attempts per 15 minutes. Hammer one number
// with a wrong password and confirm the door shuts.
const victim = "9000000002"; // the seeded demo customer
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
// attacker can't lock every customer out of their own account.
await page.goto(`${BASE}/login`);
await page.fill("#phone", "9000000001");
await page.fill("#password", "flyingdev-admin");
await page.getByRole("button", { name: "Sign in" }).click();
await page.waitForURL(/\/admin/, { timeout: 15000 });
check("a different number still signs in", true);

await browser.close();

const failed = results.filter((ok) => !ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
