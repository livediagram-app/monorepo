# livediagram

A collaborative diagram editor that works without signing in. Open a link, draw, share. Real-time presence, cursors, comments, per-tab activity log with surgical revert. The canvas never sits behind an auth wall — friction-free engagement is the acquisition strategy, not a growth experiment.

**Live at [livediagram.app](https://livediagram.app).**

- **Marketing site** at `/` — the pitch + the feature tour.
- **Editor** at `/live` — the canvas. Guests get a per-browser identity and full persistence; signed-in users get the same plus cross-device sync.
- **API** at `/api/*` — Cloudflare Worker holding REST endpoints + a Durable Object realtime room per diagram, backed by D1.

The whole stack runs on Cloudflare Workers (Static Assets for the two Next.js apps). MIT-licensed and self-hostable end-to-end.

## What's actually built

Every product decision lives in [`specs/`](specs/) — read the index at [`specs/README.md`](specs/README.md). The short version:

- Shapes, text, sticky notes, arrows of every style (straight / curved / angled, configurable thickness + arrowhead size, optional labels), groups, marquee + shift-click multi-select, format painter, per-element lock, link-to-tab, comment threads, themed templates.
- Realtime presence + selection + cursor + laser-pointer broadcast via Durable Object rooms.
- Per-tab activity log + surgical revert (each entry holds full before/after snapshots).
- Folders in the Explorer; full-page `/live/explorer` for signed-in users.
- Hybrid Clerk auth — guests use everything; signed-in users get persistence across devices, account self-delete, and a future home for Pro features. The api worker silently degrades to pure-guest mode when `CLERK_JWKS_URL` is unset; the live frontend's ClerkProvider becomes a pass-through when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is unset. A self-hoster can ship without Clerk.
- Export the active tab as Markdown / PDF / PNG / JSON file; import the JSON envelope back as a new tab (with `schemaVersion` gating).
- "Shared with you" Explorer accordion; visitor can "Make a copy" of a shared diagram into their own files.
- 90-day `change_log` retention cron.

What's still ahead: payments (Stripe), transactional email (Resend), team workspaces, operational-transform / CRDT (today's realtime is last-writer-wins).

## Architecture

Four apps + five packages in a pnpm workspace, orchestrated with Turborepo.

```
apps/
  marketing/    static landing site (Next.js export, /)
  live/         the editor (Next.js export, /live)
  api/          REST + WebSocket worker (D1 + Durable Objects, /api)
  router/       service-binding router stitching the apps under one hostname
packages/
  ui/             shared UI primitives (Brand, etc.)
  diagram/        diagram data model (Tab, Element types + helpers)
  api-schema/     wire-format DTOs the api worker emits + the live editor consumes
  eslint-config/  shared ESLint flat config
  prettier-config/
  tailwind-config/
specs/          product specs — read these first
```

Worker names match the service-binding targets in `apps/router/wrangler.toml`: `livediagram-marketing`, `livediagram-live`, `livediagram-api`, `livediagram-router`.

## Hard constraints

The shape of this repo isn't accidental — three rules keep the stack honest:

- **Static-only frontends.** Next.js apps use `output: 'export'`. No SSR, no Node runtime, no Next.js API routes. Server logic goes in the api worker.
- **Reuse over duplication** (CLAUDE.md). Shared types, UI primitives, configs, and the diagram data model live in `packages/`, never copy-pasted across apps.
- **No secrets in source.** The repo is public; secrets travel via env vars / `wrangler secret put` / GitHub Actions secrets. See [`specs/06-secrets-policy.md`](specs/06-secrets-policy.md).

## Self-hosting

Requirements:

- Node `>= 22` (wrangler 4 requirement)
- pnpm `>= 9`
- A Cloudflare account (for production) — or run locally without one

Clone + install:

```sh
git clone https://github.com/livediagram-app/monorepo livediagram
cd livediagram
pnpm install
```

Run all four apps locally:

```sh
pnpm dev
```

Individual ports: marketing `:3001`, live `:3002`, api `:8787` (router doesn't have a dev server — it only matters in production).

The editor works in pure-guest mode with the api worker's `CLERK_JWKS_URL` unset and the live app's `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` unset. To enable Clerk auth (so users get cross-device sync), provision a Clerk instance and set:

```sh
# apps/live/.env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

# apps/api/.dev.vars (gitignored)
CLERK_JWKS_URL=https://<your-instance>.clerk.accounts.dev/.well-known/jwks.json
```

See [`specs/04-auth-and-guest-access.md`](specs/04-auth-and-guest-access.md) for the full hybrid auth model.

## Development workflow

| Command             | What it does                      |
| ------------------- | --------------------------------- |
| `pnpm install`      | Install all workspace deps        |
| `pnpm dev`          | `turbo run dev` across workspaces |
| `pnpm build`        | `turbo run build`                 |
| `pnpm lint`         | `turbo run lint`                  |
| `pnpm typecheck`    | `turbo run typecheck`             |
| `pnpm test`         | `turbo run test`                  |
| `pnpm format`       | Prettier write across the repo    |
| `pnpm format:check` | Prettier check (CI)               |

Scope to one workspace: `pnpm --filter @livediagram/<name> <script>`.

The live app's dev server (`pnpm --filter @livediagram/live dev`) uses `.next-dev/` instead of `.next/` so `next build` invoked anywhere in the same checkout can't race with it on `.next/static/development/_buildManifest.tmp.*`. Build keeps `.next/` so CI / the deploy workflow are unchanged.

## Deployment

GitHub Actions → Cloudflare Workers. CI runs lint / format / typecheck / test / build on every PR and push to main. The deploy workflow (manual trigger from the Actions tab) then builds, deploys marketing + live + api in parallel, and deploys router last — its service bindings need the other three to already exist.

Required GitHub repo secrets: `CF_API_TOKEN`, `CF_ACCOUNT_ID`. Clerk-related secrets are optional (the worker degrades to guest-only without them). Full deploy mechanics: [`specs/10-deployment.md`](specs/10-deployment.md).

## Specs are the source of truth

Every product decision, constraint, and rule lives in [`specs/`](specs/). PRs and discussions reference specs by filename; if code and spec disagree, that's a bug (usually the spec is right; if not, fix the spec first). When you're building something new, write or update the spec **before** the code.

Start with [`specs/00-purpose.md`](specs/00-purpose.md), then read in order — the numeric prefix is the suggested read order (purpose → constraints → architecture → apps).

## License

[MIT](LICENSE). Anyone can self-host. A hosted Pro tier runs alongside (see [`specs/03-open-source-and-business-model.md`](specs/03-open-source-and-business-model.md)) — the OSS core never depends on a SaaS endpoint at runtime, and Pro features are cleanly separable.
