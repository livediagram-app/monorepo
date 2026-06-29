import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';

import { BRAND_600 } from './arrow-handle-style';

// The on-canvas arrow grips (endpoints, curve / elbow bend points) are fixed
// SVG shapes a few px across — fine for a mouse, fiddly for a fingertip. On
// coarse-pointer (touch) devices we lay an invisible larger hit circle over
// each one so there's a ~44px-diameter tap target (iOS HIG), without making
// the visible grip clunky on desktop. Evaluated once in the browser; guarded
// for the static-export build where `window` is absent. Mirrors the
// `pointer-coarse` hit pad the box resize handles use (element-parts.tsx).
const COARSE_POINTER =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches;
const HANDLE_HIT_R = 22;

// The draggable SVG widgets on a selected arrow: endpoint grips, the
// curve / control-point handles, and the add-curve-point hit target.
// Extracted from ArrowView; pure prop-based SVG components.
type EndpointHandleProps = {
  cx: number;
  cy: number;
  pinned: boolean;
  disabled: boolean;
  onPointerDown: (e: ReactPointerEvent) => void;
};

export function EndpointHandle({ cx, cy, pinned, disabled, onPointerDown }: EndpointHandleProps) {
  const fill = pinned ? BRAND_600 : 'white';
  const grab = { pointerEvents: 'all', cursor: disabled ? 'default' : 'grab' } as const;
  return (
    <>
      {COARSE_POINTER ? (
        <circle
          cx={cx}
          cy={cy}
          r={HANDLE_HIT_R}
          fill="transparent"
          onPointerDown={onPointerDown}
          style={grab}
        />
      ) : null}
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={fill}
        stroke={BRAND_600}
        strokeWidth={2}
        onPointerDown={onPointerDown}
        style={grab}
      />
    </>
  );
}

// Curve drag handle. Visually distinct from the endpoint handles
// (square + smaller) so the user can tell at a glance which one
// moves an endpoint and which one bends the curve. Sits on the
// quadratic Bezier control point.
export function CurveHandle({
  cx,
  cy,
  disabled,
  onPointerDown,
  onContextMenu,
}: {
  cx: number;
  cy: number;
  disabled: boolean;
  onPointerDown: (e: ReactPointerEvent) => void;
  // Right-click handler (used by curve control points: right-click to delete).
  onContextMenu?: (e: ReactMouseEvent) => void;
}) {
  const size = 10;
  const grab = { pointerEvents: 'all', cursor: disabled ? 'default' : 'grab' } as const;
  return (
    <>
      {COARSE_POINTER ? (
        <circle
          cx={cx}
          cy={cy}
          r={HANDLE_HIT_R}
          fill="transparent"
          onPointerDown={onPointerDown}
          onContextMenu={onContextMenu}
          style={grab}
        />
      ) : null}
      <rect
        x={cx - size / 2}
        y={cy - size / 2}
        width={size}
        height={size}
        fill="white"
        stroke={BRAND_600}
        strokeWidth={2}
        rx={2}
        onPointerDown={onPointerDown}
        onContextMenu={onContextMenu}
        style={grab}
      />
    </>
  );
}

// A small "+" handle sitting on a segment of the arrow line; clicking it adds
// a control point there. The deliberate target (vs clicking the line itself)
// is what keeps points from being added by accident on select / connect / drag.
export function AddPointHandle({
  cx,
  cy,
  onAdd,
}: {
  cx: number;
  cy: number;
  onAdd: (e: ReactMouseEvent) => void;
}) {
  return (
    <g
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onAdd}
      style={{ pointerEvents: 'all', cursor: 'copy' }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="white"
        stroke={BRAND_600}
        strokeWidth={1.5}
        opacity={0.9}
      />
      <path
        d={`M ${cx - 3} ${cy} h 6 M ${cx} ${cy - 3} v 6`}
        stroke={BRAND_600}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </g>
  );
}
