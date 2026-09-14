import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/siteUrl";

/**
 * The sitemap is the whole point of having 191 model pages.
 *
 * Each one targets a search someone actually types — "iphone 13 screen
 * replacement price delhi" — but Google has no way to discover them by
 * crawling, because nothing links to most of them from the home page. This
 * hands over the full list.
 *
 * Private routes are excluded here and disallowed in robots.ts: /account,
 * /admin, /book and /track hold customer data or are useless without state.
 */
export const revalidate = 86400; // a day; the catalogue changes rarely

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/repair`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/reviews`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/quote`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const brands = await db.brand.findMany({
    select: { slug: true },
    orderBy: { rank: "asc" },
  });

  const models = await db.model.findMany({
    where: { prices: { some: { active: true } } },
    select: { slug: true, brand: { select: { slug: true } } },
  });

  return [
    ...staticPages,
    ...brands.map((brand) => ({
      url: `${base}/repair/${brand.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...models.map((model) => ({
      url: `${base}/repair/${model.brand.slug}/${model.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
