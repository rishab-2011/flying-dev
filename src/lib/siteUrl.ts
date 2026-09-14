/**
 * The site's own absolute URL, resolved without anyone having to set it.
 *
 * Canonical links, the sitemap, robots.txt and the WhatsApp share card all
 * build absolute URLs, so every one of them is wrong if this is wrong — and
 * wrong quietly: the pages still render, the card just stops loading and the
 * sitemap advertises localhost to Google.
 *
 * So rather than depend on NEXT_PUBLIC_SITE_URL being set correctly by hand,
 * fall back to the URL the host already knows. Netlify injects `URL` (the
 * site's primary address) and `DEPLOY_PRIME_URL` (this particular deploy)
 * into both the build and the function runtime. Deploy previews then get
 * their own correct URL instead of borrowing production's.
 *
 * These are read server-side only. `URL` has no NEXT_PUBLIC_ prefix, so it is
 * never inlined into a client bundle — every caller here is a server file.
 */
const FALLBACK = "http://localhost:3000";

function normalise(value: string | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  // Tolerate "flyingdev.netlify.app" as well as a full URL, since that is what
  // people type into a hosting dashboard.
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    if (!parsed.hostname) return null;
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    // A malformed value must not take the build down with it. metadataBase
    // calls `new URL()` on this at module scope, so an exception here would
    // fail the whole deploy rather than one page.
    return null;
  }
}

export function siteUrl(): string {
  return (
    normalise(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalise(process.env.URL) ??
    normalise(process.env.DEPLOY_PRIME_URL) ??
    FALLBACK
  );
}
