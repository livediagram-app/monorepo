import type { ReactNode } from 'react';

import { BreadcrumbJsonLd } from './BreadcrumbJsonLd';
import { Footer } from './Footer';
import { Header } from './Header';

// Shared shell for the static legal pages (Terms, Privacy). Prose styling
// lives in globals.css under `.legal-prose` so both pages stay consistent.
// `path` matches the alternates.canonical declaration in each page's
// metadata block; we accept it as a prop rather than deriving from
// usePathname() so the component remains a server component.
export function LegalPage({
  title,
  path,
  lastUpdated,
  children,
}: {
  title: string;
  path: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      <BreadcrumbJsonLd name={title} path={path} />
      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">Last updated {lastUpdated}</p>
        <div className="legal-prose mt-10">{children}</div>
      </main>
      <Footer />
    </>
  );
}
