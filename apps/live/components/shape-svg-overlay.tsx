import type { ShapeKind } from '@livediagram/diagram';

// Shape-shape SVG primitives, used by both BoxedElementView (the
// canvas-rendered element) and Canvas (the in-progress draw
// preview). Lifted out of BoxedElementView.tsx (was 1159 lines) so
// the element-view file is scoped to selection / drag / overlay
// composition and these two presentational primitives can be
// imported by anything that needs to paint a shape outline at any
// rect size.

// Shapes that draw themselves via an inner SVG overlay rather than
// relying on the wrapper's border / background. The CSS-rendered
// set are the ones where a border + border-radius produces the
// right geometry at any aspect ratio without distortion:
//   - square: rounded rectangle
//   - circle: border-radius 50% (forced 1:1 so it stays a circle)
//   - stadium: border-radius 9999px, always semicircular ends
export function isSvgRenderedShape(kind: ShapeKind): boolean {
  return kind !== 'square' && kind !== 'circle' && kind !== 'stadium';
}

export function ShapeSvgOverlay({
  shape,
  fill,
  stroke,
  strokeWidth = 2,
  strokeDasharray,
}: {
  shape: ShapeKind;
  fill: string;
  stroke: string;
  strokeWidth?: number;
  // SVG dasharray string when the user picked a dashed / dotted
  // border style; undefined for solid (the default, omits the attr).
  strokeDasharray?: string;
}) {
  if (shape === 'actor') {
    // UML actor: an open circle head (the fill colour tints it) over a
    // line body, arms and legs. The viewBox is taller than wide and
    // leaves a small clear band below the legs (y 112..130) for the
    // label: the original 0..150 height left a 38-unit empty band
    // that read as wasted padding under bare stickmen. `meet` keeps
    // the figure proportional and centred at any size.
    return (
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 90 130"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <g
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        >
          <circle cx={45} cy={22} r={16} fill={fill} />
          <path d="M 45 38 L 45 82" />
          <path d="M 16 56 L 74 56" />
          <path d="M 45 82 L 22 112" />
          <path d="M 45 82 L 68 112" />
        </g>
      </svg>
    );
  }
  const common = {
    fill,
    stroke,
    strokeWidth,
    // strokeDasharray propagates so the user's dashed / dotted
    // pick affects the main outline path of every SVG-rendered
    // shape (diamond / cylinder / hexagon / device frames...).
    // The chrome details inside the device frames (the URL pill,
    // window dots, etc.) keep their own stroke setup and stay
    // solid, which reads correctly: a dotted browser frame still
    // has a solid URL bar inside it.
    strokeDasharray,
    vectorEffect: 'non-scaling-stroke' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {shape === 'diamond' ? <polygon points="50,0 100,50 50,100 0,50" {...common} /> : null}
      {shape === 'parallelogram' ? <polygon points="20,0 100,0 80,100 0,100" {...common} /> : null}
      {shape === 'hexagon' ? (
        <polygon points="25,0 75,0 100,50 75,100 25,100 0,50" {...common} />
      ) : null}
      {shape === 'document' ? (
        <path d="M 0 0 L 100 0 L 100 78 C 80 95, 65 65, 50 80 C 35 95, 20 65, 0 80 Z" {...common} />
      ) : null}
      {shape === 'cylinder' ? (
        <g>
          <path d="M 0 15 L 100 15 L 100 85 A 50 12 0 0 1 0 85 Z" {...common} />
          <ellipse cx={50} cy={15} rx={50} ry={12} {...common} />
        </g>
      ) : null}
      {shape === 'cloud' ? (
        <path
          d="M 30 80 C 14 80, 7 64, 18 55 C 11 42, 26 31, 37 38 C 41 21, 67 19, 70 38 C 84 31, 96 46, 85 57 C 96 65, 88 80, 72 80 Z"
          {...common}
        />
      ) : null}
      {/* Browser: just the rounded outer frame + the divider line
          under the chrome row. The chrome details (dots, nav icons,
          URL pill) render as an HTML overlay (see BrowserChrome
          in BoxedElementView) so their geometry stays fixed at any
          aspect ratio rather than warping with the box. */}
      {shape === 'browser' ? (
        <g>
          <rect x={1} y={1} width={98} height={98} rx={3} {...common} />
          <line
            x1={1}
            y1={20}
            x2={99}
            y2={20}
            stroke={stroke}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ) : null}
      {/* Monitor: screen rect on top, trapezoid stand on the bottom. */}
      {shape === 'monitor' ? (
        <g>
          <rect x={1} y={1} width={98} height={80} rx={3} {...common} />
          <path d="M 32 88 L 68 88 L 76 99 L 24 99 Z" {...common} />
        </g>
      ) : null}
      {/* Laptop: inset screen + wider keyboard trapezoid below. The
          hinge gap between screen and keyboard reads as the
          fold-line. */}
      {shape === 'laptop' ? (
        <g>
          <rect x={8} y={2} width={84} height={68} rx={3} {...common} />
          <path d="M 0 78 L 100 78 L 95 96 L 5 96 Z" {...common} />
        </g>
      ) : null}
      {/* Phone: tall pill silhouette. Heavily rounded corners are the
          single most recognisable tell of "phone" at this scale; an
          inset screen line gives the front-face bezel. */}
      {shape === 'phone' ? (
        <g>
          <rect x={2} y={2} width={96} height={96} rx={10} {...common} />
          <rect
            x={6}
            y={10}
            width={88}
            height={80}
            rx={3}
            fill="none"
            stroke={stroke}
            strokeWidth={0.8}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ) : null}
      {/* Tablet: same skeleton as phone but with a thinner bezel and
          less-aggressive corner radius, so they read as different
          devices at a glance. */}
      {shape === 'tablet' ? (
        <g>
          <rect x={2} y={2} width={96} height={96} rx={6} {...common} />
          <rect
            x={5}
            y={6}
            width={90}
            height={88}
            rx={3}
            fill="none"
            stroke={stroke}
            strokeWidth={0.8}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ) : null}
    </svg>
  );
}
