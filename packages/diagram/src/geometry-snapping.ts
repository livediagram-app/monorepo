// Snapping + alignment/distribution guides, split out of geometry.ts to keep
// each file under the ~1000-line budget. Depends on the core geometry helpers
// (anchorPosition, Point) which stay in geometry.ts. Re-exported through the
// package barrel (index.ts) alongside geometry.
import { anchorPosition, endpointPosition, type Point } from './geometry';
import {
  ALL_ANCHORS,
  arrowLabelAnchor,
  arrowStyleOf,
  isBoxed,
  projectToArrow,
  type Anchor,
  type ArrowElement,
  type BoxedElement,
  type Element,
  type ElementId,
} from './index';

// Alignment snapping: when dragging an element, snap its edges/centre to
// match nearby OTHER elements' edges/centres on the same axis. Returns the
// delta (dx, dy) to apply to the candidate position.
//
// Considers six lines per element: left / centre-x / right (X axis) and
// top / centre-y / bottom (Y axis). For each axis, picks the nearest
// candidate-target pair within `threshold` pixels.
export function snapToAlignment(
  candidate: { x: number; y: number; width: number; height: number },
  elements: Element[],
  excludeIds: Set<ElementId>,
  threshold: number,
): { dx: number; dy: number; snappedX: boolean; snappedY: boolean } {
  const xs = [candidate.x, candidate.x + candidate.width / 2, candidate.x + candidate.width];
  const ys = [candidate.y, candidate.y + candidate.height / 2, candidate.y + candidate.height];

  let bestX: number | null = null;
  let bestY: number | null = null;

  for (const el of elements) {
    if (!isBoxed(el) || excludeIds.has(el.id)) continue;
    const targetXs = [el.x, el.x + el.width / 2, el.x + el.width];
    const targetYs = [el.y, el.y + el.height / 2, el.y + el.height];
    for (const cx of xs) {
      for (const tx of targetXs) {
        const delta = tx - cx;
        if (Math.abs(delta) <= threshold && (bestX === null || Math.abs(delta) < Math.abs(bestX))) {
          bestX = delta;
        }
      }
    }
    for (const cy of ys) {
      for (const ty of targetYs) {
        const delta = ty - cy;
        if (Math.abs(delta) <= threshold && (bestY === null || Math.abs(delta) < Math.abs(bestY))) {
          bestY = delta;
        }
      }
    }
  }

  // snappedX/Y report whether an alignment was FOUND on that axis, which
  // a 0 delta can't convey (an exact alignment and "nothing in range"
  // both yield dx 0). Callers that layer another snap (e.g. distribution)
  // use these to tell "already aligned, leave it" from "free, go ahead".
  return { dx: bestX ?? 0, dy: bestY ?? 0, snappedX: bestX !== null, snappedY: bestY !== null };
}

// Snap a dragged arrow control point (a curve bend, the single-bow control,
// or an angled elbow) to the alignment lines around it, so bends square up
// instead of landing at arbitrary sub-pixel positions. Two families of
// candidate line, both per axis, nearest-within-`threshold` wins:
//   1. `neighbours` — the point's adjacent vertices on the rendered line
//      (the previous + next vertex). Snapping x to a neighbour's x makes that
//      segment vertical; snapping y makes it horizontal. Hitting one on each
//      axis squares the bend to a right angle.
//   2. Other elements' left / centre / right (x) and top / centre / bottom
//      (y), so a bend lines up with nearby shapes the same way a moved box
//      does.
// Returns the snapped point plus the guide lines now in effect (same shape as
// `alignmentGuides`, so the caller renders them through the existing overlay).
// `excludeIds` are elements the arrow's own endpoints sit on, skipped so a
// pinned arrow doesn't snap its bend to the very box it connects.
export function snapArrowPoint(
  point: Point,
  neighbours: Point[],
  elements: Element[],
  threshold: number,
  excludeIds: Set<ElementId> = new Set(),
): { point: Point; guides: AlignmentGuide[] } {
  // Each candidate carries the perpendicular coordinate of whatever it lines
  // up with, so the emitted guide spans from the point to that reference.
  const xLines: { pos: number; ref: number }[] = [];
  const yLines: { pos: number; ref: number }[] = [];
  for (const n of neighbours) {
    xLines.push({ pos: n.x, ref: n.y });
    yLines.push({ pos: n.y, ref: n.x });
  }
  for (const el of elements) {
    if (!isBoxed(el) || excludeIds.has(el.id)) continue;
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    for (const x of [el.x, cx, el.x + el.width]) xLines.push({ pos: x, ref: cy });
    for (const y of [el.y, cy, el.y + el.height]) yLines.push({ pos: y, ref: cx });
  }
  const nearest = (lines: { pos: number; ref: number }[], v: number) => {
    let best: { pos: number; ref: number } | null = null;
    for (const c of lines) {
      const d = Math.abs(c.pos - v);
      if (d <= threshold && (best === null || d < Math.abs(best.pos - v))) best = c;
    }
    return best;
  };
  const bestX = nearest(xLines, point.x);
  const bestY = nearest(yLines, point.y);
  const sx = bestX ? bestX.pos : point.x;
  const sy = bestY ? bestY.pos : point.y;
  const guides: AlignmentGuide[] = [];
  if (bestX) {
    guides.push({
      axis: 'x',
      position: sx,
      start: Math.min(sy, bestX.ref),
      end: Math.max(sy, bestX.ref),
    });
  }
  if (bestY) {
    guides.push({
      axis: 'y',
      position: sy,
      start: Math.min(sx, bestY.ref),
      end: Math.max(sx, bestY.ref),
    });
  }
  return { point: { x: sx, y: sy }, guides };
}

