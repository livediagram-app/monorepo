// Route-level not-found override for `/diagram/[id]`.
//
// `output: 'export'` only enumerates the param values returned by
// `generateStaticParams` (here: `placeholder`). Any other id the
// client navigates to triggers Next.js's client-side not-found
// path. Without this file, the root `app/not-found.tsx` (a 404
// page) would replace the editor seconds after it started
// hydrating on every `/diagram/<uuid>` load — visible to the user
// as "create new diagram → page not found".
//
// Re-rendering the EditorPage here makes the dynamic-segment
// not-found a no-op: the live worker has already rewritten the
// request to `/diagram/placeholder` so the HTML the browser
// received IS the editor; this just keeps it on screen once the
// app-router decides the param isn't statically known. The editor
// itself reads the real id from `window.location.pathname` and
// fetches the diagram from the api worker. If the api 404s, the
// in-app `<NotFound>` card surfaces — branded, with a CTA.

import EditorPage from './editor-page';

export default function DiagramRouteNotFound() {
  return <EditorPage />;
}
