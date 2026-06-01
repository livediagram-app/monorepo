'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { DiagramSettings } from '@/lib/diagram-settings';

// Per-diagram preference dialog (spec/20). Launched from the
// settings gear in the TabBar footer. Each row is a toggle bound
// to a single flag in DiagramSettings; the editor owns the state
// and persists it via the diagram-settings helpers.

type SettingsDialogProps = {
  settings: DiagramSettings;
  onChange: (next: DiagramSettings) => void;
  onClose: () => void;
};

export function SettingsDialog({ settings, onChange, onClose }: SettingsDialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  const autoRebind = settings.autoRebindArrows !== false;

  return createPortal(
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
        aria-label="Diagram settings"
        className="flex w-[480px] max-w-[calc(100%-2rem)] flex-col rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Diagram settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <CloseIcon />
          </button>
        </header>
        <div className="flex flex-col gap-3 p-4">
          <ToggleRow
            label="Auto-attach arrows when elements move"
            description="Arrows connected to a shape re-pin to whichever face reads most naturally as you drag. Turn off to keep arrow anchors fixed at whatever you chose originally."
            checked={autoRebind}
            onChange={(v) => onChange({ ...settings, autoRebindArrows: v })}
          />
        </div>
        <footer className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Settings are stored per diagram on this device.
          </p>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-brand-300 dark:border-slate-700 dark:hover:border-brand-500/60">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{label}</span>
        <span className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          {description}
        </span>
      </span>
    </label>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M3 3l10 10M3 13l10-10" />
    </svg>
  );
}
