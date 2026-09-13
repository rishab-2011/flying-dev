# Flying Dev

Doorstep mobile-phone repair for Delhi NCR — a booking website with a customer
funnel, WhatsApp notifications, and an admin panel for running the operation.

Built with Next.js (App Router), Prisma, SQLite and Tailwind.

## Running it locally

Needs a Postgres database. The quickest one is a free Neon project — create a
second one alongside production and use it for development.

```bash
npm install
cp .env.example .env        # paste your Neon connection strings in
npm run db:migrate          # create the tables
npm run seed                # load the catalogue, pincodes and accounts
npm run dev                 # http://localhost:3000
```

Seeded logins (change these before deploying anywhere public):

| Role     | Phone        | Password          |
| -------- | ------------ | ----------------- |
| Admin    | `9000000001` | `flyingdev-admin` |
| Customer | `9000000002` | `demo1234`        |

## What's here

**Customer side**

- Home page, then brand → model → issue → price funnel over 191 phone models
- Multi-issue selection with a live running total
- Booking form with inline Delhi NCR pincode serviceability checking, doorstep
  or pickup-and-drop, and a two-hour slot picker
- Booking works without an account; signing up later links past bookings placed
  with the same number
- Tracking page at `/track/FD-XXXXXX` with a status timeline
- "Model not listed" quote request form
- Terms and privacy pages — **drafts with `[bracketed]` placeholders to fill in**

**Admin side** (`/admin`, admin role only)

- Overview with open bookings, today's visits, and completed revenue
- Bookings board filtered by status, with status transitions, internal notes,
  one-tap WhatsApp to the customer, and a Google Maps link to the address
- Price editor per model, plus CSV export and bulk CSV import
- Pincode management: add, pause and resume service areas
- Quote requests inbox

**No online payment.** Booking takes no money; the customer pays the technician
after the repair. That is a deliberate product decision, not a missing feature.

## Pricing

Prices are generated from one anchor number per model — its screen-replacement
price in `prisma/catalogue.ts` — with per-issue multipliers defined in
`prisma/seed.ts`. Change the anchor and the whole row moves sensibly.

**The seeded prices are market-rate estimates, not your costs.** They are a
starting point so the site is usable on day one. Replace them with your real
supplier pricing before quoting a customer: edit them in the admin panel, or
export the CSV, edit it in a spreadsheet, and import it back.

The seed is additive. Re-running it creates anything missing and never
overwrites a price you have edited or deletes a model an existing booking
points at, so adding models to `catalogue.ts` and re-running is safe.

## WhatsApp notifications

Sending automated WhatsApp messages requires a verified Meta Business account
and pre-approved message templates — one to two weeks, and it needs your
company documents. Until that exists, `src/lib/notify.ts` uses a click-to-chat
driver: every message is recorded in the `Notification` table and rendered as a
`wa.me` deep link that a person taps. The customer gets one after booking; the
admin gets one per booking, pre-filled with a message matching its current
status.

When the Cloud API is ready, implement the `cloudApi` driver in that file and
change `activeDriver`. Nothing else in the app changes.

## Deploying (Netlify + Neon, both free)

Netlify's free tier permits commercial use; Vercel's free Hobby plan does not,
so this project is set up for Netlify. Total cost: ₹0, plus a domain if you want
one.

### 1. Create the database (Neon)

1. Sign up at neon.tech and create a project in the **Singapore** region — it's
   the closest to Delhi NCR.
2. On the dashboard, copy **two** connection strings:
   - the **pooled** one, whose host contains `-pooler` → this is `DATABASE_URL`
   - the **direct** one, same string without `-pooler` → this is `DIRECT_URL`

   The app opens a connection per request, so it must go through the pooler;
   migrations can't run through a pooler, which is why both are needed.

### 2. Deploy the site (Netlify)

1. Sign up at netlify.com, choose **Add new site → Import an existing project**,
   and pick this repository.
2. Leave the build settings alone — `netlify.toml` already sets them.
3. Under **Environment variables**, add:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | the pooled Neon string |
   | `DIRECT_URL` | the direct Neon string |
   | `SESSION_SECRET` | output of `openssl rand -base64 32` |
   | `ADMIN_PHONE` | the phone number you'll sign in with |
   | `ADMIN_PASSWORD` | a strong password you choose |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | your WhatsApp number, e.g. `919876543210` |
   | `NEXT_PUBLIC_SUPPORT_PHONE` | as you want it shown, e.g. `+91 98765 43210` |
   | `NEXT_PUBLIC_SITE_URL` | your live URL |
   | `SEED_ON_BUILD` | `1` — **for the first deploy only** |

4. Deploy. The build runs the migrations, loads the catalogue, and publishes.
5. **Delete `SEED_ON_BUILD`** and redeploy. Leaving it on isn't destructive —
   the seed never overwrites an edited price — but it re-adds models you may
   have deliberately removed.

Sign in at `/login` with the `ADMIN_PHONE` and `ADMIN_PASSWORD` you set.

### 3. Your own domain (optional, ~₹800/year)

`your-site.netlify.app` works, but a real domain converts better. Buy a `.in`
from Cloudflare or Namecheap, then add it under **Domain management** in
Netlify. HTTPS is automatic.

### Before taking real bookings

- Replace the seeded prices with your own — export the CSV from `/admin/prices`,
  edit it, import it back.
- Verify every pincode in `prisma/serviceAreas.ts` is one you can actually reach
  inside a two-hour slot.
- Fill in every `[bracketed]` placeholder in `/terms` and `/privacy` and have a
  lawyer review them.
- Confirm the WhatsApp and support numbers are yours, not the placeholders.

## Known gaps

- **Passwords, not OTP.** Phone-number login normally uses an SMS OTP in India,
  which needs a DLT-registered sender ID (about a week) and an SMS provider.
  Until then accounts use a password, and there is no password-reset flow.
- **No technician assignment.** Bookings have a status but no assignee.
- **No GST invoicing.**
- **No rate limiting** on signup or booking submission.

## Tests

`tests/e2e.mjs` drives the real app in a browser: the funnel and its running
total, pincode acceptance and rejection, booking creation, the WhatsApp link,
signup, admin sign-in, a status transition reaching the customer's tracking
page, and a price edit reaching the storefront.

```bash
npm run build && npm start     # in one terminal, on port 3000
npm test                       # in another

BASE_URL=http://localhost:3311 npm test   # if you started it on another port
```
