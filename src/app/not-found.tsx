import Link from "next/link";
import { RepairIllustration } from "@/components/RepairIllustration";

/**
 * Next's stock 404 is bare unstyled text, and it is one of the clearest signs
 * a site was never finished. A customer usually lands here from a stale link or
 * a mistyped model name, so this sends them somewhere useful rather than just
 * apologising.
 */
export default function NotFound() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto grid max-w-4xl items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Page not found
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            That page isn't here.
          </h1>
          <p className="mt-4 max-w-lg leading-relaxed text-ink-soft">
            The link may be old, or the model may be spelled differently on our
            site. Your phone is still fixable — start from the brand and we'll
            get you a price.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/repair" className="btn-primary">
              Find your phone
            </Link>
            <Link href="/track" className="btn-ghost">
              Track a booking
            </Link>
          </div>

          <p className="mt-6 text-sm text-ink-muted">
            Model not listed?{" "}
            <Link href="/quote" className="font-semibold text-brand-600 hover:underline">
              Ask us for a quote
            </Link>{" "}
            — we repair more models than we list.
          </p>
        </div>

        <RepairIllustration className="mx-auto w-full max-w-xs lg:max-w-none" />
      </div>
    </div>
  );
}
