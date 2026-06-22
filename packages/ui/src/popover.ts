// Shared primitives for portal-positioned floating UI (tooltips,
// confirm popovers, note popovers, edge-aware menus). Before this, the
// viewport-edge inset was defined twice — once in this package's
// Tooltip (`VIEWPORT_MARGIN`) and once in the live app's
// clamp-to-viewport (`VIEWPORT_EDGE_MARGIN`) — and every floating box
// hand-rolled the same one-dimensional clamp. Both now live here so the
// inset is a single source and the clamp is one function.
//
// Note: each floating element keeps its OWN width/height (a tooltip
// card, a confirm popover, and a note editor are deliberately different
// sizes) and its OWN placement strategy (prefer-top vs flip-left-right
// vs anchor-below). Those are per-component design choices, not shared
// state — only the edge inset and the clamp arithmetic are common.

// The px gap floating UI keeps from the viewport edge so a box anchored
// on a near-edge trigger never bleeds off-screen.
export const POPOVER_VIEWPORT_MARGIN = 8;

// Clamp a single coordinate into `[min, max]`. The arithmetic every
// portal positioner repeated as `Math.max(min, Math.min(max, value))`
// to keep a left/top edge (or an anchored centre) inside the viewport.
// When `max < min` (the box is wider/taller than the available space)
// the lower bound wins, matching the previous inlined behaviour.
export function clampIntoRange(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
