// Pure viewport math used by useEditorViewport. Lives in lib/ so the
// fit-to-screen calculation can be reasoned about (and tested)
// without booting React or simulating a DOM. The hook handles only
// the state plumbing and `getBoundingClientRect` measurement; the
// formulas land here.

// Padding (in canvas-space pixels) kept between the elements'
// bounding box and the viewport edges when fit-to-screen runs. 60
// matches the previous hard-coded value.
export const FIT_TO_SCREEN_PADDING = 60;

// Zoom clamps. The 5x ceiling stops tiny diagrams from blowing up;
// the 0.1 floor stops massive scaffolds from shrinking below the "I
// can see it" threshold. Cap at 1.0 too so fit-to-screen never
// magnifies past 100% (the user can zoom further manually).
export const FIT_TO_SCREEN_MIN = 0.1;
export const FIT_TO_SCREEN_MAX = 5;
export const FIT_TO_SCREEN_MAX_AT_FIT = 1;

export type Rect = { width: number; height: number };
export type BBox = { x: number; y: number; width: number; height: number };
export type Offset = { x: number; y: number };

// Given the viewport's bounding rect and the elements' bounding box
// (canvas-coords), compute the zoom + offset that fits the bbox
// inside the viewport with `FIT_TO_SCREEN_PADDING` on every side.
// The offset centres the bbox in the viewport: with the canvas
// transform `translate(offset) scale(zoom)` applied (scale centred
// on the wrapper), centring on the viewport centre is `viewport-
// centre minus bbox-centre`.
export function computeFitToScreen(rect: Rect, bbox: BBox): { zoom: number; offset: Offset } {
  const zoom = Math.max(
    FIT_TO_SCREEN_MIN,
    Math.min(
      FIT_TO_SCREEN_MAX,
      (rect.width - 2 * FIT_TO_SCREEN_PADDING) / Math.max(1, bbox.width),
      (rect.height - 2 * FIT_TO_SCREEN_PADDING) / Math.max(1, bbox.height),
      FIT_TO_SCREEN_MAX_AT_FIT,
    ),
  );
  const offset = {
    x: rect.width / 2 - (bbox.x + bbox.width / 2),
    y: rect.height / 2 - (bbox.y + bbox.height / 2),
  };
  return { zoom, offset };
}

// Canvas-coord position of the viewport centre. With transform
// `scale(z) translate(offset)` centred on the wrapper, the canvas-
// coord at viewport centre is just (canvasCentre - offset), because
// scale is centred on the same point so zoom doesn't enter the
// equation. Used as the drop point for "add a shape from the
// palette".
export function computeViewportCenter(rect: Rect, offset: Offset): { x: number; y: number } {
  return {
    x: rect.width / 2 - offset.x,
    y: rect.height / 2 - offset.y,
  };
}
