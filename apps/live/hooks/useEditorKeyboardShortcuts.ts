// Global keyboard shortcuts for the editor route, lifted out of
// editor-page.tsx so the page file stays focused on orchestration.
//
// Two shortcuts today:
// - Escape cancels the format-painter or group-source mode if either
//   is active. Suppressed via the early return when neither is on so
//   the listener isn't attached unnecessarily.
// - Delete / Backspace wipes the current selection. Multi-selection
//   wins over single, view-only sessions are no-op'd before
//   preventDefault (so a viewer's Backspace still navigates the
//   browser as usual), and any focus inside an input / textarea /
//   contentEditable bails out so typing in a label doesn't delete
//   the element you're typing into.
//
// The deps stay on the useEffect dep arrays directly (no depsRef
// trick used by useEditorDrag / useEditorViewport): each onKey
// closure captures the latest values at attach time, and the effect
// re-attaches whenever any of its deps change. That's cheap because
// keydown listeners aren't dispatch-hot in the same way pointer-move
// is, and the closure-direct pattern is the React canon for one-shot
// keyboard handlers.

import { useEffect } from 'react';

type EditorKeyboardShortcutsDeps = {
  // Modal-interaction state. Escape clears whichever is active.
  formatSourceId: string | null;
  setFormatSourceId: (v: string | null) => void;
  groupSourceId: string | null;
  setGroupSourceId: (v: string | null) => void;
  // Selection state. Delete / Backspace acts on whichever is
  // populated (multi wins).
  selectedId: string | null;
  multiSelectedIds: Set<string>;
  editingId: string | null;
  // True for a view-only ('view' share role) session. Suppresses
  // Delete / Backspace entirely (incl. preventDefault) so the
  // browser's default behaviour for those keys stays intact.
  isReadOnly: boolean;
  // Action callbacks that perform the actual deletion. Both should
  // do nothing when there's no selection (defensive), but the
  // shortcut handler only invokes them when there IS one.
  deleteSelected: () => void;
  deleteMultiSelected: () => void;
  // Undo / redo callbacks. Cmd-Z (or Ctrl-Z on non-mac) undoes;
  // Cmd-Shift-Z (or Ctrl-Y / Ctrl-Shift-Z) redoes. The handlers
  // already no-op when there's nothing to undo/redo, so the
  // shortcut layer just invokes them unconditionally.
  undo: () => void;
  redo: () => void;
  // Per-device disable flag. When false, every shortcut effect
  // below short-circuits before attaching its listener. The
  // checkbox lives in the keyboard-shortcuts modal; the storage
  // hook is `useShortcutsEnabled`.
  enabled: boolean;
};

export function useEditorKeyboardShortcuts(deps: EditorKeyboardShortcutsDeps): void {
  const {
    formatSourceId,
    setFormatSourceId,
    groupSourceId,
    setGroupSourceId,
    selectedId,
    multiSelectedIds,
    editingId,
    isReadOnly,
    deleteSelected,
    deleteMultiSelected,
    undo,
    redo,
    enabled,
  } = deps;

  // Escape cancels the format-painter / group-source mode.
  useEffect(() => {
    if (!enabled) return;
    if (formatSourceId === null && groupSourceId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFormatSourceId(null);
        setGroupSourceId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, formatSourceId, groupSourceId, setFormatSourceId, setGroupSourceId]);

  // Delete / Backspace wipes the current selection. Multi-selection
  // wins over single, label-edit and any text-input focus bails out.
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      // View-only: bail before preventDefault so the browser's
      // default (Backspace = navigate back) still works.
      if (isReadOnly) return;
      const target = e.target as Element | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }
      if (editingId !== null) return;
      if (multiSelectedIds.size > 0) {
        e.preventDefault();
        deleteMultiSelected();
      } else if (selectedId !== null) {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // deleteSelected / deleteMultiSelected are recreated on every
    // editor-page render (closures over state); we want the latest
    // closures here, but listing them in deps would re-attach every
    // render. The shape mirrors the inline original's behaviour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, multiSelectedIds, selectedId, editingId, isReadOnly]);

  // Cmd-Z / Ctrl-Z = undo. Cmd-Shift-Z / Ctrl-Y / Ctrl-Shift-Z =
  // redo. Bails when focus is inside an input / textarea /
  // contentEditable so a user mid-rename uses the native undo
  // for their text edit, not the diagram-level one.
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (isReadOnly) return;
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const target = e.target as Element | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }
      const key = e.key.toLowerCase();
      // Redo branches: Cmd-Shift-Z (mac convention), Ctrl-Y
      // (Windows convention), Ctrl-Shift-Z (covers both).
      if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
        return;
      }
      if (key === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // Same closure-direct pattern as the Delete handler above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isReadOnly]);
}
