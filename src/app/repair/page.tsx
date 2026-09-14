import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Mobile repair prices in Delhi NCR",
  description:
    "Pick your phone brand to see screen, battery and charging-port repair prices. Doorstep service across Delhi, Noida, Gurugram, Ghaziabad and Faridabad.",
  alternates: { canonical: "/repair" },
};

export default async function RepairPage() {
  const brands = await db.brand.findMany({
    orderBy: { rank: "asc" },
    include: { _count: { select: { models: true } } },
  });

  return (
    <div className="container-page py-12">
      <nav className="text-sm text-ink-muted">
        <Link href="/" className="hover:text-brand-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Repair</span>
      </nav>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Which phone needs fixing?
      </h1>
      <p className="mt-2 max-w-xl text-ink-muted">
        Choose your brand, then your model. You'll see the exact price for each
        repair before you book anything.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/repair/${brand.slug}`}
            className="card group flex items-center justify-between p-6 transition hover:border-brand-300 hover:shadow-lift"
          >
            <div>
              <p className="text-lg font-semibold group-hover:text-brand-700">
                {brand.name}
              </p>
              <p className="mt-0.5 text-sm text-ink-muted">
                {brand._count.models} models
              </p>
            </div>
            <span className="text-xl text-ink-muted transition group-hover:translate-x-1 group-hover:text-brand-500">
              →
            </span>
          </Link>
        ))}
      </div>

      <div className="card mt-10 flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="font-semibold">Don't see your phone?</p>
          <p className="mt-1 text-sm text-ink-muted">
            Tell us the model and we'll send you a price on WhatsApp.
          </p>
        </div>
        <Link href="/quote" className="btn-ghost">
          Request a quote
        </Link>
      </div>
    </div>
  );
}
