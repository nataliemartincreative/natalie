import type { TechniqueSlug } from "@/content/portfolio";

/*
 * Line drawings of each packaging format: an isometric tray or carton, with
 * the branded part (band, sleeve, window, card) shaded. Coordinates are in a
 * 200 × 130 box; strokes use currentColor so they follow the text color.
 */

// Shallow tray used by the band and sleeve drawings.
const TRAY = (
  <>
    <path d="M40 50 120 30 170 55 90 75Z" />
    <path d="M40 50 90 75 90 100 40 75Z" />
    <path d="M90 75 170 55 170 80 90 100Z" />
  </>
);

/** A band around the short side of the tray, from t0 to t1 along its length. */
function Band({ t0, t1 }: { t0: number; t1: number }) {
  const along = (x: number, y: number, t: number) => [x + 80 * t, y - 20 * t] as const;
  const [p1x, p1y] = along(40, 50, t0);
  const [p2x, p2y] = along(40, 50, t1);
  const [q1x, q1y] = along(90, 75, t0);
  const [q2x, q2y] = along(90, 75, t1);
  return (
    <g className="band">
      <path d={`M${p1x} ${p1y} ${p2x} ${p2y} ${q2x} ${q2y} ${q1x} ${q1y}Z`} />
      <path d={`M${q1x} ${q1y} ${q2x} ${q2y} ${q2x} ${q2y + 25} ${q1x} ${q1y + 25}Z`} />
    </g>
  );
}

const ART: Record<TechniqueSlug, React.ReactNode> = {
  bellyband: (
    <>
      {TRAY}
      <Band t0={0.42} t1={0.58} />
    </>
  ),
  "color-sleeve": (
    <>
      {TRAY}
      <Band t0={0.12} t1={0.88} />
    </>
  ),
  "four-way-band": (
    <>
      {TRAY}
      <Band t0={0.42} t1={0.58} />
      {/* Second band along the length, over the top and down the near end. */}
      <g className="band">
        <path d="M61 60.5 141 40.5 149 44.5 69 64.5Z" />
        <path d="M61 60.5 69 64.5 69 89.5 61 85.5Z" />
      </g>
    </>
  ),
  "window-box": (
    <>
      <path d="M50 40 120 25 160 45 90 60Z" />
      <path d="M50 40 90 60 90 120 50 100Z" />
      <path d="M90 60 160 45 160 105 90 120Z" className="band" />
      <path d="M104 72 146 63 146 90 104 99Z" className="window" />
      <path d="M112 86 138 80" />
    </>
  ),
  "insert-card": (
    <>
      <rect x="58" y="28" width="84" height="80" className="band" />
      <path d="M72 46h40M72 54h28M72 88h22" />
      <rect x="46" y="18" width="108" height="100" rx="10" strokeDasharray="4 4" />
    </>
  ),
};

export function TechniqueArt({ slug, className = "" }: { slug: TechniqueSlug; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 130"
      className={`[&_.band]:fill-current/12 [&_.window]:fill-paper ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden
    >
      {ART[slug]}
    </svg>
  );
}
