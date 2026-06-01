import { useLayoutEffect, useRef, useState } from 'react';
import { Tooltip } from './Tooltip';

type Bounds = { x: number; y: number; width: number; height: number };

type SelectionPopoverProps = {
  bounds: Bounds;
  canvasOffset: { x: number; y: number };
  zoom: number;
  locked: boolean;
  onToggleLock: () => void;
  onDelete: () => void;
  onCopyFormat?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onOpenComments?: () => void;
  // Open the per-element note popover. Notes are a single plain-
  // text paragraph, distinct from the threaded comments.
  onOpenNote?: () => void;
  // True when the selected element already has a non-empty note.
  // Drives the note button's active-state highlight so the user
  // can tell at a glance whether a note exists.
  hasNote?: boolean;
  // Open the same context menu that a right-click on the element
  // would open, anchored under the ellipsis button. Surfaces the
  // full action list on touch devices that can't right-click.
  onOpenContextMenu?: (screenX: number, screenY: number) => void;
};

// The plus button sits between the popover and the element edge it
// belongs to. Bumped to 48 px so the plus has clear breathing room:
// at 36 px the popover crowded it and felt visually cramped.
const GAP = 48;
const EDGE_MARGIN = 8;

export function SelectionPopover({
  bounds,
  canvasOffset,
  zoom,
  locked,
  onToggleLock,
  onDelete,
  onCopyFormat,
  onGroup,
  onUngroup,
  onOpenComments,
  onOpenNote,
  hasNote,
  onOpenContextMenu,
}: SelectionPopoverProps) {
  const ellipsisRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [adjust, setAdjust] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  // Prefer above by default. After mount we measure and flip to
  // below only if there isn't room — checked in screen space, not
  // canvas space, because auto-fit puts most elements at negative
  // canvas-y, which made the old canvas-coord check always pick
  // "below".
  const [placeAbove, setPlaceAbove] = useState(true);

  const visualGap = GAP / zoom;
  const baseTop = placeAbove ? bounds.y - visualGap : bounds.y + bounds.height + visualGap;
  const baseLeft = bounds.x + bounds.width / 2;

  // After mount: (1) flip below if above doesn't fit in the viewport,
  // (2) nudge inside the viewport for edge cases. Both work off the
  // popover's own getBoundingClientRect so they account for the
  // outer canvas transform without needing to plumb it in.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    // Flip if the chosen direction doesn't fit; only flip once per
    // cycle so we don't oscillate when both directions are tight.
    if (placeAbove && rect.top < EDGE_MARGIN) {
      setPlaceAbove(false);
      return;
    }
    if (!placeAbove && rect.bottom > window.innerHeight - EDGE_MARGIN) {
      setPlaceAbove(true);
      return;
    }
    let dx = 0;
    let dy = 0;
    if (rect.left < EDGE_MARGIN) dx = EDGE_MARGIN - rect.left;
    else if (rect.right > window.innerWidth - EDGE_MARGIN)
      dx = window.innerWidth - EDGE_MARGIN - rect.right;
    if (rect.top < EDGE_MARGIN) dy = EDGE_MARGIN - rect.top;
    else if (rect.bottom > window.innerHeight - EDGE_MARGIN)
      dy = window.innerHeight - EDGE_MARGIN - rect.bottom;
    if (dx !== adjust.x || dy !== adjust.y) setAdjust({ x: dx, y: dy });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bounds.x, bounds.y, bounds.width, bounds.height, canvasOffset.x, canvasOffset.y, placeAbove]);

  return (
    <div
      ref={ref}
      onPointerDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="pointer-events-auto absolute z-20 flex animate-fade-in items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/40"
      style={{
        left: baseLeft + adjust.x,
        top: baseTop + adjust.y,
        // Counter-scale so the popover renders at its natural on-screen
        // size regardless of canvas zoom. Origin pinned to the centre edge
        // closest to the selected element so the popover stays attached.
        transform: `translate(-50%, ${placeAbove ? '-100%' : '0'}) scale(${1 / zoom})`,
        transformOrigin: placeAbove ? 'center bottom' : 'center top',
      }}
    >
      {/* Ellipsis at the start: opens the right-click context menu
          anchored under the button. Touch users have no native
          right-click gesture, so this is the discoverable way to
          reach the full action list. */}
      {onOpenContextMenu ? (
        <>
          <Tooltip title="More" description="Open the element menu.">
            <button
              ref={ellipsisRef}
              type="button"
              onClick={() => {
                const rect = ellipsisRef.current?.getBoundingClientRect();
                if (!rect) return;
                onOpenContextMenu(rect.left, rect.bottom);
              }}
              aria-label="More actions"
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <EllipsisIcon />
            </button>
          </Tooltip>
          <Divider />
        </>
      ) : null}

      {/* Copy formatting stays on the toolbar because the format
          painter is a stateful gesture (click + click-to-apply) that
          reads naturally as a dedicated button. Duplicate moved into
          the context menu, since its action is one-shot and the
          toolbar was getting crowded once notes + comments + ellipsis
          were added. */}
      {onCopyFormat ? (
        <>
          <PopoverButton
            label="Copy formatting"
            description="Apply this size to the next click."
            onClick={onCopyFormat}
          >
            <PaintbrushIcon />
          </PopoverButton>

          <Divider />
        </>
      ) : null}

      {onOpenComments ? (
        <PopoverButton
          label="Comments"
          description="Open the comment thread for this element."
          onClick={onOpenComments}
        >
          <CommentIcon />
        </PopoverButton>
      ) : null}
      {onOpenNote ? (
        <PopoverButton
          label="Note"
          description="Attach a multi-line note to this element."
          active={hasNote}
          onClick={onOpenNote}
        >
          <NoteIcon />
        </PopoverButton>
      ) : null}

      <Divider />

      {/* Group: constraints on movement & resize. Group / Ungroup sits at
          the start of this cluster so it reads next to the aspect-lock
          button — grouping is the "lock these together" sibling of "lock
          the aspect ratio". */}
      {onUngroup ? (
        <PopoverButton
          label="Ungroup"
          description="Break group; members move alone."
          onClick={onUngroup}
        >
          <UngroupIcon />
        </PopoverButton>
      ) : onGroup ? (
        <PopoverButton
          label="Group with another"
          description="Click elements to group with this."
          onClick={onGroup}
        >
          <GroupIcon />
        </PopoverButton>
      ) : null}
      <Tooltip
        title={locked ? 'Unlock' : 'Lock'}
        description={
          locked
            ? 'Allow this element to be moved and resized again.'
            : 'Prevent accidental moves and resizes. You can still delete or unlock.'
        }
      >
        <button
          type="button"
          onClick={onToggleLock}
          aria-label={locked ? 'Unlock' : 'Lock'}
          aria-pressed={locked}
          className={
            locked
              ? 'flex h-8 w-8 items-center justify-center rounded-md bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-100'
              : 'flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
          }
        >
          <LockIcon closed={locked} />
        </button>
      </Tooltip>
      <Divider />

      {/* Group: destructive (always last so it's not adjacent to anything benign). */}
      <Tooltip title="Delete" description="Delete this element (arrows too).">
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete"
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-300 dark:hover:bg-rose-500/15 dark:hover:text-rose-300"
        >
          <TrashIcon />
        </button>
      </Tooltip>
    </div>
  );
}

