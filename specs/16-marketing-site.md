# 16 — Marketing site

The marketing app (`apps/marketing`) is the public landing site served at `/` (everything except `/live/*` and `/api/*` — see [08-router-app](08-router-app.md)). Static Next.js export, no SSR. It is the top of the acquisition funnel: its only job is to explain what livediagram is and send visitors to `/live/new`.

## Golden rule: claims map to shipped features

**Every feature claim on the marketing site must correspond to something a visitor can actually do today.** No aspirational copy, no roadmap dressed as present tense.

- If a feature is not built (export, teams/permissions, Pro specifics, true concurrent/CRDT editing — see [02-prototype-scope](02-prototype-scope.md)), it does **not** appear on the landing page, even softened.
- When the editor gains or loses a feature, update the landing page in the same change. Drift between the page and the product is a bug.
- Counts (templates, themes, shapes) must match the source of truth ([09-canvas-and-command-palette](09-canvas-and-command-palette.md), `apps/live/lib/templates.ts`, `apps/live/lib/themes.ts`). As of this spec: **12 templates** (8 default + 4 extra), **18 themes** (12 default + 6 extra).
- Be honest about trade-offs where it builds trust: realtime is **last-write-wins**, not CRDT — say so rather than implying conflict-free merging.

## Structure

Single landing page (`app/page.tsx`) with a sticky header, hero, themed feature sections, a closing CTA, and a footer. Feature sections group related capabilities (rather than two large catch-all grids) and alternate the `tinted` background for rhythm.

1. **Hero** (`components/Hero.tsx`) — headline, subhead, primary CTA → `/live/new` ("Start drawing") with a no-sign-up note, animated `HeroIllustration` mock of the editor.
2. **Simple by design** (`#why`): the positioning lead-in. Tagline "Simple by design, powerfully deep" plus the easy-yet-powerful duality (start in one click, looks simple/runs deep, multiplayer with no setup) and the two easiest-start features, templates and themes. The three duality cards use light icon badges; the templates/themes cards keep their canvas mocks.
3. **Collaboration** (`#collaboration`, tinted): the shared-canvas story. Live presence, selection glow, LWW realtime edits, comments, and the laser pointer.
4. **Draw** (`#features`): the raw materials of a diagram, shapes and arrows.
5. **Refine** (`#refine`, tinted): working the canvas: multi-select, format painter, tabs + cross-tab links, folders.
6. **Share & control** (`#sharing`): editor/view-only links, revoke, activity log + revert, collaborator name, durable save.
7. **Open and honest** (`#foundations`, tinted): MIT license, self-host, no telemetry. See [03-open-source-and-business-model](03-open-source-and-business-model.md).
8. **Closing CTA** (`#get-started`) — "no sign-up wall" message + `/live/new`.

The primary CTA reads **"Start drawing"** everywhere (header, hero, closing CTA) — keep it consistent. The `#features` anchor must stay on the first feature section (the hero's "See what's in it" button targets it).

Reusable building blocks: `Section` + `FeatureGrid` (`components/Section.tsx`), `Header`, `Footer`, `Brand` (from `@livediagram/ui`). Add new feature cards by editing the `items` arrays in `page.tsx` — do not fork the grid.

**Feature-card illustrations.** Every feature card carries a small animated mock of the real editor surface it describes (`components/FeatureArt.tsx`), passed via the card's `art` slot. Like the hero, the motion is **pure CSS** — shared keyframe classes (`fa-*`) live in `app/globals.css` — so it works under static export with no JS and settles to a finished frame under `prefers-reduced-motion`. The mocks must stay faithful to how the feature actually looks (brand-blue rounded shapes, dot-grid canvas, presence avatars, the explorer / share / activity panels); when a feature's UI changes, update its art. This is part of the golden rule above — an illustration is a claim too.

## Tone & brand

- Product name **livediagram** (lowercase). Brand colour sky-blue `#0EA5E9` (`brand-500`) — see [01-color-scheme](01-color-scheme.md).
- Fast, clean, structured. Plain and confident; not cutesy, not enterprise-jargon.
- Positioning: multiplayer-from-the-start diagramming for teams who think visually — between casual whiteboards and heavyweight suites (see [00-purpose](00-purpose.md)).

## Auth messaging

The canvas works without signing in, and that stays the headline ("no sign-up wall" — [04-auth-and-guest-access](04-auth-and-guest-access.md)). Do not advertise account-only benefits (cross-device sync, teams) until they are shipped and verified end-to-end.

## Not yet present

- No `/pricing` page yet (the router reserves the path). Add one only when free/Pro tiers are concrete — Pro benefits are TBD ([03](03-open-source-and-business-model.md)).
- Footer `Terms` / `Privacy` / `Contact` links are placeholders pointing at `#` anchors.
