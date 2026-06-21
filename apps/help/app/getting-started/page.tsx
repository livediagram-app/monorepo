import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ArticleCard } from '@/components/ArticleCard';
import { getArticlesByCategory } from '@/lib/articles';
import { helpMetadata } from '@/lib/seo';

export const metadata: Metadata = helpMetadata({
  title: 'Getting Started',
  description:
    'New to livediagram? Create your first diagram, learn the canvas, and share it with your team.',
  path: '/help/getting-started/',
});

export default function GettingStartedPage() {
  const articles = getArticlesByCategory('getting-started');
  return (
    <div>
      <Breadcrumb items={[{ label: 'Getting Started' }]} />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900 md:text-4xl">Getting Started</h1>
        <p className="mb-8 text-base leading-relaxed text-slate-500 md:text-lg">
          New here? These guides get you up and running quickly.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <ArticleCard key={article.slug} article={article} number={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
