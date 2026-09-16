/**
 * When a repair can be booked. One definition, used by the picker and by the
 * server action that accepts the booking.
 *
 * The two were previously unrelated: the form offered seven days and five
 * windows, while the action accepted any date-shaped string and any non-empty
 * window. A booking could therefore be posted for yesterday, for a slot that
 * had already passed, or for "03:00 - 04:00" -- and would be written to the
 * database and confirmed by WhatsApp as though it were real.
 *
 * Everything here is in IST, deliberately. The slots are Indian business hours
 * and the customers are in Delhi NCR, but the server runs in UTC, so comparing
 * a 10:00 window against a UTC clock is wrong by five and a half hours -- which
 * on an evening booking is the difference between "too late" and "fine".
 */
const TZ = "Asia/Kolkata";

export const SLOT_WINDOWS = [
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
] as const;

/** How far ahead bookings are taken. */
export const HORIZON_DAYS = 7;

/**
 * Lead time before a window starts. A technician has to be dispatched and has
 * to travel, so a slot beginning in ten minutes is not really available.
 * Change this one number to change the policy.
 */
export const LEAD_MINUTES = 90;

/** The current date and time, as it is in India. */
export function istNow(now: Date = new Date()): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

/** Minutes past midnight at which a window opens. */
export function windowStartMinutes(window: string): number | null {
  const match = /^(\d{2}):(\d{2})/.exec(window);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function addDays(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  // Noon UTC keeps the arithmetic clear of daylight-saving and offset edges.
  const stepped = new Date(Date.UTC(y, m - 1, d, 12));
  stepped.setUTCDate(stepped.getUTCDate() + days);
  return stepped.toISOString().slice(0, 10);
}

export type BookableDay = { value: string; weekday: string; day: string; month: string; today: boolean };

/** The days a customer may choose, starting from today in India. */
export function bookableDays(now: Date = new Date()): BookableDay[] {
  const { date: today } = istNow(now);
  return Array.from({ length: HORIZON_DAYS }, (_, i) => {
    const value = addDays(today, i);
    const [y, m, d] = value.split("-").map(Number);
    const at = new Date(Date.UTC(y, m - 1, d, 12));
    return {
      value,
      weekday: at.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" }),
      day: String(d),
      month: at.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }),
      today: i === 0,
    };
  });
}

/** Whether a window on a day can still be booked. */
export function isSlotBookable(
  dateISO: string,
  window: string,
  now: Date = new Date()
): boolean {
  if (!(SLOT_WINDOWS as readonly string[]).includes(window)) return false;
  if (!bookableDays(now).some((d) => d.value === dateISO)) return false;

  const current = istNow(now);
  if (dateISO !== current.date) return true; // a future day: every window is open

  const start = windowStartMinutes(window);
  if (start === null) return false;
  return start >= current.minutes + LEAD_MINUTES;
}

/** The first day that still has a bookable window, for a sensible default. */
export function firstBookableDay(now: Date = new Date()): string {
  const days = bookableDays(now);
  const open = days.find((d) =>
    SLOT_WINDOWS.some((w) => isSlotBookable(d.value, w, now))
  );
  return (open ?? days[0]).value;
}
