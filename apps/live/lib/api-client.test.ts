import { afterEach, describe, expect, it } from 'vitest';
import { apiHeaders, setTokenProvider } from './api-client';

// Reset the module-level token provider between tests so the order of
// the cases below doesn't leak. The Bearer-path tests register a
// provider, the guest-path tests assume none. Without this teardown a
// previous case's provider would silently drive a later "guest" case
// down the Bearer branch.
afterEach(() => {
  setTokenProvider(null);
});

// Helper: apiHeaders returns HeadersInit which can be either a plain
// object or a Headers / [string, string][] tuple list. In this file
// every branch returns a plain object, so the cast is safe and the
// tests can treat the result as a Record for index assertions.
async function call(...args: Parameters<typeof apiHeaders>): Promise<Record<string, string>> {
  return (await apiHeaders(...args)) as Record<string, string>;
}

describe('apiHeaders (hybrid identity gate, spec/04 + spec/11)', () => {
  it('guest path: no provider, no token, emits X-Owner-Id', async () => {
    const h = await call('guest-uuid-1');
    expect(h['X-Owner-Id']).toBe('guest-uuid-1');
    expect(h.Authorization).toBeUndefined();
  });

  it('guest path: provider returning null falls back to X-Owner-Id', async () => {
    // Signed-out Clerk session: useAuth().getToken() resolves to
    // null, so the provider is registered but currently inert. The
    // request must still carry the X-Owner-Id header (the editor
    // stays usable for signed-out visitors).
    setTokenProvider(async () => null);
    const h = await call('guest-uuid-2');
    expect(h['X-Owner-Id']).toBe('guest-uuid-2');
    expect(h.Authorization).toBeUndefined();
  });

  it('bearer path: provider returning a token emits Authorization and drops X-Owner-Id', async () => {
    // The invariant that matters: a request must NOT carry both
    // headers simultaneously. The api worker would prefer the JWT
    // (verifies it, derives the owner from sub) but the duplicate
    // owner signal would leave a confusing trail in any per-request
    // audit. Bearer-only is the only correct shape.
    setTokenProvider(async () => 'jwt-token-abc');
    const h = await call('client-passed-id-ignored');
    expect(h.Authorization).toBe('Bearer jwt-token-abc');
    expect(h['X-Owner-Id']).toBeUndefined();
  });

  it('body opt adds Content-Type: application/json on guest path', async () => {
    const h = await call('guest-uuid-3', { body: true });
    expect(h['X-Owner-Id']).toBe('guest-uuid-3');
    expect(h['Content-Type']).toBe('application/json');
  });

  it('body opt adds Content-Type on bearer path too', async () => {
    setTokenProvider(async () => 'jwt-token-def');
    const h = await call('ignored', { body: true });
    expect(h.Authorization).toBe('Bearer jwt-token-def');
    expect(h['Content-Type']).toBe('application/json');
    expect(h['X-Owner-Id']).toBeUndefined();
  });

  it('share opt adds X-Share-Code', async () => {
    const h = await call('guest-uuid-4', { share: 'ABCD2345' });
    expect(h['X-Owner-Id']).toBe('guest-uuid-4');
    expect(h['X-Share-Code']).toBe('ABCD2345');
  });

  it('share + body together emit all three headers', async () => {
    const h = await call('guest-uuid-5', { share: 'EFGH6789', body: true });
    expect(h['X-Owner-Id']).toBe('guest-uuid-5');
    expect(h['X-Share-Code']).toBe('EFGH6789');
    expect(h['Content-Type']).toBe('application/json');
  });

  it('bearer + share: signed-in visitor on a share URL still carries the share code', async () => {
    // A signed-in user clicking a share link sends Bearer (their
    // Clerk identity) AND X-Share-Code (the link's role gates write
    // access on the diagram they don't own). spec/04: "Share-code
    // visitors who happen to also be signed in send Bearer +
    // X-Share-Code; the per-link role still gates write access."
    setTokenProvider(async () => 'jwt-token-xyz');
    const h = await call('ignored', { share: 'IJKL0123' });
    expect(h.Authorization).toBe('Bearer jwt-token-xyz');
    expect(h['X-Share-Code']).toBe('IJKL0123');
    expect(h['X-Owner-Id']).toBeUndefined();
  });

  it('share: null is treated as absent (no X-Share-Code header)', async () => {
    // Several call sites pass `share: shareCode ?? null` where the
    // user is an owner (no share code in scope). A null value must
    // not emit an X-Share-Code: "" header, which the api would
    // mis-parse as a share visit. Verifies the truthy guard.
    const h = await call('guest-uuid-6', { share: null });
    expect(h['X-Share-Code']).toBeUndefined();
    expect(h['X-Owner-Id']).toBe('guest-uuid-6');
  });
});
