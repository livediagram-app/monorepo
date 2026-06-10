import type { Metadata } from 'next';
import { ExplorerPane } from '../ExplorerPane';

// /explorer/recent — the default landing section: last N owned diagrams.
// The layout's ExplorerShell provides the chrome + state; this page
// only pins the route and the tab title (spec/15, routes.ts).
export const metadata: Metadata = {
  title: 'Recent diagrams | livediagram',
};

export default function Page() {
  return <ExplorerPane />;
}
