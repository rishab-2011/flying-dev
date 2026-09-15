/**
 * Datadog must be invisible until it is both configured and consented to.
 *
 * Run twice, against two builds:
 *   MODE=unconfigured  -- built with no DD_* variables (today's production)
 *   MODE=configured    -- built with them set
 *
 * NEXT_PUBLIC_* values are inlined at build time, so the mode is a property of
 * the build being served, not of this process.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3000";
const MODE = process.env.MODE || "unconfigured";

let failed = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
  if (!ok) failed++;
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext();
const page = await ctx.newPage();

// Record anything heading for Datadog, and any Datadog chunk the page pulls.
const ddRequests = [];
page.on("request", (r) => {
  const url = r.url();
  if (/datadoghq|datadog-browser|browser-intake/i.test(url)) ddRequests.push(url);
});

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

const banner = page.getByRole("dialog", { name: /Help us improve this site/i });
const bannerVisible = await banner.isVisible().catch(() => false);

if (MODE === "unconfigured") {
  // The state the site ships in until the keys are added: nothing changes.
  check("no consent banner when Datadog is unconfigured", !bannerVisible);
  check(
    "no Datadog code or network when unconfigured",
    ddRequests.length === 0,
    `${ddRequests.length} request(s)`
  );
} else {
  check("consent banner is shown when Datadog is configured", bannerVisible);

  // Loading the SDK before a choice is made is fine; SENDING is not. The SDK is
  // initialised with trackingConsent "not-granted", so no intake call may go
  // out until the customer agrees.
  const intakeBefore = ddRequests.filter((u) => /browser-intake|\/api\/v2\//i.test(u));
  check(
    "nothing is sent to Datadog before consent",
    intakeBefore.length === 0,
    `${intakeBefore.length} intake call(s)`
  );

  // Declining must keep it closed, and must not ask again.
  await banner.getByRole("button", { name: /No thanks/i }).click();
  await page.waitForTimeout(2500);
  const intakeAfterDeny = ddRequests.filter((u) => /browser-intake|\/api\/v2\//i.test(u));
  check(
    "declining sends nothing",
    intakeAfterDeny.length === 0,
    `${intakeAfterDeny.length} intake call(s)`
  );

  await page.reload({ waitUntil: "networkidle" });
  check(
    "a decision is remembered, so the banner is not asked twice",
    !(await banner.isVisible().catch(() => false))
  );

  // A fresh visitor who accepts should actually produce data.
  const ctx2 = await browser.newContext();
  const page2 = await ctx2.newPage();
  const sent = [];
  page2.on("request", (r) => {
    if (/browser-intake|datadoghq/i.test(r.url())) sent.push(r.url());
  });
  await page2.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page2
    .getByRole("dialog", { name: /Help us improve this site/i })
    .getByRole("button", { name: /That's fine/i })
    .click();
  await page2.waitForTimeout(4000);
  check("accepting starts reporting to Datadog", sent.length > 0, `${sent.length} request(s)`);
  await ctx2.close();
}

await browser.close();
console.log(`\n${failed === 0 ? "All checks passed" : `${failed} FAILED`} (mode: ${MODE})`);
process.exit(failed === 0 ? 0 : 1);
