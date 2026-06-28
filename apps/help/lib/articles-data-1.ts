import type { Article } from './articles';

// Help-article registry, part 1 of 4 (spec/55). articles.ts concatenates
// the four parts into the canonical browse/search order.
export const ARTICLES_PART_1: Article[] = [
  // ---- User Interface ----
  {
    slug: 'panel-layout',
    title: 'Panel Layout',
    description: 'The floating panels that frame the canvas, and how they are arranged.',
    category: 'User Interface',
    categorySlug: 'user-interface',
  },
  {
    slug: 'toolbar',
    title: 'The Toolbar',
    description: 'The contextual toolbar that appears when you select one or more elements.',
    category: 'User Interface',
    categorySlug: 'user-interface',
  },
  {
    slug: 'context-menus',
    title: 'Context Menus',
    description: 'Right-click menus across the editor, each scoped to what you clicked.',
    category: 'User Interface',
    categorySlug: 'user-interface',
  },
  {
    slug: 'zoom-controls',
    title: 'Zoom Controls',
    description: 'Move in and out of the canvas, fit the diagram to the screen, and reset to 100%.',
    category: 'User Interface',
    categorySlug: 'user-interface',
  },
  {
    slug: 'minimap',
    title: 'Minimap',
    description:
      'The bottom-left Map: a zoomed-out overview with a box for your view. Tap or drag to navigate.',
    category: 'User Interface',
    categorySlug: 'user-interface',
  },
  {
    slug: 'tab-bar',
    title: 'The Tab Bar',
    description:
      'Switch between the boards in a diagram, add new ones, and group them into folders.',
    category: 'User Interface',
    categorySlug: 'user-interface',
  },
  {
    slug: 'quick-controls',
    title: 'Quick Controls',
    description: 'The always-available actions tucked into the corner of the editor.',
    category: 'User Interface',
    categorySlug: 'user-interface',
  },

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
  {
    slug: 'what-is-open-source',
    title: 'What is Open Source?',
    description: 'What open source means, and what livediagram being MIT-licensed gives you.',
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
    title: 'The Palette',
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
];
