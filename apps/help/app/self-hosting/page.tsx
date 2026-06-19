import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ArticleCard } from '@/components/ArticleCard';
import { getArticlesByCategory } from '@/lib/articles';
import { helpMetadata } from '@/lib/seo';

export const metadata: Metadata = helpMetadata({
  title: 'Self-Hosting',
  description: 'livediagram is open source and MIT-licensed. Run your own instance on Cloudflare.',
  path: '/help/self-hosting/',
});

export default function SelfHostingPage() {
  const articles = getArticlesByCategory('self-hosting');
  return (
    <div>
      <Breadcrumb items={[{ label: 'Self-Hosting' }]} />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900 md:text-4xl">Self-Hosting</h1>
        <p className="mb-8 text-base leading-relaxed text-slate-500 md:text-lg">
          The whole product is open source. Here is how to run your own.
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
