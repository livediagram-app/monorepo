'use client';

// The custom-theme builder (spec/44). Fast by default, deep on demand:
// it opens on three base colours (Base / Fill / Stroke) from which sane
// defaults for everything else are derived, then expands to the granular
// controls (text colour, pattern, per-shape colours). Shared by the Tab
// Appearance Theme tab and the Explorer Themes pane, so the two entry
// points can't drift. Purely a form: it owns a draft, and hands the
// finished { name, definition } back via onSave.

import { useState } from 'react';
import {
  deriveTextColorForBg,
  elementKindLabel,
  tint,
  type BackgroundPattern,
  type ShapeKind,
} from '@livediagram/diagram';
import type { CustomThemeDefinition } from '@livediagram/api-schema';
import { ColorSwatch, PATTERNS, PatternButton } from './palette-controls';
import { ShapeIcon } from './shape-icon';

// The shape kinds offered in the per-shape editor: the flowchart /
// diagram vocabulary where a per-kind colour is meaningful. Device
// frames, the icon glyph, the frame container and the actor figure are
// left out (their colour is intrinsic or not a fill/stroke box).
const PER_SHAPE_KINDS: ShapeKind[] = [
  'square',
  'circle',
  'diamond',
  'stadium',
  'parallelogram',
  'hexagon',
  'document',
  'triangle',
  'trapezoid',
  'cylinder',
  'cloud',
  'star',
];

export type CustomThemeDraft = { name: string; definition: CustomThemeDefinition };

const FALLBACK_FILL = '#dbeafe';
const FALLBACK_STROKE = '#2563eb';

function resolved(
  def: CustomThemeDefinition,
  kind: ShapeKind,
): { fill: string; stroke: string; text: string } {
  const o = def.shapeColors?.[kind];
  return {
    fill: o?.fill ?? def.elementFill ?? FALLBACK_FILL,
    stroke: o?.stroke ?? def.elementStroke ?? FALLBACK_STROKE,
    text: o?.text ?? def.elementText ?? '#0f172a',
  };
}

