// API-worker type surface. The wire-format DTOs are now defined in
// `@livediagram/api-schema` so the api worker and the live editor
// share the same source of truth (no more parallel type definitions
// drifting between them — see CLAUDE.md's reuse-over-duplication
// rule). This file re-exports the canonical names under the
// historical `*DTO` aliases the worker code already uses, and adds
// the worker-only `Env` binding shape that has nowhere else to live.

export type {
  Diagram as DiagramDTO,
  DiagramSummary,
  TabSummary as TabSummaryDTO,
  TabRecord as TabDTO,
  Folder as FolderDTO,
  ImageSummary,
  ParticipantRecord as ParticipantDTO,
  ParticipantPresence,
  ShareRole,
  ShareLink as ShareLinkDTO,
  ChangeLogKind,
  ChangeLogEntry as ChangeLogEntryDTO,
  ServerMessage,
  ClientMessage,
} from '@livediagram/api-schema';

// Worker bindings injected by Cloudflare at runtime. Not part of the
// wire format (purely a server-side capability handle).
export type Env = {
  DB: D1Database;
  DIAGRAM_ROOM: DurableObjectNamespace;
  // Clerk JWKS URL: when set, the request handler verifies Bearer
  // tokens against it via `src/auth/clerk.ts` and prefers the
  // resulting userId over `X-Owner-Id`. When unset, the worker stays
  // in pure-guest mode (X-Owner-Id only). See spec/04 + spec/11.
  CLERK_JWKS_URL?: string;
  // R2 bucket holding image-element bytes (spec/19). Optional so
  // self-hosters who haven't provisioned R2 can still deploy the
  // api worker: when unbound, the image endpoints all return 503
  // and the live app hides the Image palette entry.
  IMAGES?: R2Bucket;
  // Cloudflare Workers Rate Limiting API binding. Caps per-owner
  // writes (POST / PUT / DELETE) at the configured limit/period in
  // wrangler.toml. Optional so self-host deployments without the
  // feature flag still serve (the check helper returns "allowed"
  // when the binding is absent).
  WRITE_RATE_LIMITER?: { limit: (input: { key: string }) => Promise<{ success: boolean }> };
};
