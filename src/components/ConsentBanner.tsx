"use client";

import { useEffect, useState } from "react";
import { applyConsent, isDatadogConfigured, readConsent } from "@/lib/datadog";

/**
 * Asks before any behavioural data goes to Datadog.
 *
 * Renders nothing at all when Datadog is unconfigured, so the site a customer
 * sees today is unchanged until the keys are added. It also renders nothing
 * once a choice has been made -- this is a one-time question, not a banner that
 * follows people around.
 *
 * The choice is read in an effect rather than during render because
 * localStorage does not exist on the server; rendering it directly would give
 * a hydration mismatch.
 */
export function ConsentBanner() {
  const [decided, setDecided] = useState(true);

  useEffect(() => {
    if (!isDatadogConfigured()) return;
    setDecided(readConsent() !== null);
  }, []);

  if (decided) return null;

  const choose = (consent: "granted" | "denied") => {
    // Hide the banner immediately; loading the SDK chunk must not make the
    // button feel unresponsive.
    setDecided(true);
    void applyConsent(consent);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="consent-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-surface-line bg-surface p-4 shadow-lg sm:p-5"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p id="consent-title" className="font-semibold">
            Help us improve this site?
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            We&apos;d like to measure which pages are slow or broken. It never
            includes your name, phone number or address, and we don&apos;t use
            it for advertising.{" "}
            <a href="/privacy" className="text-brand-600 hover:underline">
              How we handle your data
            </a>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="btn-ghost px-4 py-2"
          >
            No thanks
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="btn-primary px-4 py-2"
          >
            That&apos;s fine
          </button>
        </div>
      </div>
    </div>
  );
}
