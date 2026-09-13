import Link from "next/link";
import { db } from "@/lib/db";
import { PriceRow, type EditablePrice } from "@/components/admin/PriceRow";
import { PriceImport } from "@/components/admin/PriceImport";
import { updatePriceAction, importPricesAction } from "../actions";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ brand?: string; model?: string }> };

export default async function AdminPricesPage({ searchParams }: Props) {
  const { brand: brandSlug, model: modelSlug } = await searchParams;

  const brands = await db.brand.findMany({ orderBy: { rank: "asc" } });
  const activeBrand = brandSlug
    ? brands.find((b) => b.slug === brandSlug)
    : brands[0];

  const models = activeBrand
    ? await db.model.findMany({
        where: { brandId: activeBrand.id },
        orderBy: [{ releaseYear: "desc" }, { name: "asc" }],
      })
    : [];

  const activeModel = modelSlug
    ? models.find((m) => m.slug === modelSlug)
    : models[0];

  const prices = activeModel
    ? await db.priceItem.findMany({
        where: { modelId: activeModel.id },
        include: { issue: true },
        orderBy: { issue: { rank: "asc" } },
      })
    : [];

  const rows: EditablePrice[] = prices.map((p) => ({
    id: p.id,
    issueName: p.issue.name,
    price: p.price,
    strikePrice: p.strikePrice,
    etaMinutes: p.etaMinutes,
    warrantyMonths: p.warrantyMonths,
    active: p.active,
  }));

  return (
    <div className="space-y-8">
      <PriceImport action={importPricesAction} />

      <div className="card overflow-hidden">
        <div className="border-b border-surface-line px-5 py-4">
          <h2 className="font-semibold">Edit one model</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Changes go live on the website immediately.
          </p>
        </div>

        <div className="border-b border-surface-line px-5 py-4">
          <p className="label">Brand</p>
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/admin/prices?brand=${brand.slug}`}
                className={`chip border px-3.5 py-1.5 ${
                  activeBrand?.id === brand.id
                    ? "border-brand-300 bg-brand-50 text-brand-700"
                    : "border-surface-line bg-white text-ink-soft"
                }`}
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>

        {activeBrand && (
          <div className="border-b border-surface-line px-5 py-4">
            <label className="label" htmlFor="model-picker">
              Model
            </label>
            <form method="get" className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="brand" value={activeBrand.slug} />
              <select
                id="model-picker"
                name="model"
                defaultValue={activeModel?.slug}
                className="field w-auto py-2"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.slug}>
                    {model.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-ghost px-4 py-2">
                Load prices
              </button>
            </form>
          </div>
        )}

        {rows.length > 0 ? (
          <div>
            {rows.map((row) => (
              <PriceRow key={row.id} row={row} action={updatePriceAction} />
            ))}
          </div>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-ink-muted">
            Pick a brand and model to edit its prices.
          </p>
        )}
      </div>
    </div>
  );
}
