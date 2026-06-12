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
//   - browser: rounded rectangle frame (the HTML BrowserChrome strip
//     paints the address bar on top). It MUST be CSS so the corner
//     radius is a real pixel radius: an SVG rect rx in the stretched
//     0..100 viewBox warps into big asymmetric arcs on a wide box,
//     and the user's border-radius control would do nothing.
export function isSvgRenderedShape(kind: ShapeKind): boolean {
  return kind !== 'square' && kind !== 'circle' && kind !== 'stadium' && kind !== 'browser';
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
        <path
          d="M 0 0 L 100 0 L 100 92 C 80 109, 65 79, 50 94 C 35 109, 20 79, 0 94 Z"
          {...common}
        />
      ) : null}
      {shape === 'cylinder' ? (
        <g>
          <path d="M 0 15 L 100 15 L 100 85 A 50 12 0 0 1 0 85 Z" {...common} />
          <ellipse cx={50} cy={15} rx={50} ry={12} {...common} />
        </g>
      ) : null}
      {shape === 'cloud' ? (
        // Path normalised to fill the full 0..100 viewBox (the earlier
        // geometry sat in x 12.7..90 / y 24.5..80, leaving dead margin
        // on every side that made the cloud impossible to line up
        // against neighbouring shapes). Control points fall outside the
        // box by design — the curve itself reaches the edges.
        <path
          d="M 22.4 100 C 1.7 100, -7.3 71.2, 6.9 55 C -2.2 31.5, 17.2 11.7, 31.4 24.3 C 36.6 -6.3, 70.2 -9.9, 74.1 24.3 C 92.1 11.7, 107.6 38.8, 93.4 58.6 C 107.6 73, 97.3 100, 76.6 100 Z"
          {...common}
        />
      ) : null}
      {/* Browser is NOT drawn here: it is a CSS-rendered rounded
          rectangle (see isSvgRenderedShape) so its corner radius is a
          real pixel radius and the border-radius control applies. The
          HTML BrowserChrome strip paints the address bar on top. */}
      {/* Monitor: screen rect on top, trapezoid stand on the bottom. */}
      {shape === 'monitor' ? (
        <g>
          <rect x={1} y={1} width={98} height={80} rx={3} {...common} />
          <path d="M 32 88 L 68 88 L 76 99 L 24 99 Z" {...common} />
        </g>
      ) : null}
      {/* Laptop: an open clamshell. A lid panel with an inset display
          bezel sits above a keyboard deck, joined by a hinge bar so
          the two read as one device (rather than two stacked shapes),
          with a trackpad on the deck. The deck flares wider toward the
          front edge for a touch of perspective. */}
      {shape === 'laptop' ? (
        <g>
          {/* Lid / screen panel. */}
          <rect x={8} y={2} width={84} height={64} rx={4} {...common} />
          {/* Display bezel: an inset outline so the screen reads as a
              framed panel (matches the phone / tablet inner line).
              Stroke-only so content layered on top still shows. */}
          <rect
            x={12}
            y={5}
            width={76}
            height={58}
            rx={2}
            fill="none"
            stroke={stroke}
            strokeWidth={0.8}
            vectorEffect="non-scaling-stroke"
          />
          {/* Hinge bar bridging the lid and the keyboard deck. */}
          <rect x={4} y={66} width={92} height={6} rx={2} {...common} />
          {/* Keyboard deck: a shallow trapezoid, wider at the front. */}
          <path d="M 6 72 L 94 72 L 100 96 L 0 96 Z" {...common} />
          {/* Trackpad. */}
          <rect
            x={42}
            y={80}
            width={16}
            height={9}
            rx={1}
            fill="none"
            stroke={stroke}
            strokeWidth={0.8}
            vectorEffect="non-scaling-stroke"
          />
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
