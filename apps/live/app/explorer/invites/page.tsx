import type { Metadata } from 'next';
import { ExplorerPane } from '../ExplorerPane';

// /explorer/invites — pending team invites to accept or decline (spec/32).
// The layout's ExplorerShell provides the chrome + state; this page
// only pins the route and the tab title (spec/15, routes.ts).
export const metadata: Metadata = {
  title: 'Invites | livediagram',
};

export default function Page() {
  return <ExplorerPane />;
}
