"use client";

import { useActionState } from "react";
import { SubmitButton } from "../SubmitButton";
import { rupees } from "@/lib/format";
import type { AdminState } from "@/app/admin/actions";

export type EditablePrice = {
  id: string;
  issueName: string;
  price: number;
  strikePrice: number | null;
  etaMinutes: number;
  warrantyMonths: number;
  active: boolean;
};

export function PriceRow({
  row,
  action,
}: {
  row: EditablePrice;
  action: (state: AdminState, formData: FormData) => Promise<AdminState>;
}) {
  const [state, formAction] = useActionState(action, {} as AdminState);

  return (
    <form
      action={formAction}
      className="grid items-end gap-3 border-b border-surface-line px-5 py-4 sm:grid-cols-[1fr_7rem_7rem_6rem_6rem_auto]"
    >
      <input type="hidden" name="priceId" value={row.id} />

      <div>
        <p className="font-medium">{row.issueName}</p>
        <p className="mt-0.5 text-xs text-ink-muted">Currently {rupees(row.price)}</p>
      </div>

      <div>
        <label className="label text-xs" htmlFor={`price-${row.id}`}>
          Price ₹
        </label>
        <input
          id={`price-${row.id}`}
          name="price"
          type="number"
          min={0}
          defaultValue={row.price}
          className="field py-2"
          required
        />
      </div>

      <div>
        <label className="label text-xs" htmlFor={`strike-${row.id}`}>
          Struck-out ₹
        </label>
        <input
          id={`strike-${row.id}`}
          name="strikePrice"
          type="number"
          min={0}
          defaultValue={row.strikePrice ?? ""}
          className="field py-2"
          placeholder="—"
        />
      </div>

      <div>
        <label className="label text-xs" htmlFor={`eta-${row.id}`}>
          Mins
        </label>
        <input
          id={`eta-${row.id}`}
          name="etaMinutes"
          type="number"
          min={5}
          defaultValue={row.etaMinutes}
          className="field py-2"
          required
        />
      </div>

      <div>
        <label className="label text-xs" htmlFor={`warranty-${row.id}`}>
          Warranty
        </label>
        <input
          id={`warranty-${row.id}`}
          name="warrantyMonths"
          type="number"
          min={0}
          defaultValue={row.warrantyMonths}
          className="field py-2"
          required
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="active"
            defaultChecked={row.active}
            className="h-4 w-4 accent-brand-500"
          />
          Live
        </label>
        <SubmitButton className="btn-ghost px-3 py-2" pendingLabel="…">
          Save
        </SubmitButton>
      </div>

      {(state.message || state.error) && (
        <p
          className={`text-sm sm:col-span-6 ${state.error ? "text-red-700" : "text-emerald-700"}`}
        >
          {state.error ?? state.message}
        </p>
      )}
    </form>
  );
}
