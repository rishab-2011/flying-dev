/**
 * Shown while a page's data loads.
 *
 * Every page in the funnel reads from the database, and on a serverless host
 * whose compute has scaled to zero the first request can take a second or two.
 * Without this the browser sits on the previous page with nothing happening,
 * which reads as a broken link — people tap again, or leave.
 */
function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-line ${className}`} />;
}

export function FunnelSkeleton() {
  return (
    <div className="container-page py-12" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>

      <Bar className="h-4 w-48" />
      <Bar className="mt-5 h-9 w-80 max-w-full" />
      <Bar className="mt-3 h-4 w-64 max-w-full" />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-6">
            <Bar className="h-5 w-32" />
            <Bar className="mt-3 h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
