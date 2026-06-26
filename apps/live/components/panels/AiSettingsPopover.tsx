'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Portal } from '@/components/primitives/Portal';
import { Tooltip } from '@/components/primitives/Tooltip';
import { ToggleSwitch } from '@/components/palette/palette-controls';
import { GearIcon } from '@/components/chrome/tab-bar-icons';
import { ResetPositionGlyph } from '@/components/primitives/ResetPositionGlyph';
import { useClickOutside } from '@/hooks/ui/useClickOutside';
import { useEscape } from '@/hooks/ui/useEscape';
import { VIEWPORT_EDGE_MARGIN as EDGE } from '@/lib/clamp-to-viewport';

const WIDTH = 232;
const GAP = 8; // space between the trigger and the popover

// Settings popover for the AI Assistant panel (spec/25), mirroring the
// Palette / Map gear popovers: turn the AI Assistant off (hides the
// panel; the Settings dialog flips it back on), toggle the suggested-
// prompt chips, and reset the panel to its default corner. Portal-rendered
// so the panel's stacking context can't clip it.
export function AiSettingsPopover({
  enabled,
  onSetEnabled,
  showSuggestions,
  onSetShowSuggestions,
  onResetPosition,
  resettable,
}: {
  enabled: boolean;
  onSetEnabled: (value: boolean) => void;
  showSuggestions: boolean;
  onSetShowSuggestions: (value: boolean) => void;
  onResetPosition: () => void;
  resettable: boolean;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const t = triggerRef.current?.getBoundingClientRect();
      if (!t) return;
      const left = Math.max(EDGE, Math.min(t.right - WIDTH, window.innerWidth - WIDTH - EDGE));
      setPos({ left, top: t.bottom + GAP });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useClickOutside(panelRef, () => setOpen(false), open, '[data-ai-settings-trigger]');
  useEscape(() => setOpen(false), { enabled: open });

  return (
    <>
      <Tooltip title="AI settings" description="Options for the AI Assistant panel.">
        <button
          ref={triggerRef}
          type="button"
          data-ai-settings-trigger
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setOpen((v) => !v)}
          aria-label="AI settings"
          aria-expanded={open}
          aria-haspopup="dialog"
          className={`flex h-5 w-5 items-center justify-center rounded transition ${
            open
              ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
          }`}
        >
          <GearIcon />
        </button>
      </Tooltip>
      {open ? (
        <Portal>
          <div
            ref={panelRef}
            role="dialog"
            aria-label="AI settings"
            onPointerDown={(e) => e.stopPropagation()}
            className="fixed z-[var(--z-overlay)] flex animate-fade-in flex-col gap-0.5 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900"
            style={{ left: pos?.left ?? -9999, top: pos?.top ?? -9999, width: WIDTH }}
          >
            <ToggleRow
              label="AI Assistant"
              description="Turn off to hide the panel; switch it back on in Settings."
              checked={enabled}
              onChange={() => onSetEnabled(!enabled)}
            />
            <ToggleRow
              label="Suggested prompts"
              description="Show the quick-prompt chips under the mode tabs."
              checked={showSuggestions}
              onChange={() => onSetShowSuggestions(!showSuggestions)}
            />
            <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
            <button
              type="button"
              disabled={!resettable}
              onClick={() => {
                onResetPosition();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800 dark:disabled:hover:bg-transparent"
            >
              <ResetPositionGlyph />
              <span className="flex flex-col">
                <span>Reset position</span>
                <span className="text-[10px] font-normal leading-snug text-slate-400 dark:text-slate-500">
                  {resettable
                    ? 'Snap back to the default corner.'
                    : 'Already at the default corner.'}
                </span>
              </span>
            </button>
          </div>
        </Portal>
      ) : null}
    </>
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
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
    >
      <span className="flex min-w-0 flex-col">
        <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-[10px] leading-snug text-slate-400 dark:text-slate-500">
          {description}
        </span>
      </span>
      <ToggleSwitch checked={checked} label={label} presentational />
    </button>
  );
}
