import type { Review } from "@prisma/client";

export function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="text-accent-400"
      aria-label={`${rating} out of 5`}
      title={`${rating} out of 5`}
    >
      {"★".repeat(rating)}
      <span className="text-surface-line">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="card flex h-full flex-col p-6">
      <Stars rating={review.rating} />
      <blockquote className="mt-3 flex-1 leading-relaxed text-ink-soft">
        “{review.body}”
      </blockquote>
      <figcaption className="mt-5 border-t border-surface-line pt-4 text-sm">
        <span className="font-semibold">{review.customerName}</span>
        {review.area && <span className="text-ink-muted"> · {review.area}</span>}
        {review.deviceLabel && (
          <span className="mt-0.5 block text-ink-muted">{review.deviceLabel}</span>
        )}
      </figcaption>
    </figure>
  );
}
