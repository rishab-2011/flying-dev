import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATALOGUE } from "./catalogue";
import { SERVICE_AREAS } from "./serviceAreas";

const db = new PrismaClient();

/**
 * Repair types, and how each one is priced relative to the model's screen
 * price. A screen is the most expensive common repair, so it works well as the
 * single anchor per model: change one number and the whole row moves sensibly.
 *
 * `factor` is the share of the screen price; `min`/`max` clamp the result so a
 * ₹1,699 budget screen doesn't imply a ₹340 battery job that loses money, and a
 * ₹45,000 foldable screen doesn't imply a ₹12,000 speaker swap.
 */
const ISSUES = [
  {
    slug: "screen",
    name: "Screen replacement",
    blurb: "Cracked glass, black display, lines, or touch not responding",
    icon: "screen",
    rank: 10,
    factor: 1,
    min: 0,
    max: Infinity,
    eta: 60,
  },
  {
    slug: "battery",
    name: "Battery replacement",
    blurb: "Drains within hours, shuts down suddenly, or swollen",
    icon: "battery",
    rank: 20,
    factor: 0.2,
    min: 1199,
    max: 7999,
    eta: 45,
  },
  {
    slug: "charging-port",
    name: "Charging port repair",
    blurb: "Won't charge, charges only at an angle, or cable keeps slipping",
    icon: "charging",
    rank: 30,
    factor: 0.14,
    min: 899,
    max: 5999,
    eta: 60,
  },
  {
    slug: "camera",
    name: "Camera repair",
    blurb: "Blurry photos, black camera screen, or a cracked camera lens",
    icon: "camera",
    rank: 40,
    factor: 0.24,
    min: 1299,
    max: 9999,
    eta: 60,
  },
  {
    slug: "speaker-mic",
    name: "Speaker or mic repair",
    blurb: "No sound, crackling audio, or callers can't hear you",
    icon: "speaker",
    rank: 50,
    factor: 0.12,
    min: 799,
    max: 4999,
    eta: 60,
  },
  {
    slug: "back-panel",
    name: "Back panel replacement",
    blurb: "Cracked or shattered rear glass",
    icon: "back",
    rank: 60,
    factor: 0.26,
    min: 999,
    max: 12999,
    eta: 90,
  },
  {
    slug: "water-damage",
    name: "Water damage treatment",
    blurb: "Dropped in water. Priced after inspection — this is a starting estimate",
    icon: "water",
    rank: 70,
    factor: 0.3,
    min: 1499,
    max: 9999,
    eta: 1440,
  },
  {
    slug: "motherboard",
    name: "Motherboard repair",
    blurb: "Dead phone, no power, or boot loop. Confirmed after diagnosis",
    icon: "motherboard",
    rank: 80,
    factor: 0.55,
    min: 2499,
    max: 19999,
    eta: 2880,
  },
  {
    slug: "software",
    name: "Software & OS issues",
    blurb: "Hanging, restarting, stuck on logo, or needs a clean reinstall",
    icon: "software",
    rank: 90,
    flat: 699,
    eta: 45,
  },
] as const;

/** Rounds to the familiar ₹X,499 / ₹X,999 shape Indian repair shops quote in. */
function round99(value: number): number {
  return Math.max(199, Math.round(value / 100) * 100 - 1);
}

function priceFor(issue: (typeof ISSUES)[number], screenPrice: number): number {
  if ("flat" in issue) return issue.flat;
  const raw = screenPrice * issue.factor;
  return round99(Math.min(Math.max(raw, issue.min), issue.max));
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\+/g, "-plus")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * The seed is additive: it creates anything missing and leaves anything that
 * already exists alone. Re-running it after adding models to catalogue.ts picks
 * up the new ones without overwriting prices you have edited in the admin panel
 * — and without deleting models that existing bookings point at.
 */
async function main() {
  console.log("Seeding Flying Dev…");

  const issueRows = new Map<string, string>();
  for (const issue of ISSUES) {
    const row = await db.issue.upsert({
      where: { slug: issue.slug },
      update: {
        name: issue.name,
        blurb: issue.blurb,
        icon: issue.icon,
        rank: issue.rank,
      },
      create: {
        name: issue.name,
        slug: issue.slug,
        blurb: issue.blurb,
        icon: issue.icon,
        rank: issue.rank,
      },
    });
    issueRows.set(issue.slug, row.id);
  }

  let modelsAdded = 0;
  let pricesAdded = 0;

  for (const brand of CATALOGUE) {
    const brandRow = await db.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name, rank: brand.rank },
      create: { name: brand.name, slug: brand.slug, rank: brand.rank },
    });

    for (const [name, screenPrice, year] of brand.models) {
      const slug = slugify(name);
      const existing = await db.model.findUnique({
        where: { brandId_slug: { brandId: brandRow.id, slug } },
      });

      const modelRow =
        existing ??
        (await db.model.create({
          data: { name, slug, releaseYear: year, brandId: brandRow.id },
        }));
      if (!existing) modelsAdded++;

      for (const issue of ISSUES) {
        const issueId = issueRows.get(issue.slug)!;
        const already = await db.priceItem.findUnique({
          where: { modelId_issueId: { modelId: modelRow.id, issueId } },
        });
        // An existing price may have been edited by hand — never overwrite it.
        if (already) continue;

        const price = priceFor(issue, screenPrice);
        await db.priceItem.create({
          data: {
            modelId: modelRow.id,
            issueId,
            price,
            // The struck-through "market price" on the quote card.
            strikePrice: round99(price * 1.2),
            etaMinutes: issue.eta,
            warrantyMonths: 6,
          },
        });
        pricesAdded++;
      }
    }
  }

  let areasAdded = 0;
  for (const area of SERVICE_AREAS) {
    const existing = await db.serviceArea.findUnique({ where: { pincode: area.pincode } });
    if (existing) continue;
    await db.serviceArea.create({ data: { ...area, doorstep: true, pickupAndDrop: true } });
    areasAdded++;
  }

  // Accounts. Both are seeded from env so a deploy can set real credentials.
  const adminPhone = process.env.ADMIN_PHONE || "9000000001";
  const adminPassword = process.env.ADMIN_PASSWORD || "flyingdev-admin";

  await db.user.upsert({
    where: { phone: adminPhone },
    update: { role: "ADMIN" },
    create: {
      name: "Flying Dev Admin",
      phone: adminPhone,
      role: "ADMIN",
      password: await bcrypt.hash(adminPassword, 10),
    },
  });

  await db.user.upsert({
    where: { phone: "9000000002" },
    update: {},
    create: {
      name: "Demo Customer",
      phone: "9000000002",
      email: "demo@example.com",
      role: "CUSTOMER",
      password: await bcrypt.hash("demo1234", 10),
    },
  });

  console.log(
    `Done. ${modelsAdded} models added, ${pricesAdded} prices added, ` +
      `${areasAdded} pincodes added. Existing rows were left untouched.`
  );
  console.log(`Admin login: ${adminPhone} / ${adminPassword}`);
  console.log("Customer login: 9000000002 / demo1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
