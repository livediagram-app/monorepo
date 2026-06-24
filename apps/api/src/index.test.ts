import { describe, it, expect, vi } from 'vitest';

// Mock the two async deps the request path touches before dispatch, so we can
// drive the worker's top-level §4 guest-signature gate (spec/61) directly.
vi.mock('./auth/clerk', () => ({ getClerkIdentity: async () => null }));
vi.mock('./db', () => ({
  resolveApiToken: async () => null,
  listDiagramsByOwner: async () => [],
  deleteOldChangeLogEntries: async () => {},
  deleteOldEvents: async () => {},
  deleteOldUnusedImages: async () => {},
}));

import worker from './index';
import { signOwnerId } from './auth/owner-signature';
import type { Env } from './types';

const SECRET = 'test-hmac-secret';

// Enforcement on: secret set + a cutoff in the past.
function env(): Env {
  return { GUEST_ID_HMAC_SECRET: SECRET, GUEST_SIG_ENFORCE_AFTER: '1' } as unknown as Env;
}
function get(path: string, headers: Record<string, string> = {}): Request {
  return new Request(`https://api.test${path}`, { method: 'GET', headers });
}

describe('worker §4 guest X-Owner-Id signature gate', () => {
  it('401s an unsigned X-Owner-Id on an owner-scoped route when enforcing', async () => {
    const res = await worker.fetch(get('/api/diagrams', { 'X-Owner-Id': 'guest-1' }), env());
    expect(res.status).toBe(401);
  });

  it('401s an X-Owner-Id carrying a Clerk sub with no signature (signed-up Bearer-only)', async () => {
    const res = await worker.fetch(get('/api/diagrams', { 'X-Owner-Id': 'user_abc' }), env());
    expect(res.status).toBe(401);
  });

  it('401s an invalid signature', async () => {
    const res = await worker.fetch(
      get('/api/diagrams', { 'X-Owner-Id': 'guest-1', 'X-Owner-Sig': 'bogus' }),
      env(),
    );
    expect(res.status).toBe(401);
  });

  it('lets a validly signed X-Owner-Id through the gate', async () => {
    const sig = (await signOwnerId(SECRET, 'guest-1'))!;
    const res = await worker.fetch(
      get('/api/diagrams', { 'X-Owner-Id': 'guest-1', 'X-Owner-Sig': sig }),
      env(),
    );
    expect(res.status).not.toBe(401);
  });

  it('does not gate when no X-Owner-Id is presented (public reads still resolve)', async () => {
    const res = await worker.fetch(get('/api/diagrams'), env());
    expect(res.status).not.toBe(401);
  });
});
