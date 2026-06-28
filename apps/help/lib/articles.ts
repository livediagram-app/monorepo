import { categories } from './articles-categories';
import { ARTICLES_PART_1 } from './articles-data-1';
import { ARTICLES_PART_2 } from './articles-data-2';
import { ARTICLES_PART_3 } from './articles-data-3';
import { ARTICLES_PART_4 } from './articles-data-4';

export interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  /** Full nested path under /help, e.g. "canvas" or "canvas/the-canvas". */
  categorySlug: string;
  /** Feature-landing slug this article hangs off, if it's a sub-article. */
  parentSlug?: string;
  /** Optional sub-category heading used to group a feature category's landing
   *  cards on its index page (e.g. Palette → "Selection Modes" / "Elements" /
   *  "Palette Settings"). Landings without a group render in a single grid. */
  group?: string;
}

/**
 * Canonical in-app path to an article page. Trailing slash to match the help
 * app's `trailingSlash: true` (so internal links resolve directly instead of
 * 308-redirecting). `next/link` prepends the `/help` basePath at render; the
 * sitemap, which needs absolute URLs, prepends the origin + `/help` itself.
 * One source for the `/<categorySlug>/<slug>/` shape every card / list / sitemap
 * entry was spelling out by hand.
 */
export function articleHref(article: Pick<Article, 'categorySlug' | 'slug'>): string {
  return `/${article.categorySlug}/${article.slug}/`;
}

/**
 * Canonical in-app path to a category landing page (`/<slug>/`, trailing slash
 * to match `trailingSlash: true`). `slug` is a category slug — top-level
 * (`canvas`) or a nested feature path (`canvas/the-canvas`), both of
 * which have a landing page. Sibling of {@link articleHref}; one source for the
 * category-link shape the cards / breadcrumbs / sitemap built by hand.
 */
export function categoryHref(slug: string): string {
  return `/${slug}/`;
}

export interface Category {
  slug: string;
  title: string;
  description: string;
  articleCount: number;
  /** Feature-guide categories: grouped under "Feature Guides" on the home page,
   *  apart from the support categories (About, Getting Started, ...). */
  kind?: 'feature';
}

export { categories };

// The two ways the category list partitions by `kind`, derived once here so the
// home + features pages don't each re-spell the predicate. Feature-guide
// categories (the card grids), and the support categories (About, Getting
// Started, ...) minus Contact, which the home renders as its own CTA.
export const featureCategories: Category[] = categories.filter((c) => c.kind === 'feature');
export const supportCategories: Category[] = categories.filter(
  (c) => c.kind !== 'feature' && c.slug !== 'contact',
);

// Full help-article registry (spec/55). Authored across articles-data-1..4
// to keep each module within the file-size budget; the order here is the
// canonical browse/search order. categories live in articles-categories.
export const articles: Article[] = [
  ...ARTICLES_PART_1,
  ...ARTICLES_PART_2,
  ...ARTICLES_PART_3,
  ...ARTICLES_PART_4,
];

export function getArticlesByCategory(categorySlug: string): Article[] {
  return articles.filter((a) => a.categorySlug === categorySlug);
}

/**
 * A feature category's landing cards, split into sub-category groups in the
 * order each group first appears in {@link articles}. Used by the category
 * index to render grouped sections (e.g. Palette's Selection Modes / Elements
 * / Palette Settings). A category whose landings have no `group` collapses to
 * a single section with an empty `group` label, so callers can render a plain
 * grid unchanged.
 */
export function getCategoryGroups(categorySlug: string): { group: string; articles: Article[] }[] {
  const items = getArticlesByCategory(categorySlug);
  const groups: { group: string; articles: Article[] }[] = [];
  for (const article of items) {
    const label = article.group ?? '';
    const existing = groups.find((g) => g.group === label);
    if (existing) existing.articles.push(article);
    else groups.push({ group: label, articles: [article] });
  }
  return groups;
}

export function getSubArticles(parentSlug: string): Article[] {
  return articles.filter((a) => a.parentSlug === parentSlug);
}

export function searchArticles(query: string): Article[] {
  const lower = query.toLowerCase();
  return articles.filter(
    (a) => a.title.toLowerCase().includes(lower) || a.description.toLowerCase().includes(lower),
  );
}
