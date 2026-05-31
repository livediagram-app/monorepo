# Deployment

All deployments run **via GitHub Actions** to **Cloudflare Workers**. No manual deploys.

## Apps and their Cloudflare Workers

| App              | Cloudflare Worker       | Type                                             |
| ---------------- | ----------------------- | ------------------------------------------------ |
| `apps/marketing` | `livediagram-marketing` | Static assets only (Next.js `output: 'export'`). |
| `apps/live`      | `livediagram-live`      | Static assets + a tiny path-rewrite worker.      |
| `apps/api`       | `livediagram-api`       | Worker (D1 binding + Durable Object).            |
| `apps/router`    | `livediagram-router`    | Worker (service bindings to the other three).    |

The marketing worker serves files from `apps/marketing/out/` (`output: 'export'`). The live worker serves files from `apps/live/out/` plus a small worker (`apps/live/src/worker.ts`) that rewrites every `/diagram/<id>` request to the single statically-built `/diagram/placeholder/` page — see [14-new-diagram-route.md](14-new-diagram-route.md). The api worker holds the REST + WebSocket layer (see [11-api.md](11-api.md)). The router holds **no application logic** — only `MARKETING`, `LIVE`, and `API` service bindings that forward requests to the right downstream worker.

`wrangler.toml` for each app sits at the app root and is the source of truth for the worker's name, compatibility date, `[assets]`, `[[services]]`, `[[d1_databases]]`, and Durable Object bindings. Account-level identifiers (account id, custom domain, secrets) **never** go in `wrangler.toml` — they live in environment variables or the Cloudflare dashboard. See [06-secrets-policy.md](06-secrets-policy.md).

## Toolchain

- **Node:** `>=22` (Wrangler 4 requires it). Both `ci.yml` and `deploy.yml` pin Node 22.
- **pnpm:** `9.15.0` via `pnpm/action-setup`.
- **Wrangler:** `^4.40.0` across all workspaces.

## CI

`.github/workflows/ci.yml` runs on **every PR** and **every push to `main`**.

Steps:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm format:check`
4. `pnpm typecheck`
5. `pnpm test`
6. `pnpm build`

CI must pass before deploy is allowed to run.

**Testing** runs via [Vitest](https://vitest.dev). Workspaces opt in by adding `"test": "vitest run"` to their `package.json` scripts and `vitest` to their `devDependencies`; turbo then picks the task up automatically. Tests live next to the source they cover as `*.test.ts` files. Today `packages/diagram` and `apps/live` are opted in; other workspaces mirror the pattern when they add their first test.

## Deploy

`.github/workflows/deploy.yml` runs only on `main` and only **after CI has succeeded** (via `workflow_run`). Can also be triggered manually with `workflow_dispatch`.

Jobs:

1. **build** — installs deps, runs `pnpm build`, uploads `apps/marketing/out` and `apps/live/out` as workflow artifacts.
2. **deploy-marketing** — downloads `marketing-out`, runs `pnpm exec wrangler deploy` from `apps/marketing/`.
3. **deploy-live** — downloads `live-out`, runs `pnpm exec wrangler deploy` from `apps/live/`.
4. **deploy-api** — runs:
   - `pnpm exec wrangler whoami` (diagnostic — prints which Cloudflare account the token authenticates against so a `7403 account not authorized` error is debuggable from the log).
   - `pnpm exec wrangler d1 migrations apply DB --remote --yes` — applies any pending migrations BEFORE the worker deploy so the new code never briefly runs against an older schema. If this step fails the job halts and surfaces a precise error pointing at the missing token scopes.
   - `pnpm exec wrangler deploy` from `apps/api/`.
5. **deploy-router** — depends on **deploy-marketing**, **deploy-live**, and **deploy-api**. Runs `pnpm exec wrangler deploy` from `apps/router/`. The router's service bindings target the three workers above, so it must deploy after they exist.

`deploy-marketing`, `deploy-live`, and `deploy-api` run in parallel; `deploy-router` waits for all three.

All five jobs use raw `pnpm exec wrangler` rather than `cloudflare/wrangler-action` — wrangler 4 ships sensible defaults and the explicit invocation makes the workflow log read 1:1 against a local run.

## Required GitHub Action secrets

Set in the repo under **Settings → Secrets and variables → Actions**:

| Secret          | What it is                                                                      |
| --------------- | ------------------------------------------------------------------------------- |
| `CF_API_TOKEN`  | A Cloudflare API token with permissions to deploy Workers and apply migrations. |
| `CF_ACCOUNT_ID` | The Cloudflare account ID the workers belong to.                                |

### Creating the API token

Cloudflare dashboard → **My Profile → API Tokens → Create Token → Custom Token**.

Permissions (all on the account that owns the workers):

- **Workers Scripts → Edit** — deploy & update workers.
- **D1 → Edit** — apply migrations during deploy.
- **Workers Routes → Edit** — wire / update custom domain routes.
- **Account Settings → Read** — required by wrangler.
- **User → User Details → Read** — `wrangler whoami` introspection.

Scope to **the specific account** that owns the workers. Do **not** issue an "all-account" token. If the deploy-api step emits `7403 The given account is not valid or is not authorized to access this service`, the token is missing D1 Edit (or was minted for a different account than `CF_ACCOUNT_ID`).

### Getting the account ID

Cloudflare dashboard → any zone → right sidebar → **Account ID** (copy).

## First deploy

On the first run, none of the workers exist yet. The job ordering handles this: `deploy-marketing`, `deploy-live`, and `deploy-api` run first and create those workers, then `deploy-router` runs — by which point its three service-binding targets already exist, so wrangler accepts the bindings.

Subsequent deploys are idempotent updates.

## Custom domain

Production lives at **`https://livediagram.app`**. The apex routes to the router worker (configured in the Cloudflare dashboard, not in `wrangler.toml`). From there:

- `https://livediagram.app/api/*` → api worker (REST + WebSocket).
- `https://livediagram.app/live` and `https://livediagram.app/live/<anything>` → live editor (the router strips the `/live` prefix before forwarding).
- Everything else → marketing.

The workers themselves remain reachable at their default `*.workers.dev` URLs for direct testing.

## What this spec does **not** yet cover

- Preview deploys for PRs.
- Staging environment.
- Rollback procedure (currently: `wrangler rollback` via dashboard or CLI).
- Per-worker secrets (`wrangler secret put`).
