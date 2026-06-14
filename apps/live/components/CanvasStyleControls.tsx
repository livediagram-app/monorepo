'use client';

// The per-tab canvas-style controls: the pattern grid (with the "Show
// more patterns" toggle), the Canvas + Pattern colour swatches, and the
// pattern-opacity slider. Lifted out of TabSection so the same block
// renders in both the palette's Canvas accordion AND the Canvas tab of
// the right-click CanvasThemeDialog (spec/42) — the two can't drift.
//
// Purely presentational: every change is a callback prop applied live to
// the active tab. The "Show more" expansion is local UI state owned here.

import type { BackgroundPattern } from '@livediagram/diagram';
import { useShowMoreList } from '@/hooks/useShowMoreList';
import { ColorSwatch, PATTERNS, PatternButton } from './palette-controls';
import { ShowMoreButton } from './ShowMoreButton';
import { Tooltip } from './Tooltip';

export function CanvasStyleControls({
  backgroundPattern,
  backgroundColor,
  patternColor,
  backgroundOpacity,
  onSetBackgroundPattern,
  onSetBackgroundColor,
  onSetPatternColor,
  onSetBackgroundOpacity,
  patternColumns = 4,
}: {
  backgroundPattern: BackgroundPattern;
  backgroundColor: string;
  patternColor: string;
  backgroundOpacity: number;
  onSetBackgroundPattern: (pattern: BackgroundPattern) => void;
  onSetBackgroundColor: (color: string) => void;
  onSetPatternColor: (color: string) => void;
  onSetBackgroundOpacity: (opacity: number) => void;
  // Pattern-grid density. The narrow palette accordion uses 4; the wide
  // dialog passes 7 so the tiles aren't marooned with empty gutters.
  // Discrete values keep the class names static for Tailwind.
  patternColumns?: 4 | 7;
}) {
  // Auto-expands when the active pattern sits behind the toggle so the
  // current selection is always visible.
  const patternsList = useShowMoreList(PATTERNS, (p) => p.id === backgroundPattern);
  const patternGridClass =
    patternColumns === 7
      ? 'mt-1 grid grid-cols-4 gap-1 sm:grid-cols-7'
      : 'mt-1 grid grid-cols-4 gap-1';

  return (
    <>
      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-300">Pattern</p>
      <div className={patternGridClass}>
        {patternsList.visible.map((p) => (
          <Tooltip key={p.id} title={p.label} description={p.description}>
            <PatternButton
              active={backgroundPattern === p.id}
              onClick={() => onSetBackgroundPattern(p.id)}
              label={p.shortLabel}
            >
              <p.icon />
            </PatternButton>
          </Tooltip>
        ))}
      </div>
      {patternsList.hasMore && !patternsList.showAll ? (
        <ShowMoreButton label="Show more patterns" onClick={patternsList.reveal} />
      ) : null}
      <p className="mt-3 border-t border-slate-100 pt-3 text-[10px] font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Colours
      </p>
      <div className="mt-1 flex items-stretch gap-1">
        <Tooltip title="Canvas colour" description="The colour of the canvas background.">
          <ColorSwatch label="Canvas" value={backgroundColor} onChange={onSetBackgroundColor} />
        </Tooltip>
        <Tooltip title="Pattern colour" description="The colour of the grid dots or ruled lines.">
          <ColorSwatch label="Pattern" value={patternColor} onChange={onSetPatternColor} />
        </Tooltip>
      </div>
      <div className="mt-3 flex flex-col gap-1 border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Opacity</p>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-300">
            {Math.round(backgroundOpacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={backgroundOpacity}
          onChange={(e) => onSetBackgroundOpacity(parseFloat(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-500 dark:bg-slate-700"
        />
      </div>
    </>
  );
}
