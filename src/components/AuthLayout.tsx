import Link from "next/link";
import { Wordmark } from "./Logo";
import { Icon } from "./Icon";

const REASSURANCE = [
  {
    icon: "shield",
    title: "Six-month warranty",
    body: "On the part and the workmanship. Your booking reference is the record.",
  },
  {
    icon: "rupee",
    title: "Pay after the repair",
    body: "Never an advance. You pay the technician once you've tested the phone.",
  },
  {
    icon: "home",
    title: "We come to you",
    body: "Most repairs happen at your door, in front of you, inside an hour.",
  },
];

/**
 * The frame around sign in and sign up.
 *
 * A lone form floating on an empty page is the thing that makes a site look
 * unfinished. The panel gives the page weight and, more usefully, answers the
 * question someone has while deciding whether to hand over their number. It is
 * hidden below lg — on a phone it would push the form under the fold, and the
 * form is the reason they came.
 */
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const phone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 85879 49104";

  return (
    <div className="container-page py-10 lg:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-surface-line bg-white shadow-card lg:grid-cols-2">
        {/* Form */}
        <div className="p-8 sm:p-10">
          <Link href="/" className="lg:hidden" aria-label="Flying Dev home">
            <Wordmark size={28} />
          </Link>

          <h1 className="mt-8 text-2xl font-bold tracking-tight lg:mt-0">{title}</h1>
          <p className="mb-7 mt-1.5 text-sm leading-relaxed text-ink-muted">{subtitle}</p>

          {children}

          <p className="mt-8 border-t border-surface-line pt-5 text-xs leading-relaxed text-ink-muted">
            Trouble signing in? Call us on{" "}
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="font-semibold text-brand-600 hover:underline"
            >
              {phone}
            </a>{" "}
            — you don't need an account to book a repair or to{" "}
            <Link href="/track" className="font-semibold text-brand-600 hover:underline">
              track one
            </Link>
            .
          </p>
        </div>

        {/* Reassurance panel */}
        <aside className="hidden bg-ink p-10 text-white lg:block">
          <Link href="/" aria-label="Flying Dev home">
            <span className="inline-flex items-center gap-2.5">
              <svg width="30" height="30" viewBox="0 0 40 40" aria-hidden="true">
                <rect width="40" height="40" rx="11" fill="#2F5BEA" />
                <path d="M9 14.5h17.5L21 20H9v-5.5z" fill="#fff" />
                <path d="M9 22h13l-5.5 5.5H9V22z" fill="#FFB020" />
                <path d="M27.5 20.8 33 15.2v11.2l-5.5-5.6z" fill="#fff" fillOpacity=".55" />
              </svg>
              <span className="text-lg font-extrabold tracking-tight">
                Flying<span className="text-brand-300">Dev</span>
              </span>
            </span>
          </Link>

          <p className="mt-10 text-xl font-semibold leading-snug">
            Doorstep phone repair across Delhi NCR.
          </p>

          <ul className="mt-9 space-y-7">
            {REASSURANCE.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-300">
                  <Icon name={item.icon} className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-semibold">{item.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-white/60">
                    {item.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-10 border-t border-white/10 pt-6 text-sm text-white/50">
            Delhi · Noida · Greater Noida · Ghaziabad · Gurugram · Faridabad
          </p>
        </aside>
      </div>
    </div>
  );
}
