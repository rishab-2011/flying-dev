import Link from "next/link";
import { Wordmark } from "./Logo";
import { Icon } from "./Icon";
import { getSessionUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getSessionUser();
  const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 99999 99999";

  return (
    <header className="sticky top-0 z-40 border-b border-surface-line bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Flying Dev home">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
          <Link href="/repair" className="hover:text-brand-600">
            Repair
          </Link>
          <Link href="/track" className="hover:text-brand-600">
            Track booking
          </Link>
          <Link href="/about" className="hover:text-brand-600">
            Why us
          </Link>
          <a href={`tel:${supportPhone.replace(/\s/g, "")}`} className="hover:text-brand-600">
            {supportPhone}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {/* Tap-to-call, phones only. Someone holding a broken phone often
              wants to talk to a person, and the number in the desktop nav is
              invisible here. Sign in is hidden at this width to make room —
              it's still reachable from the footer's "My bookings". */}
          <a
            href={`tel:${supportPhone.replace(/\s/g, "")}`}
            aria-label={`Call Flying Dev on ${supportPhone}`}
            className="btn-ghost px-3 py-2 md:hidden"
          >
            <Icon name="phone" className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Call</span>
          </a>

          {user ? (
            <Link
              href={user.role === "ADMIN" ? "/admin" : "/account"}
              className="btn-ghost px-4 py-2"
            >
              {user.role === "ADMIN" ? "Admin" : user.name.split(" ")[0]}
            </Link>
          ) : (
            <Link href="/login" className="btn-ghost hidden px-4 py-2 md:inline-flex">
              Sign in
            </Link>
          )}
          <Link href="/repair" className="btn-primary px-4 py-2">
            Book a repair
          </Link>
        </div>
      </div>
    </header>
  );
}
