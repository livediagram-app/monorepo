import Link from 'next/link';
import type { Article } from '@/lib/articles';

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/help/${article.categorySlug}/${article.slug}`}
      className="card-glow group block rounded-xl bg-white p-5 transition-colors duration-300 hover:bg-brand-50/30 sm:p-6"
    >
      <h3 className="font-semibold text-slate-900 transition-colors group-hover:text-brand-700">
        {article.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{article.description}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm text-brand-600 transition-all group-hover:gap-2">
        Read article
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}
