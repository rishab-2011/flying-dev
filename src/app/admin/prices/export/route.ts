import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

/** Exports the whole price list as CSV, in the shape the importer expects. */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return new Response("Forbidden", { status: 403 });
  }

  const prices = await db.priceItem.findMany({
    include: { issue: true, model: { include: { brand: true } } },
    orderBy: [
      { model: { brand: { rank: "asc" } } },
      { model: { name: "asc" } },
      { issue: { rank: "asc" } },
    ],
  });

  // Names are catalogue-controlled and contain no commas, but quoting keeps the
  // file valid if someone adds a model like "Galaxy S24, Exynos" later.
  const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const lines = [
    "brand,model,issue,price,strike_price,eta_minutes,warranty_months,active",
    ...prices.map((p) =>
      [
        quote(p.model.brand.name),
        quote(p.model.name),
        quote(p.issue.name),
        p.price,
        p.strikePrice ?? "",
        p.etaMinutes,
        p.warrantyMonths,
        p.active ? "yes" : "no",
      ].join(",")
    ),
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="flyingdev-prices-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
