import { useEffect, useState, type Ref } from 'react';
import { isBoxed, unionBoxedBounds, type Element } from '@livediagram/diagram';
import { isContentOffScreen } from '@/lib/viewport';

// True while every element on the tab is panned / zoomed entirely out of
// view — and there is at least one element to see. Drives the "bring it back"
// nudge above the Fit button (OffscreenContentHint). Recomputes on element /
// pan / zoom changes and on viewport resize, reading the canvas wrapper's
// live rect through the same ref fit-to-screen measures. Returns false for an
// empty tab or before the wrapper has mounted.
export function useOffscreenContent(
  elements: Element[],
  viewportOffset: { x: number; y: number },
  viewportZoom: number,
  mainRef: Ref<HTMLElement>,
): boolean {
  const [offscreen, setOffscreen] = useState(false);
  useEffect(() => {
    const node =
      mainRef && typeof mainRef === 'object' && 'current' in mainRef ? mainRef.current : null;
    const compute = () => {
      const rect = node?.getBoundingClientRect();
      const boxedIds = new Set(elements.filter(isBoxed).map((el) => el.id));
      if (!rect || boxedIds.size === 0) {
        setOffscreen(false);
        return;
      }
      const bbox = unionBoxedBounds(elements, boxedIds);
      if (!bbox) {
        setOffscreen(false);
        return;
      }
      setOffscreen(isContentOffScreen(rect, bbox, viewportOffset, viewportZoom));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [elements, viewportOffset, viewportZoom, mainRef]);
  return offscreen;
}
