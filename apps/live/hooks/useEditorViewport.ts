// Viewport state for the canvas: pan offset, zoom level, the wrapper
// ref every measurement reads through, and the zoom-ref the drag
// hook reads each pointer-move event. Owns the two helpers that
// translate between viewport space and canvas space
// (`getViewportCenter`) and that re-fit every element into view
// (`fitToScreen`). Lifted out of editor-page.tsx so the route file
// stays focused on orchestration; same depsRef pattern as
// useEditorDrag so the helpers always read fresh tab elements
// without re-creating themselves on every parent render.

import { useCallback, useEffect, useRef, useState } from 'react';
import { isBoxed, unionBoxedBounds, type Tab } from '@livediagram/diagram';
import { computeFitToScreen, computeViewportCenter } from '@/lib/viewport';

// Breakpoint at which we initialise the viewport at 60% zoom rather
// than 100%, so a mobile visitor lands on a usable overview instead
// of a single nodes-fill-the-screen view. 30% was too far out, the
// text on every element became unreadable; 60% keeps labels legible
// while still showing a workable chunk of canvas around the
// pointer.
const MOBILE_BREAKPOINT_PX = 768;
const MOBILE_DEFAULT_ZOOM = 0.6;
const DESKTOP_DEFAULT_ZOOM = 1;

type EditorViewportDeps = {
  activeTab: Tab;
  // The single-selected element id. Used to scroll a freshly-added element
  // into view on mobile (the add handlers select what they create).
  selectedId: string | null;
};

// Screen-px margins kept clear when scrolling an element into view: room
// above for the selection toolbar + top chrome, below for the tab bar /
// dock, and a little on the sides.
const VIEW_MARGIN_TOP = 96;
const VIEW_MARGIN_BOTTOM = 88;
const VIEW_MARGIN_SIDE = 20;

type EditorViewportApi = {
  // Pan offset in canvas-coords. The canvas wrapper applies
  // `translate(viewportOffset.x, viewportOffset.y) scale(zoom)`.
  viewportOffset: { x: number; y: number };
  setViewportOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  // Zoom multiplier on the canvas transform. 1 = 100%.
  viewportZoom: number;
  setViewportZoom: React.Dispatch<React.SetStateAction<number>>;
  // Same value as `viewportZoom` but mirrored into a ref so the
  // pointer-move handlers in useEditorDrag can invert the zoom
  // without re-attaching their listeners every time zoom changes.
  zoomRef: React.RefObject<number>;
  // Wrapper element the canvas renders into. Its bounding-client
  // rect is the source of truth for "where is the viewport in
  // screen space?" and every helper here reads through it.
  canvasMainRef: React.RefObject<HTMLElement | null>;
  // Canvas-coord position of the viewport centre, used as the drop
  // point for "add a shape from the palette".
  getViewportCenter: () => { x: number; y: number };
  // Re-fit every boxed element on the active tab into the
  // viewport. Idempotent (the lastFittedTabRef gate in
  // editor-page.tsx still controls WHEN this runs).
  fitToScreen: () => void;
};

