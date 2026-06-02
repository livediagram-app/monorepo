import type { NextConfig } from 'next';

// Static export fronted by Cloudflare Static Assets, served under
// `/telemetry` by the router worker (which strips the prefix before
// forwarding, exactly like `/live`). See specs/22 + specs/08.
const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/telemetry',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@livediagram/ui', '@livediagram/api-schema'],
};

export default nextConfig;
