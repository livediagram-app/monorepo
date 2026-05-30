import type { NextConfig } from 'next';

// `output: 'export'` is required for the production build (Cloudflare
// Static Assets fronts a fully static export — no Node runtime). In
// dev we omit it so the dynamic-segment route at `/diagram/[id]` can
// resolve arbitrary user-minted ids without needing them enumerated
// in `generateStaticParams`. The production build still ships a
// single placeholder file backed by the live worker's path rewrite
// (spec/14).
const isProdBuild = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  ...(isProdBuild ? { output: 'export' } : {}),
  basePath: '/live',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@livediagram/ui', '@livediagram/diagram'],
  // Dev-only: disable webpack's persistent filesystem cache. The
  // cache is supposed to speed up rebuilds but in this app it
  // produced repeated "CSS disappears" and "Cannot find module
  // './XYZ.js'" failures after structural changes — the cached
  // chunk graph diverged from what the running HMR client expected.
  // In-memory only is slightly slower on cold starts but rock-solid.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: 'memory' };
    }
    return config;
  },
};

export default nextConfig;
