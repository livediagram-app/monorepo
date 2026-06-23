import { useEffect, useState, type Ref } from 'react';
import { isBoxed, unionBoxedBounds, type Element } from '@livediagram/diagram';
import { isContentOffScreen } from '@/lib/viewport';

// True while every element on the tab is panned / zoomed entirely out of
// view — and there is at least one element to see. Drives the "bring it back"
// nudge above the Fit button (OffscreenContentHint).
//
// The wrapper's size is cached and refreshed only via a ResizeObserver, NOT
// re-measured on each pan: reading getBoundingClientRect on every
// viewportOffset change forced a synchronous layout reflow on the pan hot
// path (see useCanvasPanAndMarquee's rАF note), so the recompute is now pure
// arithmetic over the cached size + the current offset / zoom. setOffscreen
// no-ops when the boolean is unchanged, so a steady pan never re-renders.
export function useOffscreenContent(
  elements: Element[],
  viewportOffset: { x: number; y: number },
  viewportZoom: number,
  mainRef: Ref<HTMLElement>,
): boolean {
  const [offscreen, setOffscreen] = useState(false);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  // Track the canvas wrapper's size. ResizeObserver fires only when the size
  // actually changes (mount + container/window resize), never during a pan,
  // so this stays off the pan hot path.
  useEffect(() => {
    const node =
      mainRef && typeof mainRef === 'object' && 'current' in mainRef ? mainRef.current : null;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const r = node.getBoundingClientRect();
      setSize((prev) =>
        prev && prev.width === r.width && prev.height === r.height
          ? prev
          : { width: r.width, height: r.height },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [mainRef]);

  useEffect(() => {
    const boxedIds = new Set(elements.filter(isBoxed).map((el) => el.id));
    if (!size || boxedIds.size === 0) {
      setOffscreen(false);
      return;
    }
    const bbox = unionBoxedBounds(elements, boxedIds);
    if (!bbox) {
      setOffscreen(false);
      return;
    }
    setOffscreen(isContentOffScreen(size, bbox, viewportOffset, viewportZoom));
  }, [size, elements, viewportOffset, viewportZoom]);

  return offscreen;
}
