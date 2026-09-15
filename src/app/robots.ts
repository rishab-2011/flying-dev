import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing here helps a searcher, and some of it holds customer data.
      disallow: [
        "/admin",
        "/account",
        "/book",
        "/track",
        "/login",
        "/signup",
        // Machine endpoints. /api/health is meant for uptime monitors, and a
        // crawler indexing it wastes crawl budget on a page no one searches for.
        "/api",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
