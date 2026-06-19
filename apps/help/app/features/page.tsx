import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { articles, getArticlesByCategory } from '@/lib/articles';
import { FEATURE_ENTITY_HEX, FEATURE_FALLBACK_HEX } from '@/lib/featureColours';
import { FEATURE_ICONS } from '@/lib/featureIcons';
import { helpMetadata } from '@/lib/seo';

export const metadata: Metadata = helpMetadata({
  title: 'Features',
  description:
    'Detailed guides covering everything in the livediagram editor: the canvas, shapes and arrows, themes, tabs, teams, sharing, AI, and more.',
  path: '/help/features/',
});

export default function FeaturesPage() {
  const featureArticles = getArticlesByCategory('features');

  return (
    <div>
      <Breadcrumb items={[{ label: 'Features' }]} />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900 md:text-4xl">Features</h1>
        <p className="mb-8 text-base leading-relaxed text-slate-500 md:text-lg">
          Detailed guides covering everything in the editor.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureArticles.map((article) => {
            const subCount = articles.filter((a) => a.parentSlug === article.slug).length;
            const colour = FEATURE_ENTITY_HEX[article.slug] ?? FEATURE_FALLBACK_HEX;
            return (
              <Link
                key={article.slug}
                href={`/help/${article.categorySlug}/${article.slug}`}
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
      </div>
    </div>
  );
}
