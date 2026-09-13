import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Track your booking" };

async function findBooking(formData: FormData) {
  "use server";
  const ref = String(formData.get("ref") ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s/g, "");
  // Customers often type just the code, without the FD- prefix.
  const normalised = ref.startsWith("FD-") ? ref : `FD-${ref}`;
  redirect(`/track/${encodeURIComponent(normalised)}`);
}

export default function TrackPage() {
  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold tracking-tight">Track your repair</h1>
        <p className="mb-6 mt-1.5 text-sm text-ink-muted">
          Enter the booking reference we sent you, for example FD-7K2QX9.
        </p>

        <form action={findBooking} className="space-y-4">
          <div>
            <label className="label" htmlFor="ref">
              Booking reference
            </label>
            <input
              id="ref"
              name="ref"
              className="field uppercase"
              placeholder="FD-7K2QX9"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Track booking
          </button>
        </form>
      </div>
    </div>
  );
}
