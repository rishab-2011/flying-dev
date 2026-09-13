import { db } from "./db";
import { rupees, formatSlot, modeLabel, statusLabel } from "./format";

/**
 * Outbound messaging.
 *
 * Sending automated WhatsApp messages requires a verified Meta Business account
 * and pre-approved templates, which takes one to two weeks and needs company
 * documents. Until that exists, the `clickToChat` driver records the same
 * message rows and renders them as wa.me deep links that a human taps — the
 * customer to confirm their booking, the admin to reply from the bookings board.
 *
 * When the Cloud API is ready, implement `cloudApi` below and change
 * `activeDriver`. Nothing else in the app changes: callers only ever see
 * `notifyBookingCreated` and `notifyStatusChanged`.
 */

export type NotificationTemplate =
  | "BOOKING_RECEIVED"
  | "BOOKING_ADMIN_ALERT"
  | "STATUS_UPDATE";

export type OutboundMessage = {
  bookingId: string;
  template: NotificationTemplate;
  toPhone: string;
  body: string;
};

export type NotificationDriver = {
  name: string;
  send(message: OutboundMessage): Promise<{ status: string; providerId?: string }>;
};

/** Records the message as PENDING; a person sends it via the rendered link. */
const clickToChat: NotificationDriver = {
  name: "click-to-chat",
  async send() {
    return { status: "PENDING" };
  },
};

// Placeholder for the Meta Cloud API driver. Implement, then set activeDriver.
// const cloudApi: NotificationDriver = { name: "meta-cloud-api", async send(m) { ... } };

const activeDriver: NotificationDriver = clickToChat;

export function businessWhatsAppNumber(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999").replace(/\D/g, "");
}

/** Builds a wa.me deep link. `phone` may be 10-digit Indian or full international. */
export function whatsAppLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  const international = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${international}?text=${encodeURIComponent(text)}`;
}

type BookingForMessage = {
  id: string;
  ref: string;
  customerName: string;
  customerPhone: string;
  deviceLabel: string;
  mode: string;
  slotDate: string;
  slotWindow: string;
  addressLine: string;
  pincode: string;
  city: string;
  totalAmount: number;
  warrantyMonths: number;
  status: string;
  items: { issueName: string; price: number }[];
};

export function customerConfirmationText(b: BookingForMessage): string {
  const lines = b.items.map((i) => `• ${i.issueName} — ${rupees(i.price)}`).join("\n");
  return [
    `Hi Flying Dev, I've booked a repair.`,
    ``,
    `Booking: ${b.ref}`,
    `Device: ${b.deviceLabel}`,
    lines,
    `Estimate: ${rupees(b.totalAmount)} (${b.warrantyMonths}-month warranty)`,
    `Service: ${modeLabel(b.mode)}`,
    `Slot: ${formatSlot(b.slotDate, b.slotWindow)}`,
    `Address: ${b.addressLine}, ${b.city} ${b.pincode}`,
    ``,
    `Please confirm.`,
  ].join("\n");
}

function adminAlertText(b: BookingForMessage): string {
  return [
    `New booking ${b.ref}`,
    `${b.customerName} · ${b.customerPhone}`,
    `${b.deviceLabel} — ${b.items.map((i) => i.issueName).join(", ")}`,
    `${rupees(b.totalAmount)} · ${modeLabel(b.mode)}`,
    `${formatSlot(b.slotDate, b.slotWindow)}`,
    `${b.addressLine}, ${b.city} ${b.pincode}`,
  ].join("\n");
}

export function statusUpdateText(b: BookingForMessage): string {
  const tail: Record<string, string> = {
    CONFIRMED: `Our technician will reach you at ${formatSlot(b.slotDate, b.slotWindow)}.`,
    IN_PROGRESS: `Your ${b.deviceLabel} is being repaired now.`,
    READY: `Your ${b.deviceLabel} is ready. We'll hand it over at your slot.`,
    COMPLETED: `Repair complete — covered by a ${b.warrantyMonths}-month warranty. Thank you for choosing Flying Dev.`,
    CANCELLED: `Your booking has been cancelled. Reply here if this was a mistake.`,
  };
  return [
    `Hi ${b.customerName.split(" ")[0]}, this is Flying Dev.`,
    `Booking ${b.ref} — ${statusLabel(b.status)}.`,
    tail[b.status] ?? "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function record(message: OutboundMessage) {
  const result = await activeDriver.send(message);
  await db.notification.create({
    data: {
      bookingId: message.bookingId,
      channel: "WHATSAPP",
      template: message.template,
      toPhone: message.toPhone,
      body: message.body,
      status: result.status,
      providerId: result.providerId,
    },
  });
}

export async function notifyBookingCreated(b: BookingForMessage): Promise<void> {
  await record({
    bookingId: b.id,
    template: "BOOKING_RECEIVED",
    toPhone: b.customerPhone,
    body: customerConfirmationText(b),
  });
  await record({
    bookingId: b.id,
    template: "BOOKING_ADMIN_ALERT",
    toPhone: businessWhatsAppNumber(),
    body: adminAlertText(b),
  });
}

export async function notifyStatusChanged(b: BookingForMessage): Promise<void> {
  await record({
    bookingId: b.id,
    template: "STATUS_UPDATE",
    toPhone: b.customerPhone,
    body: statusUpdateText(b),
  });
}
