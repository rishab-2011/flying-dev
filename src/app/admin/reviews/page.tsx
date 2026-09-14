import { db } from "@/lib/db";
import { AddReview, ReviewRow, type AdminReview } from "@/components/admin/ReviewAdmin";
import { addReviewAction, toggleReviewAction, deleteReviewAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({ orderBy: { createdAt: "desc" } });

  const rows: AdminReview[] = reviews.map((r) => ({
    id: r.id,
    customerName: r.customerName,
    area: r.area,
    deviceLabel: r.deviceLabel,
    rating: r.rating,
    body: r.body,
    published: r.published,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <AddReview action={addReviewAction} />

      {rows.length === 0 ? (
        <p className="card p-10 text-center text-sm text-ink-muted">
          No reviews yet. The section on the home page stays hidden until there
          is at least one.
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((review) => (
            <ReviewRow
              key={review.id}
              review={review}
              toggle={toggleReviewAction}
              remove={deleteReviewAction}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
