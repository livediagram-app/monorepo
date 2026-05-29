'use client';

import { MovablePanel } from './MovablePanel';

type ExplorerProps = {
  position: { x: number; y: number } | null;
  minimized: boolean;
  onMoveTo: (x: number, y: number) => void;
  onToggleMinimized: () => void;
  onNewDiagram: () => void;
};

// Floating "Explorer" panel pinned to the top-left of the canvas by
// default. Symmetric to the Palette in shape and behaviour.
//
// In the post-prototype world this lists every diagram in the signed-in
// user's account. For now, with no auth and only localStorage persistence
// of the current diagram, it shows a sign-up nudge so the surface is
// already there when accounts ship.
export function Explorer({
  position,
  minimized,
  onMoveTo,
  onToggleMinimized,
  onNewDiagram,
}: ExplorerProps) {
  if (minimized) return null;
  return (
    <MovablePanel
      title="Explorer"
      position={position}
      defaultCorner="top-left"
      width="w-60"
      onMoveTo={onMoveTo}
      onMinimize={onToggleMinimized}
    >
      <div className="flex flex-col gap-2 px-3 pb-3 pt-1">
        <button
          type="button"
          onClick={onNewDiagram}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:border-brand-400 hover:bg-brand-100"
        >
          <PlusIcon />
          New Diagram
        </button>
        <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/60 px-3 py-3 text-xs text-slate-600">
          <p className="font-medium text-slate-800">Sign in to save your diagrams</p>
          <p className="mt-1 leading-relaxed text-slate-500">
            Your work lives only on this device for now. Create an account to keep diagrams across
            sessions and share them.
          </p>
          <button
            type="button"
            disabled
            aria-disabled
            className="mt-3 inline-flex w-full cursor-not-allowed items-center justify-center rounded-md bg-brand-500/60 px-3 py-1.5 text-xs font-medium text-white shadow-sm"
            title="Sign-in is coming soon"
          >
            Sign in (coming soon)
          </button>
        </div>
      </div>
    </MovablePanel>
  );
}

function PlusIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 2v8M2 6h8" />
    </svg>
  );
}

export function ExplorerIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 5a1.5 1.5 0 0 1 1.5-1.5h3l1.5 1.5h6.5A1.5 1.5 0 0 1 17 6.5v8A1.5 1.5 0 0 1 15.5 16h-11A1.5 1.5 0 0 1 3 14.5z" />
    </svg>
  );
}

export function PaletteIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <rect x="3" y="3" width="6" height="6" rx="1.25" />
      <rect x="11" y="3" width="6" height="6" rx="1.25" />
      <rect x="3" y="11" width="6" height="6" rx="1.25" />
      <rect x="11" y="11" width="6" height="6" rx="1.25" />
    </svg>
  );
}
