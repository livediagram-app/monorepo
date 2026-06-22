import type { MetadataRoute } from 'next';

// Help centre robots (spec/55): fully crawlable, with a pointer to the
// sitemap. Static so it ships with the `output: 'export'` build.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://livediagram.app/help/sitemap.xml',
    host: 'https://livediagram.app',
  };
}
