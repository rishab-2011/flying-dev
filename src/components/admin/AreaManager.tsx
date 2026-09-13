"use client";

import { useActionState } from "react";
import { SubmitButton } from "../SubmitButton";
import type { AdminState } from "@/app/admin/actions";

type Action = (state: AdminState, formData: FormData) => Promise<AdminState>;

export type AreaRow = {
  id: string;
  pincode: string;
  city: string;
  area: string;
  active: boolean;
};

export function AddArea({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, {} as AdminState);

  return (
    <form action={formAction} className="card p-6">
      <h2 className="font-semibold">Add a pincode</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Only add pincodes a technician can actually reach within a two-hour slot.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[8rem_1fr_1fr_auto]">
        <div>
          <label className="label text-xs" htmlFor="pincode">Pincode</label>
          <input id="pincode" name="pincode" inputMode="numeric" maxLength={6} className="field py-2" required />
        </div>
        <div>
          <label className="label text-xs" htmlFor="city">City</label>
          <input id="city" name="city" className="field py-2" placeholder="Gurugram" required />
        </div>
        <div>
          <label className="label text-xs" htmlFor="area">Area</label>
          <input id="area" name="area" className="field py-2" placeholder="Sector 56" required />
        </div>
        <div className="flex items-end">
          <SubmitButton className="btn-primary px-5 py-2.5" pendingLabel="Adding…">
            Add
          </SubmitButton>
        </div>
      </div>

      {(state.message || state.error) && (
        <p className={`mt-3 text-sm ${state.error ? "text-red-700" : "text-emerald-700"}`}>
          {state.error ?? state.message}
        </p>
      )}
    </form>
  );
}

export function AreaToggle({ area, action }: { area: AreaRow; action: Action }) {
  const [, formAction] = useActionState(action, {} as AdminState);

  return (
    <form action={formAction} className="flex items-center justify-between gap-4 px-5 py-3">
      <input type="hidden" name="areaId" value={area.id} />
      <div>
        <p className="font-medium">
          {area.pincode}{" "}
          <span className="font-normal text-ink-muted">
            — {area.area}, {area.city}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`chip ${area.active ? "bg-emerald-50 text-emerald-700" : "bg-surface-sunk text-ink-muted"}`}>
          {area.active ? "Serviceable" : "Paused"}
        </span>
        <SubmitButton className="btn-ghost px-3 py-1.5 text-xs" pendingLabel="…">
          {area.active ? "Pause" : "Resume"}
        </SubmitButton>
      </div>
    </form>
  );
}
