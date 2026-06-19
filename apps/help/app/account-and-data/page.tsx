import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ArticleCard } from '@/components/ArticleCard';
import { getArticlesByCategory } from '@/lib/articles';
import { helpMetadata } from '@/lib/seo';

export const metadata: Metadata = helpMetadata({
  title: 'Account and Data',
  description: 'Guest access, signing in, syncing, exporting, and deleting your data.',
  path: '/help/account-and-data/',
});

export default function AccountAndDataPage() {
  const articles = getArticlesByCategory('account-and-data');
  return (
    <div>
      <Breadcrumb items={[{ label: 'Account and Data' }]} />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900 md:text-4xl">Account and Data</h1>
        <p className="mb-8 text-base leading-relaxed text-slate-500 md:text-lg">
          How identity works, what an account adds, and how to manage your data.
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
