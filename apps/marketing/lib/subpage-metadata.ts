import type { Metadata } from 'next';

// Shared metadata factory for marketing subpages (FAQ, Terms,
// Privacy). All three pages had grown identical 17-line Metadata
// blocks repeating openGraph + twitter + alternates with the same
// locale, type, siteName, and card style. Pulling the boilerplate
// here means a future change (a new locale, a different OG `type`,
// adding a per-page image override) lands once and rides to every
// subpage.
//
// The landing page (`/`) keeps its own bespoke Metadata in
// app/layout.tsx because its shape differs (type: 'website', extra
// JSON-LD wrappers, root canonical), so this factory deliberately
// covers subpages only.

const SITE_NAME = 'livediagram';
const SUBPAGE_LOCALE = 'en_GB';

export type SubpageMetadataInput = {
  title: string;
  description: string;
  // Path relative to the metadataBase (set in app/layout.tsx). The
  // canonical + openGraph url both resolve through that base so a
  // value of `/faq` becomes `https://livediagram.app/faq` in the
  // emitted head.
  path: `/${string}`;
};

export function subpageMetadata({ title, description, path }: SubpageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      url: path,
      siteName: SITE_NAME,
      title,
      description,
      locale: SUBPAGE_LOCALE,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
