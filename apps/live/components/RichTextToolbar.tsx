// The floating WYSIWYG toolbar shown above an element while its label is
// being edited (spec/09). Applies bold / italic / underline / strikethrough
// / size / colour to the current text selection. Rendered by RichTextEditor
// (which owns the selection + the apply handlers); this component is pure
// presentation + the critical focus-preservation detail.

import { BoldIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon } from './palette-icons';
import type { RunBoolKey, RunSize } from '@livediagram/diagram';

// The resolved formatting of the current selection: each boolean is true
// when EVERY character in the selection is effectively-on; size/color are
// the uniform value across the selection, or null when mixed.
export type ActiveFormat = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  size: RunSize | null;
  color: string | null;
};

const SIZES: { key: RunSize; label: string }[] = [
  { key: 'sm', label: 'S' },
  { key: 'md', label: 'M' },
  { key: 'lg', label: 'L' },
];

// Default 6-hex for the native colour input when the selection's colour is
// mixed or inherited (the input can't represent "no value").
const DEFAULT_SWATCH = '#0f172a';

function btnClass(active: boolean): string {
  return `flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-xs font-semibold transition ${
    active
      ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
  }`;
}

export function RichTextToolbar({
  active,
  onToggle,
  onSize,
  onColor,
}: {
  active: ActiveFormat;
  onToggle: (key: RunBoolKey) => void;
  onSize: (size: RunSize) => void;
  onColor: (color: string) => void;
}) {
  // preventDefault on mousedown keeps focus + the live selection in the
  // contentEditable when a button is clicked (the classic rich-text-toolbar
  // bug). The colour <input> is the ONE control that must take focus to
  // open the OS picker, so it deliberately omits preventDefault — the editor
  // skips its commit-on-blur for focus moving into this toolbar, and
  // re-focuses + restores the selection after the colour applies.
  const noFocusSteal = (e: React.MouseEvent) => e.preventDefault();
  const toggles: { key: RunBoolKey; label: string; icon: React.ReactNode }[] = [
    { key: 'bold', label: 'Bold', icon: <BoldIcon /> },
    { key: 'italic', label: 'Italic', icon: <ItalicIcon /> },
    { key: 'underline', label: 'Underline', icon: <UnderlineIcon /> },
    { key: 'strikethrough', label: 'Strikethrough', icon: <StrikethroughIcon /> },
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-1 py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      {toggles.map((t) => (
        <button
          key={t.key}
          type="button"
          aria-label={t.label}
          aria-pressed={active[t.key]}
          onMouseDown={noFocusSteal}
          onClick={() => onToggle(t.key)}
          className={btnClass(active[t.key])}
        >
          {t.icon}
        </button>
      ))}
      <span className="mx-0.5 h-5 w-px bg-slate-200 dark:bg-slate-700" aria-hidden />
      {SIZES.map((s) => (
        <button
          key={s.key}
          type="button"
          aria-label={`Size ${s.label}`}
          aria-pressed={active.size === s.key}
          onMouseDown={noFocusSteal}
          onClick={() => onSize(s.key)}
          className={btnClass(active.size === s.key)}
        >
          {s.label}
        </button>
      ))}
      <span className="mx-0.5 h-5 w-px bg-slate-200 dark:bg-slate-700" aria-hidden />
      <label
        className="flex h-7 cursor-pointer items-center rounded px-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Text color"
      >
        <span
          className="h-4 w-4 rounded border border-slate-300 dark:border-slate-600"
          style={{ backgroundColor: active.color ?? DEFAULT_SWATCH }}
          aria-hidden
        />
        <input
          type="color"
          value={active.color ?? DEFAULT_SWATCH}
          onChange={(e) => onColor(e.target.value)}
          aria-label="Text color"
          className="absolute h-0 w-0 opacity-0"
        />
      </label>
    </div>
  );
}
