/**
 * Emits JSON-LD. Search engines read it; nobody sees it.
 *
 * Everything passed here is a claim the business is making to Google, so it
 * must match what the site actually says. Never assert a rating, a review
 * count, an address or an opening hour that isn't real.
 */
export function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