// Snap candidate bounds during a resize to align with other elements'
// edges, centres, and dimensions. Mirrors `snapToAlignment` but only
// nudges the edges that the active resize handle actually moves
// (the opposite corner is anchored and must not drift). Threshold
// is in canvas px.
//
// Two snap modes combine on each axis, with the smaller delta winning
// when they conflict:
//   1. Edge alignment: the active edge lines up with another element's
//      left / centre / right (or top / centre / bottom).
//   2. Dimension match: the candidate's width (or height) matches
//      another element's width (or height), so the user can size a
//      shape to be visually identical to a nearby one without
//      pixel-fiddling.
//
// `mode` is the corner being dragged ("se" = bottom-right handle =
// right + bottom edges move; etc.).
export function snapResizeBounds(
  candidate: { x: number; y: number; width: number; height: number },
  // Corner modes move two edges; single-edge modes (n/s/e/w) move one,
  // snapping (and dimension-matching) on that axis only.
  mode: 'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w',
  elements: Element[],
  excludeIds: Set<ElementId>,
  threshold: number,
  minSize: number,
): { x: number; y: number; width: number; height: number } {
  const movesRight = mode === 'se' || mode === 'ne' || mode === 'e';
  const movesLeft = mode === 'sw' || mode === 'nw' || mode === 'w';
  const movesBottom = mode === 'se' || mode === 'sw' || mode === 's';
  const movesTop = mode === 'ne' || mode === 'nw' || mode === 'n';

  // Anchored coordinates, the corner that should NOT move.
  const anchorRight = movesLeft ? candidate.x + candidate.width : null;
  const anchorLeft = movesRight ? candidate.x : null;
  const anchorBottom = movesTop ? candidate.y + candidate.height : null;
  const anchorTop = movesBottom ? candidate.y : null;

  // The active edge positions we'll try to snap.
  const activeX = movesRight ? candidate.x + candidate.width : candidate.x;
  const activeY = movesBottom ? candidate.y + candidate.height : candidate.y;

  let bestDx: number | null = null;
  let bestDy: number | null = null;

  for (const el of elements) {
    if (!isBoxed(el) || excludeIds.has(el.id)) continue;
    const targetXs = [el.x, el.x + el.width / 2, el.x + el.width];
    const targetYs = [el.y, el.y + el.height / 2, el.y + el.height];
    if (movesLeft || movesRight) {
      for (const tx of targetXs) {
        const delta = tx - activeX;
        if (
          Math.abs(delta) <= threshold &&
          (bestDx === null || Math.abs(delta) < Math.abs(bestDx))
        ) {
          bestDx = delta;
        }
      }
      // Dimension match: translate "candidate.width should equal
      // el.width" into a delta on the active X edge. movesRight
      // pushes the active edge to anchorLeft + el.width; movesLeft
      // pulls it to anchorRight - el.width. Skip degenerate sources
      // (zero-width elements would always be within threshold and
      // confuse the user).
      if (el.width > 0) {
        const targetActiveX =
          movesRight && anchorLeft !== null
            ? anchorLeft + el.width
            : movesLeft && anchorRight !== null
              ? anchorRight - el.width
              : null;
        if (targetActiveX !== null) {
          const delta = targetActiveX - activeX;
          if (
            Math.abs(delta) <= threshold &&
            (bestDx === null || Math.abs(delta) < Math.abs(bestDx))
          ) {
            bestDx = delta;
          }
        }
      }
    }
    if (movesTop || movesBottom) {
      for (const ty of targetYs) {
        const delta = ty - activeY;
        if (
          Math.abs(delta) <= threshold &&
          (bestDy === null || Math.abs(delta) < Math.abs(bestDy))
        ) {
          bestDy = delta;
        }
      }
      if (el.height > 0) {
        const targetActiveY =
          movesBottom && anchorTop !== null
            ? anchorTop + el.height
            : movesTop && anchorBottom !== null
              ? anchorBottom - el.height
              : null;
        if (targetActiveY !== null) {
          const delta = targetActiveY - activeY;
          if (
            Math.abs(delta) <= threshold &&
            (bestDy === null || Math.abs(delta) < Math.abs(bestDy))
          ) {
            bestDy = delta;
          }
        }
      }
    }
  }

  let { x, y, width, height } = candidate;
  if (bestDx !== null) {
    if (movesRight && anchorLeft !== null) {
      width = Math.max(minSize, activeX + bestDx - anchorLeft);
    } else if (movesLeft && anchorRight !== null) {
      const newX = activeX + bestDx;
      const newWidth = Math.max(minSize, anchorRight - newX);
      x = anchorRight - newWidth;
      width = newWidth;
    }
  }
  if (bestDy !== null) {
    if (movesBottom && anchorTop !== null) {
      height = Math.max(minSize, activeY + bestDy - anchorTop);
    } else if (movesTop && anchorBottom !== null) {
      const newY = activeY + bestDy;
      const newHeight = Math.max(minSize, anchorBottom - newY);
      y = anchorBottom - newHeight;
      height = newHeight;
    }
  }
  return { x, y, width, height };
}

