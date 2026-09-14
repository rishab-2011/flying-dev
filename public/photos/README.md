# Photographs

Drop your photos in this folder, then list them in `src/lib/photos.ts`. The
gallery on the home page appears as soon as there is at least one.

## What to shoot

Five or six is plenty. A phone camera in daylight is fine — these should look
like your actual workshop, not a stock library.

1. **Your technician working on a phone.** Hands, tools, a device mid-repair.
   The single most useful image on the site.
2. **A close-up of a repair in progress** — screen off, internals visible.
   This is the one that says "we actually know how".
3. **New parts in their packaging.** Backs up the genuine-parts claim.
4. **Your workbench or workshop**, tidy, with tools visible.
5. **You.** A plain portrait. People trust a business with a face.
6. **A before and after**, if you have one — cracked, then not.

## Practical notes

- **Landscape, roughly 3:2.** The gallery crops to that shape.
- **Around 1600px wide**, saved as JPEG. Bigger files slow the page down on
  mobile data, which is most of your traffic.
- **No customer faces, and no visible IMEI, phone numbers or addresses** —
  including anything on a screen in shot.
- Name files plainly: `technician-screen.jpg`, `workbench.jpg`.

## Adding them

```ts
export const PHOTOS: Photo[] = [
  {
    file: "technician-screen.jpg",
    alt: "A technician fitting a new screen to an iPhone on a workbench",
    caption: "Screen replacement at a customer's home in Gurugram",
  },
];
```

`alt` matters: it is read aloud to blind visitors, shown if the image fails on a
slow connection, and read by Google. Describe what is happening, not "photo".
