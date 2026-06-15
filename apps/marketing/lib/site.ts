// The marketing site's canonical origin. Used for metadataBase, JSON-LD
// ids/urls, the sitemap + robots references, and share links. Defined once
// here so the domain lives in a single place instead of being hardcoded
// across layout, route handlers, and components (see spec/21 "Metadata").
export const SITE_URL = 'https://livediagram.app';

// The product / site name, used as the metadata siteName and JSON-LD name.
// Defined alongside SITE_URL so the brand string lives in one place.
export const SITE_NAME = 'livediagram';
