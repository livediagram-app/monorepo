// Shared setup for the chart-family element views (pie / bar / …): resolves the
// slice palette (theme-derived, else the built-in categorical one), the box
// size, the data (built-in defaults when the element has none), the legend
// toggle, and a per-datum colour accessor (explicit slice colour, else the
// palette). Each view layers its own geometry + legend width on top. Keeps the
// identical preamble the views shared in one place.

import {
  animLoops,
  PIE_DEFAULT_SLICES,
  PIE_LOOPING_ANIMS,
  PIE_PALETTE,
  type PieSlice,
  type ShapeElement,
} from '@livediagram/diagram';
import type { CSSProperties } from 'react';
import { animClass, animSpeedVars } from './icons';

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

// The animated-group className + style for a chart element (pie / bar share the
// `pieAnim` / `pieAnimRepeat` / `pieAnimSpeed` fields + the `lvd-pie-*` classes).
// `transformOrigin` is the only per-chart difference (the pie centre vs the bar
// baseline), so each view passes its own. Returns no style when there's no
// animation.
export function chartAnim(
  element: ShapeElement,
  transformOrigin: string,
): { className: string | undefined; style: CSSProperties | undefined } {
  const anim = element.pieAnim;
  const loops = animLoops(anim, element.pieAnimRepeat, PIE_LOOPING_ANIMS);
  return {
    className: animClass('pie', anim),
    style: anim
      ? { transformOrigin, ...animSpeedVars('pie', element.pieAnimSpeed, loops) }
      : undefined,
  };
}
