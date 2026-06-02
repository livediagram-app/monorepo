# What is livediagram?

A multiplayer canvas in the browser. Teams build diagrams and mindmaps together in real time: shared cursors, live selections, per-tab activity log with surgical revert. The canvas always works without signing in, so the friction to start is "open the link, start drawing."

The hosted product is at **[livediagram.app](https://livediagram.app)**. The entire codebase is [MIT-licensed](../LICENSE) and self-hostable end-to-end.

## Who it's for

Teams that think visually together:

- Engineering teams sketching architecture, sequence flows, system designs.
- Product and design teams mapping user journeys, information architecture, brainstorms.
- Cross-functional groups in workshops, planning sessions, retrospectives.

The unit of value is the team, not the individual. See [spec/00](../specs/00-purpose.md) for the full positioning.

## What's built today

- **Canvas primitives**: shapes (ten core), sticky notes, text, images, arrows (straight / curved / angled, configurable thickness + arrowhead size, optional labels), comment threads, per-element links + locks.
- **Multi-select**: marquee drag, shift-click, format painter, groups.
- **Templates**: sixteen starters (Blank, Mind map, Flowchart, Kanban, SWOT, Retrospective, Org chart, Timeline, Fishbone, Pyramid, Flywheel, Venn, User journey, plus three UI wireframes).
- **Themes**: eighteen presets that recolour the canvas, every shape, every arrow in one click.
- **Multiplayer**: live presence, cursors, selection rings, comments, laser-pointer broadcast via per-diagram Durable Object rooms.
- **Audit log**: every change recorded per-tab; one-click revert on any entry, even after later edits.
- **Tabs**: every diagram is a stack of tabs (link across them; copy a tab into another diagram).
- **Folders**: nested folders in the Explorer; full-page `/live/explorer` for signed-in users.
- **Sharing**: editor or view-only share links per diagram; revoke at any time.
- **Hybrid auth**: guests get everything (full persistence keyed to a per-browser id); signed-in users (Clerk) get cross-device sync, account self-delete, and a future home for Pro features.
- **Export / import**: active tab to Markdown / PDF / PNG / JSON file; import the JSON envelope back as a new tab.
- **"Shared with you" Explorer accordion**: visitors can make their own copy of a shared diagram.
- **Telemetry**: anonymous first-party product events stored in D1; public dashboard at `/telemetry`. No third-party analytics; no identifiers crossing the wire. Off in OSS forks unless the worker is configured for it. See [spec/22](../specs/22-telemetry.md).

## What's still ahead

- **Payments** (Stripe) for the hosted Pro tier.
- **Transactional email** (Resend) for share notifications and account flows.
- **Team workspaces** (today a diagram belongs to one identity; teams are post-launch).
- **Operational transform / CRDT** (today's realtime is last-writer-wins; concurrent edits to the same field collapse to whoever wrote most recently).

## Open source + commercial

- The codebase is **[MIT-licensed](../LICENSE)** and publicly viewable. Anyone can self-host.
- The hosted version at [livediagram.app](https://livediagram.app) runs alongside, with a **free tier** and a future **Pro subscription**.
- The OSS core never calls home, never depends on a SaaS endpoint at runtime, and never gates features behind a license check.
- Pro features (when they land) will be cleanly separable: feature-flagged at build, or implemented as hosted-only infrastructure (e.g. shared billing, team storage). A self-host build runs cleanly without Pro code paths failing.

See [spec/03](../specs/03-open-source-and-business-model.md) for the full model, and [spec/04](../specs/04-auth-and-guest-access.md) for the hybrid auth contract.
