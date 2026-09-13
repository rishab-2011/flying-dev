"use client";

import { useActionState } from "react";
import Link from "next/link";
import { SubmitButton } from "./SubmitButton";
import type { AuthState } from "@/app/auth-actions";

type Action = (state: AuthState, formData: FormData) => Promise<AuthState>;

export function LoginForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, {} as AuthState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="phone">
          Mobile number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="98765 43210"
          className="field"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="field"
          required
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>

      <p className="text-center text-sm text-ink-muted">
        New to Flying Dev?{" "}
        <Link href="/signup" className="font-semibold text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, {} as AuthState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">
          Full name
        </label>
        <input id="name" name="name" className="field" autoComplete="name" required />
      </div>
      <div>
        <label className="label" htmlFor="phone">
          Mobile number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="98765 43210"
          className="field"
          required
        />
        <p className="mt-1.5 text-xs text-ink-muted">
          We'll send booking updates to this number on WhatsApp.
        </p>
      </div>
      <div>
        <label className="label" htmlFor="email">
          Email <span className="font-normal text-ink-muted">(optional)</span>
        </label>
        <input id="email" name="email" type="email" className="field" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="field"
          minLength={8}
          required
        />
        <p className="mt-1.5 text-xs text-ink-muted">At least 8 characters.</p>
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <SubmitButton pendingLabel="Creating account…">Create account</SubmitButton>

      <p className="text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
