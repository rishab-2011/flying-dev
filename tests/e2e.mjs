import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

const rupeesToNumber = (text) => Number(text.replace(/[^0-9]/g, ""));

// --- Serviceability, before the funnel ------------------------------------
// The point of the home-page check is that nobody fills in a name, number and
// address before finding out we can't reach them.
await page.goto(`${BASE}/`);
await page.fill("#home-pincode", "110001");
await page.waitForSelector("text=we repair at your doorstep in Connaught Place");
check("home page confirms a covered pincode", true);

await page.fill("#home-pincode", "560001"); // Bengaluru
await page.waitForSelector("text=Not 560001 yet");
check("home page turns away an uncovered pincode early", true);

// A phone-width visitor must be able to call without hunting in the footer.
// The header carries two tel: links — the desktop nav number and the phone-only
// button — so this asserts exactly one is actually visible at each width.
const phone = await ctx.newPage();
await phone.setViewportSize({ width: 390, height: 844 });
await phone.goto(`${BASE}/`);
const visibleOnPhone = await phone.locator("header a[href^='tel:']:visible").count();
check("tap-to-call is reachable on a phone", visibleOnPhone === 1, `${visibleOnPhone} visible`);

await phone.setViewportSize({ width: 1280, height: 900 });
await phone.goto(`${BASE}/`);
const visibleOnDesktop = await phone.locator("header a[href^='tel:']:visible").count();
check(
  "the number shows once on desktop, not twice",
  visibleOnDesktop === 1,
  `${visibleOnDesktop} visible`
);
await phone.close();

// --- Customer funnel -------------------------------------------------------
await page.goto(`${BASE}/repair/apple/iphone-13`);

// Read each issue's listed price off the page so the check holds whatever the
// catalogue currently says — the suite must not depend on seeded amounts.
const listedPrice = async (name) => {
  const row = page.getByRole("button", { name });
  // The row has two bold spans: the price, and the selection tick (empty when
  // unselected) — so keep only the one carrying an amount.
  const amounts = (await row.locator("span.font-bold").allInnerTexts()).filter((t) =>
    t.includes("₹")
  );
  return rupeesToNumber(amounts[amounts.length - 1]);
};

const screenPrice = await listedPrice(/Screen replacement/);
const batteryPrice = await listedPrice(/Battery replacement/);

await page.getByRole("button", { name: /Screen replacement/ }).click();
await page.getByRole("button", { name: /Battery replacement/ }).click();

const total = await page.locator("aside").getByText(/^₹/).last().innerText();
const expected = screenPrice + batteryPrice;
check(
  "quote totals two issues",
  rupeesToNumber(total) === expected,
  `${total} vs ${expected}`
);

await page.getByRole("button", { name: "Continue to booking" }).click();
await page.waitForURL(/\/book\?/);
check("reaches booking page", true);

// --- Booking ---------------------------------------------------------------
await page.fill("#customerName", "Rishab Test");
await page.fill("#customerPhone", "9876543210");
await page.fill("#pincode", "110001");
await page.waitForSelector("text=We service Connaught Place");
check("pincode serviceability confirmed inline", true);

await page.fill("#addressLine", "A-14 Barakhamba Road, Connaught Place");
await page.fill("#landmark", "Near the metro gate 5");
await page.getByRole("button", { name: "Confirm booking" }).click();
await page.waitForURL(/\/track\/FD-/, { timeout: 20000 });

const url = page.url();
const ref = url.match(/FD-[A-Z0-9]{6}/)[0];
check("booking created with reference", !!ref, ref);

const waHref = await page.getByRole("link", { name: "Confirm on WhatsApp" }).getAttribute("href");
check("WhatsApp confirm link built", waHref.startsWith("https://wa.me/919999999999?text="), "");
check("WhatsApp text carries the ref", decodeURIComponent(waHref).includes(ref));

// --- Rejected pincode ------------------------------------------------------
await page.goto(`${BASE}/repair/xiaomi/redmi-note-13`);
await page.getByRole("button", { name: /Screen replacement/ }).click();
await page.getByRole("button", { name: "Continue to booking" }).click();
await page.waitForURL(/\/book\?/);
await page.fill("#pincode", "560001"); // Bengaluru — outside NCR
await page.waitForSelector("text=We don't cover 560001 yet");
check("out-of-area pincode rejected inline", true);

// --- Signup ----------------------------------------------------------------
const newPhone = "98" + String(Date.now()).slice(-8);
await page.goto(`${BASE}/signup`);
await page.fill("#name", "New Customer");
await page.fill("#phone", newPhone);
await page.fill("#password", "testpass123");
await page.getByRole("button", { name: "Create account" }).click();
await page.waitForURL(/\/account/, { timeout: 15000 });
check("signup lands on account page", true);

// --- Admin -----------------------------------------------------------------
const admin = await ctx.browser().newContext();
const ap = await admin.newPage();
await ap.goto(`${BASE}/login`);
await ap.fill("#phone", "9000000001");
await ap.fill("#password", "flyingdev-admin");
await ap.getByRole("button", { name: "Sign in" }).click();
await ap.waitForURL(/\/admin/, { timeout: 15000 });
check("admin signs in to admin panel", true);

await ap.goto(`${BASE}/admin/bookings`);
await ap.waitForSelector(`text=${ref}`);
check("booking appears in admin bookings", true);

// Move the booking forward and confirm the customer-facing page follows.
const card = ap.locator("li.card", { hasText: ref });
await card.locator("select[name=status]").selectOption("CONFIRMED");
await card.getByRole("button", { name: "Update" }).click();
await ap.waitForSelector(`text=moved to confirmed`, { timeout: 15000 });
check("admin advances booking status", true);

await page.goto(`${BASE}/track/${ref}`);
const statusText = await page.locator("span.chip").first().innerText();
check("tracking page reflects new status", statusText === "Confirmed", `got ${statusText}`);

// --- Price edit propagates to the storefront -------------------------------
// Uses a value derived from the current one, then puts it back, so running the
// suite twice in a row gives the same result.
const editedPrice = screenPrice - 500;
const priceUrl = `${BASE}/admin/prices?brand=apple&model=iphone-13`;

const setScreenPrice = async (value) => {
  await ap.goto(priceUrl);
  // Saving is a server action, so the form only works once React has hydrated;
  // clicking sooner does a plain POST that goes nowhere.
  await ap.waitForLoadState("networkidle");
  const form = ap.locator("form", { hasText: "Screen replacement" }).first();
  await form.locator("input[name=price]").fill(String(value));
  await form.getByRole("button", { name: "Save" }).click();
  await ap.waitForSelector("text=Price updated.", { timeout: 15000 });
};

await setScreenPrice(editedPrice);

await page.goto(`${BASE}/repair/apple/iphone-13`);
const shownPrice = await listedPrice(/Screen replacement/);
check(
  "edited price shows on the storefront",
  shownPrice === editedPrice,
  `${shownPrice} vs ${editedPrice}`
);

await setScreenPrice(screenPrice);
await page.goto(`${BASE}/repair/apple/iphone-13`);
check(
  "price restored, leaving the catalogue as found",
  (await listedPrice(/Screen replacement/)) === screenPrice
);

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