// A faint line the canvas draws while an element is being dragged /
// resized to show WHY it snapped to a given position: it lies along an
// edge / centre line the dragged element now shares with one or more
// neighbours. `axis: 'x'` is a vertical line at constant x; `axis: 'y'`
// is a horizontal line at constant y. `start`/`end` are the inclusive
// span on the perpendicular axis (top→bottom for a vertical line,
// left→right for a horizontal one) so the guide bridges only the
// aligned elements rather than crossing the whole canvas.
export type AlignmentGuide = {
  axis: 'x' | 'y';
  position: number;
  start: number;
  end: number;
};

// Derive the alignment guides for an element at `candidate` bounds
// against its neighbours. Decoupled from snapToAlignment /
// snapResizeBounds on purpose: callers pass the ALREADY-SNAPPED bounds,
// and this reports every candidate line (left / centre-x / right on X,
// top / centre-y / bottom on Y) that now coincides with a neighbour's
// line within `epsilon` pixels. Because it keys off the snapped
// position, a guide surfaces exactly when a snap is in effect — there's
// no separate "is the snap active" flag to keep in sync.
//
// `excludeIds` skips the dragged elements (so a group drag never guides
// against itself). Each returned guide spans the union extent of the
// candidate plus every matched neighbour on the perpendicular axis.
// Lines at the same axis + position are merged into one.
export function alignmentGuides(
  candidate: { x: number; y: number; width: number; height: number },
  elements: Element[],
  excludeIds: Set<ElementId>,
  epsilon = 0.5,
): AlignmentGuide[] {
  const candidateXs = [
    candidate.x,
    candidate.x + candidate.width / 2,
    candidate.x + candidate.width,
  ];
  const candidateYs = [
    candidate.y,
    candidate.y + candidate.height / 2,
    candidate.y + candidate.height,
  ];
  const candidateTop = candidate.y;
  const candidateBottom = candidate.y + candidate.height;
  const candidateLeft = candidate.x;
  const candidateRight = candidate.x + candidate.width;

  // Keyed by `${axis}:${roundedPosition}` so duplicate lines (e.g. left
  // edge AND centre landing on the same x) collapse and their spans merge.
  const guides = new Map<string, AlignmentGuide>();

  const record = (axis: 'x' | 'y', position: number, start: number, end: number) => {
    const key = `${axis}:${Math.round(position)}`;
    const existing = guides.get(key);
    if (existing) {
      existing.start = Math.min(existing.start, start);
      existing.end = Math.max(existing.end, end);
    } else {
      guides.set(key, { axis, position, start, end });
    }
  };

  // One pass per axis (was one pass per candidate line, i.e. 3 + 3 =
  // 6 full element scans). For each element we test all three
  // candidate lines at once and accumulate that line's span. The
  // record() order (x lines in candidate order, then y lines) and the
  // min/max span accumulation are unchanged, so the output is
  // identical, two scans instead of six.
  const xStart = [candidateTop, candidateTop, candidateTop];
  const xEnd = [candidateBottom, candidateBottom, candidateBottom];
  const xMatched = [false, false, false];
  for (const el of elements) {
    if (!isBoxed(el) || excludeIds.has(el.id)) continue;
    const e0 = el.x;
    const e1 = el.x + el.width / 2;
    const e2 = el.x + el.width;
    const top = el.y;
    const bottom = el.y + el.height;
    for (let i = 0; i < 3; i++) {
      const lineX = candidateXs[i]!;
      if (
        Math.abs(e0 - lineX) <= epsilon ||
        Math.abs(e1 - lineX) <= epsilon ||
        Math.abs(e2 - lineX) <= epsilon
      ) {
        xMatched[i] = true;
        xStart[i] = Math.min(xStart[i]!, top);
        xEnd[i] = Math.max(xEnd[i]!, bottom);
      }
    }
  }
  for (let i = 0; i < 3; i++) {
    if (xMatched[i]) record('x', candidateXs[i]!, xStart[i]!, xEnd[i]!);
  }

  const yStart = [candidateLeft, candidateLeft, candidateLeft];
  const yEnd = [candidateRight, candidateRight, candidateRight];
  const yMatched = [false, false, false];
  for (const el of elements) {
    if (!isBoxed(el) || excludeIds.has(el.id)) continue;
    const e0 = el.y;
    const e1 = el.y + el.height / 2;
    const e2 = el.y + el.height;
    const left = el.x;
    const right = el.x + el.width;
    for (let i = 0; i < 3; i++) {
      const lineY = candidateYs[i]!;
      if (
        Math.abs(e0 - lineY) <= epsilon ||
        Math.abs(e1 - lineY) <= epsilon ||
        Math.abs(e2 - lineY) <= epsilon
      ) {
        yMatched[i] = true;
        yStart[i] = Math.min(yStart[i]!, left);
        yEnd[i] = Math.max(yEnd[i]!, right);
      }
    }
  }
  for (let i = 0; i < 3; i++) {
    if (yMatched[i]) record('y', candidateYs[i]!, yStart[i]!, yEnd[i]!);
  }

  return [...guides.values()];
}

