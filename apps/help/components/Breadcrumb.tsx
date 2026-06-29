import Link from 'next/link';
import { HELP_URL } from '@/lib/site';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

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

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="sticky top-16 z-40 border-b border-slate-200 bg-slate-50/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 md:px-8">
        <nav className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 transition-colors hover:text-slate-900"
          >
            {HomeIcon}
            Help
          </Link>
          {items.map((item, i) => (
            <span key={i} className="flex min-w-0 items-center gap-2">
              <svg
                className="h-3.5 w-3.5 shrink-0 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              {item.href ? (
                <Link href={item.href} className="truncate transition-colors hover:text-slate-900">
                  {item.label}
                </Link>
              ) : (
                <span className="truncate text-slate-700">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Help',
                item: `${HELP_URL}/`,
              },
              ...items.map((item, i) => ({
                '@type': 'ListItem',
                position: i + 2,
                name: item.label,
                ...(item.href ? { item: `${HELP_URL}${item.href}` } : {}),
              })),
            ],
          }),
        }}
      />
    </div>
  );
}
