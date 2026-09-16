import { launchChromium } from "./browser.mjs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
}

const browser = await launchChromium();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

/**
 * Poll until `probe` returns true, reloading state each time.
 *
 * Server-action forms here are progressively enhanced, and React's
 * useActionState is given no `permalink`, so a click that lands before
 * hydration finishes still posts natively and still saves -- it just reloads
 * the page and discards the returned message with the old document. Waiting on
 * the flash text therefore fails runs where the write plainly succeeded.
 * Waiting on the saved state instead is true either way.
 */
async function until(probe, { timeout = 20000, interval = 500 } = {}) {
  const deadline = Date.now() + timeout;
  for (;;) {
    if (await probe()) return;
    if (Date.now() > deadline) throw new Error("until(): timed out");
    await new Promise((r) => setTimeout(r, interval));
  }
}

const rupeesToNumber = (text) => Number(text.replace(/[^0-9]/g, ""));

const listedPrice = async (name) => {
  const row = page.getByRole("button", { name });
  // The row has two bold spans: the price, and the selection tick (empty when
  // unselected) — so keep only the one carrying an amount.
  const amounts = (await row.locator("span.font-bold").allInnerTexts()).filter((t) =>
    t.includes("₹")
  );
  return rupeesToNumber(amounts[amounts.length - 1]);
};

// --- Findability -----------------------------------------------------------
// The 191 model pages are the point of the catalogue, and nothing links to most
// of them — without a sitemap Google never discovers them.
const sitemap = await page.request.get(`${BASE}/sitemap.xml`);
const sitemapXml = await sitemap.text();
const urlCount = (sitemapXml.match(/<loc>/g) ?? []).length;
check(
  "sitemap lists every model page",
  sitemap.ok() && urlCount > 190,
  `${sitemap.status()}, ${urlCount} urls`
);
check(
  "sitemap includes a specific model",
  sitemapXml.includes("/repair/apple/iphone-13")
);

const robots = await page.request.get(`${BASE}/robots.txt`);
const robotsText = await robots.text();
check("robots.txt is served", robots.ok(), `${robots.status()}`);
check("robots.txt points at the sitemap", robotsText.includes("sitemap.xml"));
check(
  "robots.txt keeps crawlers out of customer data",
  ["/admin", "/account", "/book", "/track"].every((p) => robotsText.includes(p))
);

// Structured data has to match what the page actually says — a rating or a
// price asserted to Google but not honoured on the page is a penalty.
await page.goto(`${BASE}/`);
const homeLd = JSON.parse(
  await page.locator('script[type="application/ld+json"]').first().innerText()
);
check("home declares the business", homeLd["@type"] === "ProfessionalService", homeLd["@type"]);
check(
  "no rating is claimed while there are no reviews",
  homeLd.aggregateRating === undefined
);
check(
  "no address is claimed while none is configured",
  homeLd.address === undefined
);

await page.goto(`${BASE}/repair/apple/iphone-13`);
const serviceLd = JSON.parse(
  await page.locator('script[type="application/ld+json"]').first().innerText()
);
const screenOffer = serviceLd.offers.find((o) => o.name.startsWith("Screen"));
const shownScreenPrice = await listedPrice(/Screen replacement/);
check(
  "the offered price matches the price on the page",
  screenOffer.price === shownScreenPrice,
  `${screenOffer.price} vs ${shownScreenPrice}`
);
check("the page declares a canonical URL", await page.locator('link[rel="canonical"]').count() === 1);

// --- Model search ----------------------------------------------------------
await page.goto(`${BASE}/repair/samsung`);
const allModels = await page.locator("ul li a").count();
await page.fill("#model-search", "s24");
await page.waitForTimeout(200);
const filtered = await page.locator("ul li a").count();
check(
  "typing filters the model list",
  filtered > 0 && filtered < allModels,
  `${filtered} of ${allModels}`
);

