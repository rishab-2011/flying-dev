/**
 * The health endpoint is only useful if it tells the truth and gives nothing
 * away. These cover the healthy path -- 200 with the fields a monitor reads --
 * and that nothing in the body could help an attacker.
 *
 * The 503 path is not covered here, because asserting it means stopping the
 * database out from under every other test in the suite. It was verified by
 * hand against a stopped Postgres: HTTP 503, status "degraded", database
 * "unreachable", and no connection string in the body (Prisma's own error
 * quotes DATABASE_URL in full, which is why the route's catch stays silent).
 */
const BASE = process.env.BASE || "http://localhost:3000";
let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
  if (!ok) failed++;
};

const res = await fetch(`${BASE}/api/health`);
const raw = await res.text();
let body;
try { body = JSON.parse(raw); } catch { body = null; }

check("responds 200 when healthy", res.status === 200, `got ${res.status}`);
check("is JSON", (res.headers.get("content-type") || "").includes("application/json"));
check("is never cached", /no-store/.test(res.headers.get("cache-control") || ""),
  res.headers.get("cache-control") || "(none)");
check("reports status ok", body?.status === "ok", body?.status);
check("reports the database reachable", body?.checks?.database === "ok", body?.checks?.database);
check("reports database latency", typeof body?.checks?.databaseLatencyMs === "number",
  `${body?.checks?.databaseLatencyMs}ms`);
check("names the build", typeof body?.version === "string" && typeof body?.env === "string",
  `${body?.version} / ${body?.env}`);
check("reports whether Datadog is configured",
  typeof body?.checks?.datadogConfigured === "boolean", String(body?.checks?.datadogConfigured));

// Nothing in the body may help someone attack the site. Prisma's connection
// errors quote DATABASE_URL in full, which is exactly why the catch is silent.
const forbidden = [
  ["a connection string", /postgres(ql)?:\/\//i],
  ["a password or secret", /password|secret|session_secret/i],
  ["a Datadog token", /pub[0-9a-f]{20,}/i],
  ["a raw stack trace", /at\s+\w+\s+\(|node_modules/],
];
for (const [what, pattern] of forbidden) {
  check(`does not leak ${what}`, !pattern.test(raw));
}

console.log(failed === 0 ? `\nAll health checks passed.` : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
