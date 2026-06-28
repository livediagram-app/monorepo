// The wordmark subtitle ("Explorer" / "Help" next to the logo) turned into a
// quick-navigation dropdown shared by the Explorer (apps/live) and Help
// (apps/help) headers. It reads as a plain label until hovered, when a chevron
// fades in and a menu drops down to jump between the product's main surfaces.
// Helps a visitor build a mental model of where things live.
//
// Pure CSS open (group-hover + focus-within) — no client JS needed. Links are
// plain <a> with absolute hrefs because the destinations live in different apps
// stitched under one host by the router, so client-side nav wouldn't cross them.

type ProductNavKey = 'home' | 'explorer' | 'editor' | 'help' | 'telemetry';

const ITEMS: { key: ProductNavKey; label: string; href: string; desc: string }[] = [
  { key: 'home', label: 'Home', href: '/', desc: 'The livediagram landing page' },
  { key: 'explorer', label: 'Explorer', href: '/explorer/recent', desc: 'Your diagrams & folders' },
  { key: 'editor', label: 'Editor', href: '/new', desc: 'Start a new diagram' },
  { key: 'help', label: 'Help', href: '/help/', desc: 'Guides, tutorials & answers' },
  {
    key: 'telemetry',
    label: 'Telemetry',
    href: '/telemetry',
    desc: 'Anonymous usage, in the open',
  },
];

// `showOnMobile` opts a surface into rendering the menu on phones (next to the
// logo), where it otherwise hides to save room. The Explorer, Help, and
// Telemetry headers pass it; the space-tight editor toolbar leaves it off so
// the menu stays desktop-only there.
export function ProductNav({
  current,
  showOnMobile = false,
}: {
  current: ProductNavKey;
  showOnMobile?: boolean;
}) {
  const active = ITEMS.find((i) => i.key === current) ?? ITEMS[0]!;
  return (
    <div className={`group relative ${showOnMobile ? 'block' : 'hidden sm:block'}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-label={`${active.label} — switch section`}
        className="flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-medium text-slate-500 outline-none transition hover:bg-slate-100 hover:text-slate-700 focus-visible:bg-slate-100 focus-visible:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:focus-visible:bg-slate-800"
      >
        {active.label}
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="h-3 w-3 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-70 group-hover:[transform:rotate(180deg)] group-focus-within:opacity-70 group-focus-within:[transform:rotate(180deg)]"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {/* pt-2 is a transparent bridge so the pointer can travel from the label
          to the card without crossing a gap that would close the menu. */}
      <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div
          role="menu"
          className="w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/30"
        >
          {ITEMS.map((item) => {
            const isCurrent = item.key === current;
            return (
              <a
                key={item.key}
                href={item.href}
                role="menuitem"
                aria-current={isCurrent ? 'page' : undefined}
                className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 transition ${
                  isCurrent
                    ? 'bg-brand-50 dark:bg-brand-500/15'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? 'text-brand-700 dark:text-brand-300'
                      : 'text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {item.label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export type { ProductNavKey };
