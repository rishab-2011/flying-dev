import type { Metadata } from "next";
import { QuoteForm } from "@/components/QuoteForm";
import { createQuoteRequestAction } from "../booking-actions";

export const metadata: Metadata = {
  title: "Request a repair quote",
  description:
    "Phone not listed? Tell us the model and the fault and we'll send you a repair price on WhatsApp.",
};

export default function QuotePage() {
  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-lg p-8">
        <h1 className="text-2xl font-bold tracking-tight">Request a quote</h1>
        <p className="mb-6 mt-1.5 text-sm leading-relaxed text-ink-muted">
          We list 190+ models, but we repair many more. Tell us what you have and
          we'll send a price on WhatsApp — usually within a few hours.
        </p>
        <QuoteForm action={createQuoteRequestAction} />
      </div>
    </div>
  );
}
