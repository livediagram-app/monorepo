// Live-image URL + snippet builders for the share dialog (spec/54 +
// spec/67). The endpoint serves a diagram's cached SVG snapshot scoped
// to a share code, so a bare <img> in a README / wiki / Notion can embed
// it and it stays close to live (the worker re-renders when the diagram
// is saved). Pure functions so the dialog's copy buttons and the tests
// share one source of truth for the URL shape.
//
// The api is same-origin in production (the router worker stitches `/api`
// onto the app's hostname), so the public URL is `<origin>/api/share/...`
// — matching how embedUrlFor builds its `<origin>/embed?s=` URL.

export function liveImageUrlFor(origin: string, code: string): string {
  return `${origin}/api/share/${encodeURIComponent(code)}/image.svg`;
}

// GitHub / docs Markdown image syntax.
export function liveImageMarkdown(origin: string, code: string): string {
  return `![diagram](${liveImageUrlFor(origin, code)})`;
}

// Plain HTML <img> for wikis / sites that take raw HTML.
export function liveImageHtml(origin: string, code: string): string {
  return `<img src="${liveImageUrlFor(origin, code)}" alt="diagram" />`;
}
