"use client";

import { useEffect, useState } from "react";
import {
  SLOT_WINDOWS,
  isSlotBookable,
  windowStartMinutes,
  istNow,
  type BookableDay,
} from "@/lib/slots";

/**
 * Choosing when the technician comes.
 *
 * A month grid would be the wrong instrument: bookings run seven days ahead,
 * so twenty-three of thirty cells would be dead. A week of day cards shows
 * every real option at once and needs no navigation.
 *
 * The days arrive from the server so the first render matches on both sides --
 * computing "today" independently in the browser produces a hydration mismatch
 * on any request that straddles midnight in India. Which windows have passed is
 * then refined after mount, since that depends on the customer's own clock and
 * only ever changes a disabled state.
 */
export function SlotPicker({
  days,
  defaultDate,
}: {
  days: BookableDay[];
  defaultDate: string;
}) {
  const [date, setDate] = useState(defaultDate);
  const [window, setWindow] = useState<string | null>(null);

  // Before mount, trust the server's view; after, use the visitor's clock.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(tick);
  }, []);

  const at = now ?? undefined;
  const open = (d: string, w: string) => isSlotBookable(d, w, at);
  const dayHasRoom = (d: string) => SLOT_WINDOWS.some((w) => open(d, w));

  // If the chosen window stops being available -- the clock passed it while the
  // form was open, or the day changed -- drop it rather than submit it.
  useEffect(() => {
    if (window && !open(date, window)) setWindow(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, now]);

  const istToday = at ? istNow(at).date : null;

  return (
    <div>
      <input type="hidden" name="slotDate" value={date} />
      <input type="hidden" name="slotWindow" value={window ?? ""} />

      <p className="label">Which day?</p>
      <div
        role="radiogroup"
        aria-label="Day"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      >
        {days.map((d) => {
          const chosen = d.value === date;
          const room = dayHasRoom(d.value);
          return (
            <button
              key={d.value}
              type="button"
              role="radio"
              aria-checked={chosen}
              disabled={!room}
              onClick={() => setDate(d.value)}
              className={`flex min-w-[4.5rem] shrink-0 flex-col items-center rounded-xl border px-3 py-3 transition ${
                chosen
                  ? "border-brand-400 bg-brand-50"
                  : room
                    ? "border-surface-line hover:border-brand-300"
                    : "cursor-not-allowed border-surface-line opacity-40"
              }`}
            >
              <span className="text-xs font-medium text-ink-muted">
                {d.value === istToday ? "Today" : d.weekday}
              </span>
              <span className={`mt-0.5 text-xl font-bold ${chosen ? "text-brand-700" : ""}`}>
                {d.day}
              </span>
              <span className="text-xs text-ink-muted">{d.month}</span>
            </button>
          );
        })}
      </div>

      <p className="label mt-5">Which time?</p>
      <div role="radiogroup" aria-label="Time" className="grid gap-2.5 sm:grid-cols-3">
        {SLOT_WINDOWS.map((w) => {
          const available = open(date, w);
          const chosen = w === window;
          return (
            <button
              key={w}
              type="button"
              role="radio"
              aria-checked={chosen}
              disabled={!available}
              onClick={() => setWindow(w)}
              className={`rounded-xl border px-4 py-3 text-[15px] transition ${
                chosen
                  ? "border-brand-400 bg-brand-50 font-semibold text-brand-700"
                  : available
                    ? "border-surface-line hover:border-brand-300"
                    : "cursor-not-allowed border-surface-line text-ink-muted opacity-45"
              }`}
            >
              {w}
              {!available && windowStartMinutes(w) !== null && date === istToday && (
                <span className="ml-1.5 text-xs">· passed</span>
              )}
            </button>
          );
        })}
      </div>

      {!dayHasRoom(date) && (
        <p className="mt-3 text-sm text-ink-muted">
          Nothing left today — pick another day above.
        </p>
      )}
    </div>
  );
}
