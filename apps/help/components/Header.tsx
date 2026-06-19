import { Brand } from '@livediagram/ui';

// Help-centre header. Brand links back to the marketing home; the editor
// is always one click away (the canvas works without signing in, spec/04).
// Same origin as the rest of livediagram — the router stitches the apps by
// path — so these are plain absolute links.
export function Header() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-slate-200/70 bg-slate-50/85 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2.5">
          <Brand href="/" size="md" />
          <span className="hidden text-sm font-medium text-slate-400 sm:inline">Help</span>
        </div>
        <nav className="flex items-center gap-1.5">
          <a
            href="/help/"
            className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
          >
            Help
          </a>
          <a
            href="/explorer/recent"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200/60 hover:text-slate-900 sm:inline-flex"
          >
            Explorer
          </a>
          <a
            href="/new"
            className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            Open editor
          </a>
        </nav>
      </div>
    </header>
  );
}
