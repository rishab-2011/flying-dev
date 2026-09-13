import "server-only";
import { headers } from "next/headers";
import { db } from "./db";

/**
 * Fixed-window rate limiting, backed by the database.
 *
 * Every public form on this site — signup, login, booking, quote request —
 * writes to the database with no payment step in front of it, so without a
 * limit a script can fill the admin panel with fake bookings, brute-force a
 * password, or burn through the database's free-tier quota.
 *
 * The window is fixed rather than sliding: simpler, one row per key per window,
 * and precise enough for abuse control. The cost is that a burst can straddle a
 * boundary and get up to double the limit in a short span, which is acceptable
 * here — these limits are about stopping scripts, not shaping traffic.
 */

export type RateLimitRule = { limit: number; windowMs: number };

/**
 * Per-IP limits. These are deliberately loose.
 *
 * Most Indian mobile traffic arrives through carrier-grade NAT, so a single IP
 * can represent a great many unrelated Jio or Airtel customers. A tight per-IP
 * limit would lock out real people who happen to share an address with someone
 * who booked a minute earlier — a worse outcome than the abuse it prevents.
 * These catch a crude flood; the per-phone rules below do the precise work.
 */
export const IP_RULES = {
  signup: { limit: 15, windowMs: 60 * 60 * 1000 },
  login: { limit: 30, windowMs: 15 * 60 * 1000 },
  booking: { limit: 20, windowMs: 60 * 60 * 1000 },
  quote: { limit: 15, windowMs: 60 * 60 * 1000 },
} as const satisfies Record<string, RateLimitRule>;

/**
 * Per-phone-number limits. An attacker on many IPs still can't grind one
 * account's password, and one number can't flood the bookings board.
 */
export const PHONE_RULES = {
  login: { limit: 6, windowMs: 15 * 60 * 1000 },
  booking: { limit: 4, windowMs: 60 * 60 * 1000 },
} as const satisfies Record<string, RateLimitRule>;

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

/**
 * The caller's IP. Netlify sets x-nf-client-connection-ip; x-forwarded-for is
 * the general fallback, whose first entry is the original client.
 *
 * These headers are set by the platform, but a request that reaches the app
 * without passing through it could forge them — so treat the result as a
 * best-effort grouping key, never as identity. The per-phone limits below are
 * what hold when the IP can't be trusted.
 */
async function clientIp(): Promise<string> {
  const h = await headers();
  const netlify = h.get("x-nf-client-connection-ip");
  if (netlify) return netlify;

  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return h.get("x-real-ip") ?? "unknown";
}

async function consume(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
  const now = Date.now();
  // Align windows to the clock so every caller in the same window shares a row.
  const windowEnd = new Date(Math.ceil((now + 1) / rule.windowMs) * rule.windowMs);

  const row = await db.rateLimit.upsert({
    where: { key_windowEnd: { key, windowEnd } },
    update: { count: { increment: 1 } },
    create: { key, windowEnd, count: 1 },
  });

  if (row.count <= rule.limit) return { allowed: true, retryAfterSeconds: 0 };

  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((windowEnd.getTime() - now) / 1000)),
  };
}

/** Deletes windows that have closed. Cheap, and keeps the table from growing. */
async function sweepExpired(): Promise<void> {
  // Roughly one sweep per fifty calls — often enough to stay small, rare enough
  // not to add a delete to every request.
  if (Math.random() > 0.02) return;
  try {
    await db.rateLimit.deleteMany({ where: { windowEnd: { lt: new Date() } } });
  } catch {
    // A failed sweep must never fail the request it happened to run inside.
  }
}

/**
 * Checks the caller against the IP rule for `action`, and the phone rule too
 * when a number is supplied. Returns the first limit that is exceeded.
 */
export async function checkRateLimit(
  action: keyof typeof IP_RULES,
  phone?: string
): Promise<RateLimitResult> {
  await sweepExpired();

  const ip = await clientIp();
  const ipResult = await consume(`${action}:ip:${ip}`, IP_RULES[action]);
  if (!ipResult.allowed) return ipResult;

  const phoneRule = (PHONE_RULES as Record<string, RateLimitRule | undefined>)[action];
  if (phone && phoneRule) {
    return consume(`${action}:phone:${phone}`, phoneRule);
  }

  return ipResult;
}

/** The message shown when a limit is hit. Vague on purpose — it shouldn't help
 *  someone tune a script, and it shouldn't alarm a real customer who double-clicked. */
export function rateLimitMessage(result: RateLimitResult): string {
  const minutes = Math.ceil(result.retryAfterSeconds / 60);
  const wait = minutes <= 1 ? "a minute" : `${minutes} minutes`;
  return `Too many attempts. Please try again in ${wait}, or message us on WhatsApp and we'll sort it out.`;
}
