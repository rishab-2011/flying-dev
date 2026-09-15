import { launchChromium } from "./browser.mjs";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const b = await launchChromium();
const ctx = await b.newContext({ viewport: { width: 1360, height: 1000 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();

await p.goto(`${BASE}/`);
await p.waitForTimeout(600);
await p.screenshot({ path: "shots/home.png" });

await p.goto(`${BASE}/repair/apple/iphone-13`);
await p.getByRole("button", { name: /Screen replacement/ }).click();
await p.getByRole("button", { name: /Battery replacement/ }).click();
await p.waitForTimeout(300);
await p.screenshot({ path: "shots/quote.png" });

await p.goto(`${BASE}/repair/apple/iphone-13`);
await p.getByRole("button", { name: /Screen replacement/ }).click();
await p.getByRole("button", { name: "Continue to booking" }).click();
await p.waitForURL(/\/book\?/);
await p.fill("#customerName", "Aarav Sharma");
await p.fill("#customerPhone", "9876543210");
await p.fill("#pincode", "122002");
await p.fill("#addressLine", "House 214, DLF Phase 2");
await p.waitForTimeout(400);
await p.screenshot({ path: "shots/booking.png" });

const ap = await (await b.newContext({ viewport: { width: 1360, height: 1100 }, deviceScaleFactor: 2 })).newPage();
await ap.goto(`${BASE}/login`);
await ap.fill("#phone", "9000000001");
await ap.fill("#password", "flyingdev-admin");
await ap.getByRole("button", { name: "Sign in" }).click();
await ap.waitForURL(/\/admin/);
await ap.waitForTimeout(400);
await ap.screenshot({ path: "shots/admin.png" });

await ap.goto(`${BASE}/admin/bookings`);
await ap.waitForTimeout(500);
await ap.screenshot({ path: "shots/admin-bookings.png" });

// Phone-width check on the funnel.
const m = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
await m.goto(`${BASE}/repair/apple/iphone-13`);
await m.getByRole("button", { name: /Screen replacement/ }).click();
await m.waitForTimeout(300);
await m.screenshot({ path: "shots/mobile.png", fullPage: false });

await b.close();
console.log("captured");
