import type { Metadata } from 'next';
import { ExplorerPane } from '../ExplorerPane';

// /explorer/team?id=<id> — one team's member view (spec/32). The id rides the query string (see routes.ts for why not a path segment).
// The layout's ExplorerShell provides the chrome + state; this page
// only pins the route and the tab title (spec/15, routes.ts).
export const metadata: Metadata = {
  title: 'Team | livediagram',
};

export default function Page() {
  return <ExplorerPane />;
}
