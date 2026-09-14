# Brand logos

Drop logo files here and map them in `src/lib/brandLogos.ts`. Any brand without
one keeps its text tile, which looks deliberate rather than broken — so you can
add them one at a time.

## Before you add them: the trademark position

These logos belong to the manufacturers, not to you. Using them to identify
devices you repair is generally accepted as *nominative use* — the same reason
a garage may say it services Toyotas — and it is what every large repair
business in India does.

What keeps it nominative:

- Use the logo **only** to say which devices you repair.
- **Never** imply endorsement, partnership, or authorisation. You are an
  independent repair service, and the site says so on `/terms` and `/faq`.
  Don't undo that with a logo placed to look like a badge of approval.
- Don't alter the logos — no recolouring, no adding your own mark to them.
- Don't put them beside your own logo in a way that reads as a joint venture.

If a manufacturer ever asks you to stop, delete the file and remove the line
from `brandLogos.ts`. The tile reverts to text and nothing breaks.

## Where to get the files

Use the official ones, from each brand's own newsroom or brand-assets page —
not an image search, where you'll get outdated logos, wrong colours, and files
with someone's watermark. Search "<brand> brand assets" or "<brand> newsroom".

## Format

- **SVG** where offered — sharp at every size and a fraction of the weight.
  PNG with a transparent background otherwise, about 240px wide.
- Logos with their own coloured background (some brands supply these) look
  wrong on a white tile; take the plain version.
- Name files by the brand slug used in the catalogue: `apple.svg`,
  `samsung.svg`, `oneplus.svg`, `xiaomi.svg`, `realme.svg`, `vivo.svg`,
  `oppo.svg`, `google.svg`, `motorola.svg`, `nothing.svg`.

## Adding them

```ts
export const BRAND_LOGOS: Record<string, string> = {
  apple: "apple.svg",
  samsung: "samsung.svg",
};
```
