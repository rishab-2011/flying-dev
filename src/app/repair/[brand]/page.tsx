import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ModelSearch, type SearchableModel } from "@/components/ModelSearch";

type Props = { params: Promise<{ brand: string }> };

export async function generateStaticParams() {
  const brands = await db.brand.findMany({ select: { slug: true } });
  return brands.map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = await db.brand.findUnique({ where: { slug } });
  if (!brand) return {};
  return {
    title: `${brand.name} repair in Delhi NCR — prices for every model`,
    description: `Screen, battery and charging-port repair prices for ${brand.name} phones. Doorstep service across Delhi NCR with a 6-month warranty.`,
    alternates: { canonical: `/repair/${slug}` },
  };
}

export default async function BrandPage({ params }: Props) {
  const { brand: slug } = await params;

  const brand = await db.brand.findUnique({
    where: { slug },
    include: {
      models: {
        orderBy: [{ releaseYear: "desc" }, { name: "asc" }],
        include: {
          prices: {
            where: { issue: { slug: "screen" }, active: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!brand) notFound();

  const models: SearchableModel[] = brand.models.map((model) => ({
    id: model.id,
    name: model.name,
    slug: model.slug,
    screenPrice: model.prices[0]?.price ?? null,
  }));

  return (
    <div className="container-page py-12">
      <nav className="text-sm text-ink-muted">
        <Link href="/" className="hover:text-brand-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/repair" className="hover:text-brand-600">
          Repair
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{brand.name}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        {brand.name} repair prices
      </h1>
      <p className="mt-2 text-ink-muted">
        Find your model to see every repair we offer and what each one costs.
      </p>

      <ModelSearch
        brandSlug={brand.slug}
        brandName={brand.name}
        models={models}
      />

      <div className="card mt-10 flex flex-wrap items-center justify-between gap-4 p-6">
        <p className="text-sm text-ink-muted">
          Your {brand.name} model isn't on the list?
        </p>
        <Link href="/quote" className="btn-ghost">
          Request a quote
        </Link>
      </div>
    </div>
  );
}
