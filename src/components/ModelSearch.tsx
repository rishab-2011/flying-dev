"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { rupees } from "@/lib/format";
import { Icon } from "./Icon";

export type SearchableModel = {
  id: string;
  name: string;
  slug: string;
  screenPrice: number | null;
};

/**
 * Filter for a brand's model list.
 *
 * Apple has 33 models and Samsung 31, ordered newest-first — which reads as
 * arbitrary to someone who only knows their own phone's name and is scrolling
 * a 390px screen looking for it. Typing two characters beats scrolling.
 *
 * Every model still renders in the markup, so this costs nothing in crawlable
 * links: the filter only hides rows the browser already has.
 */
export function ModelSearch({
  brandSlug,
  brandName,
  models,
}: {
  brandSlug: string;
  brandName: string;
  models: SearchableModel[];
}) {
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!needle) return models;
    // Match on the model name with and without spaces, so "s24ultra" and
    // "note13" find what someone typed in a hurry.
    return models.filter((model) => {
      const name = model.name.toLowerCase();
      return name.includes(needle) || name.replace(/\s+/g, "").includes(needle.replace(/\s+/g, ""));
    });
  }, [models, needle]);

  return (
    <>
      <div className="mt-8 max-w-md">
        <label className="sr-only" htmlFor="model-search">
          Search {brandName} models
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            id="model-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${models.length} ${brandName} models`}
            className="field pl-11"
            autoComplete="off"
          />
        </div>
      </div>

      <p className="mt-3 text-sm text-ink-muted" aria-live="polite">
        {needle
          ? `${matches.length} ${matches.length === 1 ? "model" : "models"} matching “${query.trim()}”`
          : `${models.length} models`}
      </p>

      {matches.length === 0 ? (
        <div className="card mt-6 max-w-xl p-8">
          <p className="font-semibold">No {brandName} model matches that.</p>
          <p className="mt-2 leading-relaxed text-ink-muted">
            We repair more models than we list. Tell us which one you have and
            we'll send a price on WhatsApp.
          </p>
          <Link href="/quote" className="btn-primary mt-5">
            Request a quote
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((model) => (
            <li key={model.id}>
              <Link
                href={`/repair/${brandSlug}/${model.slug}`}
                className="card group flex items-center justify-between gap-4 p-5 transition hover:border-brand-300 hover:shadow-lift"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold group-hover:text-brand-700">
                    {model.name}
                  </p>
                  {model.screenPrice !== null && (
                    <p className="mt-0.5 text-sm text-ink-muted">
                      Screen from {rupees(model.screenPrice)}
                    </p>
                  )}
                </div>
                <span className="text-ink-muted transition group-hover:translate-x-1 group-hover:text-brand-500">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
