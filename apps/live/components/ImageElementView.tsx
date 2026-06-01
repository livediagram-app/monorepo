'use client';

import { useEffect, useState } from 'react';
import type { ImageElement } from '@livediagram/diagram';
import { apiFetchImageBlobUrl } from '@/lib/api-client';

// Renders the bitmap (or upload placeholder) for an ImageElement.
// Mounted inside BoxedElementView's transformed wrapper so it picks
// up the element's pan + zoom for free; this component only worries
// about loading the bytes + showing the empty / broken states.
//
// Auth: `<img src>` can't send Authorization / X-Owner-Id headers, so
// the bytes flow through `apiFetchImageBlobUrl`, which fetches via
// the same authenticated client used everywhere else and hands back
// a blob URL. The URL is revoked on unmount + on `imageId` change so
// the browser doesn't leak the blob.
type ImageElementViewProps = {
  element: ImageElement;
  // Owner identifying the requester. Either the diagram owner (when
  // viewing one of their own diagrams) or a share-link visitor; the
  // api-client picks Authorization vs X-Owner-Id internally.
  ownerId: string;
  // Diagram the element lives on; required for share-code reads so
  // the API can verify the diagram references this image.
  diagramId: string;
  // Share code carried by the visitor, when any. Null for the owner
  // session. Drives the X-Share-Code header on the fetch.
  shareCode: string | null;
  // Fired when the user clicks the empty-state placeholder, asking
  // the editor to open the image picker for this element. Optional
  // so view-role visitors who can't upload pass undefined; the
  // placeholder then renders as a static "no image" state.
  onOpenPicker?: () => void;
};

export function ImageElementView({
  element,
  ownerId,
  diagramId,
  shareCode,
  onOpenPicker,
}: ImageElementViewProps) {
  const { imageId } = element;
  const [src, setSrc] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (!imageId) {
      setSrc(null);
      setBroken(false);
      return;
    }
    let cancelled = false;
    let activeUrl: string | null = null;
    setBroken(false);
    setSrc(null);
    apiFetchImageBlobUrl(ownerId, imageId, { diagramId, shareCode })
      .then((url) => {
        if (cancelled) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        if (!url) {
          setBroken(true);
          return;
        }
        activeUrl = url;
        setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setBroken(true);
      });
    return () => {
      cancelled = true;
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [imageId, ownerId, diagramId, shareCode]);

  if (!imageId) {
    // Empty placeholder. Double-click opens the picker for editors
    // so a single click (and the drag that follows it) can still
    // move / resize the placeholder without spawning the modal.
    // View-role visitors see the same hint with no picker.
    const placeholderBase =
      'flex h-full w-full flex-col items-center justify-center gap-1 rounded border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400';
    if (!onOpenPicker) {
      return (
        <div className={placeholderBase}>
          <ImageIcon />
          <span className="text-[10px] font-medium">No image</span>
        </div>
      );
    }
    return (
      <div
        className={`${placeholderBase} cursor-pointer transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:hover:border-brand-500/60 dark:hover:bg-brand-500/10 dark:hover:text-brand-200`}
      >
        <ImageIcon />
        <span className="text-[10px] font-medium">Double-click to upload</span>
      </div>
    );
  }

  if (broken) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded border border-rose-200 bg-rose-50/60 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
        <BrokenIcon />
        <span className="text-[10px] font-medium">Image unavailable</span>
      </div>
    );
  }

  if (!src) {
    // Loading: keep a soft skeleton so the empty box doesn't flash
    // as "no image".
    return <div className="h-full w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />;
  }

  return (
    <img
      src={src}
      alt={element.alt ?? ''}
      draggable={false}
      className="block h-full w-full select-none"
      style={{ objectFit: 'contain' }}
    />
  );
}

function ImageIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="M3.5 17l5-5 4 4 3-3 5 5" />
    </svg>
  );
}

function BrokenIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 17l5-5 4 4 2-2" />
      <path d="M16 6l5 5" />
      <path d="M21 6l-5 5" />
    </svg>
  );
}
