import type { ElementLink } from '@livediagram/diagram';

// Human-readable destination for a link, shown in the hover tooltip on a
// link badge so a user can see WHERE a link goes before clicking it —
// notably the full URL of an external link they may not want to visit.
// Tab / element links resolve to a generic phrase here (the badge layer
// doesn't carry tab names); the URL + diagram name are the cases that
// matter for "where does this take me".
export function describeLink(link: ElementLink): string {
  switch (link.kind) {
    case 'url':
      return link.url;
    case 'diagram':
      return `Diagram: ${link.name}`;
    case 'tab':
    case 'element':
      return 'A tab in this diagram';
  }
}
