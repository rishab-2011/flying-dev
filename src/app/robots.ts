import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing here helps a searcher, and some of it holds customer data.
      disallow: ["/admin", "/account", "/book", "/track", "/login", "/signup"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
