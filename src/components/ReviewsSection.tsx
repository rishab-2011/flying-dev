import Link from "next/link";
import { db } from "@/lib/db";
import { ReviewCard } from "./ReviewCard";

/**
 * The three most recent published reviews.
 *
 * Renders nothing when there are none. A new business has no reviews yet, and
 * inventing some is the fastest way to lose the trust the section is for — a
 * customer who spots a fake testimonial stops believing the prices too.
 */
export async function ReviewsSection() {
  const reviews = await db.review.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  if (reviews.length === 0) return null;

  const all = await db.review.count({ where: { published: true } });

  return (
    <section className="border-y border-surface-line bg-white py-16">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">What customers say</h2>
            <p className="mt-2 text-ink-muted">
              Real feedback from repairs we've done across Delhi NCR.
            </p>
          </div>
          {all > 3 && (
            <Link href="/reviews" className="font-semibold text-brand-600 hover:underline">
              Read all {all} reviews →
            </Link>
          )}
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
