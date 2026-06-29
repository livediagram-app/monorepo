// The help centre's canonical origin and its `/help` base. The app is
// served under /help by the router, so HELP_URL is the prefix every
// absolute help URL builds on. Defined once here instead of hardcoding
// 'https://livediagram.app' across the layout metadata, robots, sitemap,
// breadcrumb JSON-LD, and the seo / structured-data builders (mirrors
// apps/marketing/lib/site.ts).
export const SITE_URL = 'https://livediagram.app';
export const HELP_URL = `${SITE_URL}/help`;
