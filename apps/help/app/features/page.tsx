import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { FeatureArticleCard } from '@/components/FeatureArticleCard';
import { getArticlesByCategory } from '@/lib/articles';
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
          {featureArticles.map((article) => (
            <FeatureArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}
