// api_tokens — external API credentials, owner-scoped to a Clerk account
// (spec/61). We store only the SHA-256 hash; the auth hot path hashes the
// presented token and looks the hash up here.

import { hashApiToken } from '../auth/api-token';
import { rowToApiToken, type ApiTokenRow } from '../api-token-row';
import type { ApiTokenDTO, Env } from '../types';

const COLS = 'id, owner_id, token_hash, name, created_at, last_used_at, expires_at, revoked';

// Hard cap on live tokens per account (spec/61): enough for any real
// integration set, low enough to keep the list + table tidy.
export const MAX_API_TOKENS_PER_OWNER = 10;

export async function listApiTokensByOwner(env: Env, ownerId: string): Promise<ApiTokenDTO[]> {
  const result = await env.DB.prepare(
    `SELECT ${COLS} FROM api_tokens WHERE owner_id = ? AND revoked = 0 ORDER BY created_at DESC`,
  )
    .bind(ownerId)
    .all<ApiTokenRow>();
  return (result.results ?? []).map(rowToApiToken);
}

// Live = not revoked and not expired. Drives the per-owner creation cap.
export async function countLiveApiTokens(env: Env, ownerId: string): Promise<number> {
  const row = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM api_tokens WHERE owner_id = ? AND revoked = 0 AND expires_at > ?',
  )
    .bind(ownerId, Date.now())
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function createApiToken(
  env: Env,
  t: {
    id: string;
    ownerId: string;
    name: string | null;
    tokenHash: string;
    createdAt: number;
    expiresAt: number;
  },
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO api_tokens (id, owner_id, token_hash, name, created_at, last_used_at, expires_at, revoked)
     VALUES (?, ?, ?, ?, ?, NULL, ?, 0)`,
  )
    .bind(t.id, t.ownerId, t.tokenHash, t.name, t.createdAt, t.expiresAt)
    .run();
}

// Resolve a presented token to its owner id — the auth hot path. Hashes the
// token, looks up a LIVE (non-revoked, unexpired) row, and stamps
// `last_used_at`. Returns the owner id, or null when no live token matches
// (revoked / expired / unknown all collapse to "not authenticated").
export async function resolveApiToken(env: Env, token: string): Promise<string | null> {
  const hash = await hashApiToken(token);
  const now = Date.now();
  const row = await env.DB.prepare(
    'SELECT id, owner_id FROM api_tokens WHERE token_hash = ? AND revoked = 0 AND expires_at > ?',
  )
    .bind(hash, now)
    .first<{ id: string; owner_id: string }>();
  if (!row) return null;
  await env.DB.prepare('UPDATE api_tokens SET last_used_at = ? WHERE id = ?')
    .bind(now, row.id)
    .run();
  return row.owner_id;
}

// Revoke one of the owner's own tokens. Scoped by owner_id so a caller can
// only revoke their own. Returns whether a live row was actually flipped.
export async function revokeApiToken(env: Env, ownerId: string, id: string): Promise<boolean> {
  const res = await env.DB.prepare(
    'UPDATE api_tokens SET revoked = 1 WHERE id = ? AND owner_id = ? AND revoked = 0',
  )
    .bind(id, ownerId)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

// Account-deletion cascade (spec/61): no credential outlives the account.
export async function deleteApiTokensByOwner(env: Env, ownerId: string): Promise<void> {
  await env.DB.prepare('DELETE FROM api_tokens WHERE owner_id = ?').bind(ownerId).run();
}
