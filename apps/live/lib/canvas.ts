export type ShapeDragMode = 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se';

// Back-compat alias — used in ShapeView / drag handlers.
export type DragMode = ShapeDragMode;

export type ArrowEnd = 'from' | 'to';

export const SNAP_THRESHOLD = 24;
// Pixel range within which a dragged element's edges/centres snap to
// align with another element's edges/centres. Tight enough that nudging
// off the line takes deliberate motion.
export const ALIGN_SNAP_THRESHOLD = 6;
