import { describe, expect, it } from 'vitest';
import { POST_AUTH_DEFAULT, resolvePostAuthDestination } from './auth-shared';

// resolvePostAuthDestination decides where the sign-in and sign-up
// pages send a verified user. Wrong here means either an open
// redirect (worth a security row), a redirect loop back to auth, or
// a doubled /live/live/... basePath. Tests pin every documented
// branch.
//
// Both call sites pass next/navigation's ReadonlyURLSearchParams;
// the function reads only `.get(key)`, so plain URLSearchParams
// stands in fine here.

const params = (qs: string) => new URLSearchParams(qs);

describe('resolvePostAuthDestination', () => {
  it("returns the default '/' when redirect_url is absent", () => {
    expect(resolvePostAuthDestination(params(''))).toBe(POST_AUTH_DEFAULT);
  });

  it('returns the default for a redirect_url that does not start with /live', () => {
    // Open-redirect guard: anything not under /live is rejected so
    // an attacker can't bounce the verified user off-site via the
    // query param.
    expect(resolvePostAuthDestination(params('redirect_url=https://evil.example'))).toBe(
      POST_AUTH_DEFAULT,
    );
    expect(resolvePostAuthDestination(params('redirect_url=/marketing'))).toBe(POST_AUTH_DEFAULT);
    expect(resolvePostAuthDestination(params('redirect_url=//evil.example'))).toBe(
      POST_AUTH_DEFAULT,
    );
  });

  it('refuses a redirect back to /live/sign-in (loop guard)', () => {
    expect(resolvePostAuthDestination(params('redirect_url=/live/sign-in'))).toBe(
      POST_AUTH_DEFAULT,
    );
    expect(resolvePostAuthDestination(params('redirect_url=/live/sign-in?foo=bar'))).toBe(
      POST_AUTH_DEFAULT,
    );
    // Case-insensitive: the lowercase prefix check stops capitalised
    // bypass attempts.
    expect(resolvePostAuthDestination(params('redirect_url=/LIVE/SIGN-IN'))).toBe(
      POST_AUTH_DEFAULT,
    );
  });

  it('refuses a redirect back to /live/get-started (loop guard)', () => {
    expect(resolvePostAuthDestination(params('redirect_url=/live/get-started'))).toBe(
      POST_AUTH_DEFAULT,
    );
    expect(resolvePostAuthDestination(params('redirect_url=/live/Get-Started?onboarding=1'))).toBe(
      POST_AUTH_DEFAULT,
    );
  });

  it('strips the /live prefix from a safe path', () => {
    // router.push already respects the basePath, so passing the
    // raw /live/diagram/abc would yield /live/live/diagram/abc.
    expect(resolvePostAuthDestination(params('redirect_url=/live/diagram/abc'))).toBe(
      '/diagram/abc',
    );
    expect(resolvePostAuthDestination(params('redirect_url=/live/explorer'))).toBe('/explorer');
    expect(resolvePostAuthDestination(params('redirect_url=/live/new?folder=f1'))).toBe(
      '/new?folder=f1',
    );
  });

  it("collapses a bare /live redirect to '/'", () => {
    // Stripping the prefix from exactly "/live" leaves the empty
    // string. We promote that to "/" so router.push has a valid path.
    expect(resolvePostAuthDestination(params('redirect_url=/live'))).toBe('/');
  });
});
