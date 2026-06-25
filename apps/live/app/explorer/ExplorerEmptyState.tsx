'use client';

// Explorer empty states (spec/15): a friendly animated illustration per section
// rather than a lone sentence in a dashed box. A floating gradient icon badge
// (the section's glyph) over a softly pulsing double ring and a faint
// mini-diagram motif, with a heading, a one-line explainer, and a contextual
// CTA where one applies. Motion is CSS-only (animate-empty-* in globals.css)
// and pauses under prefers-reduced-motion.
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ClockIcon, DiagramIcon, FolderIcon, PlusIcon, ShareIcon } from './icons';
import type { SelectedNode } from './views';

type EmptyKind = 'recent' | 'shared' | 'unsorted' | 'folder' | 'default';

const CONTENT: Record<
  EmptyKind,
  { icon: ReactNode; title: string; description: string; cta?: string }
> = {
  recent: {
    icon: <ClockIcon />,
    title: 'No recent diagrams',
    description: 'Diagrams you open show up here for quick access. Make your first one.',
    cta: 'New diagram',
  },
  shared: {
    icon: <ShareIcon />,
    title: 'Nothing shared with you yet',
    description: 'Open a share link someone sends you and the diagram lands here.',
  },
  unsorted: {
    icon: <FolderIcon open={false} />,
    title: 'Nothing unsorted',
    description: 'Diagrams not filed into a folder collect here, ready to organise.',
  },
  folder: {
    icon: <FolderIcon open />,
    title: 'This folder is empty',
    description: 'Add a diagram or a subfolder to organise your work.',
    cta: 'New diagram',
  },
  default: {
    icon: <DiagramIcon />,
    title: 'No diagrams yet',
    description: 'Create your first diagram and it will appear here.',
    cta: 'New diagram',
  },
};

function kindFor(selected: SelectedNode): EmptyKind {
  if (selected.kind === 'recent') return 'recent';
  if (selected.kind === 'shared') return 'shared';
  if (selected.kind === 'unsorted') return 'unsorted';
  if (selected.kind === 'folder') return 'folder';
  return 'default';
}

export function EmptyPane({ selected }: { selected: SelectedNode }) {
  const c = CONTENT[kindFor(selected)];
  const ctaHref =
    selected.kind === 'folder' ? `/new?folder=${encodeURIComponent(selected.id)}` : '/new';

  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 px-6 py-20 text-center dark:border-slate-700 dark:from-slate-900 dark:to-slate-900/60">
      {/* Faint mini-diagram motif (two shapes + an elbow connector) — the
          product's own visual language as a quiet backdrop. */}
      <svg
        aria-hidden
        width="240"
        height="130"
        viewBox="0 0 240 130"
        fill="none"
        className="pointer-events-none absolute top-10 text-slate-900 opacity-[0.04] dark:text-white"
      >
        <rect x="34" y="34" width="60" height="34" rx="7" fill="currentColor" />
        <rect x="150" y="64" width="60" height="34" rx="7" fill="currentColor" />
        <path d="M94 51 H122 V81 H150" stroke="currentColor" strokeWidth="3" />
      </svg>

      {/* Animated illustration: a floating icon badge over a pulsing double ring. */}
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center">
        <span
          aria-hidden
          className="animate-empty-ring absolute inset-0 rounded-3xl bg-brand-400/30"
        />
        <span
          aria-hidden
          className="animate-empty-ring absolute inset-0 rounded-3xl bg-brand-400/20 [animation-delay:1.3s]"
        />
        <span className="animate-empty-float relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 [&_svg]:h-7 [&_svg]:w-7">
          {c.icon}
        </span>
      </div>

      <h2 className="relative text-base font-semibold text-slate-900 dark:text-slate-100">
        {c.title}
      </h2>
      <p className="relative mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {c.description}
      </p>

      {c.cta ? (
        <Link
          href={ctaHref}
          className="relative mt-5 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500"
        >
          <PlusIcon size={14} />
          {c.cta}
        </Link>
      ) : null}
    </div>
  );
}
