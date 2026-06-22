# 57 — Source layout: group `apps/live` components + hooks by domain

Status: **proposal** (taxonomy agreed; the file moves are a mechanical follow-up, see "Execution").

## Problem

`apps/live` has grown two flat grab-bag directories:

- `apps/live/components/` — ~157 files, alphabetical, mixing 3-line leaves
  (`ChartTooltip.tsx`, `CloseIcon.tsx`) with 1,000+ line screens
  (`Canvas.tsx`, `EditorContextMenu.tsx`, `BoxedElementView.tsx`).
- `apps/live/hooks/` — ~66 files, canvas state machines
  (`useEditorDrag.ts`, `useElementStyle.ts`) sitting next to UI-only hooks
  (`useConfirm.ts`, `useToast.ts`) and persistence hooks
  (`useFolders.ts`, `useTeams.ts`).

The blessed counter-example already in the tree is `apps/live/lib/api/*`,
which is split by domain (`diagrams.ts`, `tabs.ts`, `share.ts`, …). A new
contributor can find the persistence boundary instantly; finding "the
canvas components" means scrolling 157 alphabetised entries. This is the
flat-directory half of the consistency review (item #9); it complements
the no-god-files rule in `CLAUDE.md` (cohesion over line count).

## Proposed taxonomy

Group by domain, not by type. Target subdirectories (indicative, not
exhaustive — each file lands in the bucket that owns its concern):

`apps/live/components/`

- `canvas/` — `Canvas*`, element views (`BoxedElementView`, `ArrowView`,
  `LinkCardView`, …), overlays, marquee, layers.
- `dialogs/` — modal surfaces (`Dialog`, `ConfirmDialog`, `ShareDialog`,
  `ImportTabDialog`, `ExportTabDialog`, `SettingsDialog`, `TeamFormModal`).
- `panels/` — side/floating panels (`ActivityPanel`, `CommentsPanel`,
  `AiPanel`, `GalleryPane`, Explorer surfaces).
- `palette/` — palette + context-menu tiles/rows.
- `chrome/` — header, toolbars, docks, tab bar.
- `primitives/` — local leaves (`CloseIcon`, `Portal`, chart leaves) not
  promoted to `@livediagram/ui`.

`apps/live/hooks/`

- `canvas/` — drag, eraser, marquee, element style, keyboard shortcuts.
- `persistence/` — folders, teams, capabilities, custom themes, share links.
- `ui/` — confirm, toast, panel layout, escape/click-outside.
- `collab/` — room connection, presence, change log.

Rules:

- Import via the `@/components/<domain>/X` / `@/hooks/<domain>/X` path; no
  per-directory barrels (keeps tree-shaking + matches today's direct-path
  imports).
- A file belongs to the domain of its concern, not the screen that happens
  to render it first.
- Cross-app primitives keep migrating to `@livediagram/ui` (see review #4/#5:
  `Button`, `TextInput`); domain folders are for app-local code.

## Execution

This is a **single atomic change**, not an incremental one: a partial move
leaves the tree half-organised (worse than consistently-flat), and every
move rewrites `@/components/X` / `@/hooks/X` import sites across hundreds of
files — many of them hot files (`EditorView`, `useEditorState`, `Canvas`)
edited continuously by the repo's background auto-committer. Doing it
piecemeal against that churn guarantees merge conflicts and risks landing a
half-state on `main`.

So it must run in one pass with the working tree otherwise quiet:
`git mv` each file, then a project-wide import-path rewrite, then
`pnpm -w typecheck && pnpm -w lint && pnpm -w test` green before a single
commit. Best done in an isolated `git worktree` off `origin/main` with the
auto-committer paused.

Deferred until that window exists; the taxonomy above is the agreed target.
