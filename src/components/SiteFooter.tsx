import Link from "next/link";
import { Wordmark } from "./Logo";

const CITIES = ["Delhi", "Noida", "Greater Noida", "Ghaziabad", "Gurugram", "Faridabad"];

export function SiteFooter() {
  const phone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 85879 49104";

  return (
    <footer className="mt-20 border-t border-surface-line bg-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
            Doorstep phone repair across Delhi NCR. Genuine parts, a 6-month
            warranty, and a technician who comes to you.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Service</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            <li><Link href="/repair" className="hover:text-brand-600">Book a repair</Link></li>
            <li><Link href="/track" className="hover:text-brand-600">Track your booking</Link></li>
            <li><Link href="/quote" className="hover:text-brand-600">Model not listed?</Link></li>
            <li><Link href="/faq" className="hover:text-brand-600">Questions</Link></li>
            <li><Link href="/reviews" className="hover:text-brand-600">Reviews</Link></li>
            <li><Link href="/account" className="hover:text-brand-600">My bookings</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">We cover</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            {CITIES.map((city) => (
              <li key={city}>{city}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Company</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
            <li><Link href="/about" className="hover:text-brand-600">Why Flying Dev</Link></li>
            <li><Link href="/terms" className="hover:text-brand-600">Terms of service</Link></li>
            <li><Link href="/privacy" className="hover:text-brand-600">Privacy policy</Link></li>
            <li><a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-brand-600">{phone}</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-surface-line py-6">
        <p className="container-page text-xs text-ink-muted">
          © {new Date().getFullYear()} Flying Dev. Prices shown are estimates and
          are confirmed by the technician after inspection.
        </p>
      </div>
    </footer>
  );
}