// Equal-spacing ("distribution") guide: the equal gaps the moving element
// shares with its neighbours along one axis — Figma's pink equal-distance
// guides. `gap` is the matched spacing; `spans` are the gap segments to
// draw (each runs `from`->`to` along `axis` at the perpendicular `cross`),
// tick-capped so the equal gaps read at a glance.
export type DistributionGuide = {
  axis: 'x' | 'y';
  gap: number;
  spans: { from: number; to: number; cross: number }[];
};

type DistAxisItem = { low: number; high: number; crossLow: number; crossHigh: number };
type DistAxisResult = { delta: number; gap: number; spans: { from: number; to: number }[] };

// Per-axis equal-spacing search. `cand` is the moving element's interval
// on the primary axis (low + size) plus its span on the cross axis;
// `items` are the other elements' intervals. Only neighbours that overlap
// the candidate on the cross axis count (so X-spacing considers a
// horizontal row, Y-spacing a vertical column). Returns the smallest snap
// within `threshold` that makes a gap equal, or null.
function distributeAxis(
  cand: { low: number; size: number; crossLow: number; crossHigh: number },
  items: DistAxisItem[],
  threshold: number,
): DistAxisResult | null {
  const row = items.filter((n) => n.crossLow < cand.crossHigh && n.crossHigh > cand.crossLow);
  const cHigh = cand.low + cand.size;
  let best: DistAxisResult | null = null;
  const consider = (delta: number, gap: number, spans: { from: number; to: number }[]) => {
    if (gap < 1 || Math.abs(delta) > threshold) return;
    if (!best || Math.abs(delta) < Math.abs(best.delta)) best = { delta, gap, spans };
  };
  // Equidistant: a neighbour P to the left and Q to the right; centre the
  // candidate in the gap so the two facing gaps are equal.
  for (const P of row) {
    if (P.high > cand.low + threshold) continue;
    for (const Q of row) {
      if (Q.low < cHigh - threshold || Q.low <= P.high) continue;
      const gap = (Q.low - P.high - cand.size) / 2;
      const targetLow = P.high + gap;
      consider(targetLow - cand.low, gap, [
        { from: P.high, to: targetLow },
        { from: targetLow + cand.size, to: Q.low },
      ]);
    }
  }
  // Equal extension: an adjacent neighbour pair (P, Q) defines a gap;
  // snap the candidate one gap beyond Q (to the right) or before P (left).
  const sorted = [...row].sort((a, b) => a.low - b.low);
  for (let i = 0; i + 1 < sorted.length; i++) {
    const P = sorted[i]!;
    const Q = sorted[i + 1]!;
    if (Q.low <= P.high) continue;
    const gap = Q.low - P.high;
    if (cand.low + cand.size / 2 > Q.high) {
      const targetLow = Q.high + gap;
      consider(targetLow - cand.low, gap, [
        { from: P.high, to: Q.low },
        { from: Q.high, to: targetLow },
      ]);
    }
    if (cand.low + cand.size / 2 < P.low) {
      const targetLow = P.low - gap - cand.size;
      consider(targetLow - cand.low, gap, [
        { from: targetLow + cand.size, to: P.low },
        { from: P.high, to: Q.low },
      ]);
    }
  }
  return best;
}

