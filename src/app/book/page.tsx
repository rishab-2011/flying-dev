import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { BookingForm, type QuotedIssue } from "@/components/BookingForm";
import { bookableDays, firstBookableDay } from "@/lib/slots";
import { createBookingAction } from "../booking-actions";

export const metadata: Metadata = {
  title: "Book your repair",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ model?: string; issues?: string }> };

export default async function BookPage({ searchParams }: Props) {
  const { model: modelId, issues: issueParam } = await searchParams;
  const issueSlugs = (issueParam ?? "").split(",").filter(Boolean);

  // Landing here without a device selected means the funnel was skipped.
  if (!modelId || issueSlugs.length === 0) redirect("/repair");

  const model = await db.model.findUnique({
    where: { id: modelId },
    include: { brand: true },
  });
  if (!model) redirect("/repair");

  const prices = await db.priceItem.findMany({
    where: { modelId: model.id, active: true, issue: { slug: { in: issueSlugs } } },
    include: { issue: true },
    orderBy: { issue: { rank: "asc" } },
  });
  if (prices.length === 0) redirect(`/repair/${model.brand.slug}/${model.slug}`);

  const issues: QuotedIssue[] = prices.map((p) => ({
    slug: p.issue.slug,
    name: p.issue.name,
    price: p.price,
    etaMinutes: p.etaMinutes,
  }));

  const areas = await db.serviceArea.findMany({
    where: { active: true },
    select: { pincode: true, city: true, area: true, doorstep: true, pickupAndDrop: true },
    orderBy: { pincode: "asc" },
  });

  const session = await getSessionUser();
  const account = session
    ? await db.user.findUnique({ where: { id: session.id } })
    : null;

  const label = `${model.brand.name} ${model.name}`.replace(/^Apple /, "");

  return (
    <div className="container-page py-12">
      <nav className="text-sm text-ink-muted">
        <Link href={`/repair/${model.brand.slug}/${model.slug}`} className="hover:text-brand-600">
          ← Back to {label}
        </Link>
      </nav>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">Book your repair</h1>
      <p className="mt-2 text-ink-muted">
        No payment now — you pay the technician once the repair is done.
      </p>

      {!session && (
        <p className="mt-5 rounded-xl border border-surface-line bg-white px-5 py-4 text-sm text-ink-soft">
          You can book without an account.{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>{" "}
          if you'd like it saved to your bookings.
        </p>
      )}

      <div className="mt-8">
        <BookingForm
          days={bookableDays()}
          defaultDate={firstBookableDay()}
          action={createBookingAction}
          modelId={model.id}
          modelLabel={label}
          issues={issues}
          areas={areas}
          defaults={{
            name: account?.name ?? "",
            phone: account?.phone ?? "",
            email: account?.email ?? "",
          }}
        />
      </div>
    </div>
  );
}
