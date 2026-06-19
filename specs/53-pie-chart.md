# 53 — Pie chart

A **Pie chart** is a data element: slices sized by value, in a categorical
palette, with a legend beside the pie. It's the first of a **Data** family of
chart components (a dedicated palette category), built so more chart kinds slot
in beside it.

## Behaviour

- Drag it in from the palette's new **Data** category. It drops with three
  sample slices.
- A **Data** context-menu category edits the chart: one row per slice — a
  recolourable swatch, a **label**, and a **value** — plus add / remove. The
  pie + legend redraw live from the data.
- The **Animation** category carries the chart-specific slice animations
  (None / Grow / Pop / Spin / Pulse, with a **Speed** row + **Repeat** toggle)
  in place of the boxed-element animation set — a pie animates its slices, not
  the whole box. Grow / Pop play once (an entrance); Spin / Pulse loop.
- Slice colours default to **variants of the active theme** (`themeChartPalette`
  — each branch hue on multi-colour themes, accent tints/shades on single-accent
  themes), overridable per slice. So a pie reads as part of the theme out of the
  box.
- It's a normal boxed element otherwise (move / resize / select / group / lock),
  but the **Colours / Border / Presets** context-menu categories are hidden — a
  pie styles per-slice via its Data category, not as one filled box.

## Model

Pie chart is a `ShapeKind` `'pie-chart'` (like the progress / rating elements),
not a new top-level type — so it inherits boxed-element behaviour with no new
render/copy/export branches.

- `ShapeElement.pieSlices?: PieSlice[]` (`{ label, value, color? }`), plus
  `pieAnim?` / `pieAnimSpeed?` / `pieAnimRepeat?`. The `PieSlice` / `PieAnim`
  types, `PIE_ANIMS`, `PIE_PALETTE`, `PIE_DEFAULT_SLICES`, and `isPieShape()`
  live in `packages/diagram/src/index.ts`.
- Rendered by `PieChartView` (`apps/live/components/PieChartView.tsx`): SVG
  wedges sized by value (a single 100% slice draws as a full circle), default
  palette or per-slice colour, with a legend; the slice group carries the
  `lvd-pie-*` animation (CSS in `globals.css`, reduced-motion-safe).
  `element-variant.ts` gives it a borderless wrapper.
- Setters in `useElementStyle.ts`: `setPieDataSelected(slices)` (the Data editor
  builds the next array — add / remove / edit — and commits it) +
  `setPieAnim*Selected`, gated to pie shapes.
- Telemetry (spec/22): `track('Element', 'Added', 'PieChart')` on create,
  `track('Element', 'Changed', 'PieData' | 'PieAnim')` on edits.

Follows the composite-component pattern (spec/51, 52): a dedicated `ShapeKind`

- small `ShapeElement` fields + a bespoke `*View` + a borderless variant + a
  context-menu category. New chart kinds reuse it under the same Data palette tab.