// Snap a dragged element to EQUAL spacing with its neighbours (so three
// elements end up evenly spread) and report the gap segments to draw.
// Pure; mirrors snapToAlignment's shape (a dx/dy nudge) but for
// inter-element spacing rather than edge/centre alignment. Each axis is
// considered independently.
export function distributionSnap(
  candidate: { x: number; y: number; width: number; height: number },
  elements: Element[],
  excludeIds: Set<ElementId>,
  threshold: number,
): { dx: number; dy: number; guides: DistributionGuide[] } {
  const boxed = elements.filter((el): el is BoxedElement => isBoxed(el) && !excludeIds.has(el.id));
  const xs = distributeAxis(
    {
      low: candidate.x,
      size: candidate.width,
      crossLow: candidate.y,
      crossHigh: candidate.y + candidate.height,
    },
    boxed.map((el) => ({
      low: el.x,
      high: el.x + el.width,
      crossLow: el.y,
      crossHigh: el.y + el.height,
    })),
    threshold,
  );
  const ys = distributeAxis(
    {
      low: candidate.y,
      size: candidate.height,
      crossLow: candidate.x,
      crossHigh: candidate.x + candidate.width,
    },
    boxed.map((el) => ({
      low: el.y,
      high: el.y + el.height,
      crossLow: el.x,
      crossHigh: el.x + el.width,
    })),
    threshold,
  );
  const dx = xs?.delta ?? 0;
  const dy = ys?.delta ?? 0;
  const guides: DistributionGuide[] = [];
  if (xs) {
    const cross = candidate.y + dy + candidate.height / 2;
    guides.push({ axis: 'x', gap: xs.gap, spans: xs.spans.map((s) => ({ ...s, cross })) });
  }
  if (ys) {
    const cross = candidate.x + dx + candidate.width / 2;
    guides.push({ axis: 'y', gap: ys.gap, spans: ys.spans.map((s) => ({ ...s, cross })) });
  }
  return { dx, dy, guides };
}

// Nearest boxed-element anchor to a canvas point. Returns the pinning
// reference if one is within `threshold` pixels; otherwise null.
export function snapToAnchor(
  point: Point,
  elements: Element[],
  threshold: number,
): { elementId: ElementId; anchor: Anchor } | null {
  // Compare squared distances throughout (Math.hypot is markedly
  // slower and we only need the ordering / the threshold test).
  const thresholdSq = threshold * threshold;
  let best: { elementId: ElementId; anchor: Anchor; distSq: number } | null = null;
  for (const el of elements) {
    if (!isBoxed(el)) continue;
    // Bounding-radius pre-reject: every anchor (corner, edge-mid, or
    // centre) sits within R = half the element's diagonal of its
    // centre, for ANY rotation. So if the point is farther than
    // R + threshold from the centre, no anchor can be in range — skip
    // the 8-anchor inner loop entirely. Conservative, so it never
    // changes the result, only avoids work on distant elements.
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    const radius = Math.hypot(el.width, el.height) / 2;
    const reach = radius + threshold;
    const dcx = cx - point.x;
    const dcy = cy - point.y;
    if (dcx * dcx + dcy * dcy > reach * reach) continue;
    for (const anchor of ALL_ANCHORS) {
      const pos = anchorPosition(el, anchor);
      const dx = pos.x - point.x;
      const dy = pos.y - point.y;
      const distSq = dx * dx + dy * dy;
      if (distSq <= thresholdSq && (best === null || distSq < best.distSq)) {
        best = { elementId: el.id, anchor, distSq };
      }
    }
  }
  if (!best) return null;
  return { elementId: best.elementId, anchor: best.anchor };
}

