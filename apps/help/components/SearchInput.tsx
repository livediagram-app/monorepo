'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { searchArticles, type Article } from '@/lib/articles';

export function SearchInput({ large = false }: { large?: boolean }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length > 1) {
      setResults(searchArticles(query));
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full text-left">
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
          width={large ? 22 : 18}
          height={large ? 22 : 18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Search help articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 1 && setIsOpen(true)}
          aria-label="Search help articles"
          className={`w-full rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/50 ${
            large ? 'py-4 pl-12 pr-4 text-lg' : 'py-2.5 pl-10 pr-4 text-sm'
          }`}
        />
      </div>
      {isOpen && results.length > 0 && (
        <div className="scrollbar-thin absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
          {results.map((article) => (
            <Link
              key={`${article.categorySlug}/${article.slug}`}
              href={`/help/${article.categorySlug}/${article.slug}`}
              onClick={() => {
                setIsOpen(false);
                setQuery('');
              }}
              className="block border-b border-slate-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-brand-50/60"
            >
              <p className="text-sm font-medium text-slate-900">{article.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {article.category} &middot; {article.description}
              </p>
            </Link>
          ))}
        </div>
      )}
      {isOpen && query.trim().length > 1 && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
          <p className="text-center text-sm text-slate-500">
            No articles found for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
