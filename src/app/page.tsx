import Link from "next/link";
import { db } from "@/lib/db";
import { Icon } from "@/components/Icon";
import { rupees } from "@/lib/format";
import { PincodeCheck } from "@/components/PincodeCheck";
import { PhotoGallery } from "@/components/PhotoGallery";
import { ReviewsSection } from "@/components/ReviewsSection";
import { BrandTile } from "@/components/BrandTile";
import { RepairIllustration } from "@/components/RepairIllustration";

const PROMISES = [
  {
    icon: "home",
    title: "We come to you",
    body: "A technician reaches your home or office across Delhi NCR and repairs on the spot, usually in under an hour.",
  },
  {
    icon: "shield",
    title: "6-month warranty",
    body: "Every repair carries a 6-month warranty on the part and the workmanship. If it fails, we fix it free.",
  },
  {
    icon: "rupee",
    title: "Price before we start",
    body: "You see the price on this site before booking. The technician confirms it after inspection — no surprise additions.",
  },
  {
    icon: "clock",
    title: "Same-day slots",
    body: "Book a two-hour window that suits you. Most screen and battery jobs are done in a single visit.",
  },
];

const STEPS = [
  { n: "1", title: "Pick your phone", body: "Choose your brand and model from 190+ devices." },
  { n: "2", title: "Tell us what's wrong", body: "Select one or more issues and see the price instantly." },
  { n: "3", title: "Book a slot", body: "Give us an address and a two-hour window. No payment now." },
  { n: "4", title: "We repair, you pay after", body: "Pay the technician once the repair is done and tested." },
];

export default async function HomePage() {
  const brands = await db.brand.findMany({
    orderBy: { rank: "asc" },
    include: { _count: { select: { models: true } } },
  });

  const areas = await db.serviceArea.findMany({
    where: { active: true },
    select: { pincode: true, city: true, area: true },
    orderBy: { pincode: "asc" },
  });

  // The cheapest screen job across the catalogue anchors the "from" price.
  const cheapestScreen = await db.priceItem.findFirst({
    where: { issue: { slug: "screen" }, active: true },
    orderBy: { price: "asc" },
  });

  return (
    <>
      {/* Hero */}
      <section className="border-b border-surface-line bg-white">
        <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="chip bg-accent-100 text-accent-600">
              Doorstep repair across Delhi NCR
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Phone broken?
              <br />
              We'll fix it at your
              <span className="text-brand-500"> doorstep.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
              Screen, battery, charging port — repaired at your home or office
              across Delhi, Noida, Gurugram, Ghaziabad and Faridabad. Fixed
              prices, genuine parts, and a 6-month warranty on every job.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/repair" className="btn-primary px-7 py-3.5 text-base">
                Get a repair price
              </Link>
              <Link href="/track" className="btn-ghost px-7 py-3.5 text-base">
                Track a booking
              </Link>
            </div>

            <p className="mt-5 text-sm text-ink-muted">
              No advance payment. Pay the technician after the repair is done.
            </p>

            <PincodeCheck areas={areas} />
          </div>

          {/* Brand quick-pick */}
          <div className="card p-7">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Start with your brand
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {brands.slice(0, 9).map((brand) => (
                <BrandTile
                  key={brand.id}
                  name={brand.name}
                  slug={brand.slug}
                  modelCount={brand._count.models}
                />
              ))}
            </div>
            <Link
              href="/repair"
              className="mt-5 block text-center text-sm font-semibold text-brand-600 hover:underline"
            >
              See all brands →
            </Link>
            {cheapestScreen && (
              <p className="mt-5 border-t border-surface-line pt-5 text-center text-sm text-ink-muted">
                Screen replacements from{" "}
                <span className="font-semibold text-ink">{rupees(cheapestScreen.price)}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Promises */}
      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p) => (
            <div key={p.title} className="card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon name={p.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-surface-line bg-white py-16">
        <div className="container-page">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mt-2 text-ink-muted">Four steps, about two minutes.</p>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
            <ol className="grid gap-8 sm:grid-cols-2">
              {STEPS.map((s) => (
                <li key={s.n}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                    {s.n}
                  </span>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{s.body}</p>
                </li>
              ))}
            </ol>

            <RepairIllustration className="mx-auto w-full max-w-sm" />
          </div>
        </div>
      </section>

      <ReviewsSection />

      <PhotoGallery />

      {/* Closing CTA */}
      <section className="container-page py-16">
        <div className="rounded-2xl bg-ink px-8 py-14 text-center text-white sm:px-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Get your phone working again today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Check the price for your model in under a minute. Booking takes no
            payment — you pay the technician after the repair.
          </p>
          <Link href="/repair" className="btn-accent mt-8 px-7 py-3.5 text-base">
            Check my repair price
          </Link>
        </div>
      </section>
    </>
  );
}
