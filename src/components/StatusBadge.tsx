import { statusLabel } from "@/lib/format";

const TONES: Record<string, string> = {
  REQUESTED: "bg-accent-100 text-accent-600",
  CONFIRMED: "bg-brand-50 text-brand-600",
  IN_PROGRESS: "bg-brand-100 text-brand-700",
  READY: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`chip ${TONES[status] ?? "bg-surface-sunk text-ink-soft"}`}>
      {statusLabel(status)}
    </span>
  );
}
