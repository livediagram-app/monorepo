// share_links — per-diagram, per-role short codes (migration 0003).
// Row shape + role normalisation live in share-link-row.ts so the
// defensive mapper has its own test surface.

import { rowToShareLink, type ShareLinkRow } from '../share-link-row';
import type { Env, ShareLinkDTO, ShareRole } from '../types';

// Short, URL-safe alphabet. Avoids visually ambiguous characters
// (0/O/1/I/l) so the share codes are easy to read aloud or transcribe.
const SHARE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateShareCode(length = 8): string {
  let code = '';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (const byte of bytes) {
    code += SHARE_ALPHABET[byte % SHARE_ALPHABET.length];
  }
  return code;
}

export async function listShareLinks(env: Env, diagramId: string): Promise<ShareLinkDTO[]> {
  const result = await env.DB.prepare(
    'SELECT code, diagram_id, role, created_at FROM share_links WHERE diagram_id = ? ORDER BY created_at ASC',
  )
    .bind(diagramId)
    .all<ShareLinkRow>();
  return (result.results ?? []).map(rowToShareLink);
}

export async function getShareLink(env: Env, code: string): Promise<ShareLinkDTO | null> {
  const row = await env.DB.prepare(
    'SELECT code, diagram_id, role, created_at FROM share_links WHERE code = ?',
  )
    .bind(code)
    .first<ShareLinkRow>();
  return row ? rowToShareLink(row) : null;
}

export async function createShareLink(
  env: Env,
  diagramId: string,
  code: string,
  role: ShareRole,
): Promise<ShareLinkDTO> {
  const createdAt = Date.now();
  await env.DB.prepare(
    'INSERT INTO share_links (code, diagram_id, role, created_at) VALUES (?, ?, ?, ?)',
  )
    .bind(code, diagramId, role, createdAt)
    .run();
  // Flip the shareable flag on so the realtime room opens + the
  // share-code resolver picks the diagram up. The "primary" code is
  // derived from share_links on read, so no column to update.
  await env.DB.prepare('UPDATE diagrams SET shareable = 1 WHERE id = ?').bind(diagramId).run();
  return { code, diagramId, role, createdAt };
}

export async function deleteShareLink(env: Env, code: string): Promise<void> {
  const existing = await getShareLink(env, code);
  if (!existing) return;
  await env.DB.prepare('DELETE FROM share_links WHERE code = ?').bind(code).run();
  // If this was the last link for the diagram, flip shareable off so
  // the live app stops opening the realtime room. The primary code
  // is derived on read; no column to repoint.
  const remaining = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM share_links WHERE diagram_id = ?',
  )
    .bind(existing.diagramId)
    .first<{ n: number }>();
  if (!remaining || remaining.n === 0) {
    await env.DB.prepare('UPDATE diagrams SET shareable = 0 WHERE id = ?')
      .bind(existing.diagramId)
      .run();
  }
}
