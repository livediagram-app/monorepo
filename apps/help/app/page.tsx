import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchInput } from '@/components/SearchInput';
import { CategoryCard } from '@/components/CategoryCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { articles, categories, getArticlesByCategory } from '@/lib/articles';
import { helpMetadata } from '@/lib/seo';
import { FEATURE_ENTITY_HEX, FEATURE_FALLBACK_HEX } from '@/lib/featureColours';
import { FEATURE_ICONS } from '@/lib/featureIcons';

export const metadata: Metadata = helpMetadata({
  title: 'livediagram Help Centre',
  description:
    'Guides, tutorials, and answers for livediagram. Browse feature documentation, getting-started guides, and troubleshooting.',
  path: '/help/',
});

export default function HelpHome() {
  const featureArticles = getArticlesByCategory('features');

  return (
    <div>
      <Breadcrumb items={[]} />
      <section className="relative py-16 text-center md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-100/60 via-brand-50/30 to-transparent" />
        <div className="relative mx-auto max-w-2xl px-4">
          <h1 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">
            How can{' '}
            <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
              we help
            </span>
            ?
          </h1>
          <p className="mb-8 text-base leading-relaxed text-slate-600 md:text-lg">
            Search our guides and tutorials, or browse by category below.
          </p>
          <SearchInput large />
          <a
            href="/help/contact/"
            className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-800"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <rect
                width="20"
                height="16"
                x="2"
                y="4"
                rx="2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Can&apos;t find what you need? Contact us
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-8">
        <div className="mb-10 border-t border-slate-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories
            .filter((c) => c.slug !== 'contact')
            .map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <div className="mb-10 border-t border-slate-200" />
        <h2 className="mb-2 text-2xl font-bold text-slate-900 md:text-3xl">Feature Guides</h2>
        <p className="mb-8 text-base leading-relaxed text-slate-500 md:text-lg">
          In-depth guides for everything in the editor.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureArticles.map((article) => {
            const subCount = articles.filter((a) => a.parentSlug === article.slug).length;
            const colour = FEATURE_ENTITY_HEX[article.slug] ?? FEATURE_FALLBACK_HEX;
            return (
              <Link
                key={article.slug}
                href={`/${article.categorySlug}/${article.slug}/`}
                className="card-glow group block rounded-xl bg-white p-5 transition-colors duration-300 hover:bg-brand-50/30 sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${colour}1f`, color: colour }}
                  >
                    {FEATURE_ICONS[article.slug] ?? FEATURE_ICONS.canvas}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-slate-900">{article.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500">{article.description}</p>
                  </div>
                </div>
                {subCount > 0 && (
                  <div className="mt-4 flex justify-end">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      {subCount} guide{subCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
