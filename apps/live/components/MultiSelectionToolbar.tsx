import { Tooltip } from './Tooltip';

type MultiSelectionToolbarProps = {
  count: number;
  onDuplicate: () => void;
  onDelete: () => void;
};

// Floating action toolbar shown at the top-middle of the canvas while a
// marquee multi-selection is active. Same visual language as ModeBanner
// (centred pill, brand colours) but lives in its own component because it
// hosts real actions rather than a status + cancel button. Animates in
// via the shared `fade-in` keyframe.
export function MultiSelectionToolbar({ count, onDuplicate, onDelete }: MultiSelectionToolbarProps) {
  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className="pointer-events-auto absolute left-1/2 top-4 z-30 flex -translate-x-1/2 animate-fade-in items-center gap-1 rounded-full border border-slate-200 bg-white py-1 pl-3 pr-1 shadow-lg shadow-slate-900/10"
    >
      <span className="select-none pr-1 text-xs font-medium text-slate-700">
        Selected Elements
        <span className="ml-1 font-normal text-slate-400">({count})</span>
      </span>
      <span aria-hidden className="h-5 w-px bg-slate-200" />
      <Tooltip
        title="Duplicate"
        description="Make a copy of every selected element next to the originals. Arrows aren't duplicated."
      >
        <button
          type="button"
          onClick={onDuplicate}
          aria-label="Duplicate selected elements"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <DuplicateIcon />
        </button>
      </Tooltip>
      <Tooltip
        title="Delete"
        description="Remove every selected element. Connected arrows are removed too."
      >
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete selected elements"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition hover:bg-rose-50 hover:text-rose-700"
        >
          <TrashIcon />
        </button>
      </Tooltip>
    </div>
  );
}

function DuplicateIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2.5" y="2.5" width="8" height="8" rx="1.5" />
      <path d="M5.5 13.5h6a1.5 1.5 0 0 0 1.5-1.5v-6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2.5 4h11" />
      <path d="M6 4V2.75A.75.75 0 0 1 6.75 2h2.5a.75.75 0 0 1 .75.75V4" />
      <path d="M4 4l.7 9.1a1 1 0 0 0 1 .9h4.6a1 1 0 0 0 1-.9L12 4" />
      <path d="M6.5 7v4M9.5 7v4" />
    </svg>
  );
}
