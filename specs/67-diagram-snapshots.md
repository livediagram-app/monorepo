# 66 — Diagram SVG snapshots

A single cached SVG snapshot per diagram, used two ways:

1. **Explorer thumbnails** — a small preview on each row of the Recent /
   folder lists so you can recognise a diagram without opening it.
2. **Live image share** — an `<img>`-able URL (spec/54) that embeds the
   diagram in a README / wiki / doc and stays up to date.

Both render the same artifact through the same DOM-free renderer; they
differ only in how they're authorised and cached.

## Why one artifact, not two

The diagram list endpoint (`GET /api/diagrams`) deliberately ships no
element data (spec/13) so listing 100 diagrams stays cheap. Rendering a
preview per row from element data would re-load exactly what the list
avoids. So previews come from a **pre-rendered SVG**, not from element
data at list time.

Because SVG is vector, the same full-fidelity snapshot renders crisply
as a 36px list thumbnail and as a full-size embed — there is no separate
"thumbnail size" to generate. One stored artifact serves both surfaces.

## Render-on-read, cached in R2

The snapshot bytes live in R2 (the existing `IMAGES` bucket, key
`thumb/<diagramId>`); a `diagrams.thumb_rendered_at` column records when
they were last rendered.

On a read of either delivery path:

- **Fresh** (`thumb_rendered_at >= saved_at`): stream the stored R2
  bytes. No render, no element load.
- **Stale** (or never rendered, or the object is missing): render the
  first tab with `renderElementsToSvg` (`@livediagram/diagram`, the same
  DOM-free renderer the MCP worker uses), write it to R2, stamp
  `thumb_rendered_at`, and return it.

This is **render-on-read**, not render-on-save, on purpose:

- **Covers every write path.** `saved_at` is bumped by every tab write
  (editor, collaborators, MCP server, API token), so the snapshot
  invalidates uniformly regardless of who edited — no client upload to
  keep in sync.
- **No wasted renders.** A diagram is only rendered when it has been
  edited _and_ subsequently viewed (in a list or an embed). A diagram
  nobody opens never costs a render.
- **Cheap steady state.** Once cached, reads are a straight R2 stream
  until the next save.

An empty / unparseable first tab yields no snapshot (the endpoints 404
and the row shows its generic icon). Deleting a diagram clears its R2
object. The freshness column needs no backfill: the first read of each
diagram renders lazily.

## Delivery path 1 — Explorer thumbnail (owner-authed)

`GET /api/diagrams/:id/thumbnail?v=<savedAt>`

- Read-gated exactly like `GET /api/diagrams/:id`: the owner, a joined
  team member, or a valid share-code visitor.
- A native `<img>` can't send auth headers, so the live app fetches this
  through the authenticated client and wraps the bytes in a blob URL
  (the same pattern image elements use, spec/19). `?v=<savedAt>` busts
  the browser cache when the diagram changes; the worker ignores it.
  `Cache-Control: private, max-age=86400`.
- The Explorer row fetches **lazily** (IntersectionObserver): only rows
  scrolled into view fetch, so a long list never fires dozens of
  requests / renders for rows the user never reaches.
- Degrades gracefully: no R2 binding, no access, or an empty diagram →
  404 → the row keeps its generic icon.

## Delivery path 2 — Live image share (public, share-code-scoped)

`GET /api/share/:code/image.svg` — this is spec/54's endpoint.

- Public: the share code in the URL is the only credential, matching a
  share link's "anyone with the URL" semantics (an `<img>` can't carry
  an auth header). Resolves through `getShareLink`, so revoking /
  expiring the link kills the image too.
- **Password-protected shares (spec/24) get no image**: an `<img>` can't
  supply the password, so serving one would bypass the gate. The route
  404s a gated diagram _before_ rendering, and the Share dialog hides the
  live-image option while a password is set.
- `Cache-Control: public, max-age=30, stale-while-revalidate=300` so an
  embed stays close to live without hammering the origin (the bytes come
  from R2; the worker only re-renders when the diagram was saved since).

### Share dialog

A per-active-link **Live image** control (non-password links only) opens
a menu to copy the URL, a Markdown `![](...)` snippet, or an HTML
`<img>` snippet. Sits beside the existing Copy / Embed actions.

## Scope (v1)

- **First tab only.** A diagram has many tabs; both paths render the
  first. A `?tab=<id>` selector (spec/54's power-user param) is deferred.
- **No PNG.** SVG only — vector, tiny, headless-renderable. A rasterised
  variant is out of scope.
- Thumbnails ship on the full-page `/explorer` list rows. The floating
  in-editor Explorer panel uses a separate row component and is a later
  follow-up.

## Self-hosting

The whole feature is gated on the optional `IMAGES` R2 binding, exactly
like the image gallery (spec/19): with no bucket, both endpoints 404 and
the Explorer row shows its icon. No new binding, no required SaaS.
