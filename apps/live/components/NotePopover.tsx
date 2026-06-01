'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Per-element note popover. Distinct from CommentThreadPopover:
// notes are a SINGLE plain-text paragraph (no author, no thread,
// no resolve / replies), surfaced as `element.note?: string` on
// the schema. The popover hovers over the canvas, anchored to the
// element's bounding box (the same way the SelectionPopover is),
// not portaled. Commit-on-blur + Cmd-Enter; Esc cancels.

type NotePopoverProps = {
  // Canvas-space bounds of the noted element. The popover snaps to
  // the bottom edge with a small gap so the note sits adjacent to
  // (rather than over) the shape.
  bounds: { x: number; y: number; width: number; height: number };
  // Current note text (defaults to empty if the element has none).
  initial: string;
  // Persist the next note text. Empty string + commit deletes the
  // field (see `setNote` in editor-page.tsx, which strips empties
  // before commit).
  onCommit: (next: string) => void;
  onClose: () => void;
};

export function NotePopover({ bounds, initial, onCommit, onClose }: NotePopoverProps) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  // Outside-click commits. Mirrors the commit-on-blur pattern the
  // rest of the editor's inline editors use; an outside click in
  // the canvas should land the user's edits rather than silently
  // discard them.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        onCommit(value);
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onCommit, onClose, value]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd-Enter / Ctrl-Enter commits + closes. Esc cancels (revert
    // to the initial value, don't write). Plain Enter inserts a
    // newline since this is a multi-line note.
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onCommit(value);
      onClose();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return createPortal(
    <div
      ref={ref}
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute z-50 flex w-72 flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-xl shadow-slate-900/10"
      style={{
        left: bounds.x + bounds.width / 2,
        top: bounds.y + bounds.height,
        transform: 'translate(-50%, 12px)',
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Note</p>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        rows={5}
        placeholder="Add a note for this element..."
        className="resize-y rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 placeholder:text-slate-400"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400">Cmd-Enter saves, Esc cancels.</span>
        <button
          type="button"
          onClick={() => {
            onCommit('');
            onClose();
          }}
          disabled={!initial && !value}
          className="text-[10px] font-medium text-rose-700 transition hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:no-underline"
        >
          Delete note
        </button>
      </div>
    </div>,
    document.body,
  );
}
