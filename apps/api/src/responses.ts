// HTTP response helpers shared across the worker's route handlers.
// Lifted out of index.ts so the handler file can focus on routing +
// auth + business logic, and so the response shapes (status codes,
// error-body envelope, CORS preflight header set) have a single
// canonical home that the next route can grep for.

// CORS for the browser. Live app runs at the same hostname as the
// API (router worker stitches them together) so this is mostly a
// safety net for local dev where origins may differ. Headers list
// is the minimum the live app sends today.
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  // `Authorization` carries the Clerk Bearer token (Stage 2 hybrid
  // auth, spec/04, spec/11). Without it in the allow-list every
  // signed-in cross-origin request fails the preflight and surfaces
  // to JS as "Failed to fetch", which was hiding behind DELETE
  // /api/account and any other authed call from localhost:3002 to
  // localhost:8787 in dev.
  // Image upload uses custom X-Image-* headers (spec/19). The browser
  // rejects the POST preflight if any header the client sends isn't
  // in this list, which surfaces as "Failed to fetch" with no other
  // signal, so each new header has to land here too.
  'Access-Control-Allow-Headers':
    'Authorization, Content-Type, X-Owner-Id, X-Share-Code, X-Share-Password, X-Image-Sha256, X-Image-Width, X-Image-Height, X-Image-Original-Name',
  'Access-Control-Max-Age': '86400',
};

export function json(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function notFound(): Response {
  return json({ error: 'not_found' }, { status: 404 });
}

export function badRequest(msg: string): Response {
  return json({ error: 'bad_request', message: msg }, { status: 400 });
}

export function forbidden(): Response {
  return json({ error: 'forbidden' }, { status: 403 });
}

export function imagesUnavailable(): Response {
  return json({ error: 'images-unavailable' }, { status: 503 });
}

export function rateLimited(): Response {
  return json({ error: 'rate-limited' }, { status: 429 });
}

// Returned whenever `resolveOwner()` yields null on a mutation /
// owner-scoped read. Owner can be null for two reasons under hybrid
// auth (spec/04):
//
//   1. Pure-guest path with no `X-Owner-Id` header sent.
//   2. A Bearer token was sent but verification failed silently
//      (expired, invalid signature, JWKS unreachable, etc.):
//      `getClerkUserId` returns null on any error so the guest path
//      still serves.
//
// Pre-Clerk this used to be a flat "missing X-Owner-Id" message,
// which now misdirects signed-in users debugging an auth failure to
// look at the wrong header. The new message names both legitimate
// identity sources so the caller can tell which one they're missing.
export function missingAuth(): Response {
  return badRequest('authentication required: send a valid Clerk Bearer token or X-Owner-Id');
}
