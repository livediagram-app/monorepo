'use client';

// The theme picker's two-level category browse: an overview (Basic
// quick-pick + a card per colour-temperament category) that drills into a
// category's themes with a Back affordance. Lifted out of TemplatePicker
// so the exact same browse renders in both the New-diagram picker
// (spec/14) and the Theme tab of the right-click CanvasThemeDialog
// (spec/42) — the two can't drift.
//
// Selection is reported via callbacks; the caller decides what "select"
// means (set local state vs apply live). `onCommit` is the double-click
// shortcut (defaults to onSelect when not given).

import { useState } from 'react';
import { shufflePinned } from '@/lib/shuffle';
import {
  THEME_CATEGORIES,
  THEMES,
  type ThemeCategory,
  type ThemeId,
  themeCategory,
} from '@/lib/themes';
import { AnimatedHeightBox } from './AnimatedHeightBox';
import { ThemeCard, ThemeCategoryCard, ThemeQuickPickCard } from './theme-picker-cards';

export function ThemeCategoryBrowser({
  themeId,
  onSelect,
  onCommit,
  className,
}: {
  // The currently-selected theme, highlighted across the overview + detail.
  themeId: ThemeId;
  onSelect: (id: ThemeId) => void;
  onCommit?: (id: ThemeId) => void;
  className?: string;
}) {
  // Drill-in state: null is the overview. If the selected theme isn't
  // Basic, open its category on mount so it lands highlighted rather than
  // buried behind a category card.
  const [openThemeCategory, setOpenThemeCategory] = useState<ThemeCategory | null>(() =>
    themeId !== 'brand' ? themeCategory(themeId) : null,
  );
  // Rotate which themes greet the user on each open (Basic always pinned
  // first). Shuffled once per mount via lazy useState so clicking around
  // never reshuffles it underfoot.
  const [themes] = useState(() => shufflePinned(THEMES, (t) => t.id === 'brand'));
  const commit = onCommit ?? onSelect;
  const brandTheme = THEMES.find((t) => t.id === 'brand');
  const themeCategoryThemes = (category: ThemeCategory) =>
    themes.filter((t) => t.id !== 'brand' && themeCategory(t.id) === category);

  return (
    <AnimatedHeightBox viewKey={openThemeCategory ?? 'overview'} className={className}>
      {openThemeCategory ? (
        <>
          <button
            type="button"
            onClick={() => setOpenThemeCategory(null)}
            className="mb-2 inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
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
            All themes
          </button>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {themeCategoryThemes(openThemeCategory).map((t) => (
              <ThemeCard
                key={t.id}
                theme={t}
                active={themeId === t.id}
                onSelect={() => onSelect(t.id)}
                onCommit={() => commit(t.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {brandTheme ? (
            <ThemeQuickPickCard
              theme={brandTheme}
              label="Basic"
              description="The plain, un-themed default."
              active={themeId === 'brand'}
              onSelect={() => onSelect('brand')}
              onCommit={() => commit('brand')}
            />
          ) : null}
          {THEME_CATEGORIES.map((cat) => {
            const items = themeCategoryThemes(cat.id);
            if (items.length === 0) return null;
            return (
              <ThemeCategoryCard
                key={cat.id}
                label={cat.label}
                description={cat.description}
                count={items.length}
                themes={items}
                selected={themeId !== 'brand' && themeCategory(themeId) === cat.id}
                onOpen={() => setOpenThemeCategory(cat.id)}
              />
            );
          })}
        </div>
      )}
    </AnimatedHeightBox>
  );
}
