import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Per-route metadata: the explorer page is a client component and
// can't export `metadata` itself, so this layout sets the title
// for the static-export `<title>` tag. Without it the page
// inherited the root layout's bare `livediagram` until a
// post-hydration `document.title = ...` rewrote it, which gave a
// brief flash of the wrong title in the browser tab on first load
// (and meant crawlers / link unfurlers saw the wrong value).
//
// `index: false` is inherited from the live app's root layout
// (`spec/07` keeps every /live route out of the index), so the
// title is for tab chrome only, not search results.
export const metadata: Metadata = {
  title: 'Explorer | livediagram',
};

export default function ExplorerLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
