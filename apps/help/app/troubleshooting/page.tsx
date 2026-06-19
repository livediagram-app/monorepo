import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ArticleCard } from '@/components/ArticleCard';
import { getArticlesByCategory } from '@/lib/articles';
import { helpMetadata } from '@/lib/seo';

export const metadata: Metadata = helpMetadata({
  title: 'Troubleshooting',
  description:
    'Solutions to common problems with the livediagram editor and real-time collaboration.',
  path: '/help/troubleshooting/',
});

export default function TroubleshootingPage() {
  const articles = getArticlesByCategory('troubleshooting');
  return (
    <div>
      <Breadcrumb items={[{ label: 'Troubleshooting' }]} />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900 md:text-4xl">Troubleshooting</h1>
        <p className="mb-8 text-base leading-relaxed text-slate-500 md:text-lg">
          Something not working? Start here.
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
