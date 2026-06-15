'use client';

// The right-click "Change Canvas" / "Change Theme" dialog (spec/42). One
// modal, two tabs: Canvas (pattern + colours + opacity) and Theme (the
// category-browse picker). Opens on whichever tab the menu item picked; the
// user can switch freely. Every control applies live to the active tab via
// its callback — there's no Apply/Cancel, closing just dismisses. (The tab
// font + default-size controls used to live here as a third Font tab; they
// now sit in the tab / canvas context menu's Font category, see spec/28.)
//
// The tabs render shared components (CanvasStyleControls,
// ThemeCategoryBrowser) so they're identical to the palette accordion and the
// New-diagram picker respectively. Follows the standard modal contract
// (Portal + backdrop + Escape) used by SettingsDialog.

import { useState } from 'react';
import type { BackgroundPattern } from '@livediagram/diagram';
import type { ThemeId } from '@/lib/themes';
import { isCustomThemeId, materialiseCustomTheme } from '@/lib/custom-theme-registry';
import { useEscape } from '@/hooks/useEscape';
import { useCustomThemes } from './CustomThemeProvider';
import { CanvasStyleControls } from './CanvasStyleControls';
import { CloseIcon } from './CloseIcon';
import { CustomThemeBuilder, type CustomThemeDraft } from './CustomThemeBuilder';
import { ResetIcon } from './palette-icons';
import { Portal } from './Portal';
import { ThemeCategoryBrowser } from './ThemeCategoryBrowser';
import { ThemeSwatch } from './ThemeSwatch';

export type CanvasThemeTab = 'canvas' | 'theme';

type CanvasThemeDialogProps = {
  tab: CanvasThemeTab;
  onTabChange: (tab: CanvasThemeTab) => void;
  // Canvas style (current values + live setters).
  backgroundPattern: BackgroundPattern;
  backgroundColor: string;
  patternColor: string;
  backgroundOpacity: number;
  onSetBackgroundPattern: (pattern: BackgroundPattern) => void;
  onSetBackgroundColor: (color: string) => void;
  onSetPatternColor: (color: string) => void;
  onSetBackgroundOpacity: (opacity: number) => void;
  // Theme. `themeId` is a built-in ThemeId or a custom `custom:<uuid>`
  // id (spec/44), so it's widened to string; onSetTheme applies either.
  themeId: string;
  onSetTheme: (id: string) => void;
  onResetElementsToTheme: () => void;
  onClose: () => void;
};

