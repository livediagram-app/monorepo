// Marketing breadcrumb bar. Mirrors the help centre's breadcrumb
// (apps/help/components/Breadcrumb.tsx): a subtle full-width bar with a
// home-icon root, chevron separators, and truncating labels, so the two
// surfaces read consistently. Structured data is emitted separately via
// BreadcrumbJsonLd, so this component is presentation only. The root links to
// the marketing home; pass the trail after it.

type BreadcrumbItem = {
  label: string;
  href?: string;
};

const HomeIcon = (
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"
    />
  </svg>
);

const ChevronIcon = (
  <svg
    className="h-3.5 w-3.5 shrink-0 text-slate-300"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="border-b border-slate-200 bg-slate-50/85 backdrop-blur">
      <nav
        aria-label="Breadcrumb"
        className="mx-auto flex min-w-0 max-w-6xl flex-wrap items-center gap-2 px-6 py-2.5 text-sm text-slate-500"
      >
        <a
          href="/"
          className="flex shrink-0 items-center gap-1.5 transition-colors hover:text-slate-900"
        >
          {HomeIcon}
          Home
        </a>
        {items.map((item, i) => (
          <span key={i} className="flex min-w-0 items-center gap-2">
            {ChevronIcon}
            {item.href ? (
              <a href={item.href} className="truncate transition-colors hover:text-slate-900">
                {item.label}
              </a>
            ) : (
              <span className="truncate text-slate-700">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
}
