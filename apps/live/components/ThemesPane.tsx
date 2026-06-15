'use client';

// The Explorer "Themes" section (spec/44): manage the owner's saved
// custom themes. Lists each as a swatch preview + name with edit /
// duplicate / delete, and a New-theme card. Editing / creating opens the
// shared CustomThemeBuilder in a modal (the same builder the Tab
// Appearance dialog hosts, so the two can't drift). Reads the reactive
// list + CRUD from CustomThemeProvider, which the Explorer shell mounts.

import { useState } from 'react';
import { useEscape } from '@/hooks/useEscape';
import { materialiseCustomTheme } from '@/lib/custom-theme-registry';
import { useCustomThemes } from './CustomThemeProvider';
import { CustomThemeBuilder, type CustomThemeDraft } from './CustomThemeBuilder';
import { CloseIcon } from './CloseIcon';
import { Portal } from './Portal';
import { ThemeSwatch } from './ThemeSwatch';

export function ThemesPane() {
  const { themes, loading, createTheme, updateTheme, deleteTheme } = useCustomThemes();
  const [building, setBuilding] = useState<null | 'new' | string>(null);
  const [saving, setSaving] = useState(false);

  const editing = typeof building === 'string' ? themes.find((t) => t.id === building) : undefined;

  const handleSave = async (draft: CustomThemeDraft) => {
    setSaving(true);
    try {
      if (building === 'new') await createTheme(draft.name, draft.definition);
      else if (editing) await updateTheme(editing.id, draft);
      setBuilding(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="px-1 py-8 text-sm text-slate-500">Loading themes…</p>;
  }

  return (
    <div>
      {themes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-600">No custom themes yet.</p>
          <p className="mt-1 text-xs text-slate-400">
            Build your own palette and reuse it across diagrams.
          </p>
          <button
            type="button"
            onClick={() => setBuilding('new')}
            className="mt-4 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-500"
          >
            New theme
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {themes.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <ThemeSwatch theme={materialiseCustomTheme(t)} size="lg" />
              <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                {t.name}
              </span>
              <div className="flex gap-1.5 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setBuilding(t.id)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void createTheme(`${t.name} copy`, t.definition)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => deleteTheme(t.id)}
                  className="ml-auto rounded-md border border-slate-200 px-2 py-1 text-slate-500 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setBuilding('new')}
            className="flex min-h-[7rem] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 text-slate-500 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-600 dark:text-slate-400"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="M8 3.5v9M3.5 8h9" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-medium">New theme</span>
          </button>
        </div>
      )}

      {building !== null ? (
        <BuilderModal
          initial={editing ? { name: editing.name, definition: editing.definition } : undefined}
          saving={saving}
          onSave={handleSave}
          onClose={() => setBuilding(null)}
        />
      ) : null}
    </div>
  );
}

function BuilderModal({
  initial,
  saving,
  onSave,
  onClose,
}: {
  initial?: CustomThemeDraft;
  saving: boolean;
  onSave: (draft: CustomThemeDraft) => void;
  onClose: () => void;
}) {
  useEscape(onClose);
  return (
    <Portal>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-slate-950/60"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={initial ? 'Edit theme' : 'New theme'}
          className="flex max-h-[calc(100%-2rem)] w-[34rem] max-w-full flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <CloseIcon size={16} strokeWidth={1.6} />
            </button>
          </div>
          <CustomThemeBuilder
            initial={initial}
            saving={saving}
            onSave={onSave}
            onCancel={onClose}
          />
        </div>
      </div>
    </Portal>
  );
}
