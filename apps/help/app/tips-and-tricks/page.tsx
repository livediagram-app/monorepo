import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ArticleCard } from '@/components/ArticleCard';
import { getArticlesByCategory } from '@/lib/articles';
import { helpMetadata } from '@/lib/seo';

export const metadata: Metadata = helpMetadata({
  title: 'Tips and Tricks',
  description: 'Shortcuts and lesser-known features that make editing in livediagram faster.',
  path: '/help/tips-and-tricks/',
});

export default function TipsAndTricksPage() {
  const articles = getArticlesByCategory('tips-and-tricks');
  return (
    <div>
      <Breadcrumb items={[{ label: 'Tips and Tricks' }]} />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900 md:text-4xl">Tips and Tricks</h1>
        <p className="mb-8 text-base leading-relaxed text-slate-500 md:text-lg">
          Work faster with these shortcuts and hidden features.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}
