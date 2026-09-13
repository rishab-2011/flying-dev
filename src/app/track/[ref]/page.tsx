import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { rupees, formatSlot, modeLabel, statusLabel } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { whatsAppLink, customerConfirmationText, businessWhatsAppNumber } from "@/lib/notify";

export const metadata: Metadata = {
  title: "Your booking",
  robots: { index: false },
};

// The happy path, in order. CANCELLED is shown on its own instead.
const TIMELINE = ["REQUESTED", "CONFIRMED", "IN_PROGRESS", "READY", "COMPLETED"];

const TIMELINE_BLURBS: Record<string, string> = {
  REQUESTED: "We've received your booking and will confirm it shortly.",
  CONFIRMED: "Your slot is confirmed. The technician will call before arriving.",
  IN_PROGRESS: "Your repair is underway.",
  READY: "The repair is done and your phone has been tested.",
  COMPLETED: "Handed over. Your 6-month warranty starts today.",
};

type Props = {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ new?: string }>;
};

export default async function TrackDetailPage({ params, searchParams }: Props) {
  const { ref } = await params;
  const { new: isNew } = await searchParams;

  const booking = await db.booking.findUnique({
    where: { ref: decodeURIComponent(ref).toUpperCase() },
    include: { items: true },
  });

  if (!booking) notFound();

  const currentStep = TIMELINE.indexOf(booking.status);
  const cancelled = booking.status === "CANCELLED";

  const confirmLink = whatsAppLink(
    businessWhatsAppNumber(),
    customerConfirmationText(booking)
  );

  return (
    <div className="container-page py-12">
      {isNew && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h1 className="text-xl font-bold text-emerald-900">
            Booking confirmed — {booking.ref}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-emerald-900/80">
            We've got your request. Send us a quick WhatsApp message so we can
            confirm your slot and answer anything you'd like to ask.
          </p>
          <a
            href={confirmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent mt-5"
          >
            Confirm on WhatsApp
          </a>
          <p className="mt-3 text-xs text-emerald-900/70">
            Save your reference: <strong>{booking.ref}</strong>
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">Booking {booking.ref}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">{booking.deviceLabel}</h2>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        {/* Timeline */}
        <section className="card p-7">
          <h3 className="font-semibold">Progress</h3>

          {cancelled ? (
            <p className="mt-4 rounded-xl bg-red-50 px-5 py-4 text-sm text-red-800">
              This booking was cancelled. Message us on WhatsApp if that wasn't
              intended and we'll get it running again.
            </p>
          ) : (
            <ol className="mt-6 space-y-6">
              {TIMELINE.map((step, index) => {
                const done = index <= currentStep;
                const active = index === currentStep;
                return (
                  <li key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          done ? "bg-brand-500 text-white" : "bg-surface-sunk text-ink-muted"
                        }`}
                      >
                        {done ? "✓" : index + 1}
                      </span>
                      {index < TIMELINE.length - 1 && (
                        <span
                          className={`mt-1 w-0.5 flex-1 ${
                            index < currentStep ? "bg-brand-500" : "bg-surface-line"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pb-1">
                      <p className={`font-medium ${active ? "text-brand-700" : done ? "" : "text-ink-muted"}`}>
                        {statusLabel(step)}
                      </p>
                      <p className="mt-0.5 text-sm text-ink-muted">{TIMELINE_BLURBS[step]}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* Details */}
        <aside className="space-y-6">
          <div className="card p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Repair details
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {booking.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span className="text-ink-soft">{item.issueName}</span>
                  <span className="font-medium">{rupees(item.price)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-surface-line pt-4">
              <span className="font-semibold">Estimate</span>
              <span className="font-bold text-brand-700">{rupees(booking.totalAmount)}</span>
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              {booking.warrantyMonths}-month warranty · payable to the technician
              after the repair
            </p>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Visit
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-ink-muted">Service</dt>
                <dd className="mt-0.5 font-medium">{modeLabel(booking.mode)}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Slot</dt>
                <dd className="mt-0.5 font-medium">
                  {formatSlot(booking.slotDate, booking.slotWindow)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-muted">Address</dt>
                <dd className="mt-0.5 font-medium leading-relaxed">
                  {booking.addressLine}
                  {booking.landmark && <>, {booking.landmark}</>}
                  <br />
                  {booking.city} {booking.pincode}
                </dd>
              </div>
            </dl>

            <a
              href={confirmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost mt-5 w-full"
            >
              Message us on WhatsApp
            </a>
          </div>
        </aside>
      </div>

      <p className="mt-10 text-sm text-ink-muted">
        <Link href="/repair" className="font-semibold text-brand-600 hover:underline">
          Book another repair
        </Link>
      </p>
    </div>
  );
}
