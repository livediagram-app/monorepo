// Per-user editor preference flags. See spec/20.
//
// Storage shape: a single `localStorage` entry under
// `livediagram:user-preferences:v1`, JSON value. Missing key ===
// defaults (every flag undefined === everything on, since flags
// exist to opt out, not into, default behaviours).
//
// Cross-tab consistency: callers can listen for the native `storage`
// event on STORAGE_KEY. Same-tab writes also fire a window event
// `livediagram:preferences-changed` so listeners that can't observe
// their own `localStorage.setItem` (like `lib/telemetry.ts`'s
// in-memory gate cache) still refresh promptly.

export type UserPreferences = {
  // When `false`, the editor skips the auto arrow-rebind pass on
  // move (spec/19's `rebindArrowAnchorsAfterMove` in
  // packages/diagram). Missing / undefined === auto-rebind on.
  autoRebindArrows?: boolean;
  // When `false`, `track()` in lib/telemetry is a no-op (the user
  // opted out of analytics). Distinct from the build-time
  // NEXT_PUBLIC_TELEMETRY_ENABLED gate and the api worker's
  // TELEMETRY_ENABLED gate. Missing / undefined === on.
  telemetryEnabled?: boolean;
};

export const STORAGE_KEY = 'livediagram:user-preferences:v1';
export const PREFERENCES_CHANGED_EVENT = 'livediagram:preferences-changed';

// Read the current preferences. Returns `{}` on missing key, an
// SSR / private-window environment without `localStorage`, or a
// parse error (corrupted JSON). The empty-object default lets
// the call site spread it without nulls, and field-level `?? true`
// defaults handle every flag uniformly.
export function readUserPreferences(): UserPreferences {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return {};
    // Keep unknown keys: forward-compat for future-versioned flags
    // a different client may have written.
    return parsed as UserPreferences;
  } catch {
    return {};
  }
}

// Write preferences back. Best-effort: a quota / private-window
// failure is swallowed (the dialog state still applies in-memory
// for the session; the user just loses the persistence). On
// success a same-tab `livediagram:preferences-changed` event
// fires so in-process listeners refresh without polling. The
// browser handles cross-tab via its native `storage` event.
export function writeUserPreferences(prefs: UserPreferences): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new Event(PREFERENCES_CHANGED_EVENT));
  } catch {
    // Silent: localStorage write failures don't surface in v1.
  }
}
