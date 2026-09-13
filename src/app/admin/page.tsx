import Link from "next/link";
import { db } from "@/lib/db";
import { rupees } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [open, today, pendingQuotes, completed, recent] = await Promise.all([
    db.booking.count({ where: { status: { in: ["REQUESTED", "CONFIRMED", "IN_PROGRESS"] } } }),
    db.booking.count({ where: { slotDate: new Date().toISOString().slice(0, 10) } }),
    db.quoteRequest.count({ where: { handled: false } }),
    db.booking.findMany({ where: { status: "COMPLETED" }, select: { totalAmount: true } }),
    db.booking.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
  ]);

  const revenue = completed.reduce((sum, b) => sum + b.totalAmount, 0);

  const stats = [
    { label: "Open bookings", value: String(open) },
    { label: "Scheduled today", value: String(today) },
    { label: "Quote requests waiting", value: String(pendingQuotes) },
    { label: "Completed revenue", value: rupees(revenue) },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-6">
            <p className="text-sm text-ink-muted">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-surface-line px-6 py-4">
          <h2 className="font-semibold">Latest bookings</h2>
          <Link href="/admin/bookings" className="text-sm font-semibold text-brand-600 hover:underline">
            See all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-ink-muted">
            No bookings yet.
          </p>
        ) : (
          <ul className="divide-y divide-surface-line">
            {recent.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="min-w-0">
                  <p className="font-medium">
                    {b.ref} · {b.deviceLabel}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-ink-muted">
                    {b.customerName} · {b.items.map((i) => i.issueName).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{rupees(b.totalAmount)}</span>
                  <StatusBadge status={b.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
