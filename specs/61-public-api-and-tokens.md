# 61 — Public API and API tokens

**Status: proposed (design only — not yet implemented).** This spec sequences
opening the REST API to external, programmatic callers. The input-validation
hardening it depends on has shipped (see [§5](#5-input-validation-prerequisite-shipped)); the
token auth model below is the part awaiting sign-off before any code.

## 1. Goal

Let people call the livediagram API from their own scripts / integrations with
a long-lived **API token**, not just from the first-party web app. Read their
diagrams, create/update them, manage folders — the same surface the app uses,
under an explicit, revocable credential.

This must not weaken the friction-free guest model ([spec/04](04-auth-and-guest-access.md))
or self-hosting ([spec/03](03-open-source-and-business-model.md)).

## 2. Why the API isn't safe to expose as-is

Today the worker resolves the caller two ways ([spec/04](04-auth-and-guest-access.md)):

- **Clerk JWT** in `Authorization: Bearer <jwt>` — verified (signature, exp,
  optional issuer/audience) in `apps/api/src/auth/clerk.ts`. Sound.
- **Guest path**: an `X-Owner-Id` header carrying a per-browser UUID, **trusted
  verbatim** (`resolveOwner()` in `apps/api/src/index.ts`).

The guest header is the blocker. It is bound to **no credential**: any caller
can set `X-Owner-Id: <someone-else's-id>` and act as that owner over REST
(read their diagram list, edit a diagram, delete an image). For the first-party
app this is acceptable — ids are unguessable UUIDs, only ever held by their
owner's browser, and the realtime/WS path already requires an HMAC proof
(`?g=`) — but it is **not** an authentication scheme we can hand to untrusted
external callers, because the header is exactly the thing an attacker controls.

Conclusion: external access needs a credential the server can verify and bind
to an owner. Bare `X-Owner-Id` from a non-first-party caller must stop being
honoured.

## 3. Design: API tokens

### 3.1 Token format

- An opaque secret with a visible prefix for greppability + leak-scanning:
  `lvd_<base62 random ≥ 32 bytes>`. The prefix also disambiguates it from a
  Clerk JWT in the same `Authorization: Bearer` header.
- Shown **once** at creation; never retrievable again.
- Stored **hashed** (SHA-256), never in plaintext. Lookup hashes the presented
  token and compares (constant-time, reusing `auth/timing-safe.ts`).

### 3.2 Storage (D1)

A new owner-scoped table, migration with the worker that owns the binding:

```
api_tokens(
  id            TEXT PRIMARY KEY,     -- public token id (for listing / revoke)
  owner_id      TEXT NOT NULL,        -- the Clerk userId OR guest id this token acts as
  token_hash    TEXT NOT NULL UNIQUE, -- SHA-256 of the secret
  name          TEXT,                 -- user label ("CI bot")
  scopes        TEXT NOT NULL,        -- 'read' | 'read,write' (see 3.4)
  created_at    INTEGER NOT NULL,
  last_used_at  INTEGER,
  expires_at    INTEGER,              -- NULL = no expiry
  revoked       INTEGER NOT NULL DEFAULT 0
)
```

Indexed on `token_hash` (lookup) and `owner_id` (listing).

### 3.3 Resolution

A token authenticates as a third identity path, resolved once in `fetch`
alongside Clerk + the guest header:

1. `Authorization: Bearer lvd_…` → hash → look up a non-revoked, non-expired
   row → the request's owner id is the row's `owner_id`; stamp `last_used_at`.
2. Else the existing Clerk JWT path.
3. Else the guest `X-Owner-Id` path — **only for first-party requests** (see
   [§4](#4-x-owner-id-trust-change)).

The resolved owner id flows through the **same** `gateRead` / `gateEdit` /
ownership checks every route already enforces — so a token can only touch what
its `owner_id` owns. No route changes for authorization; only the identity
source changes.

### 3.4 Scopes

Start coarse: `read` (GET only) and `write` (POST/PUT/DELETE). The dispatcher
already classifies writes (`isWrite` in `index.ts`); a write under a read-only
token returns `403`. Per-resource / per-diagram scopes are future work
([§7](#7-out-of-scope-for-now)).

### 3.5 Rate limiting

Key the existing `WRITE_RATE_LIMITER` on the token id (not just the owner) so a
runaway integration is throttled independently of the owner's interactive app
use, and add a read limiter for token reads. Per-IP limits stay as the outer
backstop.

### 3.6 Management

Users create / name / revoke tokens in account settings (signed-in users) — a
new `GET/POST/DELETE /api/tokens` surface, Clerk-gated (you can't mint a token
with a bare guest header). Creation returns the secret once. Revoke is
immediate (the lookup filters `revoked = 0`).

### 3.7 Self-hosting

Tokens are owner-scoped and work whether the owner id is a Clerk `sub` or a
guest id, so a self-host without Clerk can still issue tokens against guest
identities. No SaaS dependency.

## 4. `X-Owner-Id` trust change

When token auth ships, the guest header must no longer be honoured for
arbitrary external callers. Options (decide at implementation):

- **(a) First-party gate** — accept `X-Owner-Id` only when the request is
  same-origin (the app), via the `Origin` / `Sec-Fetch-Site` signals already
  used for telemetry (`origin-check.ts`). External callers must use a token.
- **(b) Require the HMAC proof** — extend the WS `?g=` signature model
  (`auth/owner-signature.ts`) to REST: a guest header must arrive with a valid
  `X-Owner-Sig`. Heavier for the app, but uniform.

(a) is the lighter path and preserves today's app behaviour exactly; (b) is
stricter but changes every guest write. Leaning (a). Either way the bare header
stops being a usable external credential.

## 5. Input validation (prerequisite — shipped)

Opening the API magnifies the cost of weak input handling, so the validation
hardening landed first:

- **Structural schema validation** — `isValidElement` / `isValidTab`
  (`packages/diagram/src/validate.ts`) vet the element/tab discriminant,
  required fields, endpoints, array bounds + unique ids. The diagram routes run
  incoming tabs (create-seed + tab PUT) through `isValidTab` and reject
  malformed trees with `400`.
- **Size caps** — a global Content-Length body cap, per-tab byte cap, and
  name / theme-definition / participant / share-password caps
  (`apps/api/src/limits.ts`); a per-frame cap in the realtime room.
- **Already solid** (pre-existing): D1 is fully parameterized; Clerk JWT
  verification; share-link expiry + constant-time password compare + per-IP
  brute-force limiter; WS-upgrade auth; realtime role re-stamping + op-rate cap.

## 6. Rollout

1. ✅ Input hardening (done).
2. `api_tokens` table + migration + token mint/verify (`auth/`), Clerk-gated
   management routes.
3. Wire token resolution into `resolveOwner`; enforce scopes.
4. Apply the `X-Owner-Id` trust change ([§4](#4-x-owner-id-trust-change)).
5. Public API docs (the surface is the existing routes; document them).

## 7. Out of scope (for now)

Per-diagram / per-folder scopes, OAuth / third-party app authorization,
webhooks, and any billing or quota tiers (the product has no paid tier —
[spec/03](03-open-source-and-business-model.md)). Tokens inherit the owner's
full access; finer grants come later if demand appears.
