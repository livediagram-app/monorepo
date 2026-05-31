import type { ArrowElement } from '@livediagram/diagram';

// One of the gestures a `BoxedElementView` can be in mid-drag. `move`
// is the body drag; the four `resize-*` corners are the bounding-box
// handles.
export type DragMode = 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se';

export type ArrowEnd = 'from' | 'to';

export const SNAP_THRESHOLD = 24;
// Pixel range within which a dragged element's edges/centres snap to
// align with another element's edges/centres. Tight enough that nudging
// off the line takes deliberate motion.
export const ALIGN_SNAP_THRESHOLD = 6;

// Floor for any single side of a boxed element during a resize. Below
// this the shape becomes a pinprick that's near-impossible to grab
// again, so the resize math clamps both axes here.
export const MIN_SIZE = 20;

// The axis-aligned bounding rectangle a boxed element occupies on the
// canvas. The drag pipeline reads start-bounds at gesture begin and
// recomputes a fresh ShapeBounds on every pointer move.
export type ShapeBounds = { x: number; y: number; width: number; height: number };

// Discriminated union covering every in-flight drag the canvas can be
// holding. Each variant carries the start-of-gesture state the
// pointer-move handler needs to project the current cursor delta into
// canvas coordinates.
export type DragState =
  | {
      kind: 'boxed';
      primaryId: string;
      mode: DragMode;
      startClientX: number;
      startClientY: number;
      // Every selected element's start bounds (keyed by id) so a
      // multi-select move/resize can update each one without losing
      // its original position.
      startBounds: Map<string, ShapeBounds>;
      aspectLocked: boolean;
    }
  | {
      kind: 'arrow-endpoint';
      arrowId: string;
      end: ArrowEnd;
      startClientX: number;
      startClientY: number;
      startCanvasX: number;
      startCanvasY: number;
    }
  | {
      // Whole-arrow translation. Only fires for arrows with both
      // endpoints `kind: 'free'` — pinned endpoints stay anchored to
      // their elements, so there's nothing to drag.
      kind: 'arrow-translate';
      arrowId: string;
      startClientX: number;
      startClientY: number;
      startFromX: number;
      startFromY: number;
      startToX: number;
      startToY: number;
    };

// Given a shape's bounds at gesture start, project the current pointer
// delta (`dx`, `dy` already in canvas coordinates — caller has
// inverted the zoom) into a fresh ShapeBounds for the given drag mode.
//
// `move` translates the shape uniformly. Each `resize-*` mode pulls
// the matching corner; `aspectLocked` collapses the two-axis input
// onto a single dominant axis (the one whose delta is larger) so the
// width:height ratio survives the gesture. Both branches floor each
// side at `MIN_SIZE` so a shape can't be dragged down to a pinprick.
export function nextBounds(
  start: ShapeBounds,
  mode: DragMode,
  dx: number,
  dy: number,
  aspectLocked: boolean,
): ShapeBounds {
  const { x, y, width, height } = start;
  if (mode === 'move') return { x: x + dx, y: y + dy, width, height };

  const freeForCorner = (signX: number, signY: number) => {
    const newW = Math.max(MIN_SIZE, width + signX * dx);
    const newH = Math.max(MIN_SIZE, height + signY * dy);
    return { newW, newH };
  };

  const lockedForCorner = (signX: number, signY: number) => {
    const candW = Math.max(MIN_SIZE, width + signX * dx);
    const candH = Math.max(MIN_SIZE, height + signY * dy);
    const ratio = width / height;
    const useW = Math.abs(candW - width) >= Math.abs(candH - height);
    const newW = useW ? candW : candH * ratio;
    const newH = useW ? candW / ratio : candH;
    return { newW: Math.max(MIN_SIZE, newW), newH: Math.max(MIN_SIZE, newH) };
  };

  const compute = aspectLocked ? lockedForCorner : freeForCorner;

  switch (mode) {
    case 'resize-se': {
      const { newW, newH } = compute(1, 1);
      return { x, y, width: newW, height: newH };
    }
    case 'resize-sw': {
      const { newW, newH } = compute(-1, 1);
      return { x: x + (width - newW), y, width: newW, height: newH };
    }
    case 'resize-ne': {
      const { newW, newH } = compute(1, -1);
      return { x, y: y + (height - newH), width: newW, height: newH };
    }
    case 'resize-nw': {
      const { newW, newH } = compute(-1, -1);
      return { x: x + (width - newW), y: y + (height - newH), width: newW, height: newH };
    }
  }
}

// True when either of the arrow's endpoints is pinned to one of the
// given element ids. Used by the deletion / cascading-update paths so
// arrows attached to a removed box can be cleaned up alongside it.
export function arrowReferencesAny(arrow: ArrowElement, ids: Set<string>): boolean {
  return (
    (arrow.from.kind === 'pinned' && ids.has(arrow.from.elementId)) ||
    (arrow.to.kind === 'pinned' && ids.has(arrow.to.elementId))
  );
}
