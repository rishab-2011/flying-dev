import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { logoutAction } from "../auth-actions";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/prices", label: "Prices" },
  { href: "/admin/areas", label: "Pincodes" },
  { href: "/admin/quotes", label: "Quote requests" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/account");

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flying Dev admin</h1>
          <p className="mt-1 text-sm text-ink-muted">Signed in as {user.name}</p>
        </div>
        <form action={logoutAction}>
          <button className="btn-ghost px-4 py-2">Sign out</button>
        </form>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2 border-b border-surface-line pb-4">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-white hover:text-brand-600"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}
