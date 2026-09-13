import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Why Flying Dev",
  description:
    "Doorstep phone repair across Delhi NCR with fixed prices, genuine-grade parts and a 6-month warranty on every repair.",
};

const POINTS = [
  {
    icon: "shield",
    title: "A real 6-month warranty",
    body: "Every repair is covered for six months on both the part and the workmanship. If the same fault comes back in that window, we fix it again at no cost. The warranty starts the day we hand the phone back and is tied to your booking reference.",
  },
  {
    icon: "rupee",
    title: "The price you see is the price you pay",
    body: "Our prices are on this website for every model we list. The technician confirms the price after inspecting the device — if the fault turns out to be different from what you booked, we tell you before doing any work, and you can walk away at no charge.",
  },
  {
    icon: "home",
    title: "We come to you",
    body: "Most repairs happen at your home or office while you watch. Nothing leaves your sight. For jobs that need the workshop — motherboard-level faults and water damage — we collect the device and return it to the same address.",
  },
  {
    icon: "clock",
    title: "Same-day where we can",
    body: "Screen and battery replacements are usually done inside an hour, in one visit. Book a two-hour window and we'll call before we set off.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-page py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Phone repair that treats you like an adult
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          Getting a phone repaired in Delhi usually means a trip to a market, a
          price invented on the spot, and no idea what part went in. Flying Dev
          exists to do the opposite: published prices, a technician at your door,
          and a warranty that means something.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {POINTS.map((point) => (
          <div key={point.title} className="card p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon name={point.icon} />
            </div>
            <h2 className="mt-4 text-lg font-semibold">{point.title}</h2>
            <p className="mt-2 leading-relaxed text-ink-muted">{point.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight">Where we work</h2>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Delhi, Noida, Greater Noida, Ghaziabad, Gurugram and Faridabad. Enter
          your pincode during booking and we'll tell you straight away whether
          we can reach you.
        </p>
        <Link href="/repair" className="btn-primary mt-7">
          Check your repair price
        </Link>
      </div>
    </div>
  );
}
