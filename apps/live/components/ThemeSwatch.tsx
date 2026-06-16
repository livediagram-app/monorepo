import type { ThemeDefinition } from '@/lib/themes';

// The preview inside a theme card. Rather than a flat colour dot, it
// renders a miniature diagram scene — two connected nodes with a text
// line + a faint pattern hint — drawn in the theme's actual colours, so
// the card previews what a diagram in this theme looks like, not just
// its palette. Shared by the palette accordion, the welcome / template
// picker, and the Tab Appearance + Explorer theme surfaces so they can't
// drift.
//
// The scene adapts to the theme kind: a single-colour theme draws one
// cohesive look; a multi-colour theme (spec/29) gives each node a branch
// hue; a per-shape theme (UML, spec/42) gives each node its kind's
// colour, so the "different colour per shape" idea reads at a glance.

type Tri = { fill: string; stroke: string; text: string };

// Design-system defaults for a theme that defers its element colours
// (null = "use the built-in shape colours", e.g. Basic) so even those
// preview as a real cyan-on-white diagram rather than a blank box.
const DEFAULT_TRI: Tri = { fill: '#e0f2fe', stroke: '#0ea5e9', text: '#075985' };

function baseTri(theme: ThemeDefinition): Tri {
  return {
    fill: theme.elementFill ?? DEFAULT_TRI.fill,
    stroke: theme.elementStroke ?? DEFAULT_TRI.stroke,
    text: theme.elementText ?? DEFAULT_TRI.text,
  };
}

// Up to three node colour-triples for the scene. Palette themes cycle
// their branch hues; per-shape themes take their first few kind colours
// (each resolved over the base); a single-colour theme repeats its base.
function nodeColours(theme: ThemeDefinition): [Tri, Tri, Tri] {
  const base = baseTri(theme);
  if (theme.palette && theme.palette.length > 0) {
    const p = theme.palette;
    return [p[0]!, p[1 % p.length]!, p[2 % p.length]!];
  }
  if (theme.shapeColors) {
    const entries = Object.values(theme.shapeColors).slice(0, 3);
    const tris = entries.map((e) => ({
      fill: e?.fill ?? base.fill,
      stroke: e?.stroke ?? base.stroke,
      text: e?.text ?? base.text,
    }));
    return [tris[0] ?? base, tris[1] ?? base, tris[2] ?? base];
  }
  return [base, base, base];
}

export function ThemeSwatch({
  theme,
  size = 'sm',
}: {
  theme: ThemeDefinition;
  // 'sm' compact palette grid, 'md' welcome picker, 'lg' the Basic
  // quick-pick card's hero swatch (fills a category-card-sized preview).
  size?: 'sm' | 'md' | 'lg';
}) {
  const boxH = size === 'lg' ? 'h-28' : size === 'md' ? 'h-20' : 'h-9';
  const [c0, c1, c2] = nodeColours(theme);
  const connector = theme.rootColor?.stroke ?? baseTri(theme).stroke;
  const showPattern = theme.backgroundPattern !== 'blank';

  return (
    <span
      aria-hidden
      className={`block ${boxH} w-full overflow-hidden rounded-md border border-slate-200 dark:border-slate-700`}
    >
      <svg
        viewBox="0 0 100 60"
        // `meet`, not `slice`: show the WHOLE scene (the backdrop fills any
        // letterbox) so nothing is clipped on a wide card.
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        style={{ backgroundColor: theme.backgroundColor }}
        role="img"
      >
        <rect x="0" y="0" width="100" height="60" fill={theme.backgroundColor} />

        {/* Faint pattern hint (skipped for blank backdrops). */}
        {showPattern ? (
          <g fill={theme.patternColor} opacity="0.55">
            {[12, 32, 52, 72, 92].map((x) =>
              [10, 26, 42, 58].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.9" />),
            )}
          </g>
        ) : null}

        {/* Connectors first, so the nodes sit on top of the line ends. */}
        <g stroke={connector} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.9">
          <path d="M48 30 H60" />
          <path d="M44 38 V44 H64" />
        </g>

        {/* Node 1: a labelled box (rounded rect + two text bars). */}
        <rect
          x="8"
          y="16"
          width="40"
          height="28"
          rx="4"
          fill={c0.fill}
          stroke={c0.stroke}
          strokeWidth="2.2"
        />
        <rect x="13" y="24" width="27" height="3.4" rx="1.7" fill={c0.text} />
        <rect x="13" y="32" width="18" height="3.4" rx="1.7" fill={c0.text} opacity="0.65" />

        {/* Node 2: a pill / stadium (top right). */}
        <rect
          x="62"
          y="10"
          width="30"
          height="16"
          rx="8"
          fill={c1.fill}
          stroke={c1.stroke}
          strokeWidth="2.2"
        />

        {/* Node 3: a second box (bottom right). */}
        <rect
          x="62"
          y="36"
          width="30"
          height="16"
          rx="3"
          fill={c2.fill}
          stroke={c2.stroke}
          strokeWidth="2.2"
        />
      </svg>
    </span>
  );
}