// Someone in a hurry types without the space.
await page.fill("#model-search", "s24ultra");
await page.waitForTimeout(200);
check(
  "a spaceless query still finds the model",
  (await page.locator("ul li a").first().innerText()).includes("S24 Ultra")
);

await page.fill("#model-search", "zzzznope");
await page.waitForTimeout(200);
check(
  "no matches offers the quote form rather than a blank page",
  (await page.locator("main").innerText()).includes("Request a quote")
);

// --- The things that make a site look finished ----------------------------
await page.goto(`${BASE}/`);
const head = await page.evaluate(() => ({
  icon: !!document.querySelector('link[rel="icon"]'),
  appleIcon: !!document.querySelector('link[rel="apple-touch-icon"]'),
  ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? "",
  ogTitle: !!document.querySelector('meta[property="og:title"]'),
  twitterCard:
    document.querySelector('meta[name="twitter:card"]')?.getAttribute("content") ?? "",
}));

check("a favicon is declared", head.icon);
check("an apple touch icon is declared", head.appleIcon);
check("a share image is declared", head.ogImage.includes("og-image"), head.ogImage);
check("the share card is the large format", head.twitterCard === "summary_large_image");

// WhatsApp and Google only fetch an absolute og:image, so metadataBase has to
// be set — an accidental relative URL silently produces a card with no image.
check("the share image URL is absolute", /^https?:\/\//.test(head.ogImage), head.ogImage);

// And it has to actually resolve. Fetched against this run's origin rather
// than the absolute URL, whose host comes from NEXT_PUBLIC_SITE_URL and points
// at the deployed site, not the server under test.
const ogPath = new URL(head.ogImage).pathname;
const ogResponse = await page.request.get(`${BASE}${ogPath}`);
check(
  "the share image loads",
  ogResponse.ok() && (ogResponse.headers()["content-type"] ?? "").includes("image"),
  `${ogResponse.status()} ${ogPath}`
);

// A stock 404 is one of the clearest signs a site was never finished.
const missing = await page.goto(`${BASE}/repair/apple/no-such-phone-here`);
check("an unknown page returns 404", missing.status() === 404, `${missing.status()}`);
const missingCopy = await page.locator("main").innerText();
check(
  "the 404 page is ours and offers a way forward",
  missingCopy.includes("That page isn't here") && missingCopy.includes("Find your phone")
);

// --- FAQ -------------------------------------------------------------------
await page.goto(`${BASE}/faq`);
const faqCount = await page.locator("details").count();
check("FAQ page lists questions", faqCount >= 10, `${faqCount} questions`);

const faqSchema = await page.locator('script[type="application/ld+json"]').innerText();
check(
  "FAQ carries FAQPage structured data",
  JSON.parse(faqSchema)["@type"] === "FAQPage"
);

// An answer must be readable once opened.
await page.locator("details").first().click();
check(
  "an answer opens",
  (await page.locator("details").first().innerText()).length > 120
);

// --- Reviews ---------------------------------------------------------------
// Nothing is seeded, so an empty site must say so rather than invent praise.
await page.goto(`${BASE}/reviews`);
const emptyCopy = await page.locator("main").innerText();
const noneYet = emptyCopy.includes("No reviews here yet");

if (noneYet) {
  check("empty reviews page is honest about having none", true);
  await page.goto(`${BASE}/`);
  const homeCopy = await page.locator("main").innerText();
  check(
    "home page hides the reviews section when there are none",
    !homeCopy.includes("What customers say")
  );
}

// --- WhatsApp, reachable while browsing -----------------------------------
// It used to appear only after a booking was placed and in the admin panel, so
// a customer deciding whether to trust us never saw one.
for (const [path, expectation] of [
  ["/", "phone repair"],
  ["/repair/apple/iphone-13", "Apple Iphone 13"],
  ["/quote", "isn't listed"],
]) {
  await page.goto(`${BASE}${path}`);
  const chat = page.locator("a[href*='wa.me']").first();
  const href = await chat.getAttribute("href");
  const ok =
    (await chat.isVisible()) &&
    /wa\.me\/918587949104\?text=/.test(href) &&
    decodeURIComponent(href).includes(expectation);
  check(`WhatsApp button on ${path}`, ok, decodeURIComponent(href ?? "").slice(0, 60));
}

// Not in the admin panel: those pages carry per-booking WhatsApp links of their
// own, and a floating button to our own number would only be in the way.
await page.goto(`${BASE}/login`);
const loginChat = await page.locator("a[href*='wa.me']").count();
check("WhatsApp button present on the login page", loginChat === 1, `${loginChat}`);

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

// Pick a slot the way a customer does. No time is pre-selected: an appointment
// a technician has to travel to should be chosen deliberately, not inherited
// from whatever happened to be first in the list.
const timeGroup = page.getByRole("radiogroup", { name: "Time" });
const openSlot = timeGroup.locator("button[role=radio]:not(:disabled)").first();
await openSlot.click();
check("a time slot can be chosen", (await page.locator("input[name=slotWindow]").inputValue()) !== "");

await page.getByRole("button", { name: "Confirm booking" }).click();
await page.waitForURL(/\/track\/FD-/, { timeout: 20000 });

const url = page.url();
const ref = url.match(/FD-[A-Z0-9]{6}/)[0];
check("booking created with reference", !!ref, ref);

const waHref = await page.getByRole("link", { name: "Confirm on WhatsApp" }).getAttribute("href");
check(
  "WhatsApp confirm link built",
  /^https:\/\/wa\.me\/91\d{10}\?text=/.test(waHref),
  waHref.split("?")[0]
);
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

// --- Account settings ------------------------------------------------------
// The signup above left this browser signed in as the new customer.
await page.goto(`${BASE}/account`);
await page.fill("#name", "Renamed Customer");
await page.fill("#email", "renamed@example.com");
await page.getByRole("button", { name: "Save changes" }).click();
// Navigating the instant the click lands can abort the in-flight POST, so let
// it settle before polling, then require the field and the header to agree --
// they are read from one page load, and the two checks below read them back.
await page.waitForTimeout(1500);
await until(async () => {
  await page.goto(`${BASE}/account`);
  const saved = (await page.locator("#name").inputValue()) === "Renamed Customer";
  const inHeader = (await page.locator("header").innerText()).includes("Renamed");
  return saved && inHeader;
});
check(
  "profile changes are saved",
  (await page.locator("#name").inputValue()) === "Renamed Customer"
);

// The header greets by name from the session cookie, so it must be reissued.
check(
  "the header reflects the new name",
  (await page.locator("header").innerText()).includes("Renamed")
);

// Changing a password must require the current one, or a borrowed unlocked
// phone could lock the real owner out.
await page.fill("#current", "definitely-not-the-password");
await page.fill("#next", "another-good-password");
await page.fill("#confirm", "another-good-password");
await page.getByRole("button", { name: "Change password" }).click();
await page.waitForSelector("text=isn't your current password", { timeout: 15000 });
check("a wrong current password is refused", true);

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
//
// Retry the whole interaction rather than just the assertion. The status form
// is a progressively-enhanced server action, and networkidle settles on the
// network while hydration is CPU work, so there is no reliable moment at which
// the click is guaranteed to take the hydrated path. Re-doing select-click and
// re-reading the board on a fresh load is true regardless of which path ran.
await until(
  async () => {
    await ap.goto(`${BASE}/admin/bookings`);
    await ap.waitForLoadState("networkidle");
    const card = ap.locator("li.card", { hasText: ref });
    await card.locator("select[name=status]").selectOption("CONFIRMED");
    await card.getByRole("button", { name: "Update" }).click();
    await ap.waitForTimeout(1500);

    await ap.goto(`${BASE}/admin/bookings`);
    const chip = await ap
      .locator("li.card", { hasText: ref })
      .locator(".chip")
      .first()
      .innerText();
    return chip.trim() === "Confirmed";
  },
  { timeout: 45000, interval: 0 }
);
check("admin advances booking status", true);

await page.goto(`${BASE}/track/${ref}`);
const statusText = await page.locator("span.chip").first().innerText();
check("tracking page reflects new status", statusText === "Confirmed", `got ${statusText}`);

// --- Reviews: admin round trip ---------------------------------------------
// The empty state was checked earlier; this proves a real review reaches the
// site, and removes it again so the suite leaves nothing behind.
const reviewName = `Test Reviewer ${Date.now().toString().slice(-6)}`;
await ap.goto(`${BASE}/admin/reviews`);
await ap.waitForLoadState("networkidle");
await ap.fill("#customerName", reviewName);
await ap.fill("#area", "Indirapuram, Ghaziabad");
await ap.fill("#deviceLabel", "iPhone 13 screen");
await ap.fill("#body", "Technician arrived on time and replaced the screen in under an hour.");
await ap.getByRole("button", { name: "Add review" }).click();
// Assert the outcome, not the flash. These forms are progressively enhanced:
// an un-hydrated click still posts natively and still works, it just reloads
// the page and discards the useActionState message with the old document.
await ap.waitForSelector(`li.card:has-text("${reviewName}")`, { timeout: 20000 });

await page.goto(`${BASE}/reviews`);
check(
  "a published review appears on the reviews page",
  (await page.locator("main").innerText()).includes(reviewName)
);

await page.goto(`${BASE}/`);
check(
  "the home page shows the reviews section once one exists",
  (await page.locator("main").innerText()).includes("What customers say")
);

// Hiding it must take it off the site without deleting it.

await ap.goto(`${BASE}/admin/reviews`);
await ap.waitForLoadState("networkidle");
await ap.locator("li.card", { hasText: reviewName }).getByRole("button", { name: "Hide" }).click();
// Hidden cards keep their text and swap the chip to "Hidden" (the button then
// reads "Publish"), so wait for that rather than for the flash message.
await ap.waitForSelector(
  `li.card:has-text("${reviewName}") .chip:has-text("Hidden")`,
  { timeout: 20000 }
);

await page.goto(`${BASE}/reviews`);
check(
  "a hidden review is off the site",
  !(await page.locator("main").innerText()).includes(reviewName)
);

await ap.goto(`${BASE}/admin/reviews`);
await ap.waitForLoadState("networkidle");
await ap.locator("li.card", { hasText: reviewName }).getByRole("button", { name: "Delete" }).click();
await ap.waitForSelector(`li.card:has-text("${reviewName}")`, { state: "detached", timeout: 15000 });
check("review deleted, leaving the site as found", true);

// --- Price edit propagates to the storefront -------------------------------
// Uses a value derived from the current one, then puts it back, so running the
// suite twice in a row gives the same result.
const editedPrice = screenPrice - 500;
const priceUrl = `${BASE}/admin/prices?brand=apple&model=iphone-13`;

const setScreenPrice = async (value) => {
  await ap.goto(priceUrl);
  // Saving is a server action, so the form is fully interactive only once React
  // has hydrated. Clicking sooner still saves -- the browser posts the form
  // natively -- but the confirmation message is lost with the old document.
  await ap.waitForLoadState("networkidle");
  const form = ap.locator("form", { hasText: "Screen replacement" }).first();
  await form.locator("input[name=price]").fill(String(value));
  await form.getByRole("button", { name: "Save" }).click();
  await until(async () => {
    await ap.goto(priceUrl);
    const field = ap.locator("form", { hasText: "Screen replacement" }).first()
      .locator("input[name=price]");
    return Number(await field.inputValue()) === value;
  });
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
