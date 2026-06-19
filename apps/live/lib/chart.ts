// Shared setup for the chart-family element views (pie / bar / …): resolves the
// slice palette (theme-derived, else the built-in categorical one), the box
// size, the data (built-in defaults when the element has none), the legend
// toggle, and a per-datum colour accessor (explicit slice colour, else the
// palette). Each view layers its own geometry + legend width on top. Keeps the
// identical preamble the views shared in one place.

import {
  PIE_DEFAULT_SLICES,
  PIE_PALETTE,
  type PieSlice,
  type ShapeElement,
} from '@livediagram/diagram';

export function chartFrame(element: ShapeElement, palette?: readonly string[]) {
  const colors = palette && palette.length > 0 ? palette : PIE_PALETTE;
  const w = Math.max(1, element.width);
  const h = Math.max(1, element.height);
  const data: readonly PieSlice[] =
    element.pieSlices && element.pieSlices.length > 0 ? element.pieSlices : PIE_DEFAULT_SLICES;
  const showLegend = element.chartLegend !== false;
  const colorAt = (i: number, d: { color?: string }) => d.color ?? colors[i % colors.length]!;
  return { w, h, data, showLegend, colorAt };
}
