'use client';

import type { TelemetrySummary, TelemetryWindowKey } from '@livediagram/api-schema';
import { RankCard, rank } from './RankCard';
import { windowLabel } from './windows';

// Palette view (spec/22): what people reach for in the editor's creation
// palette, most to least. Three rankings drawn from the events the palette
// already emits: canvas Tools (`Canvas·Used·<tool>`), Shapes and Components
// (both `Element·Added·<type>`, split by the component catalogue below). Like
// Look & Feel, everything reflects the global window; only items with events
// in it appear.

// The pre-built component blocks the palette drops in (mirrors
// COMPONENT_TELEMETRY in apps/live useShapeDrawing). Element·Added rows whose
// type is in this set are Components; everything else is a plain Shape.
const COMPONENT_TYPES = new Set([
  'Banner',
  'Hero',
  'Header',
  'Callout',
  'StatRow',
  'ProcessSteps',
  'Avatar',
]);

export function PaletteView({
  summary,
  active,
}: {
  summary: TelemetrySummary;
  active: TelemetryWindowKey;
}) {
  const rows = summary.windows[active].rows;

  const tools = rank(rows, (r) => r.category === 'Canvas' && r.action === 'Used');
  const shapes = rank(
    rows,
    (r) => r.category === 'Element' && r.action === 'Added' && !COMPONENT_TYPES.has(r.type ?? ''),
  );
  const components = rank(
    rows,
    (r) => r.category === 'Element' && r.action === 'Added' && COMPONENT_TYPES.has(r.type ?? ''),
  );

  return (
    <div className="mt-8">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        What people reach for in the creation palette, for{' '}
        <span className="font-medium">{windowLabel(active)}</span>, most to least used.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RankCard
          title="Shapes"
          subtitle="Boxes, arrows, stickies and other primitives dropped on the canvas"
          category="Element"
          action="Added"
          items={shapes}
          daily={summary.daily}
          emptyLabel="No shapes were added in this window yet."
        />
        <RankCard
          title="Components"
          subtitle="Pre-built blocks: banners, heroes, callouts, stat rows and more"
          category="Element"
          action="Added"
          items={components}
          daily={summary.daily}
          emptyLabel="No components were added in this window yet."
        />
        <RankCard
          title="Tools"
          subtitle="Canvas tools: laser, spotlight, eraser, format painter, isometric"
          category="Canvas"
          action="Used"
          items={tools}
          daily={summary.daily}
          emptyLabel="No canvas tools were used in this window yet."
        />
      </div>
    </div>
  );
}
