/**
 * A generic phone with the selected faults marked on it.
 *
 * The issue list names parts; this shows where they are. Someone who knows the
 * charging cable has to be wiggled does not necessarily know that is "charging
 * port", and a diagram answers that faster than a blurb. It also gives the
 * estimate panel something to look at before anything is selected, where it
 * previously held one line of grey text.
 *
 * Deliberately not any particular handset: a rounded slab with a camera and a
 * port is every phone and no phone, which keeps it honest for all 191 models
 * and clear of anyone's trade dress.
 *
 * Parts inside the case (battery, board) are drawn only when selected, dashed
 * and over a dimmed screen, so they read as internal rather than as something
 * printed on the glass.
 */
const MUTED = "#E4E9F2";
const BRAND = "#2F5BEA";
const BRAND_SOFT = "#EEF2FF";

/**
 * Every issue slug in the catalogue maps to somewhere on the device.
 *
 * These are the slugs, not the icon names -- four of them differ
 * (charging-port, back-panel, speaker-mic, water-damage), and using the icon
 * names silently highlights nothing for those four.
 */
const LABELS: Record<string, string> = {
  screen: "the screen",
  battery: "the battery, inside the case",
  "charging-port": "the charging port on the bottom edge",
  camera: "the camera",
  "speaker-mic": "the speaker or microphone",
  "back-panel": "the back panel",
  motherboard: "the logic board, inside the case",
  "water-damage": "the whole device, after water damage",
  software: "the software on the device",
};

export function DeviceDiagram({
  highlight = [],
  className = "",
}: {
  highlight?: string[];
  className?: string;
}) {
  const on = (part: string) => highlight.includes(part);
  const stroke = (part: string) => (on(part) ? BRAND : MUTED);
  const fill = (part: string) => (on(part) ? BRAND_SOFT : "#FFFFFF");

  const named = highlight.map((h) => LABELS[h]).filter(Boolean);
  const label =
    named.length > 0
      ? `Diagram of a phone highlighting ${named.join(", ")}`
      : "Diagram of a phone";

  // Internal parts dim the glass so they read as being under it.
  const showingInternals = on("battery") || on("motherboard");

  return (
    <svg viewBox="0 0 160 300" className={className} role="img" aria-label={label}>
      {/* Body */}
      <rect
        x="10"
        y="10"
        width="140"
        height="280"
        rx="22"
        fill={on("water-damage") ? BRAND_SOFT : "#FFFFFF"}
        stroke={on("back-panel") || on("water-damage") ? BRAND : MUTED}
        strokeWidth={on("back-panel") || on("water-damage") ? 3 : 2}
      />

      {/* Screen */}
      <rect
        x="20"
        y="32"
        width="120"
        height="228"
        rx="10"
        fill={on("screen") ? BRAND_SOFT : showingInternals ? "#F5F7FC" : "#FFFFFF"}
        stroke={stroke("screen")}
        strokeWidth={on("screen") ? 3 : 2}
      />

      {/* A crack, only when the screen is the thing being repaired. */}
      {on("screen") && (
        <path
          d="M52 70l24 34-14 18 30 40-16 26"
          fill="none"
          stroke={BRAND}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Internals: drawn over the dimmed glass, dashed to read as inside. */}
      {on("motherboard") && (
        <rect
          x="38" y="48" width="84" height="56" rx="6"
          fill="none" stroke={BRAND} strokeWidth="2.5" strokeDasharray="5 4"
        />
      )}
      {on("battery") && (
        <rect
          x="38" y="124" width="84" height="108" rx="8"
          fill="none" stroke={BRAND} strokeWidth="2.5" strokeDasharray="5 4"
        />
      )}

      {/* Earpiece speaker */}
      <rect
        x="62" y="19" width="36" height="6" rx="3"
        fill={fill("speaker-mic")} stroke={stroke("speaker-mic")} strokeWidth={on("speaker-mic") ? 2.5 : 2}
      />

      {/* Camera */}
      <circle
        cx="112" cy="22" r="5"
        fill={fill("camera")} stroke={stroke("camera")} strokeWidth={on("camera") ? 2.5 : 2}
      />

      {/* Charging port */}
      <rect
        x="66" y="275" width="28" height="7" rx="3.5"
        fill={fill("charging-port")} stroke={stroke("charging-port")} strokeWidth={on("charging-port") ? 2.5 : 2}
      />

      {/* Software has no location, so it is shown on the glass. */}
      {on("software") && (
        <path
          d="M64 132l-12 14 12 14m32-28l12 14-12 14m-20 10l8-48"
          fill="none" stroke={BRAND} strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round"
        />
      )}

      {/* Water damage: a droplet over the body. */}
      {on("water-damage") && (
        <path
          d="M80 120s22 24 22 38a22 22 0 1 1-44 0c0-14 22-38 22-38Z"
          fill="#FFFFFF" fillOpacity=".75" stroke={BRAND} strokeWidth="2.5"
        />
      )}
    </svg>
  );
}
