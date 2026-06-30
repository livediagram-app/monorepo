// Diagram SVG snapshot render-cache (spec/67). One cached SVG per
// diagram, stored in R2 (key `thumb/<diagramId>`), refreshed lazily on
// read: if the cache is fresh (rendered at or after the diagram's last
// save) we stream the stored bytes; otherwise we render the first tab
// with the shared DOM-free renderer, write it back, and stamp it fresh.
//
// Two delivery paths share this one artifact (the whole point of the
// design): the owner-authed Explorer thumbnail (GET
// /api/diagrams/:id/thumbnail) and the public, share-code-scoped live
// image (GET /api/share/:code/image.svg). Rendering on read — rather
// than on every save — means a diagram nobody looks at never costs a
// render, and every write path (editor, collaborators, MCP, API token)
// invalidates the snapshot uniformly because they all bump saved_at.

import { renderElementsToSvg, type Tab } from '@livediagram/diagram';
import { getFirstTabData, getThumbRenderedAt, markThumbRendered, thumbnailKey } from './db';
import type { DiagramDTO, Env } from './types';

// Content type for the cached SVG snapshot. Local to this module — the
// HTTP responses set their own header (responses.ts); this only stamps
// the R2 object's metadata on write.
const THUMBNAIL_CONTENT_TYPE = 'image/svg+xml; charset=utf-8';

// Resolve a diagram's cached SVG snapshot, rendering + caching it first
// if stale. Returns null — caller should 404 / fall back to an icon —
// when there's nothing to show: no R2 binding (self-host without
// storage), no tab, or an empty / unparseable first tab.
export async function getDiagramThumbnailSvg(
  env: Env,
  diagram: DiagramDTO,
): Promise<string | null> {
  // No object store: nothing to cache into or read from. The endpoints
  // 404 and the Explorer row keeps its generic icon, same graceful
  // degradation as the image gallery (spec/19) on a binding-less deploy.
  if (!env.IMAGES) return null;
  const key = thumbnailKey(diagram.id);

  // Fresh = rendered at or after the last save. saved_at is bumped by
  // every tab write, so any content change makes the snapshot stale.
  const renderedAt = await getThumbRenderedAt(env, diagram.id);
  if (renderedAt !== null && renderedAt >= diagram.savedAt) {
    const cached = await env.IMAGES.get(key);
    // A present object is the happy path. A miss here means the object
    // was evicted / never written despite the freshness stamp, so we
    // fall through and re-render rather than 404 a diagram that has
    // content.
    if (cached) return await cached.text();
  }

  const svg = await renderFirstTab(env, diagram);
  if (svg == null) return null;

  // Best effort: a write failure (R2 hiccup) must not fail the read —
  // we still return the freshly rendered SVG, just without caching it,
  // so the next read renders again. Only stamp the row as fresh once the
  // object is actually in R2, or a later read would trust a stale/absent
  // object and skip the re-render.
  try {
    await env.IMAGES.put(key, svg, { httpMetadata: { contentType: THUMBNAIL_CONTENT_TYPE } });
    await markThumbRendered(env, diagram.id, Date.now());
  } catch {
    // Swallow: the SVG is still returned to the caller below.
  }
  return svg;
}

// Render the diagram's first tab to SVG, or null when the tab is
// missing, unparseable, or has no elements (an empty canvas has no
// meaningful thumbnail — the row shows its icon instead).
async function renderFirstTab(env: Env, diagram: DiagramDTO): Promise<string | null> {
  const data = await getFirstTabData(env, diagram.id);
  if (!data) return null;
  let parsed: Partial<Tab>;
  try {
    parsed = JSON.parse(data) as Partial<Tab>;
  } catch {
    return null;
  }
  if (!Array.isArray(parsed.elements) || parsed.elements.length === 0) return null;
  // `tabs.data` is the tab body minus id + name (see db/tabs.ts
  // upsertTab); re-attach them so the value is a complete Tab. The
  // renderer only reads `elements` + `backgroundColor`, both already in
  // the parsed body.
  const tab = { id: diagram.id, name: diagram.name, ...parsed } as Tab;
  return renderElementsToSvg(tab);
}
