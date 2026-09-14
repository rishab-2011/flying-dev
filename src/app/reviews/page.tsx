import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { ReviewCard, Stars } from "@/components/ReviewCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customer reviews",
  description:
    "What customers say about Flying Dev doorstep phone repair across Delhi, Noida, Gurugram, Ghaziabad and Faridabad.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const reviews = await db.review.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="container-page py-12">
      <nav className="text-sm text-ink-muted">
        <Link href="/" className="hover:text-brand-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Reviews</span>
      </nav>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">Customer reviews</h1>

      {reviews.length === 0 ? (
        <div className="card mt-8 max-w-xl p-10">
          <p className="font-semibold">No reviews here yet.</p>
          <p className="mt-2 leading-relaxed text-ink-muted">
            We'd rather show you nothing than show you something we wrote
            ourselves. Once we've repaired a few phones, this is where the
            feedback will be — good and bad.
          </p>
          <Link href="/repair" className="btn-primary mt-6">
            Check your repair price
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-ink-muted">
            <Stars rating={Math.round(average)} />
            <span>
              {average.toFixed(1)} average from {reviews.length}{" "}
              {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </p>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
