/**
 * Server-side Datadog APM.
 *
 * This is the half of Datadog that Netlify could not run. RUM (src/lib/datadog.ts)
 * watches the browser; this watches the server, and it needs a Datadog Agent
 * listening nearby to ship traces to. Netlify Functions cannot run one, which
 * is why the server side stayed dark there. On ECS the Agent runs as a second
 * container in the same task, sharing the task's network namespace, so it is
 * reachable on localhost.
 *
 * Next calls register() once per server process, before handling any request.
 *
 * The gate is DD_AGENT_HOST. Locally, in CI and in tests nothing sets it, so
 * the tracer never initialises and the app behaves exactly as it does today --
 * the same "configured or entirely absent" rule RUM follows. dd-trace with no
 * agent to talk to does not fail loudly; it retries in the background forever,
 * which is a worse outcome than staying off.
 */
export async function register() {
  // register() also runs for the edge runtime, where dd-trace's native
  // instrumentation cannot work. Node only.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  if (!process.env.DD_AGENT_HOST && !process.env.DD_TRACE_AGENT_URL) return;
  if (process.env.DD_TRACE_ENABLED === "false") return;

  const tracer = (await import("dd-trace")).default;

  tracer.init({
    service: "flying-dev",
    // Same values the browser SDK reports, so a slow page and the slow query
    // underneath it land in the same env and version in Datadog rather than in
    // two unrelated buckets.
    env: process.env.DD_ENV || process.env.NEXT_PUBLIC_DD_ENV || "development",
    version: process.env.DD_VERSION || process.env.NEXT_PUBLIC_DD_VERSION || "dev",
    // Puts trace and span ids into log lines, which is what makes a log jump to
    // the request that produced it.
    logInjection: true,
    runtimeMetrics: true,
  });
}
