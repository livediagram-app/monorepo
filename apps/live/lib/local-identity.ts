// Single source of truth for the browser-local identity state that
// guests rely on (spec/04). The key strings used to be inlined at
// every read/write site across editor-page, the new-diagram page and
// the Clerk bootstrap hook — renaming the namespace or evolving the
// schema needed a grep + sweep across several files. Centralising
// them here means a v3 migration is a one-line edit and the intent
// of each piece of state is documented once.
//
// All accessors are SSR-safe (`typeof window` guard) so they can be
// called from module bodies or non-effect code paths without
// crashing the static export build.
//
// Namespace prefix: `livediagram:v2:`. The `v2` tag survives a
// future schema break — if the shape of a stored value changes
// incompatibly we'll bump to `v3:` and drop the old keys at read
// time so a returning guest doesn't end up with mixed-version state.

const NS = 'livediagram:v2:';

const KEYS = {
  // Per-browser guest participant id (`crypto.randomUUID()`),
  // carried to the api worker as `X-Owner-Id` until/unless the
  // user signs in with Clerk. See spec/04 — "Hybrid identity".
  selfId: `${NS}self-id`,
  // Boolean flag — '1' once the user has confirmed their display
  // name via the welcome modal at least once. Used to suppress the
  // identity prompt on subsequent diagram opens. Only meaningful
  // for guests; signed-in users derive their name from Clerk.
  nameConfirmed: `${NS}name-confirmed`,
} as const;

function safeLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    // Browsers can throw on `localStorage` access in private modes
    // / when storage is disabled. Treat as no-op storage rather
    // than blowing up the page — the guest path degrades to a
    // session that doesn't persist across reloads, which is the
    // expected behaviour in those environments.
    return null;
  }
}

export function getGuestSelfId(): string | null {
  return safeLocalStorage()?.getItem(KEYS.selfId) ?? null;
}

export function setGuestSelfId(id: string): void {
  safeLocalStorage()?.setItem(KEYS.selfId, id);
}

export function clearGuestSelfId(): void {
  safeLocalStorage()?.removeItem(KEYS.selfId);
}

export function hasConfirmedName(): boolean {
  return safeLocalStorage()?.getItem(KEYS.nameConfirmed) === '1';
}

export function markNameConfirmed(): void {
  safeLocalStorage()?.setItem(KEYS.nameConfirmed, '1');
}
