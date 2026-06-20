export interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  /** Full nested path under /help, e.g. "features/canvas". */
  categorySlug: string;
  /** Feature-landing slug this article hangs off, if it's a sub-article. */
  parentSlug?: string;
}

/**
 * Canonical in-app path to an article page. Trailing slash to match the help
 * app's `trailingSlash: true` (so internal links resolve directly instead of
 * 308-redirecting). `next/link` prepends the `/help` basePath at render; the
 * sitemap, which needs absolute URLs, prepends the origin + `/help` itself.
 * One source for the `/<categorySlug>/<slug>/` shape every card / list / sitemap
 * entry was spelling out by hand.
 */
export function articleHref(article: Pick<Article, 'categorySlug' | 'slug'>): string {
  return `/${article.categorySlug}/${article.slug}/`;
}

/**
 * Canonical in-app path to a category landing page (`/<slug>/`, trailing slash
 * to match `trailingSlash: true`). `slug` is a category slug — top-level
 * (`features`) or a nested feature path (`features/shapes-and-arrows`), both of
 * which have a landing page. Sibling of {@link articleHref}; one source for the
 * category-link shape the cards / breadcrumbs / sitemap built by hand.
 */
export function categoryHref(slug: string): string {
  return `/${slug}/`;
}

export interface Category {
  slug: string;
  title: string;
  description: string;
  icon: string;
  articleCount: number;
}

export const categories: Category[] = [
  {
    slug: 'about',
    title: 'About livediagram',
    description: 'What livediagram is, who it is for, and why it exists.',
    icon: 'info',
    articleCount: 3,
  },
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'New here? Create your first diagram and learn the basics.',
    icon: 'rocket',
    articleCount: 6,
  },
  {
    slug: 'tips-and-tricks',
    title: 'Tips and Tricks',
    description: 'Shortcuts and lesser-known features to work faster.',
    icon: 'lightbulb',
    articleCount: 5,
  },
  {
    slug: 'account-and-data',
    title: 'Account and Data',
    description: 'Guest access, signing in, syncing, exporting, and deleting data.',
    icon: 'user',
    articleCount: 4,
  },
  {
    slug: 'privacy-and-security',
    title: 'Privacy and Security',
    description: 'How your data is handled, what we collect, and link protection.',
    icon: 'shield',
    articleCount: 4,
  },
  {
    slug: 'self-hosting',
    title: 'Self-Hosting',
    description: 'Run your own livediagram instance. It is open source and free.',
    icon: 'server',
    articleCount: 3,
  },
  {
    slug: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Fixes for common problems with the editor and collaboration.',
    icon: 'wrench',
    articleCount: 5,
  },
  {
    slug: 'contact',
    title: 'Contact',
    description: 'Get in touch, report a bug, or request a feature.',
    icon: 'mail',
    articleCount: 0,
  },
];

