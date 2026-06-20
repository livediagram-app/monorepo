// The caller's IP for rate-limit keying — Cloudflare's `CF-Connecting-IP`, the
// trusted client IP at the edge. Falls back to a fixed bucket when the header is
// absent (local dev / non-CF) so every no-IP caller shares ONE limiter key
// instead of bypassing the limit. Centralised so the exact header name lives in
// one place: a typo here would silently disable a rate limiter.
export function clientIp(request: Request, fallback = 'anonymous'): string {
  return request.headers.get('CF-Connecting-IP') ?? fallback;
}
