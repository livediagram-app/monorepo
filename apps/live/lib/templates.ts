import type { BackgroundPattern, Tab } from '@livediagram/diagram';

export type TemplateKind =
  | 'blank'
  | 'mindmap'
  | 'orgchart'
  | 'retrospective'
  | 'flowchart'
  | 'kanban'
  | 'swot'
  | 'timeline'
  | 'venn'
  | 'journey'
  | 'fishbone'
  | 'pyramid'
  // UI wireframes (use the device-frame shapes added in spec/09's
  // Devices accordion). Sit under "Show more" because they're
  // situational starters for design / product work.
  | 'mobile-wireframe'
  | 'laptop-wireframe'
  | 'slide-deck'
  // A growth / momentum flywheel: hub + four sectors with a clockwise
  // arrow loop. Sits under "Show more" alongside the other strategy /
  // wireframing starters.
  | 'flywheel'
  // Logo-design lockup sheet: one canvas with all four common
  // wordmark compositions side by side (icon-left / icon-above,
  // each with and without a tagline) so a designer can pick the
  // composition that fits, delete the rest, and iterate.
  | 'logo-design'
  // Gantt chart: a month header row plus six cascading milestone rows
  // (label + full-width track + coloured duration bar). A project-
  // planning starter; sits under "Show more".
  | 'gantt'
  // Live card: a compact event / status card lockup. Sits under
  // "Show more".
  | 'live-card'
  // Comparison table: a plan-comparison grid (the table element).
  | 'comparison-table'
  // Technical / developer-diagram starters (spec/09 "Templates"). They
  // reuse the existing shape vocabulary — cylinders for datastores, the
  // table element for entities, dashed arrows for lifelines / returns —
  // so a dev audience has a first-class starting point. All sit under
  // "Show more".
  | 'system-architecture'
  | 'er-diagram'
  | 'sequence-diagram'
  // Impact / Effort prioritisation chart: crossed value / effort axes
  // with items scattered across the field to drag into the right
  // quadrant. A product / planning starter.
  | 'prioritization-matrix';

export type TemplateDescriptor = {
  kind: TemplateKind;
  title: string;
  description: string;
  // True for templates that sit behind the picker's "Show more"
  // toggle. Default templates render in the first batch; extras
  // unlock on click so the grid stays compact for first-time users.
  extra?: boolean;
};

export const TEMPLATES: TemplateDescriptor[] = [
  {
    kind: 'blank',
    title: 'Blank diagram',
    description: 'An empty canvas to start with whatever you like.',
  },
  {
    kind: 'mindmap',
    title: 'Mind map',
    description: 'A central idea with branching topics around it.',
  },
  {
    kind: 'orgchart',
    title: 'Org chart',
    description: 'A simple hierarchy: leader with direct reports.',
  },
  {
    kind: 'retrospective',
    title: 'Retrospective',
    description: '"What went well", "What didn\'t", "Action items".',
  },
  {
    kind: 'flowchart',
    title: 'Flowchart',
    description: 'Start → step → decision → end, with a branching path.',
  },
  {
    kind: 'kanban',
    title: 'Kanban',
    description: 'Five lanes from Backlog to Done, with ticket cards and priority chips.',
  },
  {
    kind: 'swot',
    title: 'SWOT',
    description: 'Spacious 2×2 with a role icon and bullet starters in each quadrant.',
  },
  {
    kind: 'timeline',
    title: 'Timeline',
    description: 'Horizontal line with milestone markers, above + below.',
  },
  {
    kind: 'venn',
    title: 'Venn diagram',
    description: 'Three overlapping sets with shared and exclusive labels.',
    extra: true,
  },
  {
    kind: 'journey',
    title: 'User journey',
    description: 'Stages a user moves through, with feeling notes below each.',
    extra: true,
  },
  {
    kind: 'fishbone',
    title: 'Fishbone',
    description: 'Cause-and-effect spine with four contributing categories.',
    extra: true,
  },
  {
    kind: 'pyramid',
    title: 'Pyramid',
    description: 'Four stacked tiers: foundation at the bottom, peak on top.',
    extra: true,
  },
  {
    kind: 'mobile-wireframe',
    title: 'Mobile wireframe',
    description: 'Three phone screens side by side: a user-flow starter for mobile UI work.',
    extra: true,
  },
  {
    kind: 'laptop-wireframe',
    title: 'Laptop wireframe',
    description:
      'A laptop frame with header, sidebar and content placeholders for desktop UI work.',
    extra: true,
  },
  {
    kind: 'slide-deck',
    title: 'Slide deck',
    description: 'Four blank slides in a 2 by 2 grid, like a short PowerPoint outline.',
    extra: true,
  },
  {
    kind: 'flywheel',
    title: 'Flywheel',
    description:
      'A central momentum hub with four reinforcing stages and a clockwise loop of arrows.',
    extra: true,
  },
  {
    kind: 'logo-design',
    title: 'Logo design',
    description:
      'Four wordmark lockups on one canvas (icon-left / icon-above, each with and without a tagline). Pick a composition, delete the rest, replace the placeholder icons with your own.',
    extra: true,
  },
  {
    kind: 'gantt',
    title: 'Gantt chart',
    description:
      'A month header with six cascading milestone rows: labels, tracks and coloured duration bars for project planning.',
    extra: true,
  },
  {
    kind: 'live-card',
    title: 'Live card',
    description: 'A compact event / status card lockup you can drop in and rename.',
    extra: true,
  },
  {
    kind: 'comparison-table',
    title: 'Comparison table',
    description: 'A plan-comparison grid with header row + column and zebra striping.',
    extra: true,
  },
  {
    kind: 'system-architecture',
    title: 'System architecture',
    description:
      'A request path through a small service topology: client → API gateway → services → database + cache.',
    extra: true,
  },
  {
    kind: 'er-diagram',
    title: 'ER diagram',
    description:
      'Four entity tables (Users / Orders / Products / OrderItems) wired by relationships.',
    extra: true,
  },
  {
    kind: 'sequence-diagram',
    title: 'Sequence diagram',
    description:
      'Participant lifelines with request / response messages stepping down a login flow.',
    extra: true,
  },
  {
    kind: 'prioritization-matrix',
    title: 'Prioritization matrix',
    description: 'Value vs Effort chart with crossed axes and items to scatter into quadrants.',
    extra: true,
  },
];

