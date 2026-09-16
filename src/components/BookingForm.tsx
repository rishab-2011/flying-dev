"use client";

import { useActionState, useMemo, useState } from "react";
import { SubmitButton } from "./SubmitButton";
import { rupees, minutesToEta } from "@/lib/format";
import { SlotPicker } from "./SlotPicker";
import type { BookableDay } from "@/lib/slots";
import type { BookingState } from "@/app/booking-actions";

export type ServiceablePincode = {
  pincode: string;
  city: string;
  area: string;
  doorstep: boolean;
  pickupAndDrop: boolean;
};

export type QuotedIssue = { slug: string; name: string; price: number; etaMinutes: number };

export function BookingForm({
  action,
  modelId,
  modelLabel,
  issues,
  areas,
  defaults,
  days,
  defaultDate,
}: {
  action: (state: BookingState, formData: FormData) => Promise<BookingState>;
  modelId: string;
  modelLabel: string;
  issues: QuotedIssue[];
  areas: ServiceablePincode[];
  defaults: { name: string; phone: string; email: string };
  /* Computed on the server so the first render agrees on what "today" is. */
  days: BookableDay[];
  defaultDate: string;
}) {
  const [state, formAction] = useActionState(action, {} as BookingState);
  const [mode, setMode] = useState<"DOORSTEP" | "PICKUP_DROP">("DOORSTEP");
  const [pincode, setPincode] = useState("");

  const total = issues.reduce((sum, i) => sum + i.price, 0);
  const longestEta = issues.reduce((max, i) => Math.max(max, i.etaMinutes), 0);

  const areaIndex = useMemo(
    () => new Map(areas.map((a) => [a.pincode, a])),
    [areas]
  );
  const matched = pincode.length === 6 ? areaIndex.get(pincode) : undefined;
  const pincodeChecked = pincode.length === 6;
  const modeUnavailable =
    matched && (mode === "DOORSTEP" ? !matched.doorstep : !matched.pickupAndDrop);

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <input type="hidden" name="modelId" value={modelId} />
      <input type="hidden" name="issueSlugs" value={issues.map((i) => i.slug).join(",")} />
      <input type="hidden" name="mode" value={mode} />

      <div className="space-y-8">
        {/* Service mode */}
        <section className="card p-6">
          <h2 className="font-semibold">How would you like it repaired?</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  value: "DOORSTEP" as const,
                  title: "Doorstep repair",
                  body: "Our technician repairs it in front of you, usually within the hour.",
                },
                {
                  value: "PICKUP_DROP" as const,
                  title: "Pickup & drop",
                  body: "We collect the phone, repair it at our workshop, and return it.",
                },
              ]
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                aria-pressed={mode === option.value}
                className={`rounded-xl border p-4 text-left transition ${
                  mode === option.value
                    ? "border-brand-400 bg-brand-50"
                    : "border-surface-line hover:border-brand-200"
                }`}
              >
                <p className="font-semibold">{option.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{option.body}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="card p-6">
          <h2 className="font-semibold">Your details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="customerName">Full name</label>
              <input
                id="customerName"
                name="customerName"
                className="field"
                defaultValue={defaults.name}
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="customerPhone">Mobile number</label>
              <input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                inputMode="numeric"
                className="field"
                defaultValue={defaults.phone}
                placeholder="98765 43210"
                autoComplete="tel"
                required
              />
              <p className="mt-1.5 text-xs text-ink-muted">
                We'll confirm your booking on WhatsApp.
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="customerEmail">
                Email <span className="font-normal text-ink-muted">(optional)</span>
              </label>
              <input
                id="customerEmail"
                name="customerEmail"
                type="email"
                className="field"
                defaultValue={defaults.email}
                autoComplete="email"
              />
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="card p-6">
          <h2 className="font-semibold">
            {mode === "DOORSTEP" ? "Where should we come?" : "Where should we collect from?"}
          </h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="label" htmlFor="pincode">Pincode</label>
              <input
                id="pincode"
                name="pincode"
                inputMode="numeric"
                maxLength={6}
                className="field sm:max-w-[12rem]"
                placeholder="110001"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
              {pincodeChecked && matched && !modeUnavailable && (
                <p className="mt-2 text-sm font-medium text-emerald-700">
                  ✓ We service {matched.area}, {matched.city}
                </p>
              )}
              {pincodeChecked && matched && modeUnavailable && (
                <p className="mt-2 text-sm font-medium text-accent-600">
                  {mode === "DOORSTEP" ? "Doorstep repair" : "Pickup & drop"} isn't
                  available in {matched.area} yet — switch to the other option above.
                </p>
              )}
              {pincodeChecked && !matched && (
                <p className="mt-2 text-sm font-medium text-red-700">
                  We don't cover {pincode} yet. We currently serve Delhi, Noida,
                  Greater Noida, Ghaziabad, Gurugram and Faridabad.
                </p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="addressLine">Full address</label>
              <textarea
                id="addressLine"
                name="addressLine"
                rows={3}
                className="field"
                placeholder="Flat / house number, building, street, locality"
                autoComplete="street-address"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="landmark">
                Landmark <span className="font-normal text-ink-muted">(optional)</span>
              </label>
              <input id="landmark" name="landmark" className="field" placeholder="Near the metro station" />
            </div>
          </div>
        </section>

        {/* Slot */}
        <section className="card p-6">
          <h2 className="font-semibold">Pick a slot</h2>
          <p className="mt-1 text-sm text-ink-muted">
            We'll call before arriving. Slots are two hours wide.
          </p>

          <SlotPicker days={days} defaultDate={defaultDate} />

          <div className="mt-5">
            <label className="label" htmlFor="notes">
              Anything else we should know?{" "}
              <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              className="field"
              placeholder="The screen flickers only when charging"
            />
          </div>
        </section>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Booking summary
          </h2>
          <p className="mt-2 font-semibold">{modelLabel}</p>

          <ul className="mt-4 space-y-2.5 border-t border-surface-line pt-4 text-sm">
            {issues.map((i) => (
              <li key={i.slug} className="flex justify-between gap-4">
                <span className="text-ink-soft">{i.name}</span>
                <span className="font-medium">{rupees(i.price)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between border-t border-surface-line pt-4">
            <span className="font-semibold">Estimate</span>
            <span className="text-lg font-bold text-brand-700">{rupees(total)}</span>
          </div>

          <ul className="mt-4 space-y-1.5 text-xs text-ink-muted">
            <li>About {minutesToEta(longestEta)} on site</li>
            <li>6-month warranty on parts and workmanship</li>
            <li>Pay the technician after the repair — nothing now</li>
          </ul>

          {state.error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <div className="mt-6">
            <SubmitButton pendingLabel="Booking…">Confirm booking</SubmitButton>
          </div>

          <p className="mt-3 text-center text-xs text-ink-muted">
            By booking you agree to our terms of service.
          </p>
        </div>
      </aside>
    </form>
  );
}
