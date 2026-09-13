"use client";

import { useActionState } from "react";
import { SubmitButton } from "../SubmitButton";
import type { AdminState } from "@/app/admin/actions";

export function PriceImport({
  action,
}: {
  action: (state: AdminState, formData: FormData) => Promise<AdminState>;
}) {
  const [state, formAction] = useActionState(action, {} as AdminState);

  return (
    <form action={formAction} className="card p-6">
      <h2 className="font-semibold">Bulk price update</h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        Paste CSV with a header row and the columns{" "}
        <code className="rounded bg-surface-sunk px-1.5 py-0.5 text-xs">
          brand,model,issue,price
        </code>
        . Brand, model and issue names must match exactly — export the current
        prices first and edit that file to be sure.
      </p>

      <textarea
        name="csv"
        rows={6}
        className="field mt-4 font-mono text-xs"
        placeholder={"brand,model,issue,price\nApple,iPhone 13,Screen replacement,11999"}
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SubmitButton className="btn-primary px-5 py-2.5" pendingLabel="Importing…">
          Import prices
        </SubmitButton>
        <a href="/admin/prices/export" className="btn-ghost px-5 py-2.5">
          Export all prices (CSV)
        </a>
      </div>

      {(state.message || state.error) && (
        <p className={`mt-4 text-sm ${state.error ? "text-red-700" : "text-emerald-700"}`}>
          {state.error ?? state.message}
        </p>
      )}
    </form>
  );
}
