'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetchDiagramThumbnailUrl } from '@/lib/api-client';
import { DiagramIcon } from './icons';

// A small SVG snapshot of a diagram (spec/67) for the Explorer list, so
// you can recognise a diagram without opening it. The bytes come from
// the api worker's render-cache and are fetched through the
// authenticated client (an <img src> can't carry auth headers), then
// hung on an <img> via a blob URL.
//
// Performance: the diagram list endpoint stays lightweight (no element
// data), and a thumbnail is only fetched once its row scrolls into view
// — a long Recent list never fires dozens of requests (or server-side
// renders) for rows the user never reaches. While idle / loading /
// broken the box shows the generic diagram glyph, so the layout never
// shifts and an empty or access-denied diagram degrades gracefully.

type State = { status: 'idle' | 'loading' | 'broken' } | { status: 'ready'; src: string };

export function DiagramThumbnail({
  ownerId,
  diagramId,
  version,
  shareCode,
}: {
  // Viewer identity for the authenticated fetch. Null while a guest id
  // is still resolving — we just hold the placeholder until it lands.
  ownerId: string | null;
  diagramId: string;
  // The diagram's savedAt, forwarded as the cache-bust version so an
  // edited diagram re-fetches a fresh snapshot.
  version: number;
  // Present on a "shared with me" row (spec/35): authorises the read via
  // the share code instead of ownership.
  shareCode?: string | null;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<State>({ status: 'idle' });

  // Defer the fetch until the row is near the viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible || !ownerId) return;
    let cancelled = false;
    let activeUrl: string | null = null;
    setState({ status: 'loading' });
    apiFetchDiagramThumbnailUrl(ownerId, diagramId, { version, shareCode: shareCode ?? null })
      .then((url) => {
        if (cancelled) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        if (!url) {
          setState({ status: 'broken' });
          return;
        }
        activeUrl = url;
        setState({ status: 'ready', src: url });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'broken' });
      });
    return () => {
      cancelled = true;
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [visible, ownerId, diagramId, version, shareCode]);

  return (
    <span
      ref={ref}
      aria-hidden
      className="flex h-7 w-9 shrink-0 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-500"
    >
      {state.status === 'ready' ? (
        // A blob URL, not a remote asset, so a plain <img> is correct
        // here (next/image can't load object URLs) — same as the canvas
        // ImageElementView.
        <img src={state.src} alt="" className="h-full w-full object-contain" />
      ) : (
        <DiagramIcon />
      )}
    </span>
  );
}
