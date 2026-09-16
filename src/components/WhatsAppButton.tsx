"use client";

import { usePathname } from "next/navigation";

/**
 * A WhatsApp button on every page.
 *
 * Until now WhatsApp only appeared once a booking was already placed, and in
 * the admin panel — so a customer deciding whether to trust us never saw one.
 * In India WhatsApp is where that conversation actually happens, and a business
 * without a visible button on a repair site reads as unreachable.
 *
 * The message is prefilled from the page the customer is on, so a question
 * about a specific phone arrives with the phone named rather than as "hi".
 */
export function WhatsAppButton({ number }: { number: string }) {
  const pathname = usePathname();

  // The admin panel has its own per-booking WhatsApp links; a floating button
  // to our own number there would only get in the way.
  if (pathname.startsWith("/admin")) return null;

  const text = messageFor(pathname);
  const href = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Flying Dev on WhatsApp"
      className="fixed bottom-5 right-5 z-50 [.has-estimate-bar_&]:bottom-28 lg:[.has-estimate-bar_&]:bottom-7 flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3 font-semibold text-white shadow-lift transition hover:bg-[#1FB855] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 sm:bottom-7 sm:right-7"
    >
      <WhatsAppGlyph />
      <span className="hidden text-sm sm:inline">Chat with us</span>
    </a>
  );
}

/** What the customer's message says, based on where they are. */
function messageFor(pathname: string): string {
  if (pathname.startsWith("/repair/")) {
    // /repair/apple/iphone-13 → "Apple iPhone 13"
    const parts = pathname.split("/").filter(Boolean).slice(1);
    const label = parts
      .map((part) =>
        part
          .replace(/-plus/g, " Plus")
          .split("-")
          .map((word) => (/^\d/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
          .join(" ")
      )
      .join(" ");
    return `Hi Flying Dev, I have a question about repairing my ${label}.`;
  }

  if (pathname.startsWith("/track")) {
    return "Hi Flying Dev, I'd like an update on my repair booking.";
  }

  if (pathname === "/quote") {
    return "Hi Flying Dev, my phone isn't listed on your site. Can you quote me?";
  }

  return "Hi Flying Dev, I'd like to ask about a phone repair.";
}

/** WhatsApp's glyph. Solid, so it reads at 20px on the green pill. */
function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path d="M12.04 2A9.9 9.9 0 0 0 2.1 11.9a9.8 9.8 0 0 0 1.34 4.95L2 22l5.3-1.38a9.9 9.9 0 0 0 4.74 1.2h.01A9.9 9.9 0 0 0 22 11.92 9.9 9.9 0 0 0 12.04 2Zm0 18.05h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.05-.2-.31a8.2 8.2 0 1 1 6.99 3.87Zm4.5-6.15c-.24-.12-1.46-.72-1.69-.8-.22-.09-.39-.13-.55.12-.16.24-.63.8-.78.96-.14.17-.29.19-.53.07a6.7 6.7 0 0 1-3.35-2.93c-.25-.44.25-.4.72-1.35.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.75-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.25-.84.83-.84 2.01 0 1.19.86 2.33.98 2.5.12.15 1.7 2.58 4.1 3.62 1.53.66 2.13.71 2.89.6.46-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.15-1.18-.06-.1-.22-.17-.46-.29Z" />
    </svg>
  );
}