export function CustomThemeBuilder({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  // Provided when editing an existing theme; omitted when creating.
  initial?: CustomThemeDraft;
  onSave: (draft: CustomThemeDraft) => void;
  onCancel: () => void;
  saving?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [def, setDef] = useState<CustomThemeDefinition>(
    initial?.definition ?? {
      backgroundColor: '#ffffff',
      backgroundPattern: 'grid',
      patternColor: '#cbd5e1',
      elementFill: FALLBACK_FILL,
      elementStroke: FALLBACK_STROKE,
      elementText: '#1e3a8a',
    },
  );
  // When editing, the text + pattern colours are already deliberate, so
  // don't auto-derive over them. When creating, derive until touched.
  const [textTouched, setTextTouched] = useState(!!initial);
  const [patternColorTouched, setPatternColorTouched] = useState(!!initial);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [shapesOpen, setShapesOpen] = useState(false);

  const patch = (p: Partial<CustomThemeDefinition>) => setDef((d) => ({ ...d, ...p }));

  // Editing a base colour re-derives the not-yet-touched dependents so
  // three clicks yield a coherent theme.
  const setFill = (fill: string) =>
    patch({
      elementFill: fill,
      ...(textTouched ? {} : { elementText: deriveTextColorForBg(fill) }),
    });
  const setStroke = (stroke: string) =>
    patch({
      elementStroke: stroke,
      ...(patternColorTouched ? {} : { patternColor: tint(stroke, 0.6) }),
    });

  // Per-shape override write: an unset (empty) value clears that channel
  // so the kind falls back to the base element colour.
  const setShapeColour = (kind: ShapeKind, channel: 'fill' | 'stroke' | 'text', value: string) =>
    setDef((d) => {
      const next = { ...(d.shapeColors ?? {}) };
      next[kind] = { ...next[kind], [channel]: value };
      return { ...d, shapeColors: next };
    });
  const clearShape = (kind: ShapeKind) =>
    setDef((d) => {
      if (!d.shapeColors?.[kind]) return d;
      const next = { ...d.shapeColors };
      delete next[kind];
      return { ...d, shapeColors: Object.keys(next).length ? next : undefined };
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M7.5 2.5 4 6l3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {initial ? 'Edit theme' : 'New theme'}
        </span>
      </div>

      <ThemePreview def={def} />

      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My theme"
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none transition focus:border-brand-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>

      {/* Three base colours — the fast path. */}
      <div>
        <p className="mb-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Base colours
        </p>
        <div className="flex flex-wrap gap-1 rounded-lg border border-slate-100 p-1 dark:border-slate-800">
          <ColorSwatch
            label="Base"
            value={def.backgroundColor}
            onChange={(c) => patch({ backgroundColor: c })}
          />
          <ColorSwatch label="Fill" value={def.elementFill ?? FALLBACK_FILL} onChange={setFill} />
          <ColorSwatch
            label="Stroke"
            value={def.elementStroke ?? FALLBACK_STROKE}
            onChange={setStroke}
          />
        </div>
      </div>

      <ExpandRow
        label="Customize details"
        open={detailsOpen}
        onToggle={() => setDetailsOpen((o) => !o)}
      >
        <div className="flex flex-wrap gap-1">
          <ColorSwatch
            label="Text"
            value={def.elementText ?? '#0f172a'}
            onChange={(c) => {
              setTextTouched(true);
              patch({ elementText: c });
            }}
          />
          <ColorSwatch
            label="Pattern colour"
            value={def.patternColor}
            onChange={(c) => {
              setPatternColorTouched(true);
              patch({ patternColor: c });
            }}
          />
        </div>
        <p className="mb-1 mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Pattern
        </p>
        <div className="grid grid-cols-4 gap-1 sm:grid-cols-7">
          {PATTERNS.map((p) => (
            <PatternButton
              key={p.id}
              active={def.backgroundPattern === p.id}
              onClick={() => patch({ backgroundPattern: p.id as BackgroundPattern })}
              label={p.shortLabel}
            >
              <p.icon />
            </PatternButton>
          ))}
        </div>
      </ExpandRow>

      <ExpandRow
        label="Per-shape colours"
        open={shapesOpen}
        onToggle={() => setShapesOpen((o) => !o)}
      >
        <p className="mb-2 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          Give a shape kind its own colours (like UML). Leave a kind unset to use the base colours.
        </p>
        <div className="flex flex-col gap-1.5">
          {PER_SHAPE_KINDS.map((kind) => {
            const o = def.shapeColors?.[kind];
            const r = resolved(def, kind);
            return (
              <div key={kind} className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
                  style={{ backgroundColor: r.fill, color: r.stroke }}
                >
                  <ShapeIcon kind={kind} />
                </span>
                <span className="w-24 shrink-0 truncate text-xs text-slate-600 dark:text-slate-300">
                  {elementKindLabel({ type: 'shape', shape: kind } as Parameters<
                    typeof elementKindLabel
                  >[0])}
                </span>
                <input
                  type="color"
                  aria-label={`${kind} fill`}
                  value={r.fill}
                  onChange={(e) => setShapeColour(kind, 'fill', e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border border-slate-300 dark:border-slate-600"
                />
                <input
                  type="color"
                  aria-label={`${kind} stroke`}
                  value={r.stroke}
                  onChange={(e) => setShapeColour(kind, 'stroke', e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border border-slate-300 dark:border-slate-600"
                />
                <input
                  type="color"
                  aria-label={`${kind} text`}
                  value={r.text}
                  onChange={(e) => setShapeColour(kind, 'text', e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border border-slate-300 dark:border-slate-600"
                />
                {o ? (
                  <button
                    type="button"
                    onClick={() => clearShape(kind)}
                    className="text-[10px] font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline dark:hover:text-slate-200"
                  >
                    reset
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </ExpandRow>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave({ name: name.trim() || 'My theme', definition: def })}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
        >
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Save theme'}
        </button>
      </div>
    </div>
  );
}

// Compact live preview: the backdrop colour with a few sample shapes
// rendered in their resolved colours, so the user sees the theme before
// saving.
function ThemePreview({ def }: { def: CustomThemeDefinition }) {
  const sample: ShapeKind[] = ['square', 'diamond', 'cylinder', 'stadium'];
  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
      style={{ backgroundColor: def.backgroundColor }}
    >
      {sample.map((kind) => {
        const r = resolved(def, kind);
        return (
          <span
            key={kind}
            className="flex h-9 w-9 items-center justify-center rounded-md border-2"
            style={{ backgroundColor: r.fill, borderColor: r.stroke, color: r.stroke }}
          >
            <ShapeIcon kind={kind} />
          </span>
        );
      })}
    </div>
  );
}

function ExpandRow({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-100 dark:border-slate-800">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-2.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
      >
        <span>{label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
          className={open ? 'rotate-180 transition' : 'transition'}
        >
          <path
            d="M3 4.5 6 7.5 9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? <div className="px-2.5 pb-2.5 pt-1">{children}</div> : null}
    </div>
  );
}
