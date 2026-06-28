import type { Category } from './articles';

// Help-centre category registry (spec/55). Split out of articles.ts to keep
// each module within the file-size budget; articles.ts re-exports this and
// derives featureCategories / supportCategories from it.
export const categories: Category[] = [
  {
    slug: 'about',
    title: 'About livediagram',
    description:
      'Get to know livediagram: what it is, who it helps, and the ideas behind a free, open canvas.',
    articleCount: 4,
  },
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description:
      'Go from a blank canvas to a shared diagram in minutes, with the basics every new user needs.',
    articleCount: 6,
  },
  {
    slug: 'tips-and-tricks',
    title: 'Tips and Tricks',
    description:
      'Work faster with the shortcuts, hidden features, and small habits experienced users rely on.',
    articleCount: 5,
  },
  {
    slug: 'account-and-data',
    title: 'Account and Data',
    description:
      'Stay in control of your work: how guest access, signing in, syncing, exporting, deletion, API tokens, and connecting AI tools work.',
    articleCount: 6,
  },
  {
    slug: 'privacy-and-security',
    title: 'Privacy and Security',
    description:
      'Know exactly how your diagrams are stored, what we collect, and how to keep shared links safe.',
    articleCount: 4,
  },
  {
    slug: 'self-hosting',
    title: 'Self-Hosting',
    description:
      'Run livediagram on your own infrastructure, with the full feature set, free and open source.',
    articleCount: 3,
  },
  {
    slug: 'developers',
    title: 'Developers',
    description:
      'Call the livediagram REST API from your own scripts: authentication, worked examples, errors and limits, and the OpenAPI reference.',
    articleCount: 4,
  },
  {
    slug: 'troubleshooting',
    title: 'Troubleshooting',
    description:
      'Get unstuck fast with fixes for the most common editor and collaboration problems.',
    articleCount: 5,
  },
  {
    slug: 'supported-devices',
    title: 'Supported Devices',
    description:
      'How livediagram works on a computer, a tablet, and a phone, and what to expect on each.',
    articleCount: 3,
  },
  {
    slug: 'policies',
    title: 'Policies',
    description:
      'The legal terms for the hosted livediagram service: the Terms of Service and the full Privacy Policy.',
    articleCount: 2,
  },
  {
    slug: 'contact',
    title: 'Contact',
    description: 'Get in touch, report a bug, or request a feature.',
    articleCount: 0,
  },
  // Feature-guide categories (kind: 'feature'). Rendered under "Feature Guides"
  // on the home page; each has a card-grid index at /help/<slug>/. articleCount
  // counts the feature landings in the category (each landing has its own
  // sub-guides). See spec/55.
  {
    slug: 'user-interface',
    title: 'User Interface',
    description:
      'Get your bearings in the editor: the panels, toolbar, context menus, minimap, zoom and tab bars, and quick controls.',
    articleCount: 7,
    kind: 'feature',
  },
  {
    slug: 'explorer',
    title: 'Explorer',
    description:
      'Organise everything you build: how the Explorer keeps your diagrams, folders, teams, and assets easy to find and manage.',
    articleCount: 10,
    kind: 'feature',
  },
  {
    slug: 'palette',
    title: 'Palette',
    description:
      'Your launchpad for everything on the canvas: every selection mode, element, and palette setting explained.',
    articleCount: 20,
    kind: 'feature',
  },
  {
    slug: 'canvas',
    title: 'Canvas',
    description:
      'Master the infinite canvas where diagrams come together: placing, selecting, grouping, linking, annotating, layering, rotating, animating, locking, theming, and templating.',
    articleCount: 12,
    kind: 'feature',
  },
  {
    slug: 'tabs',
    title: 'Tabs',
    description:
      'Keep a whole project in one diagram: organise, link, and move between multiple boards with tabs.',
    articleCount: 8,
    kind: 'feature',
  },
  {
    slug: 'collaboration',
    title: 'Collaboration',
    description:
      'Work together in real time: comments, live presence, teams, sharing, and session tools.',
    articleCount: 5,
    kind: 'feature',
  },
  {
    slug: 'activity-panel',
    title: 'Activity Panel',
    description:
      'The running record of every change to a diagram, with undo, redo, and reverting a single change.',
    articleCount: 5,
    kind: 'feature',
  },
  {
    slug: 'tools',
    title: 'Tools',
    description:
      'Do more with less effort using the editor helpers: AI, zen mode, light and dark mode, Markdown import, and cleanup.',
    articleCount: 5,
    kind: 'feature',
  },
  {
    slug: 'search-panel',
    title: 'Search Panel',
    description:
      'Find anything in seconds: jump to any diagram, folder, team, tab, or element, and add new elements to the canvas.',
    articleCount: 1,
    kind: 'feature',
  },
];
