/** Line icons for the issue picker and trust strip. Stroke-based, 24px grid. */
const PATHS: Record<string, string> = {
  screen: "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 6 6 6m0-6-6 6",
  battery: "M3 8h13a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Zm18 2v4M6 10l3 4m0-4-3 4",
  charging: "M12 2 6 13h5l-1 9 7-12h-5l1-8Z",
  camera: "M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm8 3.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z",
  speaker: "M11 5 6 9H3v6h3l5 4V5Zm4.5 3a5 5 0 0 1 0 8m3-11a9 9 0 0 1 0 14",
  water: "M12 3s6 6.5 6 10.5a6 6 0 1 1-12 0C6 9.5 12 3 12 3Z",
  back: "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 4h4M9 12h6m-6 5h3",
  motherboard: "M4 4h16v16H4V4Zm4 4h8v8H8V8ZM2 9h2m-2 6h2m16-6h2m-2 6h2M9 2v2m6-2v2M9 20v2m6-2v2",
  software: "M8 6 3 12l5 6m8-12 5 6-5 6m-6 2 4-16",
  wrench: "M20 5a5 5 0 0 1-6.6 4.7L5.4 17.7a2 2 0 1 1-2.8-2.8l8-8A5 5 0 0 1 17 3l-3 3 2 2 3-3c.6.6 1 1.3 1 2Z",
  shield: "M12 2 4 5v7c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V5l-8-3Zm-3 9 2.5 2.5L16 9",
  home: "M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5Z",
  clock: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 4v5l3.5 2",
  rupee: "M7 4h10M7 9h10M16 4c0 3.5-2.6 5-6 5l7 10",
  phone: "M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 6.2 2 2 0 0 1 5 4h1.5Z",
  search: "M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm5 12 4.5 4.5",
  pin: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Zm0-8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z",
};

export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name] ?? PATHS.wrench} />
    </svg>
  );
}
