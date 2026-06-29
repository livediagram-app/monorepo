'use client';

import { useRef, useState } from 'react';
import { MenuItem, PortalMenu } from '@/components/primitives/PortalMenu';
import { Tooltip } from '@/components/primitives/Tooltip';
import { useToast } from '@/hooks/ui/useToast';
import { track } from '@/lib/telemetry';
import { liveImageHtml, liveImageMarkdown, liveImageUrlFor } from '@/lib/live-image';

// Per-link "Live image" control in the Share dialog (spec/54 + spec/67):
// a small button that opens a menu to copy the live SVG URL as a raw
// link, a Markdown snippet, or an HTML <img>. The image re-renders the
// diagram so an embed stays current. Rendered only for non-password
// links (an <img> can't supply a password, so the server refuses an
// image for gated shares — see the share route).
export function LiveImageMenu({ code }: { code: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const copy = async (text: string, what: string) => {
    setOpen(false);
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${what}`);
      track('UI', 'Copied', 'LiveImage');
    } catch {
      toast.error(`Could not copy the ${what}. Try again.`);
    }
  };

  return (
    <>
      <Tooltip
        title="Live image"
        description="An <img>-able SVG URL that re-renders this diagram, so an embed in a README, wiki, or doc stays up to date."
      >
        <button
          ref={ref}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-600 dark:text-slate-300 dark:hover:border-brand-400 dark:hover:text-brand-300"
        >
          Live image
        </button>
      </Tooltip>
      {open ? (
        <PortalMenu anchor={ref.current} placement="below" onClose={() => setOpen(false)}>
          <MenuItem
            icon={<ImageGlyph />}
            label="Copy image URL"
            onClick={() => void copy(liveImageUrlFor(origin, code), 'image URL')}
          />
          <MenuItem
            icon={<ImageGlyph />}
            label="Copy Markdown"
            onClick={() => void copy(liveImageMarkdown(origin, code), 'Markdown')}
          />
          <MenuItem
            icon={<ImageGlyph />}
            label="Copy HTML"
            onClick={() => void copy(liveImageHtml(origin, code), 'HTML')}
          />
        </PortalMenu>
      ) : null}
    </>
  );
}

function ImageGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="3" width="12" height="10" rx="1.5" />
      <circle cx="6" cy="6.5" r="1.2" />
      <path d="M3 12l3.5-3.5 2.5 2.5 2-2L14 11.5" />
    </svg>
  );
}
