import Link from "next/link";
import { db } from "@/lib/db";
import { statusLabel, BOOKING_STATUSES } from "@/lib/format";
import { whatsAppLink, statusUpdateText } from "@/lib/notify";
import { BookingCard, type AdminBooking } from "@/components/admin/BookingCard";
import { updateBookingStatusAction, saveAdminNoteAction } from "../actions";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminBookingsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const filter = status && BOOKING_STATUSES.includes(status) ? status : undefined;

  const bookings = await db.booking.findMany({
    where: filter ? { status: filter } : undefined,
    include: { items: true },
    orderBy: [{ slotDate: "asc" }, { createdAt: "desc" }],
  });

  const counts = await db.booking.groupBy({ by: ["status"], _count: true });
  const countFor = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  const rows: AdminBooking[] = bookings.map((b) => ({
    id: b.id,
    ref: b.ref,
    status: b.status,
    customerName: b.customerName,
    customerPhone: b.customerPhone,
    customerEmail: b.customerEmail,
    deviceLabel: b.deviceLabel,
    mode: b.mode,
    addressLine: b.addressLine,
    landmark: b.landmark,
    pincode: b.pincode,
    city: b.city,
    slotDate: b.slotDate,
    slotWindow: b.slotWindow,
    notes: b.notes,
    adminNote: b.adminNote,
    totalAmount: b.totalAmount,
    createdAt: b.createdAt.toISOString(),
    items: b.items.map((i) => ({ id: i.id, issueName: i.issueName, price: i.price })),
    // Pre-filled with a message matching the booking's current status, so one
    // tap opens WhatsApp with something sensible already typed.
    whatsAppLink: whatsAppLink(b.customerPhone, statusUpdateText({ ...b, items: b.items })),
    mapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${b.addressLine}, ${b.city} ${b.pincode}`
    )}`,
  }));

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/bookings"
          className={`chip border px-3.5 py-1.5 ${
            filter ? "border-surface-line bg-white text-ink-soft" : "border-brand-300 bg-brand-50 text-brand-700"
          }`}
        >
          All ({bookings.length === 0 && !filter ? 0 : counts.reduce((n, c) => n + c._count, 0)})
        </Link>
        {BOOKING_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/bookings?status=${s}`}
            className={`chip border px-3.5 py-1.5 ${
              filter === s
                ? "border-brand-300 bg-brand-50 text-brand-700"
                : "border-surface-line bg-white text-ink-soft"
            }`}
          >
            {statusLabel(s)} ({countFor(s)})
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="card mt-6 p-10 text-center text-sm text-ink-muted">
          No bookings {filter ? `with status "${statusLabel(filter)}"` : "yet"}.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              updateStatus={updateBookingStatusAction}
              saveNote={saveAdminNoteAction}
            />
          ))}
        </ul>
      )}
    </>
  );
}
