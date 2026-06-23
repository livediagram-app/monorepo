'use client';

import { useMemo, useRef, type Ref } from 'react';
import { isBoxed, unionBoxedBounds, type Element } from '@livediagram/diagram';

// Bottom-left "Overview" minimap (spec/59): a labelled card with a zoomed-out
// wireframe of the whole tab. The area outside the current view is dimmed so
// the lit window reads instantly as where you are; tap or drag it to re-centre
// the canvas there. Rendered only when the Activity panel is closed (it shares
// the bottom-left corner) and on desktop (gated by the caller).
//
// Geometry: the canvas transform is `scale(z) translate(o)` about the <main>
// centre, so the viewport centre in world coords is (W/2 - oₓ, H/2 - o_y) and
// the visible world rect is (W/z × H/z) around it; re-centring on a world
// point P is therefore offset = (W/2 - Pₓ, H/2 - P_y). The SVG draws elements
// in world coords (its viewBox IS world space), so getScreenCTM() handles the
// click → world mapping including the letterbox.

type MinimapProps = {
  elements: Element[];
  viewportOffset: { x: number; y: number };
  viewportZoom: number;
  setViewportOffset: (offset: { x: number; y: number }) => void;
  mainRef: Ref<HTMLElement>;
};

// Padding around the content (a fraction of its size plus a floor) so elements
// never touch the minimap's edge.
const PAD_FRACTION = 0.12;
const PAD_MIN = 48;

export function Minimap({
  elements,
  viewportOffset,
  viewportZoom,
  setViewportOffset,
  mainRef,
}: MinimapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);
  // mainRef is the canvas <main>; read it fresh (it's an object ref at runtime,
  // but the prop type allows a callback ref, so narrow defensively).
  const getMain = () => (mainRef && typeof mainRef !== 'function' ? mainRef.current : null);

  // Element wireframe — recomputed only when the elements change, not on every
  // pan/zoom (which re-renders only the viewport rect below).
  const ids = useMemo(() => new Set(elements.map((e) => e.id)), [elements]);
  const rects = useMemo(
    () =>
      elements
        .filter(isBoxed)
        .map((el) => (
          <rect
            key={el.id}
            x={el.x}
            y={el.y}
            width={el.width}
            height={el.height}
            rx={Math.min(el.width, el.height) * 0.08}
            className="fill-slate-400 dark:fill-slate-500"
          />
        )),
    [elements],
  );

  const bounds = unionBoxedBounds(elements, ids);
  if (!bounds) return null; // Nothing to map on an empty tab.

  const padX = bounds.width * PAD_FRACTION + PAD_MIN;
  const padY = bounds.height * PAD_FRACTION + PAD_MIN;
  const x0 = bounds.x - padX;
  const y0 = bounds.y - padY;
  const x1 = bounds.x + bounds.width + padX;
  const y1 = bounds.y + bounds.height + padY;
  const vb = `${x0} ${y0} ${x1 - x0} ${y1 - y0}`;

  const rect = getMain()?.getBoundingClientRect();
  const w = rect?.width ?? 0;
  const h = rect?.height ?? 0;
  const z = viewportZoom || 1;
  const viewCx = w / 2 - viewportOffset.x;
  const viewCy = h / 2 - viewportOffset.y;
  // Visible-world rect, clamped to the padded content box so the "current
  // view" highlight and the dimmed surround never spill past the map edges.
  const vx = Math.max(x0, viewCx - w / z / 2);
  const vy = Math.max(y0, viewCy - h / z / 2);
  const vx1 = Math.min(x1, viewCx + w / z / 2);
  const vy1 = Math.min(y1, viewCy + h / z / 2);
  const hasView = vx1 > vx && vy1 > vy;

  const recentreToClient = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    const r = getMain()?.getBoundingClientRect();
    if (!svg || !ctm || !r) return;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const world = pt.matrixTransform(ctm.inverse());
    setViewportOffset({ x: r.width / 2 - world.x, y: r.height / 2 - world.y });
  };

  return (
    <div
      data-floating-panel
      className="group pointer-events-auto absolute bottom-4 left-4 z-[var(--z-panel)] w-48 overflow-hidden rounded-xl bg-white/90 shadow-lg ring-1 ring-slate-900/10 backdrop-blur transition hover:ring-brand-500/40 dark:bg-slate-900/90 dark:ring-white/10"
    >
      {/* Header so the panel is unmistakably the canvas overview. */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/70 px-2.5 py-1.5 dark:border-slate-700/60">
        <MapGlyph />
        <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          Overview
        </span>
        <span className="ml-auto text-[10px] text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-500">
          tap to jump
        </span>
      </div>
      <svg
        ref={svgRef}
        viewBox={vb}
        preserveAspectRatio="xMidYMid meet"
        className="block h-28 w-full cursor-pointer touch-none bg-slate-50/60 dark:bg-slate-950/40"
        role="img"
        aria-label="Canvas overview — tap or drag to navigate"
        onPointerDown={(e) => {
          draggingRef.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          recentreToClient(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) recentreToClient(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          draggingRef.current = false;
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
      >
        {rects}
        {hasView ? (
          <>
            {/* Dim everything outside the current view (even-odd: outer box
                minus the view hole) so the lit window reads at a glance as
                "where you are on the canvas". */}
            <path
              d={`M${x0} ${y0}H${x1}V${y1}H${x0}Z M${vx} ${vy}H${vx1}V${vy1}H${vx}Z`}
              fillRule="evenodd"
              className="fill-slate-500/25 dark:fill-slate-950/55"
            />
            <rect
              x={vx}
              y={vy}
              width={vx1 - vx}
              height={vy1 - vy}
              rx={3}
              fill="none"
              className="stroke-brand-500 dark:stroke-brand-400"
              strokeWidth={1.75}
              vectorEffect="non-scaling-stroke"
            />
          </>
        ) : null}
      </svg>
    </div>
  );
}

// A frame-with-highlighted-region glyph: the minimap concept in miniature, so
// the header label is reinforced by an icon that mirrors what the panel does.
function MapGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400"
      fill="none"
      aria-hidden
    >
      <rect
        x={1.75}
        y={2.75}
        width={12.5}
        height={10.5}
        rx={2}
        className="stroke-current"
        strokeWidth={1.4}
      />
      <rect x={4} y={5} width={5.5} height={4.5} rx={1} className="fill-current opacity-80" />
    </svg>
  );
}
