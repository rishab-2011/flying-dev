"use client";

import { useActionState } from "react";
import { SubmitButton } from "../SubmitButton";
import { Stars } from "../ReviewCard";
import type { AdminState } from "@/app/admin/actions";

type Action = (state: AdminState, formData: FormData) => Promise<AdminState>;

export type AdminReview = {
  id: string;
  customerName: string;
  area: string | null;
  deviceLabel: string | null;
  rating: number;
  body: string;
  published: boolean;
  createdAt: string;
};

export function AddReview({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, {} as AdminState);

  return (
    <form action={formAction} className="card p-6">
      <h2 className="font-semibold">Add a review</h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        Only enter feedback a customer actually gave you — on WhatsApp, over the
        phone, or in person. A review you wrote yourself is the fastest way to
        lose the trust this section is for.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="customerName">Customer name</label>
          <input id="customerName" name="customerName" className="field" required />
        </div>
        <div>
          <label className="label" htmlFor="area">
            Area <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input id="area" name="area" className="field" placeholder="Indirapuram, Ghaziabad" />
        </div>
        <div>
          <label className="label" htmlFor="deviceLabel">
            What was repaired <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input id="deviceLabel" name="deviceLabel" className="field" placeholder="iPhone 13 screen" />
        </div>
        <div>
          <label className="label" htmlFor="rating">Rating</label>
          <select id="rating" name="rating" className="field" defaultValue="5">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="label" htmlFor="body">What they said</label>
        <textarea id="body" name="body" rows={3} className="field" required />
      </div>

      {(state.message || state.error) && (
        <p className={`mt-4 text-sm ${state.error ? "text-red-700" : "text-emerald-700"}`}>
          {state.error ?? state.message}
        </p>
      )}

      <div className="mt-5">
        <SubmitButton className="btn-primary px-5 py-2.5" pendingLabel="Saving…">
          Add review
        </SubmitButton>
      </div>
    </form>
  );
}

export function ReviewRow({
  review,
  toggle,
  remove,
}: {
  review: AdminReview;
  toggle: Action;
  remove: Action;
}) {
  const [toggleState, toggleAction] = useActionState(toggle, {} as AdminState);
  const [, removeAction] = useActionState(remove, {} as AdminState);

  return (
    <li className={`card p-6 ${review.published ? "" : "opacity-60"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Stars rating={review.rating} />
          <p className="mt-2 font-semibold">
            {review.customerName}
            {review.area && <span className="font-normal text-ink-muted"> · {review.area}</span>}
          </p>
          {review.deviceLabel && (
            <p className="text-sm text-ink-muted">{review.deviceLabel}</p>
          )}
        </div>
        <span
          className={`chip ${review.published ? "bg-emerald-50 text-emerald-700" : "bg-surface-sunk text-ink-muted"}`}
        >
          {review.published ? "On the site" : "Hidden"}
        </span>
      </div>

      <p className="mt-4 rounded-xl bg-surface-sunk px-4 py-3 leading-relaxed text-ink-soft">
        {review.body}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <form action={toggleAction}>
          <input type="hidden" name="reviewId" value={review.id} />
          <SubmitButton className="btn-ghost px-4 py-2" pendingLabel="…">
            {review.published ? "Hide" : "Publish"}
          </SubmitButton>
        </form>
        <form action={removeAction}>
          <input type="hidden" name="reviewId" value={review.id} />
          <SubmitButton className="btn-ghost px-4 py-2 text-red-700" pendingLabel="…">
            Delete
          </SubmitButton>
        </form>
        {toggleState.message && (
          <span className="text-sm text-emerald-700">{toggleState.message}</span>
        )}
      </div>
    </li>
  );
}
