import type { ShareLink as ShareLinkDTO } from '@livediagram/api-schema';

// share_links row shape as read from D1 (migration 0003). `role`
// arrives as a free-form string here, but the wire-format DTO is
// the narrow union 'edit' | 'view'. The mapper below normalises.

export type ShareLinkRow = {
  code: string;
  diagram_id: string;
  role: string;
  created_at: number;
};

// Pure mapper from D1 row to wire-format DTO. Pulled out of db.ts
// so the defensive role normalisation has a test surface of its
// own without dragging the rest of the D1 module along (same
// pattern as image-strip.ts, image-sniff.ts, change-log-row.ts).
//
// The role check is intentionally `=== 'view'`: any other value
// (including 'edit', any future role added on the server before
// the client knows about it, or a corrupted row) defaults to
// 'edit'. This biases towards the more permissive role, which is
// safe because:
//   1. The hosted product only ever writes 'edit' or 'view' (see
//      apps/api/src/index.ts createShareLink body validation).
//   2. The defaulting is read-side: a regression here can't
//      escalate a 'view' visitor to 'edit' (the column was 'view'
//      by hypothesis; we map it to 'view').
//   3. If a future migration adds e.g. 'admin' as a stored role
//      AND a still-old client visits the API, the old client
//      reads it as 'edit', which is the strictly less-privileged
//      option than admin would imply (admin > edit > view).
//   4. The api worker validates the role on the WRITE side too,
//      so 'admin' can't actually be persisted today.
export function rowToShareLink(row: ShareLinkRow): ShareLinkDTO {
  return {
    code: row.code,
    diagramId: row.diagram_id,
    role: row.role === 'view' ? 'view' : 'edit',
    createdAt: row.created_at,
  };
}