// --- Arrow-to-arrow snapping (spec/50) -------------------------------------
//
// Lets an arrow endpoint connect to a point ALONG another arrow's line — the
// sequence-diagram pattern. We offer evenly-spaced snap points so endpoints
// line up neatly, scaled to the arrow's length (~one every 24px), clamped.
const ARROW_SNAP_SPACING_PX = 24;
const ARROW_SNAP_MIN_DIVISIONS = 4;
const ARROW_SNAP_MAX_DIVISIONS = 40;

function arrowEnds(arrow: ArrowElement, elements: Element[]): { from: Point; to: Point } {
  return {
    from: endpointPosition(arrow.from, elements),
    to: endpointPosition(arrow.to, elements),
  };
}

// Absolute point at parametric position `t` along an arrow (offset 0 = on the
// line). Shares arrowLabelAnchor so it matches the rendered centreline exactly.
function arrowPointAtT(arrow: ArrowElement, from: Point, to: Point, t: number): Point {
  return arrowLabelAnchor(
    arrowStyleOf(arrow),
    from,
    to,
    arrow.from,
    arrow.to,
    arrow.curveOffset,
    arrow.elbowOffset,
    { t, offset: 0 },
    arrow.curvePoints,
  );
}

function arrowSnapDivisions(from: Point, to: Point): number {
  const len = Math.hypot(to.x - from.x, to.y - from.y);
  return Math.max(
    ARROW_SNAP_MIN_DIVISIONS,
    Math.min(ARROW_SNAP_MAX_DIVISIONS, Math.round(len / ARROW_SNAP_SPACING_PX)),
  );
}

// The evenly-spaced snap points (absolute coords + parametric `t`) along an
// arrow, for the editor to render as connection dots while dragging an
// endpoint near it.
export function arrowSnapPoints(
  arrow: ArrowElement,
  elements: Element[],
): { x: number; y: number; t: number }[] {
  const { from, to } = arrowEnds(arrow, elements);
  const n = arrowSnapDivisions(from, to);
  const out: { x: number; y: number; t: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = arrowPointAtT(arrow, from, to, t);
    out.push({ x: p.x, y: p.y, t });
  }
  return out;
}

// Snap a cursor to the nearest evenly-spaced point on a nearby arrow line.
// `threshold` gates on the PERPENDICULAR distance to the line (so you can snap
// anywhere along it, even between dots), then the position quantises to the
// nearest division so it lines up neatly. Skips `excludeId` (the dragged
// arrow) and any arrow already attached to it (prevents a two-arrow cycle).
export function snapToArrowPoint(
  cursor: Point,
  elements: Element[],
  threshold: number,
  excludeId: ElementId,
): { arrowId: ElementId; t: number; x: number; y: number; dist: number } | null {
  let best: { arrowId: ElementId; t: number; x: number; y: number; dist: number } | null = null;
  for (const el of elements) {
    if (el.type !== 'arrow' || el.id === excludeId) continue;
    if (
      (el.from.kind === 'on-arrow' && el.from.arrowId === excludeId) ||
      (el.to.kind === 'on-arrow' && el.to.arrowId === excludeId)
    )
      continue;
    const { from, to } = arrowEnds(el, elements);
    const proj = projectToArrow(
      arrowStyleOf(el),
      from,
      to,
      el.from,
      el.to,
      el.curveOffset,
      el.elbowOffset,
      cursor,
      el.curvePoints,
    );
    const dist = Math.abs(proj.offset);
    if (dist <= threshold && (best === null || dist < best.dist)) {
      const n = arrowSnapDivisions(from, to);
      const qt = Math.round(proj.t * n) / n;
      const p = arrowPointAtT(el, from, to, qt);
      best = { arrowId: el.id, t: qt, x: p.x, y: p.y, dist };
    }
  }
  return best ? { arrowId: best.arrowId, t: best.t, x: best.x, y: best.y, dist: best.dist } : null;
}
