"use client";

import { useActionState } from "react";
import { StatusBadge } from "../StatusBadge";
import { SubmitButton } from "../SubmitButton";
import { rupees, formatSlot, modeLabel, statusLabel, BOOKING_STATUSES } from "@/lib/format";
import type { AdminState } from "@/app/admin/actions";

type Action = (state: AdminState, formData: FormData) => Promise<AdminState>;

export type AdminBooking = {
  id: string;
  ref: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  deviceLabel: string;
  mode: string;
  addressLine: string;
  landmark: string | null;
  pincode: string;
  city: string;
  slotDate: string;
  slotWindow: string;
  notes: string | null;
  adminNote: string | null;
  totalAmount: number;
  createdAt: string;
  items: { id: string; issueName: string; price: number }[];
  whatsAppLink: string;
  mapsLink: string;
};

export function BookingCard({
  booking,
  updateStatus,
  saveNote,
}: {
  booking: AdminBooking;
  updateStatus: Action;
  saveNote: Action;
}) {
  const [statusState, statusAction] = useActionState(updateStatus, {} as AdminState);
  const [noteState, noteAction] = useActionState(saveNote, {} as AdminState);

  return (
    <li className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">
            {booking.ref} · {booking.deviceLabel}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Booked {new Date(booking.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-5 grid gap-5 border-t border-surface-line pt-5 text-sm sm:grid-cols-3">
        <div>
          <p className="font-medium text-ink-muted">Customer</p>
          <p className="mt-1 font-medium">{booking.customerName}</p>
          <a href={`tel:+91${booking.customerPhone}`} className="text-brand-600 hover:underline">
            {booking.customerPhone}
          </a>
          {booking.customerEmail && (
            <p className="mt-0.5 text-ink-muted">{booking.customerEmail}</p>
          )}
        </div>

        <div>
          <p className="font-medium text-ink-muted">Visit</p>
          <p className="mt-1">{modeLabel(booking.mode)}</p>
          <p>{formatSlot(booking.slotDate, booking.slotWindow)}</p>
          <a
            href={booking.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block leading-relaxed text-brand-600 hover:underline"
          >
            {booking.addressLine}
            {booking.landmark && `, ${booking.landmark}`}, {booking.city} {booking.pincode}
          </a>
        </div>

        <div>
          <p className="font-medium text-ink-muted">Repairs</p>
          <ul className="mt-1 space-y-0.5">
            {booking.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span>{item.issueName}</span>
                <span className="font-medium">{rupees(item.price)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 border-t border-surface-line pt-1.5 font-semibold">
            {rupees(booking.totalAmount)}
          </p>
        </div>
      </div>

      {booking.notes && (
        <p className="mt-4 rounded-xl bg-surface-sunk px-4 py-3 text-sm text-ink-soft">
          <span className="font-medium">Customer note:</span> {booking.notes}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-surface-line pt-5">
        <form action={statusAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="bookingId" value={booking.id} />
          <label className="sr-only" htmlFor={`status-${booking.id}`}>
            Status
          </label>
          <select
            id={`status-${booking.id}`}
            name="status"
            defaultValue={booking.status}
            className="field w-auto py-2"
          >
            {BOOKING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
          <SubmitButton className="btn-primary px-4 py-2" pendingLabel="Saving…">
            Update
          </SubmitButton>
        </form>

        <a
          href={booking.whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost px-4 py-2"
        >
          WhatsApp customer
        </a>
      </div>

      {(statusState.message || statusState.error) && (
        <p
          className={`mt-3 text-sm ${statusState.error ? "text-red-700" : "text-emerald-700"}`}
        >
          {statusState.error ?? statusState.message}
        </p>
      )}

      <form action={noteAction} className="mt-4">
        <input type="hidden" name="bookingId" value={booking.id} />
        <label className="label" htmlFor={`note-${booking.id}`}>
          Internal note
        </label>
        <textarea
          id={`note-${booking.id}`}
          name="adminNote"
          rows={2}
          defaultValue={booking.adminNote ?? ""}
          className="field"
          placeholder="Part ordered, technician assigned, anything the team should know"
        />
        <div className="mt-2 flex items-center gap-3">
          <SubmitButton className="btn-ghost px-4 py-2" pendingLabel="Saving…">
            Save note
          </SubmitButton>
          {noteState.message && (
            <span className="text-sm text-emerald-700">{noteState.message}</span>
          )}
        </div>
      </form>
    </li>
  );
}
