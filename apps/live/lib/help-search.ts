// The help-centre catalogue surfaced by the global SearchPanel (spec/09 +
// spec/56). The editor and Explorer can't import apps/help's article registry
// (separate builds), so this is a curated, searchable view over the help
// articles the editor already deep-links via help-articles.ts: a title plus
// keyword synonyms per article, resolved to an absolute /help href.
//
// Keep keys in sync with HELP_ARTICLES (a key here pointing at a missing
// article is a bug, the same as an unregistered help article). Titles mirror
// the help centre's article titles; keywords widen matching to the words a
// user would actually type ("hotkey" -> keyboard shortcuts).

import { helpArticleHref, helpArticleLeaf, type HelpArticleKey } from './help-articles';
import type { HelpSearchItem } from './search';

type HelpSearchEntry = { key: HelpArticleKey; title: string; keywords: string };

const HELP_SEARCH_CATALOG: HelpSearchEntry[] = [
  {
    key: 'sharing',
    title: 'Sharing and embeds',
    keywords: 'share link collaborate invite embed read only realtime',
  },
  {
    key: 'sharePasswords',
    title: 'Share passwords',
    keywords: 'password protect lock secure share link',
  },
  {
    key: 'shareLinkExpiry',
    title: 'Share link expiry',
    keywords: 'expire expiry duration time limited share link',
  },
  {
    key: 'comments',
    title: 'Comments',
    keywords: 'comment thread feedback reply resolve note mention',
  },
  {
    key: 'teamRolesAndInvites',
    title: 'Team roles and invites',
    keywords: 'team invite role admin member email permission',
  },
  { key: 'palette', title: 'The palette', keywords: 'palette shapes tools elements add toolbar' },
  {
    key: 'autoAttachArrows',
    title: 'Auto-attach arrows',
    keywords: 'arrow attach reconnect pin nearest face shape move connector',
  },
  {
    key: 'alignmentGuides',
    title: 'Alignment guides',
    keywords: 'align snap guide smart guides distribute',
  },
  {
    key: 'minimalPanels',
    title: 'Minimal panels',
    keywords: 'minimal compact dock panel layout hide',
  },
  { key: 'isometricMode', title: 'Isometric mode', keywords: 'isometric 3d tilt perspective view' },
  {
    key: 'dataElements',
    title: 'Data and chart elements',
    keywords: 'chart progress bar ring rating star pie timeline data',
  },
  {
    key: 'aiTools',
    title: 'AI assistance',
    keywords: 'ai build clean ask review assistant generate suggest',
  },
  { key: 'themes', title: 'Themes', keywords: 'theme recolour restyle colour palette style' },
  {
    key: 'changingTheme',
    title: 'Changing the theme',
    keywords: 'theme dialog apply browse change',
  },
  {
    key: 'customThemes',
    title: 'Custom themes',
    keywords: 'custom theme save palette reuse build',
  },
  {
    key: 'changingTheBackground',
    title: 'Changing the canvas background',
    keywords: 'background canvas colour pattern backdrop grid dots',
  },
  {
    key: 'links',
    title: 'Links and link cards',
    keywords: 'link bookmark url card favicon preview jump',
  },
  {
    key: 'linkingTabs',
    title: 'Linking across tabs',
    keywords: 'link tab jump navigate element url cross tab',
  },
  {
    key: 'revertingChanges',
    title: 'Activity and reverting changes',
    keywords: 'activity history undo redo revert change log audit',
  },
  {
    key: 'templates',
    title: 'Templates',
    keywords: 'template starter prebuilt themed start new diagram',
  },
  {
    key: 'markdownImport',
    title: 'Markdown import',
    keywords: 'markdown outline import tree text',
  },
  {
    key: 'importTabs',
    title: 'Importing a tab',
    keywords: 'import json markdown file tab replace',
  },
  {
    key: 'exportingDiagrams',
    title: 'Exporting diagrams',
    keywords: 'export png svg pdf image download save',
  },
  {
    key: 'imageGallery',
    title: 'Image gallery',
    keywords: 'image upload gallery picture photo asset',
  },
  {
    key: 'explorerPanel',
    title: 'Explorer panel',
    keywords: 'explorer panel switch diagram folder library',
  },
  { key: 'recentDiagrams', title: 'Recent diagrams', keywords: 'recent open history last edited' },
  { key: 'sharedWithYou', title: 'Shared with you', keywords: 'shared with you others diagrams' },
  { key: 'folders', title: 'Folders', keywords: 'folder organise nest move library' },
  { key: 'unsorted', title: 'Unsorted', keywords: 'unsorted bucket inbox uncategorised' },
  {
    key: 'keyboardShortcuts',
    title: 'Keyboard shortcuts',
    keywords: 'keyboard shortcut hotkey keys bindings',
  },
  {
    key: 'yourFirstDiagram',
    title: 'Your first diagram',
    keywords: 'getting started first diagram beginner basics new',
  },
  {
    key: 'guestVsAccount',
    title: 'Guest vs account',
    keywords: 'guest account sign in sign up sync migrate',
  },
  {
    key: 'whatWeCollect',
    title: 'What we collect',
    keywords: 'privacy telemetry analytics data collect opt out tracking',
  },
];

/** The built help catalogue passed to the SearchPanel. Static, so built once. */
export const HELP_SEARCH_ITEMS: HelpSearchItem[] = HELP_SEARCH_CATALOG.map((e) => ({
  id: `help:${e.key}`,
  title: e.title,
  keywords: e.keywords,
  href: helpArticleHref(e.key),
  leaf: helpArticleLeaf(e.key),
}));
