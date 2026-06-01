# Diagram settings

Per-diagram preference flags that toggle editor behaviour without
changing the diagram's content. A small Settings dialog launched
from the footer (gear button to the left of the dark-mode toggle)
exposes them. v1 ships one flag (auto-rebind arrows on drag); the
file lays the groundwork for future toggles to slot in without
rewiring the UI each time.

## Where settings live

Stored client-side in `localStorage` under
`livediagram:diagram-settings:v1:<diagramId>`. Per-browser, per-
user, per-diagram (so a user's preference on one diagram doesn't
leak into another). v1 deliberately avoids a D1 migration because:

- The flag set is small + UI-only, so a server round-trip per
  toggle is overkill.
- Different users editing the same diagram may legitimately
  disagree about "should arrows auto-rebind?" (one user moves
  fast and likes the magic; another finds it disorienting). A
  per-user preference respects that.
- The persistence shape is easy to graft into D1 later if a flag
  ever needs to be shared across users (just add a `settings`
  TEXT column to `diagrams` and have the client merge server +
  local).

When `localStorage` is unavailable (SSR build, private-window
restrictions) the dialog still renders but falls back to in-
memory state for the session.

## Schema

```ts
type DiagramSettings = {
  // When false, the live editor skips the "re-pin connected arrow
  // anchors as elements move" pass (spec/19 cycle, implemented in
  // packages/diagram's `rebindArrowAnchorsAfterMove`). Defaults to
  // true so existing users see the magic by default; flipping it
  // off freezes arrow anchors at whatever the user chose at draw
  // time. Per-user, per-diagram (not synced across collaborators).
  autoRebindArrows?: boolean;
};
```

Stored as serialised JSON. Unknown keys are preserved on read so a
forward-rolled client doesn't strip another version's flags.

## Defaults

Missing setting === undefined === "feature on" for every flag.
Concretely:

- `autoRebindArrows` undefined → arrows rebind (the v1 default
  behaviour). Setting it to `false` is the only state that
  changes behaviour.

This shape keeps the localStorage entry empty (or missing
entirely) for users who never open the dialog.

## UI placement

- Settings dialog component: `apps/live/components/SettingsDialog.tsx`,
  lazy-loaded via `next/dynamic` (matches the other on-demand
  modals: ShareDialog, ExportTabDialog, ShortcutsDialog, ImagePicker).
- Trigger: a gear-icon button in the TabBar footer, sitting
  between the existing Shortcuts button and the dark-mode toggle.
  Hidden in view-role sessions (visitors can't change owner-only
  / collaborator preferences anyway, and the dialog's flags are
  all edit-side behaviour).

## Read / write helpers

Live in `apps/live/lib/diagram-settings.ts`:

- `readDiagramSettings(diagramId): DiagramSettings` returns the
  current settings, parsing the stored JSON and defaulting any
  missing key. Returns `{}` on parse failure (graceful).
- `writeDiagramSettings(diagramId, settings): void` serialises and
  writes back. No debounce: the dialog only mutates on direct
  user action so writes are infrequent.

The hooks layer is intentionally thin: editor-page reads on mount
and stashes the result in component state, mutates locally on
toggle, then writes back through the helper. No subscription /
event bus: settings rarely change mid-session.