export const articles: Article[] = [
  // ---- About ----
  {
    slug: 'what-is-livediagram',
    title: 'What is livediagram?',
    description: 'An overview of the real-time, multiplayer diagram editor and what it does.',
    category: 'About livediagram',
    categorySlug: 'about',
    parentSlug: 'about',
  },
  {
    slug: 'who-is-it-for',
    title: 'Who is livediagram For?',
    description: 'The teams and use cases that get the most out of livediagram.',
    category: 'About livediagram',
    categorySlug: 'about',
    parentSlug: 'about',
  },
  {
    slug: 'why-livediagram',
    title: 'Why Use livediagram?',
    description: 'Free, open source, no sign-in wall, real-time collaboration. Here is why.',
    category: 'About livediagram',
    categorySlug: 'about',
    parentSlug: 'about',
  },

  // ---- Getting Started ----
  {
    slug: 'your-first-diagram',
    title: 'Your First Diagram',
    description: 'Create a diagram and add your first shapes in under a minute.',
    category: 'Getting Started',
    categorySlug: 'getting-started',
  },
  {
    slug: 'the-canvas-basics',
    title: 'Canvas Basics',
    description: 'Panning, zooming, and finding your way around the editor.',
    category: 'Getting Started',
    categorySlug: 'getting-started',
  },
  {
    slug: 'adding-shapes-and-arrows',
    title: 'Adding Shapes and Arrows',
    description: 'Use the palette and quick-connect to build out a diagram.',
    category: 'Getting Started',
    categorySlug: 'getting-started',
  },
  {
    slug: 'sharing-your-diagram',
    title: 'Sharing Your Diagram',
    description: 'Hand a link to anyone and edit together in real time.',
    category: 'Getting Started',
    categorySlug: 'getting-started',
  },
  {
    slug: 'guest-vs-account',
    title: 'Guest vs Account',
    description: 'The canvas works without signing in. Here is what an account adds.',
    category: 'Getting Started',
    categorySlug: 'getting-started',
  },
  {
    slug: 'keyboard-essentials',
    title: 'Keyboard Essentials',
    description: 'The handful of shortcuts that make editing fast.',
    category: 'Getting Started',
    categorySlug: 'getting-started',
  },

  // ---- Tips and Tricks ----
  {
    slug: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'The full shortcut reference and how to toggle shortcuts off.',
    category: 'Tips and Tricks',
    categorySlug: 'tips-and-tricks',
  },
  {
    slug: 'command-palette',
    title: 'The Command Palette',
    description: 'Add any shape or run any command from the floating palette.',
    category: 'Tips and Tricks',
    categorySlug: 'tips-and-tricks',
  },
  {
    slug: 'format-painter',
    title: 'The Format Painter',
    description: 'Copy the look of one element onto others in two clicks.',
    category: 'Tips and Tricks',
    categorySlug: 'tips-and-tricks',
  },
  {
    slug: 'fast-theming',
    title: 'Theme a Diagram Fast',
    description: 'Restyle an entire diagram in seconds with themes and presets.',
    category: 'Tips and Tricks',
    categorySlug: 'tips-and-tricks',
  },
  {
    slug: 'presenting-well',
    title: 'Presenting from the Canvas',
    description: 'Get the most out of Presentation mode and Zen mode.',
    category: 'Tips and Tricks',
    categorySlug: 'tips-and-tricks',
  },

  // ---- Account and Data ----
  {
    slug: 'guest-identity',
    title: 'How Guest Identity Works',
    description: 'The per-browser id that owns your diagrams when you are not signed in.',
    category: 'Account and Data',
    categorySlug: 'account-and-data',
  },
  {
    slug: 'signing-in',
    title: 'Signing In',
    description: 'Create an account, sign in, and migrate your guest diagrams.',
    category: 'Account and Data',
    categorySlug: 'account-and-data',
  },
  {
    slug: 'exporting-diagrams',
    title: 'Exporting Diagrams',
    description: 'Get a diagram out as an image or a shareable embed.',
    category: 'Account and Data',
    categorySlug: 'account-and-data',
  },
  {
    slug: 'deleting-your-data',
    title: 'Deleting Your Data',
    description: 'How to remove a diagram or clear everything tied to your id.',
    category: 'Account and Data',
    categorySlug: 'account-and-data',
  },

  // ---- Privacy and Security ----
  {
    slug: 'data-privacy',
    title: 'Data Privacy',
    description: 'Where your diagrams live and how they are handled.',
    category: 'Privacy and Security',
    categorySlug: 'privacy-and-security',
    parentSlug: 'privacy-and-security',
  },
  {
    slug: 'what-we-collect',
    title: 'What We Collect',
    description: 'The anonymous, first-party telemetry we record, and how to opt out.',
    category: 'Privacy and Security',
    categorySlug: 'privacy-and-security',
    parentSlug: 'privacy-and-security',
  },
  {
    slug: 'share-link-security',
    title: 'Share Link Security',
    description: 'Passwords and expiry for the links you hand out.',
    category: 'Privacy and Security',
    categorySlug: 'privacy-and-security',
    parentSlug: 'privacy-and-security',
  },
  {
    slug: 'open-source-trust',
    title: 'Open Source and Trust',
    description: 'The code is public and MIT-licensed. What that means for you.',
    category: 'Privacy and Security',
    categorySlug: 'privacy-and-security',
    parentSlug: 'privacy-and-security',
  },

  // ---- Self-Hosting ----
  {
    slug: 'self-hosting-overview',
    title: 'Self-Hosting Overview',
    description: 'What it takes to run your own livediagram, and why you might.',
    category: 'Self-Hosting',
    categorySlug: 'self-hosting',
    parentSlug: 'self-hosting',
  },
  {
    slug: 'deploying-livediagram',
    title: 'Deploying livediagram',
    description: 'The apps, the Cloudflare stack, and how a deploy runs.',
    category: 'Self-Hosting',
    categorySlug: 'self-hosting',
    parentSlug: 'self-hosting',
  },
  {
    slug: 'configuration',
    title: 'Configuration and Optional Auth',
    description: 'Environment variables, optional Clerk auth, and guest-only mode.',
    category: 'Self-Hosting',
    categorySlug: 'self-hosting',
    parentSlug: 'self-hosting',
  },

  // ---- Troubleshooting ----
  {
    slug: 'diagram-not-loading',
    title: 'A Diagram Will Not Load',
    description: 'What to check when a diagram is blank or stuck loading.',
    category: 'Troubleshooting',
    categorySlug: 'troubleshooting',
  },
  {
    slug: 'cannot-sign-in',
    title: 'Cannot Sign In',
    description: 'Steps to take if sign-in fails or you lose access.',
    category: 'Troubleshooting',
    categorySlug: 'troubleshooting',
  },
  {
    slug: 'collaboration-issues',
    title: 'Real-Time Collaboration Problems',
    description: 'Cursors, edits, or presence not syncing? Try these.',
    category: 'Troubleshooting',
    categorySlug: 'troubleshooting',
  },
  {
    slug: 'browser-compatibility',
    title: 'Browser Compatibility',
    description: 'Supported browsers and how to fix rendering glitches.',
    category: 'Troubleshooting',
    categorySlug: 'troubleshooting',
  },
  {
    slug: 'missing-changes',
    title: 'My Changes Are Missing',
    description: 'How autosave works and how to recover with history.',
    category: 'Troubleshooting',
    categorySlug: 'troubleshooting',
  },

  // ============ Features (landing pages) ============
  {
    slug: 'canvas',
    title: 'The Canvas',
    description: 'The infinite canvas, the palette, and adding elements.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'shapes-and-arrows',
    title: 'Shapes and Arrows',
    description: 'Every shape and arrow style, with draggable curve and elbow handles.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'drawing',
    title: 'Drawing and Sketch',
    description: 'Freehand drawing with the Pencil, plus shape recognition.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'selecting-and-grouping',
    title: 'Selecting and Grouping',
    description: 'Marquee, multi-select, groups, and the format painter.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'text-and-fonts',
    title: 'Text and Fonts',
    description: 'Editing labels and choosing from eight fonts per element or tab.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'themes',
    title: 'Themes',
    description: 'Restyle a whole diagram, including multi-colour and custom themes.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'templates',
    title: 'Templates',
    description: 'Start from a themed template instead of a blank canvas.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'tabs',
    title: 'Tabs and Tab Folders',
    description: 'Multiple boards in one diagram, grouped into folders.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'comments',
    title: 'Comments',
    description: 'Leave threaded comments on the canvas and resolve them.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'links',
    title: 'Links and Link Cards',
    description: 'Link elements across tabs or to URLs, and bookmark cards.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'images',
    title: 'Images',
    description: 'Add images to the canvas from your per-owner gallery.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'explorer',
    title: 'Explorer and Folders',
    description: 'Organise diagrams into nested folders in the Explorer.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'teams',
    title: 'Teams',
    description: 'Invite members, assign roles, and share diagrams across a team.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'sharing',
    title: 'Sharing and Embeds',
    description: 'Share links, passwords, expiry, read-only embeds, and live images.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'presentation',
    title: 'Presentation Mode',
    description: 'Step through a tab as a progressive-reveal slideshow with notes.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'zen-mode',
    title: 'Zen Mode',
    description: 'A distraction-free canvas with all the chrome hidden.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'ai',
    title: 'AI Assistance',
    description: 'Optional Build, Clean, Ask, and Review helpers on the canvas.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'markdown-import',
    title: 'Markdown Import',
    description: 'Turn a Markdown outline into a themed tree diagram.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'history',
    title: 'Activity and History',
    description: 'The per-diagram change log, Activity Panel, and surgical revert.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'session-tools',
    title: 'Session Tools',
    description: 'A shared countdown or stopwatch and live dot-voting.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'data-elements',
    title: 'Data and Chart Elements',
    description: 'Progress bars, ratings, pie charts, and timeline rails.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'style-presets',
    title: 'Style Presets',
    description: 'One-click colour and line-style variations for shapes and arrows.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'layout-cleanup',
    title: 'Layout Cleanup',
    description: 'Auto-align to a grid or auto-layout the whole diagram.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'isometric',
    title: 'Isometric View',
    description: 'Tilt a tab into an extruded, isometric perspective.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'annotations',
    title: 'Annotations',
    description: 'Drop a marker with a note that readers hover to read.',
    category: 'Features',
    categorySlug: 'features',
  },
  {
    slug: 'technology-icons',
    title: 'Technology Icons',
    description: 'Full-colour AWS, Azure, and infra icons for architecture diagrams.',
    category: 'Features',
    categorySlug: 'features',
  },

  // ---- Sub-articles: Canvas ----
  {
    slug: 'adding-elements',
    title: 'Adding Elements',
    description: 'Use the command palette and double-click to place shapes.',
    category: 'Features',
    categorySlug: 'features/canvas',
    parentSlug: 'canvas',
  },
  {
    slug: 'pan-and-zoom',
    title: 'Panning and Zooming',
    description: 'Move around the infinite canvas and fit the view.',
    category: 'Features',
    categorySlug: 'features/canvas',
    parentSlug: 'canvas',
  },
  {
    slug: 'changing-the-background',
    title: 'Changing the Canvas Background',
    description: 'Pick a canvas background from the Change Canvas dialog.',
    category: 'Features',
    categorySlug: 'features/canvas',
    parentSlug: 'canvas',
  },

  // ---- Sub-articles: Shapes and Arrows ----
  {
    slug: 'arrow-styles',
    title: 'Arrow Styles',
    description: 'Straight, curved, and elbow arrows and how to switch between them.',
    category: 'Features',
    categorySlug: 'features/shapes-and-arrows',
    parentSlug: 'shapes-and-arrows',
  },
  {
    slug: 'curve-and-elbow-handles',
    title: 'Curve and Elbow Handles',
    description: 'Drag the handles to shape an arrow exactly how you want.',
    category: 'Features',
    categorySlug: 'features/shapes-and-arrows',
    parentSlug: 'shapes-and-arrows',
  },
  {
    slug: 'arrow-to-arrow',
    title: 'Connecting Arrows to Arrows',
    description: 'Snap an arrow endpoint onto another arrow for sequence diagrams.',
    category: 'Features',
    categorySlug: 'features/shapes-and-arrows',
    parentSlug: 'shapes-and-arrows',
  },
  {
    slug: 'shape-markers',
    title: 'Shape Markers',
    description: 'Traffic-light dots and a checkbox glyph inside a shape.',
    category: 'Features',
    categorySlug: 'features/shapes-and-arrows',
    parentSlug: 'shapes-and-arrows',
  },

  // ---- Sub-articles: Drawing ----
  {
    slug: 'shape-recognition',
    title: 'Shape Recognition',
    description: 'Let the Pencil snap rough sketches into clean shapes.',
    category: 'Features',
    categorySlug: 'features/drawing',
    parentSlug: 'drawing',
  },

  // ---- Sub-articles: Selecting and Grouping ----
  {
    slug: 'multi-select',
    title: 'Marquee and Multi-Select',
    description: 'Select many elements at once and act on them together.',
    category: 'Features',
    categorySlug: 'features/selecting-and-grouping',
    parentSlug: 'selecting-and-grouping',
  },
  {
    slug: 'groups',
    title: 'Groups',
    description: 'Bind elements into a group that moves and styles as one.',
    category: 'Features',
    categorySlug: 'features/selecting-and-grouping',
    parentSlug: 'selecting-and-grouping',
  },
  {
    slug: 'using-the-format-painter',
    title: 'Using the Format Painter',
    description: 'Copy one element’s style onto others.',
    category: 'Features',
    categorySlug: 'features/selecting-and-grouping',
    parentSlug: 'selecting-and-grouping',
  },

  // ---- Sub-articles: Text and Fonts ----
  {
    slug: 'choosing-fonts',
    title: 'Choosing Fonts',
    description: 'Set a font per element or a default font for the whole tab.',
    category: 'Features',
    categorySlug: 'features/text-and-fonts',
    parentSlug: 'text-and-fonts',
  },

  // ---- Sub-articles: Themes ----
  {
    slug: 'changing-theme',
    title: 'Changing the Theme',
    description: 'Open the theme dialog and browse themes by category.',
    category: 'Features',
    categorySlug: 'features/themes',
    parentSlug: 'themes',
  },
  {
    slug: 'multicolour-themes',
    title: 'Multi-Colour Themes',
    description: 'Tint each branch of a hierarchy its own hue.',
    category: 'Features',
    categorySlug: 'features/themes',
    parentSlug: 'themes',
  },
  {
    slug: 'custom-themes',
    title: 'Custom Themes',
    description: 'Build, save, and reuse your own themes.',
    category: 'Features',
    categorySlug: 'features/themes',
    parentSlug: 'themes',
  },

  // ---- Sub-articles: Tabs ----
  {
    slug: 'tab-folders',
    title: 'Tab Folders',
    description: 'Group a diagram’s tabs into collapsible folders.',
    category: 'Features',
    categorySlug: 'features/tabs',
    parentSlug: 'tabs',
  },
  {
    slug: 'linking-tabs',
    title: 'Linking Across Tabs',
    description: 'Make an element jump to another tab when clicked.',
    category: 'Features',
    categorySlug: 'features/tabs',
    parentSlug: 'tabs',
  },

  // ---- Sub-articles: Links ----
  {
    slug: 'link-cards',
    title: 'Link Cards',
    description: 'Bookmark a URL as a card with title, favicon, and preview.',
    category: 'Features',
    categorySlug: 'features/links',
    parentSlug: 'links',
  },

  // ---- Sub-articles: Teams ----
  {
    slug: 'roles-and-invites',
    title: 'Roles and Invites',
    description: 'Admin and Member roles, and inviting people by email.',
    category: 'Features',
    categorySlug: 'features/teams',
    parentSlug: 'teams',
  },
  {
    slug: 'team-shared-diagrams',
    title: 'Team Shared Diagrams',
    description: 'A per-team folder tree every member can manage.',
    category: 'Features',
    categorySlug: 'features/teams',
    parentSlug: 'teams',
  },

  // ---- Sub-articles: Sharing ----
  {
    slug: 'share-passwords',
    title: 'Share Passwords',
    description: 'Gate view or edit access behind a password.',
    category: 'Features',
    categorySlug: 'features/sharing',
    parentSlug: 'sharing',
  },
  {
    slug: 'share-link-expiry',
    title: 'Share Link Expiry',
    description: 'Give a share link a lifetime so it stops working later.',
    category: 'Features',
    categorySlug: 'features/sharing',
    parentSlug: 'sharing',
  },
  {
    slug: 'embeds',
    title: 'Read-Only Embeds',
    description: 'Drop a live, read-only diagram into another page.',
    category: 'Features',
    categorySlug: 'features/sharing',
    parentSlug: 'sharing',
  },

  // ---- Sub-articles: AI ----
  {
    slug: 'ai-tools',
    title: 'Build, Clean, Ask, and Review',
    description: 'What each AI helper does and when to reach for it.',
    category: 'Features',
    categorySlug: 'features/ai',
    parentSlug: 'ai',
  },

  // ---- Sub-articles: History ----
  {
    slug: 'activity-panel',
    title: 'The Activity Panel',
    description: 'Read the per-diagram change log as it happens.',
    category: 'Features',
    categorySlug: 'features/history',
    parentSlug: 'history',
  },
  {
    slug: 'reverting-changes',
    title: 'Reverting Changes',
    description: 'Undo a specific past change without losing the rest.',
    category: 'Features',
    categorySlug: 'features/history',
    parentSlug: 'history',
  },

  // ---- Sub-articles: Session Tools ----
  {
    slug: 'timer',
    title: 'The Timer',
    description: 'Run a shared countdown or stopwatch on a tab.',
    category: 'Features',
    categorySlug: 'features/session-tools',
    parentSlug: 'session-tools',
  },
  {
    slug: 'voting',
    title: 'Dot Voting',
    description: 'Let everyone vote live and tally the results.',
    category: 'Features',
    categorySlug: 'features/session-tools',
    parentSlug: 'session-tools',
  },

  // ---- Sub-articles: Data Elements ----
  {
    slug: 'progress-elements',
    title: 'Progress Bars and Rings',
    description: 'Show a 0–100% value with fill animations.',
    category: 'Features',
    categorySlug: 'features/data-elements',
    parentSlug: 'data-elements',
  },
  {
    slug: 'rating',
    title: 'Rating',
    description: 'A 1–5 star rating element with a score picker.',
    category: 'Features',
    categorySlug: 'features/data-elements',
    parentSlug: 'data-elements',
  },
  {
    slug: 'pie-chart',
    title: 'Pie Chart',
    description: 'An editable pie chart built from label and value rows.',
    category: 'Features',
    categorySlug: 'features/data-elements',
    parentSlug: 'data-elements',
  },

  // ---- Sub-articles: Layout Cleanup ----
  {
    slug: 'auto-align',
    title: 'Auto-Align',
    description: 'Snap selected elements onto a tidy grid.',
    category: 'Features',
    categorySlug: 'features/layout-cleanup',
    parentSlug: 'layout-cleanup',
  },
  {
    slug: 'auto-layout',
    title: 'Auto Layout',
    description: 'Recompute positions from the arrow graph with Tidy Up.',
    category: 'Features',
    categorySlug: 'features/layout-cleanup',
    parentSlug: 'layout-cleanup',
  },
];

export function getArticlesByCategory(categorySlug: string): Article[] {
  return articles.filter((a) => a.categorySlug === categorySlug);
}

export function getSubArticles(parentSlug: string): Article[] {
  return articles.filter((a) => a.parentSlug === parentSlug);
}

export function searchArticles(query: string): Article[] {
  const lower = query.toLowerCase();
  return articles.filter(
    (a) => a.title.toLowerCase().includes(lower) || a.description.toLowerCase().includes(lower),
  );
}
