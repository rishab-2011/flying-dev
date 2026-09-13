"use client";

import { useActionState } from "react";
import { SubmitButton } from "../SubmitButton";
import type { AdminState } from "@/app/admin/actions";

export type QuoteRowData = {
  id: string;
  name: string;
  phone: string;
  deviceText: string;
  issueText: string;
  pincode: string | null;
  handled: boolean;
  createdAt: string;
  whatsAppLink: string;
};

export function QuoteRow({
  quote,
  action,
}: {
  quote: QuoteRowData;
  action: (state: AdminState, formData: FormData) => Promise<AdminState>;
}) {
  const [, formAction] = useActionState(action, {} as AdminState);

  return (
    <li className={`card p-6 ${quote.handled ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{quote.deviceText}</p>
          <p className="mt-1 text-sm text-ink-muted">
            {quote.name} · {quote.phone}
            {quote.pincode && ` · ${quote.pincode}`}
          </p>
        </div>
        <span className="text-sm text-ink-muted">
          {new Date(quote.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>

      <p className="mt-4 rounded-xl bg-surface-sunk px-4 py-3 text-sm text-ink-soft">
        {quote.issueText}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={quote.whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost px-4 py-2"
        >
          Reply on WhatsApp
        </a>
        {!quote.handled && (
          <form action={formAction}>
            <input type="hidden" name="quoteId" value={quote.id} />
            <SubmitButton className="btn-primary px-4 py-2" pendingLabel="…">
              Mark handled
            </SubmitButton>
          </form>
        )}
        {quote.handled && (
          <span className="chip bg-emerald-50 text-emerald-700">Handled</span>
        )}
      </div>
    </li>
  );
}
