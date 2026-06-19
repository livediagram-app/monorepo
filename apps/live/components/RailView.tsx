'use client';

// Timeline rail (spec/51): a horizontal line with evenly-spaced points above
// it. Rendered inside its boxed element, so move / resize / select / group all
// come for free; the rail just paints the line + dots. Adding points is offered
// from the element's standard quick-connect "+" (see QuickConnectRing), so the
// rail doesn't render a competing on-canvas button of its own. The first of a
// planned family of composite "rail" components, so the geometry is kept simple
// + declarative.

import { RAIL_DEFAULT_POINTS } from '@livediagram/diagram';
import type { ShapeElement } from '@livediagram/diagram';

// Evenly-spaced x positions across the inset span (first point at the left
// inset, last at the right inset).
function pointXs(count: number, left: number, right: number): number[] {
  if (count <= 1) return [(left + right) / 2];
  const span = right - left;
  return Array.from({ length: count }, (_, i) => left + (span * i) / (count - 1));
}

export function RailView({ element, accent }: { element: ShapeElement; accent: string }) {
  const w = Math.max(1, element.width);
  const h = Math.max(1, element.height);
  const count = Math.max(1, Math.round(element.railCount ?? RAIL_DEFAULT_POINTS));
  const padX = Math.min(44, w * 0.12);
  const lineY = h * 0.72;
  const dotY = h * 0.36;
  const r = Math.max(5, Math.min(9, h * 0.12));
  const xs = pointXs(count, padX, w - padX);
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${w} ${h}`}
      className="pointer-events-none absolute inset-0"
      aria-hidden
    >
      {/* The rail line. */}
      <line
        x1={padX}
        y1={lineY}
        x2={w - padX}
        y2={lineY}
        stroke="#94a3b8"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {xs.map((x, i) => (
        <g key={i}>
          {/* Tick connecting the dot down to the line. */}
          <line x1={x} y1={dotY + r} x2={x} y2={lineY} stroke="#cbd5e1" strokeWidth={1.5} />
          <circle cx={x} cy={dotY} r={r} fill={accent} />
        </g>
      ))}
    </svg>
  );
}
