# Media assets

Binary and visual promotional assets: logos, screenshots, social cards,
demo recordings.

## Screenshots

Product screenshots of the live app at [livediagram.app](https://livediagram.app),
captioned with what each one shows so copywriters can match it to a claim in
[`../copy/facts.md`](../copy/facts.md).

| File                | Shows                                                                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `landing.png`       | The marketing landing page — "A picture tells a thousand words, tell your story" hero, the **Start drawing** CTA, and a mind-map editor preview below.                            |
| `explorer.png`      | The Explorer library (`/live/explorer`) — folders (Unsorted, Management, Product) with diagram counts, the Recent / Folders / Image Gallery / Shared sidebar, New diagram/folder. |
| `new.png`           | The **Quick Start** new-diagram modal (`/live/new`) — the template grid (Blank, Mind map, Org chart, Retrospective, Flowchart, Kanban, SWOT, Timeline) and the theme picker.      |
| `share.png`         | The **Share this diagram** dialog — editor vs view-only links, optional password gate, active links with copy, create-new-link.                                                   |
| `comments.png`      | A comment thread open on an element, the element toolbar, and the Comments panel listing comment-bearing elements.                                                                |
| `more.png`          | The element context menu — Duplicate, Edit link, Bring to front / Send to back, Add note, Comment.                                                                                |
| `settings.png`      | The Settings dialog with its grouped toggles — Canvas, Interface (Minimal panel layout), AI (AI Assistant), Privacy (anonymous usage events).                                     |
| `org-hierarchy.png` | An org-chart diagram (CEO → VPs → leads) in **dark mode**, with theme-coloured tabs.                                                                                              |
| `backlog.png`       | A Kanban sprint board (Backlog → Done) in dark mode, with the compact dock popover open.                                                                                          |
| `sprint-review.png` | A retrospective / Sprint Review board with per-person image-upload cards, and the Tab Activity log panel.                                                                         |

## Guidance

- **Brand color** is sky blue `#0EA5E9` ("livediagram blue"). Page background
  `#F8FAFC`, canvas white. Full palette in [spec/01](../../specs/01-color-scheme.md).
- **Show, don't tell.** Screenshots should feature a real diagram with visible
  multiplayer cursors, since "no sign-in, real-time" is the pitch.
- **Keep claims current.** When the UI changes, retake the affected screenshot —
  a stale shot that shows a removed control is worse than none.
- **Keep large binaries out of git where practical.** Prefer SVG for logos and
  optimized PNG/WebP for screenshots. If files get heavy, consider storing them
  outside the repo and linking instead.
- Caption every asset above with what it shows so copywriters can match it to a
  claim in [`../copy/facts.md`](../copy/facts.md).

Suggested layout if the asset set grows beyond flat screenshots:

```
media/
  logo/          wordmark + mark, SVG preferred, light + dark variants
  screenshots/   editor, multiplayer cursors, templates, activity log
  social/        Open Graph (1200x630) and other share-card sizes
  demo/          short screen recordings / GIFs
```
