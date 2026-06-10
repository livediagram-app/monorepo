'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// /explorer is an index with no content of its own: every section
// lives at /explorer/<section> (spec/15, routes.ts). Default landing
// is Recent diagrams. In production the live worker 302s this path
// before any HTML is served (src/worker.ts); this client replace is
// the dev-server / direct-asset fallback.
export default function ExplorerIndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/explorer/recent');
  }, [router]);
  return null;
}
