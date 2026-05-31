import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'livediagram',
  description: 'Build diagrams and mindmaps. Multiplayer canvas.',
};

// Pre-hydration URL swap for /live/diagram/<id> routes.
//
// `output: 'export'` forces dynamicParams=false; the client router
// triggers its not-found path whenever a dynamic-segment URL doesn't
// match the build-time placeholder. Every real diagram URL gets the
// editor swapped for the framework's default 404 on hydration — the
// editor briefly paints (loading spinner) then vanishes.
//
// Fix: rewrite the URL to /live/diagram/placeholder synchronously in
// <head>, BEFORE React hydrates, and stash the real id on a global.
// The router sees a path it knows about and renders the editor
// without ever invoking notFound. The editor's bootstrap useLayout-
// Effect reads the captured id and immediately replaceState's the
// real URL back — synchronous, so the user never sees `placeholder`
// in the address bar.
//
// Try/catch wraps it so a script failure degrades to the old broken
// state rather than blocking the whole page.
const PRE_HYDRATION_URL_SWAP = `
(function () {
  try {
    var m = window.location.pathname.match(/^\\/live\\/diagram\\/([^\\/?#]+)$/);
    if (!m || m[1] === 'placeholder') return;
    window.__LD_DIAGRAM_PATH_ID__ = m[1];
    window.history.replaceState(
      null,
      '',
      '/live/diagram/placeholder' + window.location.search + window.location.hash
    );
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_HYDRATION_URL_SWAP }} />
      </head>
      <body className="bg-slate-50 text-slate-800 antialiased">{children}</body>
    </html>
  );
}
