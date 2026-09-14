import type { Metadata } from "next";
import Link from "next/link";
import { FAQ } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Questions about phone repair, answered",
  description:
    "Do you come to my home? Is my data safe? Is the price fixed? What does the six-month warranty cover? Straight answers about doorstep phone repair in Delhi NCR.",
};

export default function FaqPage() {
  const phone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 85879 49104";

  // FAQPage structured data. Google can show these answers directly in search
  // results, which reaches people who never land on the page at all.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="container-page py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <nav className="text-sm text-ink-muted">
        <Link href="/" className="hover:text-brand-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Questions</span>
      </nav>

      <header className="mt-4 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Questions, answered
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          The things people ask before handing over a phone. If yours isn't
          here, message us on WhatsApp — we'd rather answer it than have you
          guess.
        </p>
      </header>

      {/* <details> rather than JavaScript: it works before the page hydrates,
          it is keyboard accessible for free, and the browser's own find-in-page
          can reach text inside a closed answer. */}
      <div className="mt-10 max-w-3xl divide-y divide-surface-line rounded-2xl border border-surface-line bg-white">
        {FAQ.map((item) => (
          <details key={item.question} className="group px-6 py-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold">
              {item.question}
              <span
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-xl leading-none text-ink-muted transition group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
              {item.answer}
            </p>
          </details>
        ))}
      </div>

      <div className="card mt-10 flex max-w-3xl flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="font-semibold">Still not sure?</p>
          <p className="mt-1 text-sm text-ink-muted">
            Ask us on WhatsApp, or call {phone}. No obligation.
          </p>
        </div>
        <Link href="/repair" className="btn-primary">
          Check your repair price
        </Link>
      </div>
    </div>
  );
}
