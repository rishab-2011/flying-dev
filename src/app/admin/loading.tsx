import { FunnelSkeleton } from "@/components/Skeleton";

/**
 * Loading skeletons live here and NOT under /repair.
 *
 * A loading.tsx makes Next stream the route it covers, and streaming flushes
 * the HTTP status before the page body runs — so a page that then calls
 * notFound() returns 200 with 404 content. Google indexes that as a real page.
 * Every route under /repair can 404 on an unknown brand or model, so a skeleton
 * anywhere in that subtree — parent segment included — breaks all of them.
 *
 * Admin pages never call notFound(), and their lists are the slowest queries in
 * the app, so this is where a skeleton actually earns its place.
 *
 * tests/e2e.mjs asserts an unknown model returns 404. Don't add loading.tsx to
 * the funnel to make it feel faster; you'll trade a real SEO problem for it.
 */
export default function Loading() {
  return <FunnelSkeleton />;
}