// Picker grouping. Templates are organised into a handful of
// categories so the picker reads as titled sections (Diagrams /
// Planning / Design / Technical) instead of one long flat grid. The
// mapping lives beside the catalogue (mirroring TEMPLATE_PATTERNS) so a
// new template slots into a section with a one-line edit; the picker
// renders sections in TEMPLATE_CATEGORIES order and skips empties.
export type TemplateCategory = 'general' | 'planning' | 'strategy' | 'design' | 'technical';

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string; description: string }[] = [
  { id: 'general', label: 'Diagrams', description: 'Flowcharts, mind maps, org charts and more.' },
  {
    id: 'planning',
    label: 'Planning',
    description: 'Boards, schedules and roadmaps for delivery.',
  },
  {
    id: 'strategy',
    label: 'Strategy',
    description: 'Frameworks for analysis and decisions.',
  },
  { id: 'design', label: 'Design', description: 'Wireframes, slides and visual mock-ups.' },
  {
    id: 'technical',
    label: 'Technical',
    description: 'Architecture, ER and sequence diagrams.',
  },
];

const TEMPLATE_CATEGORY: Record<TemplateKind, TemplateCategory> = {
  // General-purpose diagrams: the everyday shapes-and-arrows starters
  // (structure + relationships, no specific domain).
  blank: 'general',
  mindmap: 'general',
  orgchart: 'general',
  flowchart: 'general',
  venn: 'general',
  fishbone: 'general',
  pyramid: 'general',
  // Planning: agile boards, project schedules + roadmaps, prioritisation.
  kanban: 'planning',
  gantt: 'planning',
  timeline: 'planning',
  retrospective: 'planning',
  'prioritization-matrix': 'planning',
  // Strategy: business / product analysis + decision frameworks.
  swot: 'strategy',
  flywheel: 'strategy',
  journey: 'strategy',
  'comparison-table': 'strategy',
  // Design: wireframes, slides + visual mock-ups.
  'mobile-wireframe': 'design',
  'laptop-wireframe': 'design',
  'slide-deck': 'design',
  'logo-design': 'design',
  'live-card': 'design',
  // Technical / developer diagrams.
  'system-architecture': 'technical',
  'er-diagram': 'technical',
  'sequence-diagram': 'technical',
};

export function templateCategory(kind: TemplateKind): TemplateCategory {
  return TEMPLATE_CATEGORY[kind];
}

// The canvas backdrop pattern that best suits each template's layout.
// Applied on top of the chosen theme (which only supplies the colours),
// so a starter ships with a fitting canvas instead of inheriting the
// theme's default dot grid:
//   - graph paper for alignment-heavy scaffolds (flow / org / SWOT /
//     Gantt / kanban / wireframes) where boxes snap to a square grid,
//   - a blank canvas for clean radial layouts (Venn, flywheel,
//     pyramid) where the shapes should carry the page,
//   - a crosshatch backdrop for the slide deck, so the slide frames
//     read as cards lifted off a textured surface,
//   - a checkerboard "design board" for the logo lockup sheet,
//   - horizontal rules for the time-ordered timeline / journey,
//   - the dot grid (explicit, so it survives even a blank-canvas theme)
//     for the sticky-note / freeform boards.
// Templates not listed here fall through to the theme's pattern.
const TEMPLATE_PATTERNS: Partial<Record<TemplateKind, BackgroundPattern>> = {
  flowchart: 'graph',
  orgchart: 'graph',
  swot: 'graph',
  gantt: 'graph',
  kanban: 'graph',
  'mobile-wireframe': 'graph',
  'laptop-wireframe': 'graph',
  venn: 'blank',
  flywheel: 'blank',
  pyramid: 'blank',
  'slide-deck': 'crosshatch',
  'logo-design': 'checkerboard',
  timeline: 'lines',
  journey: 'lines',
  retrospective: 'grid',
  fishbone: 'grid',
  'live-card': 'grid',
  mindmap: 'grid',
  // Technical diagrams are alignment-heavy (boxes + tables snap to a
  // grid), so they ride graph paper like the flow / org / SWOT scaffolds.
  'system-architecture': 'graph',
  'er-diagram': 'graph',
  'sequence-diagram': 'graph',
  'prioritization-matrix': 'graph',
};

// Canvas-level overrides a specific template ships with, applied on top
// of whatever theme is selected. Each template carries its preferred
// backdrop pattern (see TEMPLATE_PATTERNS); Mind map and User journey
// additionally soften the canvas opacity so the pattern recedes behind
// the radiating branches / the stage row.
export function templateCanvasOverrides(kind: TemplateKind): Partial<Tab> {
  const overrides: Partial<Tab> = {};
  const pattern = TEMPLATE_PATTERNS[kind];
  if (pattern) overrides.backgroundPattern = pattern;
  if (kind === 'mindmap' || kind === 'journey' || kind === 'prioritization-matrix')
    overrides.backgroundOpacity = 0.8;
  return overrides;
}
