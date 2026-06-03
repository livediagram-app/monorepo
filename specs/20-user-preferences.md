# User preferences

Per-user editor preference flags that toggle behaviour without
changing diagram content. A small Settings dialog launched from
the footer (gear button to the left of the dark-mode toggle)
exposes them. Replaces the earlier per-diagram-settings shape:
preferences are about the user's editor experience, not about any
particular diagram, so they live once on the device and apply
everywhere.

## Where preferences live

Stored client-side in `localStorage` under a single key
`livediagram:user-preferences:v1` (no per-diagram suffix). Per
browser, per user, applies to every diagram they open from this
device. v1 deliberately avoids a D1 migration because:

- The flag set is small and UI-only, so a server round-trip per
  toggle is overkill.
- Different users editing the same diagram may legitimately
  disagree about "should arrows auto-rebind?" (one likes the
  magic, another finds it disorienting). Per-user keeps that
  honest.
- The persistence shape is easy to graft into D1 (Clerk-keyed)
  later if any flag ever needs to follow a signed-in user
  across devices.

When `localStorage` is unavailable (SSR build, private-window
restrictions) the dialog still renders but falls back to in-
memory state for the session.

## Schema

```ts
type UserPreferences = {
  // When false, the live editor skips the "re-pin connected arrow
  // anchors as elements move" pass implemented in packages/diagram's
  // `rebindArrowAnchorsAfterMove` (pinned in
  // packages/diagram/src/geometry.test.ts). Defaults to true so
  // users see the magic by default; flipping it off freezes arrow
  // anchors at whatever the user chose at draw time.
  autoRebindArrows?: boolean;

  // When false, the live editor's `track()` helper is a no-op:
  // nothing leaves the browser. Distinct from the build-time
  // NEXT_PUBLIC_TELEMETRY_ENABLED gate and from the api worker's
  // TELEMETRY_ENABLED gate (both still apply). This is the user's
  // own opt-out lever, surfaced in the Settings dialog so the
  // "first-party, no creepy tracking" claim on the landing page
  // and /telemetry is honest. Defaults to true (telemetry on);
  // setting it to false is the only state that changes behaviour.
  // See spec/22 for the rest of the telemetry contract.
  telemetryEnabled?: boolean;
};
```

Stored as serialised JSON. Unknown keys are preserved on read so a
forward-rolled client doesn't strip another version's flags.

## Defaults

Missing key === undefined === default behaviour. Concretely:

- `autoRebindArrows` undefined → arrows rebind (the default
  behaviour). Setting it to `false` is the only state that
  changes behaviour.
- `telemetryEnabled` undefined → telemetry on (the default).
  Setting it to `false` is the only state that opts out.

Empty (or missing entirely) localStorage entry for users who
never open the dialog is therefore the "everything on" state.

## UI placement

- Settings dialog component: `apps/live/components/SettingsDialog.tsx`,
  lazy-loaded via `next/dynamic` (matches the other on-demand
  modals: ShareDialog, ExportTabDialog, ShortcutsDialog, ImagePicker).
- Trigger: a gear-icon button in the TabBar footer, sitting
  between the existing Shortcuts button and the dark-mode toggle.
  Visible in every role: view-role visitors can still flip their
  own telemetry preference and (harmlessly) their own
  auto-rebind preference, even though they can't edit elements.

## Read / write helpers

Live in `apps/live/lib/user-preferences.ts`:

- `readUserPreferences(): UserPreferences` returns the current
  preferences, parsing the stored JSON and defaulting any missing
  key. Returns `{}` on parse failure (graceful).
- `writeUserPreferences(prefs): void` serialises and writes back.
  Also dispatches a `livediagram:preferences-changed` window event
  so same-tab listeners (notably `lib/telemetry.ts`) can refresh
  their cached gate without polling.

Cross-tab updates are picked up via the browser's native `storage`
event on the preferences key.
