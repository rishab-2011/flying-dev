import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { rupees } from "@/lib/format";
import { IssueSelector, type SelectableIssue } from "@/components/IssueSelector";
import { Icon } from "@/components/Icon";
import { StructuredData } from "@/components/StructuredData";
import { BUSINESS } from "@/lib/business";

type Props = { params: Promise<{ brand: string; model: string }> };

async function loadModel(brandSlug: string, modelSlug: string) {
  return db.model.findFirst({
    where: { slug: modelSlug, brand: { slug: brandSlug } },
    include: {
      brand: true,
      prices: {
        where: { active: true },
        include: { issue: true },
        orderBy: { issue: { rank: "asc" } },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand, model: modelSlug } = await params;
  const model = await loadModel(brand, modelSlug);
  if (!model) return {};

  const screen = model.prices.find((p) => p.issue.slug === "screen");
  const label = `${model.brand.name} ${model.name}`.replace(/^Apple /, "");

  return {
    title: `${label} repair price in Delhi NCR`,
    description: screen
      ? `${label} screen replacement from ${rupees(screen.price)}, plus battery, charging port and camera repairs. Doorstep service across Delhi NCR with a 6-month warranty.`
      : `${label} repair at your doorstep across Delhi NCR, with a 6-month warranty.`,
    alternates: { canonical: `/repair/${brand}/${modelSlug}` },
  };
}

export default async function ModelPage({ params }: Props) {
  const { brand: brandSlug, model: modelSlug } = await params;
  const model = await loadModel(brandSlug, modelSlug);
  if (!model) notFound();

  const label = `${model.brand.name} ${model.name}`.replace(/^Apple /, "");

  // One Service per page, with a real offer for each repair. These are the
  // prices actually shown below — a search result quoting a price the page
  // doesn't honour is worse than no rich result at all.
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: `${label} repair`,
    name: `${label} repair in Delhi NCR`,
    provider: {
      "@type": "ProfessionalService",
      name: BUSINESS.name,
      telephone: BUSINESS.phone,
      url: BUSINESS.url,
    },
    areaServed: BUSINESS.cities.map((city) => ({ "@type": "City", name: city })),
    offers: model.prices.map((p) => ({
      "@type": "Offer",
      name: `${p.issue.name} — ${label}`,
      price: p.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${BUSINESS.url}/repair/${model.brand.slug}/${model.slug}`,
      warranty: {
        "@type": "WarrantyPromise",
        durationOfWarranty: {
          "@type": "QuantitativeValue",
          value: p.warrantyMonths,
          unitCode: "MON",
        },
      },
    })),
  };

  const issues: SelectableIssue[] = model.prices.map((p) => ({
    id: p.id,
    slug: p.issue.slug,
    name: p.issue.name,
    blurb: p.issue.blurb,
    icon: p.issue.icon,
    price: p.price,
    strikePrice: p.strikePrice,
    etaMinutes: p.etaMinutes,
    warrantyMonths: p.warrantyMonths,
  }));

  return (
    <div className="container-page py-12">
      <StructuredData data={service} />

      <nav className="text-sm text-ink-muted">
        <Link href="/repair" className="hover:text-brand-600">
          Repair
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/repair/${model.brand.slug}`} className="hover:text-brand-600">
          {model.brand.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{model.name}</span>
      </nav>

      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight">{label} repair</h1>
        <p className="mt-2 max-w-2xl text-ink-muted">
          Fixed prices with genuine-grade parts, a 6-month warranty, and a
          technician who comes to your address across Delhi NCR.
        </p>

        <ul className="mt-5 flex flex-wrap gap-4 text-sm text-ink-soft">
          <li className="flex items-center gap-2">
            <Icon name="shield" className="h-4 w-4 text-brand-500" />6-month warranty
          </li>
          <li className="flex items-center gap-2">
            <Icon name="home" className="h-4 w-4 text-brand-500" />Doorstep or pickup
          </li>
          <li className="flex items-center gap-2">
            <Icon name="rupee" className="h-4 w-4 text-brand-500" />Pay after the repair
          </li>
        </ul>
      </header>

      <div className="mt-10">
        <IssueSelector modelId={model.id} modelLabel={label} issues={issues} />
      </div>

      <p className="mt-10 max-w-3xl text-sm leading-relaxed text-ink-muted">
        Prices shown are estimates for the {label}. The technician confirms the
        final price after inspecting the device — if it differs, you can cancel
        at no charge. Water damage and motherboard faults are always quoted after
        diagnosis.
      </p>
    </div>
  );
}
