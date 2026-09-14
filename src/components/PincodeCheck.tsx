"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";

export type CoveredArea = { pincode: string; city: string; area: string };

/**
 * Serviceability check, shown before the funnel starts.
 *
 * Without this the first time a customer learns we can't reach them is on the
 * booking form — after choosing a model, picking faults, and typing their name,
 * number and full address. That is the most expensive possible moment to turn
 * someone away, and they leave with a bad impression rather than a quote.
 *
 * The whole covered list is ~55 short rows, so it ships to the browser and the
 * answer is instant, with no request and no spinner.
 */
export function PincodeCheck({ areas }: { areas: CoveredArea[] }) {
  const [pincode, setPincode] = useState("");
  const index = useMemo(() => new Map(areas.map((a) => [a.pincode, a])), [areas]);

  const complete = pincode.length === 6;
  const match = complete ? index.get(pincode) : undefined;

  return (
    <div className="mt-8 rounded-2xl border border-surface-line bg-white p-5 shadow-card">
      <label htmlFor="home-pincode" className="flex items-center gap-2 text-sm font-semibold">
        <Icon name="pin" className="h-4 w-4 text-brand-500" />
        Do we come to you? Check your pincode
      </label>

      {/* No submit button: the answer appears as the sixth digit lands, and the
          hero already carries the primary call to action. A second identical
          button here just stacks three near-identical choices on a phone. */}
      <input
        id="home-pincode"
        inputMode="numeric"
        maxLength={6}
        value={pincode}
        onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="110001"
        className="field mt-3 w-full sm:w-40"
        aria-describedby="home-pincode-result"
      />

      <p id="home-pincode-result" aria-live="polite" className="mt-3 text-sm">
        {!complete && (
          <span className="text-ink-muted">
            Six digits. We cover Delhi, Noida, Greater Noida, Ghaziabad, Gurugram
            and Faridabad.
          </span>
        )}

        {complete && match && (
          <span className="text-emerald-700">
            <span className="font-medium">
              ✓ Yes — we repair at your doorstep in {match.area}, {match.city}.
            </span>{" "}
            <Link href="/repair" className="font-semibold text-brand-600 hover:underline">
              Get your price →
            </Link>
          </span>
        )}

        {complete && !match && (
          <span className="text-ink-soft">
            <span className="font-medium text-accent-600">
              Not {pincode} yet.
            </span>{" "}
            We're adding areas every month —{" "}
            <Link href="/quote" className="font-semibold text-brand-600 hover:underline">
              tell us your phone and area
            </Link>{" "}
            and we'll message you when we reach you.
          </span>
        )}
      </p>
    </div>
  );
}
