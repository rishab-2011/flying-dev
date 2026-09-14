/**
 * Real photographs of the business, shown on the home page.
 *
 * The gallery renders nothing while this list is empty, so the site never
 * displays placeholder boxes to a customer. Add files to public/photos/ and
 * list them here; see public/photos/README.md for what to shoot.
 *
 * Use your own photographs. Stock images of someone else's technician are
 * recognisable as stock and undo the trust the section is meant to build.
 */
export type Photo = {
  /** File in public/photos/, e.g. "technician.jpg" */
  file: string;
  /** Describes the image for screen readers and when it fails to load. */
  alt: string;
  /** Optional line shown under the photo. */
  caption?: string;
};

export const PHOTOS: Photo[] = [
  // {
  //   file: "screen-replacement.jpg",
  //   alt: "A technician fitting a new screen to an iPhone on a workbench",
  //   caption: "Screen replacement, done at your door",
  // },
];
