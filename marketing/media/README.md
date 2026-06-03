# Media assets

Binary and visual promotional assets: logos, screenshots, social cards,
demo recordings.

Nothing lives here yet. Suggested layout as assets arrive:

```
media/
  logo/          wordmark + mark, SVG preferred, light + dark variants
  screenshots/   editor, multiplayer cursors, templates, activity log
  social/        Open Graph (1200x630) and other share-card sizes
  demo/          short screen recordings / GIFs
```

## Guidance

- **Brand color** is sky blue `#0EA5E9` ("livediagram blue"). Page background
  `#F8FAFC`, canvas white. Full palette in [spec/01](../../specs/01-color-scheme.md).
- **Show, don't tell.** Screenshots should feature a real diagram with visible
  multiplayer cursors, since "no sign-in, real-time" is the pitch.
- **Keep large binaries out of git where practical.** Prefer SVG for logos and
  optimized PNG/WebP for screenshots. If files get heavy, consider storing them
  outside the repo and linking instead.
- Caption every asset with what it shows so copywriters can match it to a claim
  in [`../copy/facts.md`](../copy/facts.md).
