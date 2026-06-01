// Renders a schema.org BreadcrumbList <script type="application/ld+json">
// for a subpage. Two-level by convention (Home > Page) because the
// marketing site is intentionally flat: there's no /resources/article/x
// shape that would need a longer trail. Kept in one place so the three
// callers (FAQ, Terms, Privacy) can't drift apart in subtle ways like
// trailing slashes or @id formats, which Google's structured-data
// validator is strict about.

const SITE_URL = 'https://livediagram.app';

type BreadcrumbJsonLdProps = {
  // The current page's display name + path. The leading "Home" item
  // is added automatically. `path` is the canonical path with a
  // leading slash, no trailing slash, matching the per-page
  // alternates.canonical declarations.
  name: string;
  path: string;
};

export function BreadcrumbJsonLd({ name, path }: BreadcrumbJsonLdProps) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name,
        item: `${SITE_URL}${path}`,
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      // < escape mirrors layout.tsx + faq/page.tsx: keeps the JSON
      // safe to inline even if a future entry's name accidentally
      // contains a "<".
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json).replace(/</g, '\\u003c') }}
    />
  );
}
