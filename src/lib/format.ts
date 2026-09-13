/** Rupee amounts, Indian digit grouping: 1,23,456 rather than 123,456. */
export function rupees(paise: number): string {
  return "₹" + paise.toLocaleString("en-IN");
}

export function minutesToEta(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours} hr`;
  return `${Math.floor(hours)} hr ${minutes % 60} min`;
}

/** Strips +91 / 0 prefixes and spacing down to the bare 10 digits. */
export function normalisePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) return digits.slice(-10);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function isValidPhone(input: string): boolean {
  // Indian mobile numbers are 10 digits and never begin below 6.
  return /^[6-9]\d{9}$/.test(normalisePhone(input));
}

export function discountPercent(price: number, strike?: number | null): number | null {
  if (!strike || strike <= price) return null;
  return Math.round(((strike - price) / strike) * 100);
}

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Requested",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "Repair in progress",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const BOOKING_STATUSES = Object.keys(STATUS_LABELS);

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function modeLabel(mode: string): string {
  return mode === "DOORSTEP" ? "Doorstep repair" : "Pickup & drop";
}

export function formatSlot(date: string, window: string): string {
  const d = new Date(date + "T00:00:00");
  const pretty = d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return `${pretty}, ${window}`;
}
