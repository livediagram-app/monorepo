import type { Article } from './articles';

// Help-article registry, part 4 of 4 (spec/55). articles.ts concatenates
// the four parts into the canonical browse/search order.
export const ARTICLES_PART_4: Article[] = [
  {
    slug: 'changing-the-background',
    title: 'Changing the Canvas Background',
    description: 'Pick a canvas background from the Change Canvas dialog.',
    category: 'Canvas',
    categorySlug: 'canvas/the-canvas',
    parentSlug: 'the-canvas',
  },

  // ---- Sub-articles: Shapes ----
  {
    slug: 'shape-markers',
    title: 'Shape Markers',
    description: 'Traffic-light dots and a checkbox glyph inside a shape.',
    category: 'Palette',
    categorySlug: 'palette/shapes',
    parentSlug: 'shapes',
  },

  // ---- Sub-articles: Arrows ----
  {
    slug: 'arrow-styles',
    title: 'Arrow Styles',
    description: 'Straight, curved, and elbow arrows and how to switch between them.',
    category: 'Palette',
    categorySlug: 'palette/arrows',
    parentSlug: 'arrows',
  },
  {
    slug: 'curve-and-elbow-handles',
    title: 'Curve and Elbow Handles',
    description: 'Drag the handles to shape an arrow exactly how you want.',
    category: 'Palette',
    categorySlug: 'palette/arrows',
    parentSlug: 'arrows',
  },
  {
    slug: 'arrow-to-arrow',
    title: 'Connecting Arrows to Arrows',
    description: 'Snap an arrow endpoint onto another arrow for sequence diagrams.',
    category: 'Palette',
    categorySlug: 'palette/arrows',
    parentSlug: 'arrows',
  },

  // ---- Sub-articles: Tools ----
  {
    slug: 'drawing',
    title: 'Drawing and Sketch',
    description: 'Freehand drawing with the Pencil, plus shape recognition.',
    category: 'Palette',
    categorySlug: 'palette/tools',
    parentSlug: 'tools',
  },
  {
    slug: 'images',
    title: 'Images',
    description: 'Add images to the canvas from your per-owner gallery.',
    category: 'Palette',
    categorySlug: 'palette/tools',
    parentSlug: 'tools',
  },
  {
    slug: 'tables',
    title: 'Tables',
    description: 'An editable grid of cells for tabular content on the canvas.',
    category: 'Palette',
    categorySlug: 'palette/tools',
    parentSlug: 'tools',
  },
  {
    slug: 'sticky-notes',
    title: 'Sticky Notes',
    description: 'A coloured note card for short annotations and brainstorm items.',
    category: 'Palette',
    categorySlug: 'palette/tools',
    parentSlug: 'tools',
  },
  {
    slug: 'data-elements',
    title: 'Data and Chart Elements',
    description: 'Progress bars, ratings, pie charts, and timeline rails.',
    category: 'Palette',
    categorySlug: 'palette/tools',
    parentSlug: 'tools',
  },
  {
    slug: 'shape-recognition',
    title: 'Shape Recognition',
    description: 'Let the Pencil snap rough sketches into clean shapes.',
    category: 'Palette',
    categorySlug: 'palette/tools/drawing',
    parentSlug: 'drawing',
  },

  // ---- Sub-articles: Selecting and Grouping ----
  {
    slug: 'multi-select',
    title: 'Marquee and Multi-Select',
    description: 'Select many elements at once and act on them together.',
    category: 'Canvas',
    categorySlug: 'canvas/selecting-and-grouping',
    parentSlug: 'selecting-and-grouping',
  },
  {
    slug: 'groups',
    title: 'Groups',
    description: 'Bind elements into a group that moves and styles as one.',
    category: 'Canvas',
    categorySlug: 'canvas/selecting-and-grouping',
    parentSlug: 'selecting-and-grouping',
  },

  // ---- Sub-articles: Text and Fonts ----
  {
    slug: 'choosing-fonts',
    title: 'Choosing Fonts',
    description: 'Set a font per element or a default font for the whole tab.',
    category: 'Canvas',
    categorySlug: 'canvas/text-and-fonts',
    parentSlug: 'text-and-fonts',
  },

  // ---- Sub-articles: Themes ----
  {
    slug: 'changing-theme',
    title: 'Changing the Theme',
    description: 'Open the theme dialog and browse themes by category.',
    category: 'Canvas',
    categorySlug: 'canvas/themes',
    parentSlug: 'themes',
  },
  {
    slug: 'multicolour-themes',
    title: 'Multi-Colour Themes',
    description: 'Tint each branch of a hierarchy its own hue.',
    category: 'Canvas',
    categorySlug: 'canvas/themes',
    parentSlug: 'themes',
  },
  {
    slug: 'custom-themes',
    title: 'Custom Themes',
    description: 'Build, save, and reuse your own themes.',
    category: 'Canvas',
    categorySlug: 'canvas/themes',
    parentSlug: 'themes',
  },

  // ---- Sub-articles: Links ----
  {
    slug: 'link-cards',
    title: 'Link Cards',
    description: 'Bookmark a URL as a card with title, favicon, and preview.',
    category: 'Canvas',
    categorySlug: 'canvas/links',
    parentSlug: 'links',
  },

  // ---- Sub-articles: Teams ----
  {
    slug: 'roles-and-invites',
    title: 'Roles and Invites',
    description: 'Admin and Member roles, and inviting people by email.',
    category: 'Collaboration',
    categorySlug: 'collaboration/teams',
    parentSlug: 'teams',
  },
  {
    slug: 'team-shared-diagrams',
    title: 'Team Shared Diagrams',
    description: 'A per-team folder tree every member can manage.',
    category: 'Collaboration',
    categorySlug: 'collaboration/teams',
    parentSlug: 'teams',
  },

  // ---- Sub-articles: Sharing ----
  {
    slug: 'share-passwords',
    title: 'Share Passwords',
    description: 'Gate view or edit access behind a password.',
    category: 'Collaboration',
    categorySlug: 'collaboration/sharing',
    parentSlug: 'sharing',
  },
  {
    slug: 'share-link-expiry',
    title: 'Share Link Expiry',
    description: 'Give a share link a lifetime so it stops working later.',
    category: 'Collaboration',
    categorySlug: 'collaboration/sharing',
    parentSlug: 'sharing',
  },
  {
    slug: 'embeds',
    title: 'Read-Only Embeds',
    description: 'Drop a live, read-only diagram into another page.',
    category: 'Collaboration',
    categorySlug: 'collaboration/sharing',
    parentSlug: 'sharing',
  },

  // ---- Sub-articles: AI ----
  {
    slug: 'ai-tools',
    title: 'Ask and Clean',
    description: 'What each AI helper does and when to reach for it.',
    category: 'Tools',
    categorySlug: 'tools/ai',
    parentSlug: 'ai',
  },

  // ---- Activity Panel (feature category landings) ----
  {
    slug: 'what-it-is',
    title: 'What the Activity Panel Is',
    description: 'A running record of every change to a diagram: who did what, and when.',
    category: 'Activity Panel',
    categorySlug: 'activity-panel',
  },
  {
    slug: 'how-it-works',
    title: 'How the Activity Panel Works',
    description: 'Per-tab entries, real-time updates, jumping to an element, and clearing history.',
    category: 'Activity Panel',
    categorySlug: 'activity-panel',
  },
  {
    slug: 'undo',
    title: 'Undo',
    description: 'Step back your most recent change, with a keyboard shortcut and a button.',
    category: 'Activity Panel',
    categorySlug: 'activity-panel',
  },
  {
    slug: 'redo',
    title: 'Redo',
    description: 'Re-apply a change you just undid.',
    category: 'Activity Panel',
    categorySlug: 'activity-panel',
  },
  {
    slug: 'reverting-changes',
    title: 'Reverting a Change',
    description: 'Cancel one specific past change without disturbing later edits.',
    category: 'Activity Panel',
    categorySlug: 'activity-panel',
  },

  // ---- Sub-articles: Session Tools ----
  {
    slug: 'timer',
    title: 'The Timer',
    description: 'Run a shared countdown or stopwatch on a tab.',
    category: 'Collaboration',
    categorySlug: 'collaboration/session-tools',
    parentSlug: 'session-tools',
  },
  {
    slug: 'voting',
    title: 'Dot Voting',
    description: 'Let everyone vote live and tally the results.',
    category: 'Collaboration',
    categorySlug: 'collaboration/session-tools',
    parentSlug: 'session-tools',
  },

  // ---- Sub-articles: Data Elements ----
  {
    slug: 'progress-elements',
    title: 'Progress Bars and Rings',
    description: 'Show a 0–100% value with fill animations.',
    category: 'Palette',
    categorySlug: 'palette/tools/data-elements',
    parentSlug: 'data-elements',
  },
  {
    slug: 'rating',
    title: 'Rating',
    description: 'A 1–5 star rating element with a score picker.',
    category: 'Palette',
    categorySlug: 'palette/tools/data-elements',
    parentSlug: 'data-elements',
  },
  {
    slug: 'pie-chart',
    title: 'Pie Chart',
    description: 'An editable pie chart built from label and value rows.',
    category: 'Palette',
    categorySlug: 'palette/tools/data-elements',
    parentSlug: 'data-elements',
  },
  {
    slug: 'bar-and-line-charts',
    title: 'Bar and Line Charts',
    description: 'Multi-series bar and line charts from an editable grid or a CSV import.',
    category: 'Palette',
    categorySlug: 'palette/tools/data-elements',
    parentSlug: 'data-elements',
  },
  {
    slug: 'timeline-rail',
    title: 'Timeline Rail',
    description: 'A horizontal rail of evenly spaced, labelled points for roadmaps and processes.',
    category: 'Palette',
    categorySlug: 'palette/tools/data-elements',
    parentSlug: 'data-elements',
  },

  // ---- Sub-articles: Layout Cleanup ----
  {
    slug: 'auto-align',
    title: 'Auto-Align',
    description: 'Snap selected elements onto a tidy grid.',
    category: 'Tools',
    categorySlug: 'tools/layout-cleanup',
    parentSlug: 'layout-cleanup',
  },
  {
    slug: 'auto-layout',
    title: 'Auto Layout',
    description: 'Recompute positions from the arrow graph with Tidy Up.',
    category: 'Tools',
    categorySlug: 'tools/layout-cleanup',
    parentSlug: 'layout-cleanup',
  },

  // ============ Search Panel (landing + sub-articles) ============
  {
    slug: 'the-search-panel',
    title: 'The Search Panel',
    description: 'Open the global search, what it covers, and how to navigate the results.',
    category: 'Search Panel',
    categorySlug: 'search-panel',
  },
  {
    slug: 'search-diagrams',
    title: 'Finding Diagrams and Folders',
    description: 'Search across your diagrams, folders, and the diagrams shared with you.',
    category: 'Search Panel',
    categorySlug: 'search-panel/the-search-panel',
    parentSlug: 'the-search-panel',
  },
  {
    slug: 'search-teams',
    title: 'Searching Teams',
    description: 'Find teams and their shared folders and diagrams from the search panel.',
    category: 'Search Panel',
    categorySlug: 'search-panel/the-search-panel',
    parentSlug: 'the-search-panel',
  },
  {
    slug: 'search-tabs-and-elements',
    title: 'Finding Tabs and Elements',
    description: 'Inside a diagram, jump to any tab or element, including text inside table cells.',
    category: 'Search Panel',
    categorySlug: 'search-panel/the-search-panel',
    parentSlug: 'the-search-panel',
  },
  {
    slug: 'search-add-to-canvas',
    title: 'Adding Elements from Search',
    description:
      'Search the palette and drop a shape or icon onto the canvas without leaving search.',
    category: 'Search Panel',
    categorySlug: 'search-panel/the-search-panel',
    parentSlug: 'the-search-panel',
  },
  {
    slug: 'search-create-tab',
    title: 'Creating a Tab from Search',
    description: 'Spin up a new tab straight from the search panel with the Create new tab action.',
    category: 'Search Panel',
    categorySlug: 'search-panel/the-search-panel',
    parentSlug: 'the-search-panel',
  },
];
