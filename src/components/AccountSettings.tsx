"use client";

import { useActionState } from "react";
import { SubmitButton } from "./SubmitButton";
import type { AuthState } from "@/app/auth-actions";

type Action = (state: AuthState, formData: FormData) => Promise<AuthState>;

function Result({ state }: { state: AuthState }) {
  if (!state.error && !state.message) return null;
  return (
    <p
      className={`mt-4 rounded-xl px-4 py-3 text-sm ${
        state.error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {state.error ?? state.message}
    </p>
  );
}

export function ProfileForm({
  action,
  defaults,
}: {
  action: Action;
  defaults: { name: string; phone: string; email: string };
}) {
  const [state, formAction] = useActionState(action, {} as AuthState);

  return (
    <form action={formAction} className="card p-6">
      <h2 className="font-semibold">Your details</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" name="name" className="field" defaultValue={defaults.name} required />
        </div>
        <div>
          <label className="label" htmlFor="account-phone">Mobile number</label>
          <input
            id="account-phone"
            className="field bg-surface-sunk"
            value={defaults.phone}
            disabled
          />
          <p className="mt-1.5 text-xs text-ink-muted">
            Your bookings are tied to this number. Message us to change it.
          </p>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="email">
            Email <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="field"
            defaultValue={defaults.email}
          />
        </div>
      </div>

      <Result state={state} />

      <div className="mt-5">
        <SubmitButton className="btn-primary px-5 py-2.5" pendingLabel="Saving…">
          Save changes
        </SubmitButton>
      </div>
    </form>
  );
}

export function PasswordForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, {} as AuthState);

  return (
    <form action={formAction} className="card p-6">
      <h2 className="font-semibold">Change password</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Changing it signs you out everywhere else.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="current">Current password</label>
          <input
            id="current"
            name="current"
            type="password"
            autoComplete="current-password"
            className="field sm:max-w-sm"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="next">New password</label>
          <input
            id="next"
            name="next"
            type="password"
            autoComplete="new-password"
            minLength={8}
            className="field"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Confirm new password</label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            minLength={8}
            className="field"
            required
          />
        </div>
      </div>

      <Result state={state} />

      <div className="mt-5">
        <SubmitButton className="btn-ghost px-5 py-2.5" pendingLabel="Changing…">
          Change password
        </SubmitButton>
      </div>
    </form>
  );
}
