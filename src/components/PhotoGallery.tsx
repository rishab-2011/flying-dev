import { PHOTOS } from "@/lib/photos";

/**
 * Real photographs of the workshop and the work.
 *
 * Renders nothing until there is at least one photo, so the page never shows a
 * customer an empty frame. See public/photos/README.md.
 */
export function PhotoGallery() {
  if (PHOTOS.length === 0) return null;

  return (
    <section className="border-y border-surface-line bg-white py-16">
      <div className="container-page">
        <h2 className="text-3xl font-bold tracking-tight">The actual workshop</h2>
        <p className="mt-2 text-ink-muted">
          Our technicians, our tools, our repairs — no stock photos.
        </p>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PHOTOS.map((photo) => (
            <li key={photo.file}>
              <figure>
                <div className="overflow-hidden rounded-2xl border border-surface-line bg-surface-sunk">
                  {/* A plain img: these are photographs the owner drops in, and
                      Next's optimiser would need a build-time import per file. */}
                  <img
                    src={`/photos/${photo.file}`}
                    alt={photo.alt}
                    loading="lazy"
                    className="aspect-[3/2] w-full object-cover"
                  />
                </div>
                {photo.caption && (
                  <figcaption className="mt-2.5 text-sm text-ink-muted">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
