"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

type Props = {
  supportPhone: string;
  user: { name: string; role: string } | null;
};

const LINKS = [
  { href: "/repair", label: "Get a repair price" },
  { href: "/track", label: "Track a booking" },
  { href: "/about", label: "Why Flying Dev" },
  { href: "/faq", label: "Questions" },
  { href: "/reviews", label: "Reviews" },
];

/**
 * The header's navigation on phones.
 *
 * Everything in the desktop nav -- prices, tracking, the FAQ, sign in -- used
 * to be hidden below md with no replacement, reachable only by scrolling to
 * the footer. On a site whose visitors are by definition holding a broken
 * phone, that is the wrong half of the audience to hide the navigation from.
 */
export function MobileMenu({ supportPhone, user }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation. Without this the panel stays open over the new page,
  // because the header is not remounted between routes.
  useEffect(() => setOpen(false), [pathname]);

  // A menu that cannot be dismissed by Escape traps keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="btn-ghost px-3 py-2"
      >
        <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-16 border-b border-surface-line bg-white shadow-lift"
        >
          <nav className="container-page flex flex-col py-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-surface-line py-3.5 text-base font-medium text-ink-soft last:border-0 hover:text-brand-600"
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center gap-3 border-t border-surface-line py-4">
              {user ? (
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/account"}
                  className="btn-ghost flex-1 justify-center px-4 py-2.5"
                >
                  {user.role === "ADMIN" ? "Admin panel" : "My bookings"}
                </Link>
              ) : (
                <Link href="/login" className="btn-ghost flex-1 justify-center px-4 py-2.5">
                  Sign in
                </Link>
              )}
              <a
                href={`tel:${supportPhone.replace(/\s/g, "")}`}
                className="btn-primary flex-1 justify-center px-4 py-2.5"
              >
                Call us
              </a>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
