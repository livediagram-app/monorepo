import type { MetadataRoute } from 'next';

// Required for `output: 'export'`: route handlers must declare
// themselves fully static so Next can resolve them at build time
// rather than expecting a runtime. Without this the marketing
// build fails with "export const dynamic = 'force-static' not
// configured" during page-data collection.
export const dynamic = 'force-static';

// Next.js convention: app/robots.ts → /robots.txt at build time.
// See spec/16-marketing-site.md "SEO and metadata".
//
// Allow all crawlers everything. The editor and API don't sit
// behind robots policy (they're on the same origin but aren't
// content surfaces, and crawlers can't usefully index them
// anyway). When a private path lands (e.g. an admin route) add
// it to `disallow`.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://livediagram.app/sitemap.xml',
  };
}