export function CanvasThemeDialog({
  tab,
  onTabChange,
  backgroundPattern,
  backgroundColor,
  patternColor,
  backgroundOpacity,
  onSetBackgroundPattern,
  onSetBackgroundColor,
  onSetPatternColor,
  onSetBackgroundOpacity,
  themeId,
  onSetTheme,
  onResetElementsToTheme,
  onClose,
}: CanvasThemeDialogProps) {
  useEscape(onClose);
  const { themes: customThemes, createTheme, updateTheme, deleteTheme } = useCustomThemes();
  // null = browsing; 'new' = building a fresh theme; an id = editing it.
  const [building, setBuilding] = useState<null | 'new' | string>(null);
  const [saving, setSaving] = useState(false);

  const editingTheme =
    typeof building === 'string' ? customThemes.find((t) => t.id === building) : undefined;

  const handleSave = async (draft: CustomThemeDraft) => {
    setSaving(true);
    try {
      if (building === 'new') {
        const created = await createTheme(draft.name, draft.definition);
        if (created) onSetTheme(created.id);
      } else if (editingTheme) {
        await updateTheme(editingTheme.id, draft);
        // Re-apply so the live tab repaints with the edited definition.
        onSetTheme(editingTheme.id);
      }
      setBuilding(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tab appearance"
          className="flex max-h-[calc(100%-2rem)] w-[44rem] max-w-[calc(100%-2rem)] flex-col rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          {/* Header + the full-width tab bar live in one band so the modal
              reads as a single unit rather than two stacked divider rows. */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 pb-3 pt-3 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Tab Appearance
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <CloseIcon size={16} strokeWidth={1.6} />
              </button>
            </div>
            <div className="flex w-full gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <TabButton
                active={tab === 'canvas'}
                onClick={() => onTabChange('canvas')}
                icon={<BackgroundTabIcon />}
              >
                Canvas
              </TabButton>
              <TabButton
                active={tab === 'theme'}
                onClick={() => onTabChange('theme')}
                icon={<ThemeTabIcon />}
              >
                Theme
              </TabButton>
            </div>
          </div>

          {/* Fixed min-height so switching between tabs doesn't collapse the
              modal and make it jump around. */}
          <div className="min-h-[20rem] overflow-y-auto px-5 py-4">
            {tab === 'canvas' ? (
              <CanvasStyleControls
                backgroundPattern={backgroundPattern}
                backgroundColor={backgroundColor}
                patternColor={patternColor}
                backgroundOpacity={backgroundOpacity}
                onSetBackgroundPattern={onSetBackgroundPattern}
                onSetBackgroundColor={onSetBackgroundColor}
                onSetPatternColor={onSetPatternColor}
                onSetBackgroundOpacity={onSetBackgroundOpacity}
                patternColumns={7}
                showAllPatterns
              />
            ) : building !== null ? (
              <CustomThemeBuilder
                initial={
                  editingTheme
                    ? { name: editingTheme.name, definition: editingTheme.definition }
                    : undefined
                }
                saving={saving}
                onSave={handleSave}
                onCancel={() => setBuilding(null)}
              />
            ) : (
              <>
                <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                  Sets the canvas backdrop and recolours every element on this tab to match the
                  theme (sticky notes keep their amber palette).
                </p>
                {/* My themes (spec/44): the owner's saved custom themes plus
                    a New-theme card that opens the builder. */}
                <div className="mt-3">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    My themes
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {customThemes.map((t) => (
                      <CustomThemeCard
                        key={t.id}
                        theme={t}
                        active={themeId === t.id}
                        onApply={() => onSetTheme(t.id)}
                        onEdit={() => setBuilding(t.id)}
                        onDelete={() => {
                          if (themeId === t.id) onSetTheme('brand');
                          deleteTheme(t.id);
                        }}
                      />
                    ))}
                    <NewThemeCard onClick={() => setBuilding('new')} />
                  </div>
                </div>
                <ThemeCategoryBrowser
                  // A custom theme is highlighted in the row above, not in
                  // the built-in grid, so the browser sees 'brand' then.
                  themeId={isCustomThemeId(themeId) ? 'brand' : (themeId as ThemeId)}
                  onSelect={onSetTheme}
                  onCommit={(id) => {
                    onSetTheme(id);
                    onClose();
                  }}
                  className="mt-4"
                />
                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={onResetElementsToTheme}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-500/60 dark:hover:bg-brand-500/15 dark:hover:text-brand-200"
                  >
                    <ResetIcon />
                    Reset elements to theme
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}

// A saved custom theme: its swatch preview + name, click to apply, with
// hover Edit / Delete affordances.
function CustomThemeCard({
  theme,
  active,
  onApply,
  onEdit,
  onDelete,
}: {
  theme: import('@livediagram/api-schema').CustomTheme;
  active: boolean;
  onApply: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={
        'group relative flex flex-col gap-1 rounded-lg border p-1.5 text-left transition ' +
        (active
          ? 'border-brand-400 ring-1 ring-brand-300 dark:border-brand-500'
          : 'border-slate-200 hover:border-brand-300 dark:border-slate-700 dark:hover:border-brand-500/60')
      }
    >
      <button
        type="button"
        onClick={onApply}
        className="flex flex-col gap-1"
        aria-label={theme.name}
      >
        <ThemeSwatch theme={materialiseCustomTheme(theme)} size="md" />
        <span className="truncate text-[11px] font-medium text-slate-700 dark:text-slate-200">
          {theme.name}
        </span>
      </button>
      <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${theme.name}`}
          className="rounded bg-white/90 p-0.5 text-slate-500 shadow-sm hover:text-brand-600 dark:bg-slate-800/90 dark:text-slate-300"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            aria-hidden
          >
            <path d="M11.5 2.5l2 2L6 12l-3 1 1-3z" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${theme.name}`}
          className="rounded bg-white/90 p-0.5 text-slate-500 shadow-sm hover:text-rose-600 dark:bg-slate-800/90 dark:text-slate-300"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            aria-hidden
          >
            <path
              d="M3.5 4.5h9M6.5 4.5V3h3v1.5M5 4.5l.5 8h5l.5-8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function NewThemeCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[3.75rem] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-slate-500 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-brand-500/60 dark:hover:text-brand-300"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path d="M8 3.5v9M3.5 8h9" strokeLinecap="round" />
      </svg>
      <span className="text-[11px] font-medium">New theme</span>
    </button>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ' +
        (active
          ? 'bg-white font-semibold text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100'
          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100')
      }
    >
      <span className={active ? 'text-brand-500 dark:text-brand-300' : ''}>{icon}</span>
      {children}
    </button>
  );
}

// Compact 14px glyphs for the tab bar.
function BackgroundTabIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden
    >
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
      <circle cx="6" cy="6" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="10" cy="6" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="6" cy="10" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="10" cy="10" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
function ThemeTabIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden
    >
      <path d="M8 2.5a5.5 5.5 0 1 0 0 11c.9 0 1.3-.7 1.3-1.3 0-.7-.6-1-.6-1.6 0-.5.4-.9 1-.9h1.1A2.7 2.7 0 0 0 13.5 7 5.5 5.5 0 0 0 8 2.5z" />
      <circle cx="5.5" cy="7" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="8" cy="5.2" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}
