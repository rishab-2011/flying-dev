import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isDatadogConfigured } from "@/lib/datadog";

/**
 * Liveness and readiness for the site.
 *
 * Answers the only question worth asking automatically: can this deploy serve
 * a booking right now? Rendering a page is not enough -- every path that
 * matters reads the database, so a deploy with an unreachable database looks
 * perfectly healthy to anything that only checks that the home page returns
 * 200, right up until a customer submits the form.
 *
 * 200 when the database answers, 503 when it does not, so an uptime monitor
 * can alert on the status code alone without parsing the body.
 *
 * Deliberately says nothing a stranger could use: no connection strings, no
 * tokens, no row counts, and no error text (Prisma's connection errors quote
 * the database URL, credentials and all). The configuration fields are plain
 * booleans -- enough to tell whether a deploy was built with what it needed,
 * which is otherwise invisible from outside.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const startedAt = Date.now();

  let database: "ok" | "unreachable" = "unreachable";
  let databaseLatencyMs: number | null = null;

  try {
    const began = Date.now();
    // The cheapest possible round trip: proves the pool, the network path and
    // the credentials without touching application data.
    await db.$queryRaw`SELECT 1`;
    databaseLatencyMs = Date.now() - began;
    database = "ok";
  } catch {
    // Swallowed on purpose. The thrown message carries the full connection
    // string; this endpoint is public.
  }

  const healthy = database === "ok";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      time: new Date().toISOString(),
      // Which build is actually serving. Both are resolved at build time in
      // next.config.mjs, so they identify the deploy, not the request.
      version: process.env.NEXT_PUBLIC_DD_VERSION || "dev",
      env: process.env.NEXT_PUBLIC_DD_ENV || "development",
      checks: {
        database,
        databaseLatencyMs,
        // Whether this build carries what the browser needs. Booleans only.
        datadogConfigured: isDatadogConfigured(),
        whatsAppConfigured: Boolean(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
      },
      tookMs: Date.now() - startedAt,
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        // A cached health check is worse than none: it reports the state of
        // whenever it was cached, which is exactly when you need the truth.
        "cache-control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
