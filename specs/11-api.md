# API app

The HTTP + WebSocket layer the live editor calls for diagram persistence and realtime collab.

- **Workspace:** `apps/api` (`@livediagram/api`).
- **Worker name:** `livediagram-api`.
- **Mount:** routed from the [router worker](08-router-app.md) at `/api/*`. The router forwards the request as-is — the api worker sees the full `/api/...` path.

## Why this exists

The first prototype phase ([spec 02](02-prototype-scope.md)) ran entirely client-side with `localStorage` persistence. Once realtime collaboration entered scope, server state became necessary: a Durable Object holds the in-room participant list and broadcasts ops between connected clients, and D1 owns the durable diagram snapshot. The live app no longer reads or writes `localStorage` for diagrams — `apps/live/lib/api-client.ts` is the single boundary.

## Tech

- **Runtime:** Cloudflare Workers.
- **DB:** Cloudflare D1 (binding `DB`). Single migration in `migrations/0001_init.sql`.
- **Realtime:** Cloudflare Durable Objects (`DiagramRoom`, binding `DIAGRAM_ROOM`). One instance per diagram id, identified by the diagram's UUID via `idFromName`.

## Auth (TODO)

The API is currently **open** — no auth on any endpoint. Owner identity is carried by an `X-Owner-Id` header set by the live app to the current participant id. The participant id is a `crypto.randomUUID()` minted on first visit and persisted in `localStorage` under the bootstrap key `livediagram:v2:self-id`.

Clerk is the planned replacement (per [spec 04](04-auth-and-guest-access.md)). When it lands, `X-Owner-Id` becomes the verified Clerk user id; guests keep the localStorage path and migrate their diagrams on sign-up.

## Endpoints

All JSON. CORS allows any origin (the live app is same-origin via the router; this is mostly a dev convenience).

| Method   | Path                    | Body / headers                      | Returns                                                            |
| -------- | ----------------------- | ----------------------------------- | ------------------------------------------------------------------ |
| `GET`    | `/api/diagrams`         | `X-Owner-Id`                        | `{ diagrams: DiagramSummary[] }` — owner's diagrams, newest first. |
| `POST`   | `/api/diagrams`         | `X-Owner-Id` + `{ id, name, tabs }` | `{ diagram }` (201). Owner is set from the header.                 |
| `GET`    | `/api/diagrams/:id`     | —                                   | `{ diagram }` or 404.                                              |
| `PUT`    | `/api/diagrams/:id`     | `X-Owner-Id` + `{ name, tabs }`     | `{ diagram }`. Full upsert; owner preserved from existing row.     |
| `DELETE` | `/api/diagrams/:id`     | —                                   | 204.                                                               |
| `GET`    | `/api/diagrams/:id/ws`  | Upgrade: websocket                  | WebSocket connection to the `DiagramRoom` for this id.             |
| `GET`    | `/api/participants/:id` | —                                   | `{ participant }` or 404.                                          |
| `PUT`    | `/api/participants/:id` | `{ name, color }`                   | `{ participant }`. Upsert; no auth check (open phase).             |

## Realtime model

The `DiagramRoom` Durable Object holds the live state for one diagram id. Clients connect via the `/ws` endpoint and immediately send a `hello` message identifying themselves; the room broadcasts a `presence` snapshot to everyone whenever the set changes.

Edits propagate via opaque `op` messages. The room never inspects or persists ops — it just rebroadcasts them to peers. The current op vocabulary is a single kind:

- `{ kind: 'tabs'; tabs: Tab[]; name: string }` — the full diagram snapshot after the editing client's local mutation.

Conflict resolution is **last-writer-wins**. When a client receives an op, it replaces its local `tabs` + `name` and skips the next debounced save (a ref flag prevents the obvious echo loop). This is intentionally crude — it works for low-frequency collab on small diagrams and avoids the operational-transform / CRDT complexity that a serious editor would need. A future iteration can refine the op vocabulary (per-element add/move/delete) without changing the room contract.

The room never touches D1; persistence is the REST `PUT /api/diagrams/:id` call, which the live app fires from its debounced save effect.

## Data model

```sql
diagrams (
  id          TEXT  PRIMARY KEY,
  owner_id    TEXT  NOT NULL,
  name        TEXT  NOT NULL,
  data        TEXT  NOT NULL,  -- JSON: { tabs: Tab[] }
  saved_at    INTEGER NOT NULL,
  created_at  INTEGER NOT NULL
);
CREATE INDEX idx_diagrams_owner_recent ON diagrams (owner_id, saved_at DESC);

participants (
  id          TEXT  PRIMARY KEY,
  name        TEXT  NOT NULL,
  color       TEXT  NOT NULL,
  created_at  INTEGER NOT NULL
);
```

Document-store pattern: the `data` column holds the full JSON of `tabs[]` (the same shape the editor consumed from `localStorage` in the prototype phase). Every read / write hits the whole document anyway and the editor already round-trips JSON, so normalising tabs / elements into relational tables would buy nothing today. The downside — no SQL filtering by element type or by linked tab — isn't needed for any current feature. Comments live inside that JSON tree too (`element.commentThread`).

## One-time setup

Before the first deploy:

1. `pnpm --filter @livediagram/api exec wrangler d1 create livediagram`
2. Copy the printed `database_id` into `apps/api/wrangler.toml` (replacing `TODO_RUN_WRANGLER_D1_CREATE`).
3. `pnpm --filter @livediagram/api run db:migrate:remote` to apply migrations.

After that, GitHub Actions handles deploys via `deploy.yml` (`deploy-api` step). The router's service binding to `livediagram-api` means the API must deploy before the router.
