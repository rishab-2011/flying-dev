/**
 * Official brand logos for the brand picker.
 *
 * Empty by default, and the tiles fall back to the brand name set in type —
 * which is a perfectly good tile, not a broken one. Add files to
 * public/brands/ and map them here; see public/brands/README.md, including the
 * trademark position before you do.
 */
export const BRAND_LOGOS: Record<string, string> = {
  // "apple": "apple.svg",
  // "samsung": "samsung.svg",
};

export function brandLogo(slug: string): string | null {
  const file = BRAND_LOGOS[slug];
  return file ? `/brands/${file}` : null;
}
