// /api/share/<code> — resolve a share code to its diagram + role.

import { getDiagram, getDiagramByShareCode, getShareLink, recordSharedAccess } from '../db';
import { json, notFound } from '../responses';
import type { ShareRole } from '../types';
import type { RouteContext } from './context';

// Resolve a share code to its diagram + role. Used by visitors
// landing on /live/diagram/shared?s=<code>. Returns 404 if the
// code doesn't exist OR was revoked.
export async function handleShare(ctx: RouteContext): Promise<Response> {
  const { request, env, segments, resolveOwner } = ctx;
  if (!(segments[1] === 'share' && segments.length === 3)) return notFound();
  const code = segments[2]!;
  if (request.method === 'GET') {
    // Primary: resolve through share_links so the code's role
    // (edit vs view) is carried back to the visitor.
    // Defensive fallback: a second share_links lookup gated on
    // diagrams.shareable so a code on a revoked-then-rewritten
    // diagram still 404s. Both legs query share_links — the
    // legacy diagrams.share_code column was dropped in
    // migration 0008.
    const link = await getShareLink(env, code);
    if (link) {
      const d = await getDiagram(env, link.diagramId);
      if (!d) return notFound();
      // Track the visit in shared_with so a "Shared with you"
      // list (#8) can surface this diagram later. Only record
      // when (a) the visitor identifies (Bearer or
      // X-Owner-Id) AND (b) they're not the diagram owner —
      // an owner opening their own share link shouldn't
      // appear in their own Shared list. Failure is silent;
      // resolving the share code is the user-visible thing,
      // tracking is a nice-to-have.
      const visitor = resolveOwner();
      if (visitor && visitor !== d.ownerId) {
        await recordSharedAccess(env, visitor, d.id, link.role).catch(() => {});
      }
      return json({ diagram: d, role: link.role });
    }
    const d = await getDiagramByShareCode(env, code);
    if (!d) return notFound();
    const visitor = resolveOwner();
    if (visitor && visitor !== d.ownerId) {
      await recordSharedAccess(env, visitor, d.id, 'edit' as ShareRole).catch(() => {});
    }
    return json({ diagram: d, role: 'edit' as ShareRole });
  }
  return notFound();
}
