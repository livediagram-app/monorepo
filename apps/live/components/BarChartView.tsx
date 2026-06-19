'use client';

// Bar chart (spec/53): vertical bars sized by value, in the theme-derived
// palette (or per-datum colour), with an optional legend — the bar sibling of
// PieChartView, sharing the same data (`pieSlices`), animation (`pieAnim`), and
// legend toggle (`chartLegend`). Rendered inside its boxed element; the data is
// edited from the context menu's Data category. The slice group carries the
// `lvd-pie-*` animation (grow / pop / spin / pulse), reduced-motion-safe.

import {
  ANIMATION_SPEED_FACTOR,
  animLoops,
  PIE_DEFAULT_SLICES,
  PIE_LOOPING_ANIMS,
  PIE_PALETTE,
  type ShapeElement,
} from '@livediagram/diagram';

export function BarChartView({
  element,
  fontFamily,
  textColor,
  palette,
}: {
  element: ShapeElement;
  fontFamily?: string;
  textColor: string;
  palette?: readonly string[];
}) {
  const colors = palette && palette.length > 0 ? palette : PIE_PALETTE;
  const w = Math.max(1, element.width);
  const h = Math.max(1, element.height);
  const data =
    element.pieSlices && element.pieSlices.length > 0 ? element.pieSlices : PIE_DEFAULT_SLICES;
  const maxVal = data.reduce((m, d) => Math.max(m, Math.max(0, d.value)), 0) || 1;
  const showLegend = element.chartLegend !== false;
  const legendW = showLegend ? Math.max(0, Math.min(w * 0.4, 120)) : 0;
  const barAreaW = w - legendW;
  const colorAt = (i: number, d: { color?: string }) => d.color ?? colors[i % colors.length]!;

  // Bars across the bar area, baseline near the bottom (room for a value /
  // label gutter). Evenly spaced with a gap, capped bar width so a 2-bar chart
  // doesn't look like two slabs.
  const padX = Math.min(20, barAreaW * 0.08);
  const topPad = h * 0.1;
  const baseY = h * 0.88;
  const innerW = Math.max(1, barAreaW - padX * 2);
  const slot = innerW / data.length;
  const barW = Math.min(slot * 0.7, 48);
  const fullH = Math.max(1, baseY - topPad);

  const anim = element.pieAnim;
  const loops = animLoops(anim, element.pieAnimRepeat, PIE_LOOPING_ANIMS);
  const groupStyle = anim
    ? ({
        transformOrigin: `${barAreaW / 2}px ${baseY}px`,
        '--lvd-pie-speed': ANIMATION_SPEED_FACTOR[element.pieAnimSpeed ?? 'normal'],
        '--lvd-pie-iter': loops ? 'infinite' : 1,
      } as React.CSSProperties)
    : undefined;

  return (
    <div className="absolute inset-0">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${w} ${h}`}
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        {/* Baseline. */}
        <line
          x1={padX}
          y1={baseY}
          x2={barAreaW - padX}
          y2={baseY}
          stroke="#cbd5e1"
          strokeWidth={1}
        />
        <g className={anim ? `lvd-pie-${anim}` : undefined} style={groupStyle}>
          {data.map((d, i) => {
            const barH = (Math.max(0, d.value) / maxVal) * fullH;
            const cx = padX + slot * (i + 0.5);
            return (
              <rect
                key={i}
                x={cx - barW / 2}
                y={baseY - barH}
                width={barW}
                height={barH}
                rx={Math.min(3, barW / 4)}
                fill={colorAt(i, d)}
              />
            );
          })}
        </g>
      </svg>
      {legendW >= 48 ? (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex flex-col justify-center gap-0.5 overflow-hidden pr-1"
          style={{ width: legendW, color: textColor, fontFamily }}
          aria-hidden
        >
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-1 leading-tight">
              <span
                className="inline-block shrink-0 rounded-[2px]"
                style={{ width: 9, height: 9, backgroundColor: colorAt(i, d) }}
              />
              <span className="truncate text-[11px]">{d.label || '—'}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
