// Per-diagram editor preference flags. See spec/20.
//
// Storage shape: a single `localStorage` entry per diagram, keyed
// `livediagram:diagram-settings:v1:<diagramId>`, with JSON value.
// Missing key === defaults (every flag off === every feature on,
// since the flags exist to OPT OUT of behaviours, not into them).
//
// No event bus / subscription: the dialog is the only mutator and
// editor-page rereads the value when it mounts + caches the
// result in component state for the session.

export type DiagramSettings = {
  // When `false`, the editor skips the auto arrow-rebind pass on
  // move (spec/19's `rebindArrowAnchorsAfterMove` in
  // packages/diagram). Missing / undefined === auto-rebind on.
  autoRebindArrows?: boolean;
};

const STORAGE_PREFIX = 'livediagram:diagram-settings:v1:';

function storageKey(diagramId: string): string {
  return `${STORAGE_PREFIX}${diagramId}`;
}

// Read the settings for one diagram. Returns `{}` on a missing
// key, an SSR / private-window environment without
// `localStorage`, or a parse error (corrupted JSON). The empty-
// object default lets the call site spread it without nulls,
// and `autoRebindArrows ?? true`-style defaults handle every
// flag uniformly.
export function readDiagramSettings(diagramId: string): DiagramSettings {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(storageKey(diagramId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return {};
    // Keep unknown keys: forward-compat for future-versioned flags
    // a different client may have written.
    return parsed as DiagramSettings;
  } catch {
    return {};
  }
}

// Write the settings back. Best-effort: a quota / private-window
// failure is swallowed (the dialog state still applies in-memory
// for the session; the user just loses the persistence).
export function writeDiagramSettings(diagramId: string, settings: DiagramSettings): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(storageKey(diagramId), JSON.stringify(settings));
  } catch {
    // Silent: localStorage write failures don't surface in v1.
  }
}
