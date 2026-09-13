"use client";

import { useActionState } from "react";
import Link from "next/link";
import { SubmitButton } from "./SubmitButton";
import type { QuoteState } from "@/app/booking-actions";

export function QuoteForm({
  action,
}: {
  action: (state: QuoteState, formData: FormData) => Promise<QuoteState>;
}) {
  const [state, formAction] = useActionState(action, {} as QuoteState);

  if (state.done) {
    return (
      <div className="rounded-xl bg-emerald-50 px-6 py-8 text-center">
        <p className="font-semibold text-emerald-900">Thanks — we've got it.</p>
        <p className="mt-2 text-sm text-emerald-900/80">
          We'll send you a price on WhatsApp within a few hours.
        </p>
        <Link href="/" className="btn-ghost mt-6">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">Your name</label>
        <input id="name" name="name" className="field" autoComplete="name" required />
      </div>
      <div>
        <label className="label" htmlFor="phone">Mobile number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          className="field"
          placeholder="98765 43210"
          autoComplete="tel"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="deviceText">Which phone do you have?</label>
        <input
          id="deviceText"
          name="deviceText"
          className="field"
          placeholder="Samsung Galaxy M31s"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="issueText">What's wrong with it?</label>
        <textarea
          id="issueText"
          name="issueText"
          rows={3}
          className="field"
          placeholder="Screen is cracked and the touch works only on half the screen"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="pincode">
          Pincode <span className="font-normal text-ink-muted">(optional)</span>
        </label>
        <input
          id="pincode"
          name="pincode"
          inputMode="numeric"
          maxLength={6}
          className="field sm:max-w-[12rem]"
          placeholder="110001"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <SubmitButton pendingLabel="Sending…">Request a quote</SubmitButton>
    </form>
  );
}
