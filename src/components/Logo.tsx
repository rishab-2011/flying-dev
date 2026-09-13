/**
 * The Flying Dev mark: a wing cut from a rounded tile, with the lower feather
 * offset in amber so it reads as motion — fast repair, device back in your hand.
 */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      role="img"
      aria-label="Flying Dev"
    >
      <rect width="40" height="40" rx="11" fill="url(#fd-grad)" />
      <path d="M9 14.5h17.5L21 20H9v-5.5z" fill="white" />
      <path d="M9 22h13l-5.5 5.5H9V22z" fill="#FFB020" />
      <path d="M27.5 20.8 33 15.2v11.2l-5.5-5.6z" fill="white" fillOpacity=".55" />
      <defs>
        <linearGradient id="fd-grad" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#2F5BEA" />
          <stop offset="1" stopColor="#17359C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Wordmark({ size = 32 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Logo size={size} />
      <span className="text-lg font-extrabold tracking-tight text-ink">
        Flying<span className="text-brand-500">Dev</span>
      </span>
    </span>
  );
}
