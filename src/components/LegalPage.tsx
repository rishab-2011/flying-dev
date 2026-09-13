export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-16">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-ink-muted">Last updated {updated}</p>

        <div className="mt-4 rounded-xl border border-accent-200 bg-accent-50 px-5 py-4 text-sm text-ink-soft">
          <strong className="font-semibold text-ink">Draft — needs review.</strong>{" "}
          This document is a starting point. Fill in every value in square
          brackets and have a lawyer review it before you take real bookings.
        </div>

        <div className="prose-flyingdev mt-10 space-y-8">{children}</div>
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-2.5 space-y-3 leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}
