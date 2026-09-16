/**
 * The booking window rules, including the timezone trap.
 *
 * The server runs in UTC and the slots are Indian business hours. Late in the
 * Indian evening the UTC date is still yesterday, so any implementation that
 * reaches for the server's own clock is wrong by five and a half hours --
 * exactly when it matters, because that is when "has this slot passed" is a
 * live question.
 */
import {
  istNow,
  bookableDays,
  isSlotBookable,
  firstBookableDay,
  SLOT_WINDOWS,
  HORIZON_DAYS,
  LEAD_MINUTES,
} from "../src/lib/slots";

let failed = 0;
const check = (name: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
  if (!ok) failed++;
};

// 2026-06-01 19:00 UTC is 2026-06-02 00:30 IST: a different day.
const lateEveningUTC = new Date("2026-06-01T19:00:00Z");
const ist = istNow(lateEveningUTC);
check("UTC evening is already tomorrow in India", ist.date === "2026-06-02", ist.date);
check("and the IST clock reads 00:30", ist.minutes === 30, `${ist.minutes} minutes`);

// A weekday mid-morning: 2026-06-10 04:00 UTC = 09:30 IST.
const morning = new Date("2026-06-10T04:00:00Z");
const days = bookableDays(morning);
check(`offers ${HORIZON_DAYS} days`, days.length === HORIZON_DAYS, `${days.length}`);
check("starting with today in India", days[0].value === "2026-06-10" && days[0].today, days[0].value);
check("and running to the horizon", days[HORIZON_DAYS - 1].value === "2026-06-16", days[HORIZON_DAYS - 1].value);

check("rejects a window that is not offered", !isSlotBookable("2026-06-10", "03:00 - 04:00", morning));
check("rejects yesterday", !isSlotBookable("2026-06-09", SLOT_WINDOWS[0], morning));
check("rejects beyond the horizon", !isSlotBookable("2026-06-20", SLOT_WINDOWS[0], morning));

// 09:30 IST + 90 minutes lead = 11:00. The 10:00 window is too soon; 12:00 is fine.
check("today: too-soon window refused", !isSlotBookable("2026-06-10", "10:00 - 12:00", morning), `lead ${LEAD_MINUTES}m`);
check("today: later window allowed", isSlotBookable("2026-06-10", "12:00 - 14:00", morning));
check("a future day takes any window", isSlotBookable("2026-06-11", "10:00 - 12:00", morning));

// 17:00 UTC = 22:30 IST: every window today has gone.
const night = new Date("2026-06-10T17:00:00Z");
check(
  "after hours, nothing is left today",
  SLOT_WINDOWS.every((w) => !isSlotBookable("2026-06-10", w, night))
);
check("so the default rolls to tomorrow", firstBookableDay(night) === "2026-06-11", firstBookableDay(night));
check("while mid-morning still defaults to today", firstBookableDay(morning) === "2026-06-10");

console.log(failed === 0 ? "\nAll slot rules hold." : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
