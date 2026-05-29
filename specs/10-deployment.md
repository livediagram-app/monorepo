# Deployment

All deployments run **via GitHub Actions** to **Cloudflare Workers** (Workers with Static Assets). No manual deploys.

## Apps and their Cloudflare Workers

| App              | Cloudflare Worker       | Type                      |
| ---------------- | ----------------------- | ------------------------- |
| `apps/marketing` | `livediagram-marketing` | Static assets only        |
| `apps/live`      | `livediagram-live`      | Static assets only        |
| `apps/router`    | `livediagram-router`    | Worker (service bindings) |

The marketing and live workers serve files from each Next.js app's `./out` directory (`output: 'export'`). The router worker holds **no application logic** — only the `MARKETING` and `LIVE` service bindings that forward requests to the right downstream worker. See [08-router-app.md](08-router-app.md).

`wrangler.toml` for each app sits at the app root and is the source of truth for the worker's name, compatibility date, and (where applicable) `[assets]` / `[[services]]` configuration. Account-level identifiers (account id, custom domain, secrets) **never** go in wrangler.toml — they live in environment variables or the Cloudflare dashboard. See [06-secrets-policy.md](06-secrets-policy.md).

## CI

`.github/workflows/ci.yml` runs on **every PR** and **every push to `main`**.

Steps (in order):

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm format:check`
4. `pnpm typecheck`
5. `pnpm test`
6. `pnpm build`

CI must pass before deploy is allowed to run.

## Deploy

`.github/workflows/deploy.yml` runs only on `main` and only **after CI has succeeded** (via `workflow_run`). Can also be triggered manually with `workflow_dispatch`.

Jobs:

1. **build** — installs deps and runs `pnpm build`, uploading each app's `out/` directory as a workflow artifact.
2. **deploy-marketing** — downloads `marketing-out`, runs `wrangler deploy` from `apps/marketing/`.
3. **deploy-live** — downloads `live-out`, runs `wrangler deploy` from `apps/live/`.
4. **deploy-router** — depends on the two above (since the router has service bindings to them). Runs `wrangler deploy` from `apps/router/`.

`deploy-marketing` and `deploy-live` run in parallel; `deploy-router` waits for both.

The deploy uses [`cloudflare/wrangler-action@v3`](https://github.com/cloudflare/wrangler-action) — Cloudflare's official GitHub Action that wraps `wrangler deploy`.

## Required GitHub Action secrets

Set in the repo under **Settings → Secrets and variables → Actions**:

| Secret          | What it is                                                                       |
| --------------- | -------------------------------------------------------------------------------- |
| `CF_API_TOKEN`  | A Cloudflare API token with permissions to deploy Workers and read account info. |
| `CF_ACCOUNT_ID` | The Cloudflare account ID the workers belong to.                                 |

### Creating the API token

Cloudflare dashboard → **My Profile → API Tokens → Create Token → Custom Token**.

Permissions:

- **Account → Workers Scripts → Edit** — deploy & update workers.
- **Account → Account Settings → Read** — needed by wrangler.
- **Account → Workers KV Storage → Edit** — only if any worker uses KV (not today).
- **User → User Details → Read** — wrangler whoami.

Scope to **the specific account** that owns the workers. Do **not** issue an "all-account" token.

### Getting the account ID

Cloudflare dashboard → any zone → right sidebar → **Account ID** (copy).

## First deploy

On the first run, none of the workers exist yet. The job ordering handles this: `deploy-marketing` and `deploy-live` run first and create those workers, then `deploy-router` runs — by which point its service-binding targets already exist, so wrangler accepts the bindings.

Subsequent deploys are idempotent updates.

## Custom domain

Production lives at **`https://livediagram.app`**. The apex routes to the router worker (configured in the Cloudflare dashboard, not in `wrangler.toml`). From there:

- `https://livediagram.app/` and `https://livediagram.app/<anything>` (other than `/live*`) → marketing
- `https://livediagram.app/live` and `https://livediagram.app/live/<anything>` → live editor (the router strips the `/live` prefix before forwarding; see [08-router-app.md](08-router-app.md))

The Workers themselves remain reachable at their default `*.workers.dev` URLs for direct testing.

## What this spec does **not** yet cover

- Preview deploys for PRs.
- Staging environment.
- Rollback procedure (currently: `wrangler rollback` via the dashboard or `wrangler` CLI).
- Per-worker secrets (`wrangler secret put`).
- Custom domains / routes.
