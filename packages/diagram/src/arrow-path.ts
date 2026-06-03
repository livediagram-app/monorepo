import { type ArrowStyle, type Endpoint } from './index';

// The quadratic-Bezier control point a curved arrow uses. When
// `curveOffset` is set, the user has dragged the curve handle and
// the control point is `chordMidpoint + curveOffset`. When unset,
// the historical auto-bow applies (¼-chord-length perpendicular to
// the chord). Exposed as its own helper so the renderer + the
// curve drag handle agree on the same point.
export function curveControlPoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
  curveOffset?: { dx: number; dy: number },
): { x: number; y: number } {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  if (curveOffset) return { x: mx + curveOffset.dx, y: my + curveOffset.dy };
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.5) return { x: mx, y: my };
  const nx = -dy / len;
  const ny = dx / len;
  const offset = len * 0.25;
  return { x: mx + nx * offset, y: my + ny * offset };
}

// Build the SVG `d` attribute for an arrow at the given resolved
// endpoint positions. Pure geometry (no DOM dependency) so the
// editor's `<ArrowView>` and any future export / embedded-viewer
// route can share the same line.
//
// Straight is a single line. Curved bows the chord perpendicular
// to its midpoint by ¼ of its length (quadratic Bezier), or, when
// `curveOffset` is set, runs the curve through the user-chosen
// control point. Angled drops one right-angle bend; the leg that
// runs first is chosen from the from-endpoint's anchor side when
// available so a pinned arrow leaves its element along its anchor
// direction.
export function arrowPathD(
  style: ArrowStyle,
  from: { x: number; y: number },
  to: { x: number; y: number },
  fromEp: Endpoint,
  toEp: Endpoint,
  curveOffset?: { dx: number; dy: number },
  elbowOffset?: { dx: number; dy: number },
): string {
  if (style === 'straight') return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  if (style === 'curved') {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.5 && !curveOffset) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    const c = curveControlPoint(from, to, curveOffset);
    return `M ${from.x} ${from.y} Q ${c.x} ${c.y} ${to.x} ${to.y}`;
  }
  const elbow = angledElbow(from, to, fromEp, toEp, elbowOffset);
  return `M ${from.x} ${from.y} L ${elbow.x} ${elbow.y} L ${to.x} ${to.y}`;
}

// Auto-computed elbow position for an angled arrow, plus any
// user-dragged offset. The auto position is the right-angle corner
// the renderer would draw without input: (to.x, from.y) for
// horizontal-first, (from.x, to.y) for vertical-first. `elbowOffset`
// (set by dragging the elbow handle, see Canvas + useEditorDrag)
// translates the corner so the user can place the bend wherever they
// want. The result loses strict axis-alignment when offset is set,
// matching the "drag the bend" mental model from Lucid / draw.io.
export function angledElbow(
  from: { x: number; y: number },
  to: { x: number; y: number },
  fromEp: Endpoint,
  toEp: Endpoint,
  elbowOffset?: { dx: number; dy: number },
): { x: number; y: number } {
  const horizontalFirst = angledHorizontalFirst(from, to, fromEp, toEp);
  const baseX = horizontalFirst ? to.x : from.x;
  const baseY = horizontalFirst ? from.y : to.y;
  if (!elbowOffset) return { x: baseX, y: baseY };
  return { x: baseX + elbowOffset.dx, y: baseY + elbowOffset.dy };
}

// The point on the rendered path that a label should anchor to.
// Curves return the t=0.5 point of the quadratic Bezier; angled
// arrows return the elbow vertex; straight arrows return the chord
// midpoint.
export function arrowPathMidpoint(
  style: ArrowStyle,
  from: { x: number; y: number },
  to: { x: number; y: number },
  fromEp: Endpoint,
  toEp: Endpoint,
  curveOffset?: { dx: number; dy: number },
  elbowOffset?: { dx: number; dy: number },
): { x: number; y: number } {
  if (style === 'angled') {
    return angledElbow(from, to, fromEp, toEp, elbowOffset);
  }
  if (style === 'curved') {
    const c = curveControlPoint(from, to, curveOffset);
    // t=0.5 point on the quadratic Bezier B(0.5) = 0.25*P0 + 0.5*P1
    // + 0.25*P2.
    return {
      x: 0.25 * from.x + 0.5 * c.x + 0.25 * to.x,
      y: 0.25 * from.y + 0.5 * c.y + 0.25 * to.y,
    };
  }
  return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
}

// Which leg of an angled arrow runs first. Pinned endpoints carry
// an intrinsic direction (E/W anchors leave horizontally; N/S leave
// vertically); free endpoints fall back to "travel along the longer
// axis first" so the elbow sits closer to the destination side.
function angledHorizontalFirst(
  from: { x: number; y: number },
  to: { x: number; y: number },
  fromEp: Endpoint,
  toEp: Endpoint,
): boolean {
  if (fromEp.kind === 'pinned') {
    if (fromEp.anchor === 'e' || fromEp.anchor === 'w') return true;
    if (fromEp.anchor === 'n' || fromEp.anchor === 's') return false;
  }
  if (toEp.kind === 'pinned') {
    if (toEp.anchor === 'n' || toEp.anchor === 's') return true;
    if (toEp.anchor === 'e' || toEp.anchor === 'w') return false;
  }
  return Math.abs(to.x - from.x) >= Math.abs(to.y - from.y);
}