export function useEditorViewport(deps: EditorViewportDeps): EditorViewportApi {
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });
  const [viewportZoom, setViewportZoom] = useState<number>(() => {
    if (typeof window === 'undefined') return DESKTOP_DEFAULT_ZOOM;
    return window.innerWidth <= MOBILE_BREAKPOINT_PX ? MOBILE_DEFAULT_ZOOM : DESKTOP_DEFAULT_ZOOM;
  });
  const canvasMainRef = useRef<HTMLElement>(null);
  const zoomRef = useRef(viewportZoom);
  useEffect(() => {
    zoomRef.current = viewportZoom;
  }, [viewportZoom]);
  // Latest pan offset in a ref so the scroll-into-view animation reads the
  // current value without re-creating its stable callback.
  const viewportOffsetRef = useRef(viewportOffset);
  useEffect(() => {
    viewportOffsetRef.current = viewportOffset;
  }, [viewportOffset]);

  // depsRef means the helpers below can be stable across renders
  // (useCallback empty-dep) AND always read the latest activeTab.
  // The drag hook is the only consumer that holds a long-lived
  // reference; everyone else calls into the helpers fresh each
  // time, so this is mostly defensive.
  const depsRef = useRef(deps);
  depsRef.current = deps;

  const getViewportCenter = useCallback(() => {
    const rect = canvasMainRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return computeViewportCenter(rect, viewportOffset);
  }, [viewportOffset]);

  // Smoothly pan so an element (plus toolbar room) is fully on-screen.
  // No-op if it already is. Used by the mobile new-element scroll below.
  const scrollIntoView = useCallback((bx: number, by: number, bw: number, bh: number) => {
    const rect = canvasMainRef.current?.getBoundingClientRect();
    if (!rect) return;
    const zoom = zoomRef.current;
    // Canvas transform is `scale(z) translate(o)`, so a canvas point p
    // renders at rect.origin + z*(p + offset).
    const off = viewportOffsetRef.current;
    const sl = rect.left + zoom * (bx + off.x);
    const st = rect.top + zoom * (by + off.y);
    const sr = sl + zoom * bw;
    const sb = st + zoom * bh;
    const visLeft = rect.left + VIEW_MARGIN_SIDE;
    const visRight = rect.right - VIEW_MARGIN_SIDE;
    const visTop = rect.top + VIEW_MARGIN_TOP;
    const visBottom = rect.bottom - VIEW_MARGIN_BOTTOM;
    let dxs = 0;
    let dys = 0;
    if (sl < visLeft) dxs = visLeft - sl;
    else if (sr > visRight) dxs = visRight - sr;
    if (st < visTop) dys = visTop - st;
    else if (sb > visBottom) dys = visBottom - sb;
    if (dxs === 0 && dys === 0) return;
    const start = off;
    const target = { x: off.x + dxs / zoom, y: off.y + dys / zoom };
    const t0 = performance.now();
    const DUR = 280;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / DUR);
      const e = 1 - Math.pow(1 - k, 3); // ease-out cubic
      setViewportOffset({
        x: start.x + (target.x - start.x) * e,
        y: start.y + (target.y - start.y) * e,
      });
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  // Mobile: when a new element is added (the add handlers select it),
  // scroll it into view if it isn't fully visible. Tracks the id set so a
  // move / resize / remote change doesn't trigger it.
  const prevIdsRef = useRef<Set<string>>(new Set());
  const offFirstRunRef = useRef(true);
  useEffect(() => {
    const els = deps.activeTab.elements;
    const ids = new Set(els.map((el) => el.id));
    const prev = prevIdsRef.current;
    prevIdsRef.current = ids;
    // Seed on the first run (tab load) without scrolling.
    if (offFirstRunRef.current) {
      offFirstRunRef.current = false;
      return;
    }
    if (typeof window === 'undefined' || window.innerWidth > MOBILE_BREAKPOINT_PX) return;
    const sel = deps.selectedId;
    if (!sel || prev.has(sel) || !ids.has(sel)) return;
    const el = els.find((e) => e.id === sel);
    if (!el || !isBoxed(el)) return;
    scrollIntoView(el.x, el.y, el.width, el.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps.activeTab.elements, deps.selectedId]);

  const fitToScreen = useCallback(() => {
    const rect = canvasMainRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { activeTab } = depsRef.current;
    const boxedIds = new Set(activeTab.elements.filter(isBoxed).map((el) => el.id));
    if (boxedIds.size === 0) {
      setViewportOffset({ x: 0, y: 0 });
      setViewportZoom(1);
      return;
    }
    const bbox = unionBoxedBounds(activeTab.elements, boxedIds);
    if (!bbox) return;
    const { zoom, offset } = computeFitToScreen(rect, bbox);
    setViewportZoom(zoom);
    setViewportOffset(offset);
  }, []);

  return {
    viewportOffset,
    setViewportOffset,
    viewportZoom,
    setViewportZoom,
    zoomRef,
    canvasMainRef,
    getViewportCenter,
    fitToScreen,
  };
}
