import type { MetadataRoute } from 'next';
import { articles, categories } from '@/lib/articles';

const BASE = 'https://livediagram.app/help';

// Static sitemap for the help centre. Mirrors the article index in
// lib/articles.ts so new content is picked up automatically.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/features/`, changeFrequency: 'weekly', priority: 0.8 },
  ];

  for (const cat of categories) {
    entries.push({
      url: `${BASE}/${cat.slug}/`,
      changeFrequency: cat.slug === 'contact' ? 'monthly' : 'weekly',
      priority: cat.slug === 'contact' ? 0.5 : 0.8,
    });
  }

  for (const article of articles) {
    entries.push({
      url: `${BASE}/${article.categorySlug}/${article.slug}/`,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return entries;
}
