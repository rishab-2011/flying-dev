import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { rupees, formatSlot, modeLabel } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { logoutAction, updateProfileAction, changePasswordAction } from "../auth-actions";
import { ProfileForm, PasswordForm } from "@/components/AccountSettings";

export const metadata: Metadata = { title: "My bookings" };

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");

  const account = await db.user.findUnique({ where: { id: user.id } });
  if (!account) redirect("/login");

  const bookings = await db.booking.findMany({
    where: { OR: [{ userId: user.id }, { customerPhone: user.phone }] },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hi {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-ink-muted">{user.phone}</p>
        </div>
        <form action={logoutAction}>
          <button className="btn-ghost px-4 py-2">Sign out</button>
        </form>
      </div>

      {bookings.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-ink-soft">You haven't booked a repair yet.</p>
          <Link href="/repair" className="btn-primary mt-5">
            Book your first repair
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {bookings.map((b) => (
            <li key={b.id} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{b.deviceLabel}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {b.items.map((i) => i.issueName).join(" · ")}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>

              <dl className="mt-5 grid gap-4 border-t border-surface-line pt-5 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-ink-muted">Booking</dt>
                  <dd className="mt-0.5 font-medium">{b.ref}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Slot</dt>
                  <dd className="mt-0.5 font-medium">{formatSlot(b.slotDate, b.slotWindow)}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Service</dt>
                  <dd className="mt-0.5 font-medium">{modeLabel(b.mode)}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Estimate</dt>
                  <dd className="mt-0.5 font-semibold">{rupees(b.totalAmount)}</dd>
                </div>
              </dl>

              <Link
                href={`/track/${b.ref}`}
                className="mt-5 inline-block text-sm font-semibold text-brand-600 hover:underline"
              >
                Track this repair →
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-14 space-y-6">
        <h2 className="text-xl font-bold tracking-tight">Settings</h2>
        <ProfileForm
          action={updateProfileAction}
          defaults={{
            name: account.name,
            phone: account.phone,
            email: account.email ?? "",
          }}
        />
        <PasswordForm action={changePasswordAction} />
      </div>
    </div>
  );
}
