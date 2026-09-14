/**
 * Hand-drawn repair scene, used where the page needs something to look at.
 *
 * Deliberately an illustration rather than a stock photograph: a photo of a
 * stranger presented as "our technician" is the sort of thing customers notice,
 * and it costs more trust than the visual gains. Real photos of the real
 * workshop go in the gallery below (see src/lib/photos.ts) and should replace
 * this as soon as there are any.
 */
export function RepairIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 300"
      className={className}
      role="img"
      aria-label="Illustration of a phone with a cracked screen being repaired with a screwdriver"
    >
      <defs>
        <linearGradient id="ri-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EEF2FF" />
          <stop offset="1" stopColor="#DDE4FF" />
        </linearGradient>
        <linearGradient id="ri-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2F5BEA" />
          <stop offset="1" stopColor="#17359C" />
        </linearGradient>
      </defs>

      {/* Soft ground so the objects don't float */}
      <ellipse cx="210" cy="268" rx="150" ry="16" fill="#0B1220" opacity=".06" />

      {/* The phone, tilted slightly as it would sit on a bench */}
      <g transform="rotate(-8 190 150)">
        <rect x="126" y="42" width="128" height="216" rx="20" fill="url(#ri-body)" />
        <rect x="134" y="50" width="112" height="200" rx="14" fill="url(#ri-screen)" />
        <rect x="168" y="56" width="44" height="7" rx="3.5" fill="#17359C" opacity=".35" />

        {/* Crack, radiating from a corner impact the way they actually break */}
        <g stroke="#17359C" strokeWidth="1.6" strokeLinecap="round" opacity=".75" fill="none">
          <path d="M232 70 L196 104 L204 142 L176 170 L186 214" />
          <path d="M196 104 L156 96" />
          <path d="M204 142 L242 150" />
          <path d="M176 170 L142 158" />
          <path d="M186 214 L230 226" />
          <path d="M196 104 L214 62" />
        </g>
        <circle cx="232" cy="70" r="4" fill="#17359C" opacity=".5" />
      </g>

      {/* Replacement panel, waiting to go in */}
      <g transform="rotate(12 330 120)">
        <rect x="296" y="60" width="68" height="122" rx="11" fill="#FFFFFF" stroke="#E4E9F2" strokeWidth="2" />
        <rect x="303" y="67" width="54" height="108" rx="7" fill="#F5F7FC" />
        <path d="M312 128 l12 12 l22 -26" stroke="#22A06B" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Screwdriver */}
      <g transform="rotate(38 96 196)">
        <rect x="70" y="182" width="74" height="16" rx="8" fill="#FFB020" />
        <rect x="140" y="186" width="40" height="8" rx="3" fill="#8C99AD" />
        <rect x="178" y="187" width="14" height="6" rx="2" fill="#5B6779" />
        <path d="M78 186 h58" stroke="#F59300" strokeWidth="2.5" strokeLinecap="round" opacity=".8" />
      </g>

      {/* Two loose screws */}
      <circle cx="288" cy="238" r="5.5" fill="#8C99AD" />
      <path d="M285 238 h6" stroke="#5B6779" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="312" cy="252" r="4.5" fill="#8C99AD" />
      <path d="M310 252 h4" stroke="#5B6779" strokeWidth="1.4" strokeLinecap="round" />

      {/* Sparkles, to read as "fixed" rather than "broken" */}
      <g fill="#FFB020">
        <path d="M352 32 l3.5 8 8 3.5 -8 3.5 -3.5 8 -3.5 -8 -8 -3.5 8 -3.5Z" />
        <path d="M96 74 l2.5 5.5 5.5 2.5 -5.5 2.5 -2.5 5.5 -2.5 -5.5 -5.5 -2.5 5.5 -2.5Z" opacity=".75" />
      </g>
    </svg>
  );
}
