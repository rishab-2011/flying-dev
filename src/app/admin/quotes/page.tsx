import { db } from "@/lib/db";
import { whatsAppLink } from "@/lib/notify";
import { QuoteRow, type QuoteRowData } from "@/components/admin/QuoteRow";
import { markQuoteHandledAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminQuotesPage() {
  const quotes = await db.quoteRequest.findMany({
    orderBy: [{ handled: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  const rows: QuoteRowData[] = quotes.map((q) => ({
    id: q.id,
    name: q.name,
    phone: q.phone,
    deviceText: q.deviceText,
    issueText: q.issueText,
    pincode: q.pincode,
    handled: q.handled,
    createdAt: q.createdAt.toISOString(),
    whatsAppLink: whatsAppLink(
      q.phone,
      `Hi ${q.name.split(" ")[0]}, this is Flying Dev about your ${q.deviceText}. ` +
        `Our price for that repair is ₹____, with a 6-month warranty and doorstep service. ` +
        `Shall we book you a slot?`
    ),
  }));

  return rows.length === 0 ? (
    <p className="card p-10 text-center text-sm text-ink-muted">
      No quote requests yet. They arrive here when someone's model isn't listed.
    </p>
  ) : (
    <ul className="space-y-4">
      {rows.map((quote) => (
        <QuoteRow key={quote.id} quote={quote} action={markQuoteHandledAction} />
      ))}
    </ul>
  );
}
