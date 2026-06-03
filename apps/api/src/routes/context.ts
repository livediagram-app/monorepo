// Shared per-request context for the route handlers. The worker's
// `fetch` entry (src/index.ts) builds one of these after resolving the
// caller's identity + running the cross-cutting gates (CORS, write
// rate-limit), then dispatches on `segments[1]` to the matching
// `routes/<resource>.ts` handler. Each handler owns every request for
// its segment and returns `notFound()` for sub-paths / methods it
// doesn't recognise (preserving the original fall-through-to-404).

import { canEditDiagram, canReadDiagram } from '../auth/diagram-access';
import type { Env } from '../types';

export type RouteContext = {
  request: Request;
  env: Env;
  url: URL;
  // Path split on '/', leading slash stripped: `['api', '<resource>', ...]`.
  segments: string[];
  // The verified Clerk userId, or null. Routes that must be
  // Clerk-only (account deletion, guest->authed migration) read this
  // directly rather than through `resolveOwner` so there's no
  // X-Owner-Id fallback.
  clerkUserId: string | null;
  // Hybrid identity (spec/04): the verified Clerk userId, else the
  // legacy X-Owner-Id header, else null. Resolved once in `fetch`.
  resolveOwner: () => string | null;
};

// Visitor share code carried on edit/view-link requests so a non-owner
// can authorise against a diagram they don't own.
export function shareCodeOf(request: Request): string | null {
  return request.headers.get('X-Share-Code');
}

// Share password (spec/24) carried alongside the share code when the
// diagram the visitor is accessing is password-protected. Owners never
// send it (their identity short-circuits the check); a non-owner with a
// share code must, or the access gate denies password-protected diagrams.
export function sharePasswordOf(request: Request): string | null {
  return request.headers.get('X-Share-Password');
}

// Route-side wrappers around canReadDiagram / canEditDiagram. Most
// handler call sites need the same six args to the auth helpers
// (env, diagramId, caller, share code, diagram owner, share
// password); four of them (env, caller, share code, share password)
// fall straight out of the RouteContext, so condensing them into a
// (ctx, diagramId, diagramOwnerId) helper drops a stack of
// repetitive 6-line invocations to 1-liners. Behaviour stays
// identical: each helper just forwards the ctx-derived args.
export function gateRead(
  ctx: RouteContext,
  diagramId: string,
  diagramOwnerId: string,
): Promise<boolean> {
  return canReadDiagram(
    ctx.env,
    diagramId,
    ctx.resolveOwner(),
    shareCodeOf(ctx.request),
    diagramOwnerId,
    sharePasswordOf(ctx.request),
  );
}

export function gateEdit(
  ctx: RouteContext,
  diagramId: string,
  diagramOwnerId: string,
): Promise<boolean> {
  return canEditDiagram(
    ctx.env,
    diagramId,
    ctx.resolveOwner(),
    shareCodeOf(ctx.request),
    diagramOwnerId,
    sharePasswordOf(ctx.request),
  );
}