function Divider() {
  return <div aria-hidden className="mx-0.5 h-6 w-px shrink-0 bg-slate-200 dark:bg-slate-700" />;
}

function PopoverButton({
  label,
  description,
  onClick,
  children,
  active,
}: {
  label: string;
  description: string;
  onClick: () => void;
  children: React.ReactNode;
  // True when the action has a present-state to surface (e.g. a
  // note exists on the selected element). Lights the button up in
  // brand colours so the user can tell at a glance.
  active?: boolean;
}) {
  return (
    <Tooltip title={label} description={description}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={active ? true : undefined}
        className={
          active
            ? 'flex h-8 w-8 items-center justify-center rounded-md bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-100'
            : 'flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
        }
      >
        {children}
      </button>
    </Tooltip>
  );
}

function EllipsisIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <circle cx="4" cy="8" r="1.4" fill="currentColor" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" />
      <circle cx="12" cy="8" r="1.4" fill="currentColor" />
    </svg>
  );
}

function PaintbrushIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M13.5 2.5l-6 6" />
      <path d="M7 8l1.5 1.5" />
      <path d="M6.5 9.5a3 3 0 1 0 1 4.5c.5-.6.5-1.4 0-2-.6-.5-1.4-.5-2 0" />
    </svg>
  );
}

function GroupIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2.25" y="2.25" width="8" height="8" rx="1.25" />
      <rect x="5.75" y="5.75" width="8" height="8" rx="1.25" fill="white" />
    </svg>
  );
}

function UngroupIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="6" height="6" rx="1" />
      <rect x="8" y="8" width="6" height="6" rx="1" />
    </svg>
  );
}

function LockIcon({ closed }: { closed: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="7.5" width="10" height="6.5" rx="1.25" />
      {closed ? (
        <path d="M5.25 7.5V5a2.75 2.75 0 0 1 5.5 0v2.5" />
      ) : (
        <path d="M5.25 7.5V5a2.75 2.75 0 0 1 5.4-.7" />
      )}
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 2.5h7l3 3v8a0.5 0.5 0 0 1 -0.5 0.5h-9.5a0.5 0.5 0 0 1 -0.5 -0.5v-10.5a0.5 0.5 0 0 1 0.5 -0.5z" />
      <path d="M10 2.5v3h3" />
      <path d="M5.5 9h5M5.5 11.5h5" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2.5 4a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 13.5 4v5A1.5 1.5 0 0 1 12 10.5H7l-3 2.5V10.5A1.5 1.5 0 0 1 2.5 9z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
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
