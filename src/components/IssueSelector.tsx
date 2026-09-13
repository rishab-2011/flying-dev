"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { rupees, minutesToEta, discountPercent } from "@/lib/format";

export type SelectableIssue = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  icon: string;
  price: number;
  strikePrice: number | null;
  etaMinutes: number;
  warrantyMonths: number;
};

export function IssueSelector({
  modelId,
  modelLabel,
  issues,
}: {
  modelId: string;
  modelLabel: string;
  issues: SelectableIssue[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  const chosen = useMemo(
    () => issues.filter((i) => selected.includes(i.slug)),
    [issues, selected]
  );
  const total = chosen.reduce((sum, i) => sum + i.price, 0);
  // Repairs happen in one visit, so the longest job sets the visit length.
  const longestEta = chosen.reduce((max, i) => Math.max(max, i.etaMinutes), 0);

  function toggle(slug: string) {
    setSelected((current) =>
      current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]
    );
  }

  function proceed() {
    if (chosen.length === 0) return;
    const query = new URLSearchParams({ model: modelId, issues: selected.join(",") });
    router.push(`/book?${query.toString()}`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div>
        <h2 className="text-lg font-semibold">What's wrong with it?</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Select everything that applies — we'll fix it all in one visit.
        </p>

        <ul className="mt-6 space-y-3">
          {issues.map((issue) => {
            const isSelected = selected.includes(issue.slug);
            const off = discountPercent(issue.price, issue.strikePrice);

            return (
              <li key={issue.id}>
                <button
                  type="button"
                  onClick={() => toggle(issue.slug)}
                  aria-pressed={isSelected}
                  className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition ${
                    isSelected
                      ? "border-brand-400 bg-brand-50 shadow-card"
                      : "border-surface-line bg-white hover:border-brand-200"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isSelected ? "bg-brand-500 text-white" : "bg-surface-sunk text-ink-soft"
                    }`}
                  >
                    <Icon name={issue.icon} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-semibold">{issue.name}</span>
                      <span className="flex items-baseline gap-2">
                        {issue.strikePrice && off && (
                          <span className="text-sm text-ink-muted line-through">
                            {rupees(issue.strikePrice)}
                          </span>
                        )}
                        <span className="font-bold text-brand-700">{rupees(issue.price)}</span>
                      </span>
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-muted">
                      {issue.blurb}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="chip bg-surface-sunk text-ink-soft">
                        ~{minutesToEta(issue.etaMinutes)}
                      </span>
                      <span className="chip bg-emerald-50 text-emerald-700">
                        {issue.warrantyMonths}-month warranty
                      </span>
                      {off && (
                        <span className="chip bg-accent-100 text-accent-600">{off}% off</span>
                      )}
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold ${
                      isSelected
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-surface-line"
                    }`}
                  >
                    {isSelected ? "✓" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Quote summary. Sticky on desktop, pinned to the bottom on mobile. */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Your estimate
          </h2>
          <p className="mt-2 font-semibold">{modelLabel}</p>

          {chosen.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">
              Select an issue to see your price.
            </p>
          ) : (
            <>
              <ul className="mt-4 space-y-2.5 border-t border-surface-line pt-4 text-sm">
                {chosen.map((i) => (
                  <li key={i.id} className="flex justify-between gap-4">
                    <span className="text-ink-soft">{i.name}</span>
                    <span className="font-medium">{rupees(i.price)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-surface-line pt-4">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold text-brand-700">{rupees(total)}</span>
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                About {minutesToEta(longestEta)} on site · 6-month warranty · pay after the repair
              </p>
            </>
          )}

          <button
            type="button"
            onClick={proceed}
            disabled={chosen.length === 0}
            className="btn-primary mt-6 w-full"
          >
            Continue to booking
          </button>

          <p className="mt-3 text-center text-xs text-ink-muted">
            No payment is taken online.
          </p>
        </div>
      </aside>
    </div>
  );
}
