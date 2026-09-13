# Flying Dev

Doorstep mobile-phone repair for Delhi NCR — a booking website with a customer
funnel, WhatsApp notifications, and an admin panel for running the operation.

Built with Next.js (App Router), Prisma, SQLite and Tailwind.

## Running it locally

```bash
npm install
cp .env.example .env        # then edit the values
npm run db:push             # create the database
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

## Moving to production

1. **Database** — change the `datasource` provider in `prisma/schema.prisma` to
   `postgresql`, point `DATABASE_URL` at Neon/Supabase, run
   `npx prisma migrate deploy`, then `npm run seed`.
2. **Environment** — set `SESSION_SECRET` (use `openssl rand -base64 32`),
   `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_SUPPORT_PHONE`,
   `NEXT_PUBLIC_SITE_URL`, and a real `ADMIN_PHONE` / `ADMIN_PASSWORD`. Set them
   in your host's dashboard, never in the repo.
3. **Before taking real bookings**
   - Replace the seeded prices with your own.
   - Verify every pincode in `prisma/serviceAreas.ts` is one you can actually
     reach inside a two-hour slot.
   - Fill in every `[bracketed]` placeholder in `/terms` and `/privacy` and have
     a lawyer review them.
   - Swap the placeholder support phone and WhatsApp number.

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
