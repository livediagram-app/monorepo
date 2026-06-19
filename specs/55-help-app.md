# Help app

A standalone help centre at `/help`, modelled on the Manager Toolkit help centre but with livediagram's information architecture, content, and brand.

## Why

The editor is friction-free and discoverable, but there's no place that explains features in depth, answers "how do I…", or covers account/privacy/self-hosting questions. A searchable help centre fills that gap and doubles as SEO surface (every article is an indexable static page).

## Shape

A new Next.js app, `apps/help`, deployed as the `livediagram-help` Worker and stitched in by the router under `/help` — the same pattern as `apps/telemetry` (see [spec/08](08-router-app.md), [spec/22](22-telemetry.md)):

- `output: 'export'`, `basePath: '/help'`, `assetPrefix: '/help'`. Static only, no SSR (see [hard constraints](../CLAUDE.md)).
- The router strips `/help` and forwards to the worker, which serves `./out`.
- Content is **MDX** (`@next/mdx`) plus a TypeScript article index (`lib/articles.ts`). Navigation/index pages are TSX.

It behaves **exactly like the Manager Toolkit help centre**: hero + client-side search, a category grid, a "Feature Guides" grid, article pages with an auto-generated table of contents, breadcrumbs, "Was this helpful?" feedback, reading time, related-guide sidebar, and a back-to-top button. The difference is the categories/content (livediagram's) and the **brand**: livediagram is light + sky-blue (`brand-500`, see [spec/01](01-color-scheme.md)), not MT's dark purple, so every surface uses the shared `@livediagram/tailwind-config` brand ramp and slate neutrals to match `apps/marketing` and `apps/telemetry`.

### No paid tier

livediagram is free and MIT-licensed with no plan for a paid tier (see [spec/03](03-open-source-and-business-model.md)). So the help centre has **no "Accounts and Billing" category and no "Pro" callouts**. Instead it carries a **Self-hosting** category, reflecting that anyone can run their own instance.

## Information architecture

`lib/articles.ts` is the single source of truth for categories and articles. Two flat arrays (`categories`, `articles`) plus helpers (`getArticlesByCategory`, `getSubArticles`, `searchArticles`). An article's `categorySlug` is its full nested path (e.g. `features/canvas`); `parentSlug` links a sub-article to its feature landing page.

Categories:

| slug                   | title                | icon      |
| ---------------------- | -------------------- | --------- |
| `about`                | About livediagram    | info      |
| `getting-started`      | Getting Started      | rocket    |
| `features`             | Features             | grid      |
| `tips-and-tricks`      | Tips and Tricks      | lightbulb |
| `account-and-data`     | Account and Data     | user      |
| `privacy-and-security` | Privacy and Security | shield    |
| `self-hosting`         | Self-Hosting         | server    |
| `troubleshooting`      | Troubleshooting      | wrench    |
| `contact`              | Contact              | mail      |

`features` is special: it has a landing page per feature (each its own help page, listed on the home + features index), and each feature can have sub-articles. Feature landing pages and articles are grounded in the existing feature specs (canvas/09, themes/29+42+44, tabs/13+17+30, comments, links/40, images/19, explorer/15, teams/32+35, sharing/24+33+34, presentation/31, zen/26, AI/25, markdown import/27, history/12, session tools/39, data elements/46+51+52+53, presets/48, layout cleanup/47, isometric/45, annotations/38, markers/49, technology icons/41, drawing, selection/groups, text+fonts/28).

## In-editor entry point

The editor's `TabBar` gains a **Help** link on its right edge, beside the existing GitHub link — a plain `<a href="/help/" target="_blank">` (same convention as the GitHub link, no editor-page wiring). It fires `track('UI', 'Opened', 'Help')` (see [spec/22](22-telemetry.md); reuses existing `UI`/`Opened` enum pair). A "Help" link also lives in the help app's own header/footer.

## Analytics

The help app is a static site outside the editor, so it does not use the editor's first-party telemetry pipeline. It emits nothing by default (no third-party scripts), keeping it self-host-clean. The in-editor Help link is the only telemetry touchpoint, via the existing pipeline.

## Deployment

A `deploy-help` job in `.github/workflows/deploy.yml` mirrors `deploy-telemetry` (build artifact → `wrangler deploy`). The router's `deploy-router` job already depends on the static apps; it gains a dependency on `deploy-help`, and `apps/router/wrangler.toml` gains a `HELP` service binding to `livediagram-help`.

## Out of scope (for now)

- Contextual deep-links from specific editor dialogs to specific articles (MT's modal `?` buttons). The single editor Help link covers the entry point; per-dialog links can come later.
- Help results inside the editor's command palette / search.
