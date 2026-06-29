import type { MetadataRoute } from 'next';
import { HELP_URL, SITE_URL } from '@/lib/site';

// Help centre robots (spec/55): fully crawlable, with a pointer to the
// sitemap. Static so it ships with the `output: 'export'` build.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${HELP_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
