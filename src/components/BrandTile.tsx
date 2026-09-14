import Link from "next/link";
import { brandLogo } from "@/lib/brandLogos";

/**
 * A brand in the picker. Shows the official logo when one has been supplied,
 * otherwise the brand name — which is a complete tile in its own right, so
 * logos can be added one brand at a time without the grid looking half-done.
 */
export function BrandTile({
  name,
  slug,
  modelCount,
}: {
  name: string;
  slug: string;
  modelCount: number;
}) {
  const logo = brandLogo(slug);

  return (
    <Link
      href={`/repair/${slug}`}
      className="group flex flex-col items-center justify-center rounded-xl border border-surface-line px-4 py-4 text-center transition hover:border-brand-300 hover:bg-brand-50"
    >
      {logo ? (
        <img
          src={logo}
          alt={name}
          loading="lazy"
          className="h-7 w-auto max-w-[7rem] object-contain"
        />
      ) : (
        <p className="text-sm font-semibold group-hover:text-brand-700">{name}</p>
      )}
      <p className="mt-1 text-xs text-ink-muted">{modelCount} models</p>
    </Link>
  );
}
