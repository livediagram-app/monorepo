// Routes URL paths to the right downstream app via service bindings.
// See specs/08-router-app.md.

export interface Env {
  MARKETING: Fetcher;
  LIVE: Fetcher;
  API: Fetcher;
  TELEMETRY: Fetcher;
}

const LIVE_PATH = '/live';
const API_PATH = '/api';
const TELEMETRY_PATH = '/telemetry';

function isLivePath(pathname: string): boolean {
  return pathname === LIVE_PATH || pathname.startsWith(`${LIVE_PATH}/`);
}

function isApiPath(pathname: string): boolean {
  return pathname === API_PATH || pathname.startsWith(`${API_PATH}/`);
}

function isTelemetryPath(pathname: string): boolean {
  return pathname === TELEMETRY_PATH || pathname.startsWith(`${TELEMETRY_PATH}/`);
}

// Forward to a basePath app, stripping the path prefix. Next.js's
// basePath rewrites the URLs in the emitted HTML/JS (so links + asset
// refs carry the prefix) but does NOT shift the file layout — files
// still live at the root of `out/`. So the router presents
// `/<prefix>/foo` to the downstream worker as `/foo`.
function forwardStripped(
  request: Request,
  url: URL,
  prefix: string,
  target: Fetcher,
): Response | Promise<Response> {
  const stripped = url.pathname.slice(prefix.length) || '/';
  const rewritten = new URL(url.toString());
  rewritten.pathname = stripped;
  return target.fetch(new Request(rewritten.toString(), request));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    // /api/* is forwarded as-is to the api worker. The API worker handles
    // the full pathname (it expects `/api/...`) so there's no prefix
    // stripping here, unlike the basePath apps.
    if (isApiPath(url.pathname)) {
      return env.API.fetch(request);
    }
    if (isLivePath(url.pathname)) {
      return forwardStripped(request, url, LIVE_PATH, env.LIVE);
    }
    if (isTelemetryPath(url.pathname)) {
      // The public transparency dashboard (spec/22), a basePath:'/telemetry'
      // static app — same prefix-strip as the live app.
      return forwardStripped(request, url, TELEMETRY_PATH, env.TELEMETRY);
    }
    return env.MARKETING.fetch(request);
  },
} satisfies ExportedHandler<Env>;
