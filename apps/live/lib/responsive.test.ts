import { afterEach, describe, expect, it, vi } from 'vitest';
import { isMobileViewportSync, MOBILE_BREAKPOINT_PX } from './responsive';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isMobileViewportSync', () => {
  it('returns false in non-browser contexts so SSR / static-export builds default to desktop', () => {
    vi.stubGlobal('window', undefined);
    expect(isMobileViewportSync()).toBe(false);
  });

  it('returns true when matchMedia reports a viewport under the sm breakpoint', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn(() => ({ matches: true })),
    });
    expect(isMobileViewportSync()).toBe(true);
  });

  it('returns false when matchMedia reports a viewport at or above the sm breakpoint', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn(() => ({ matches: false })),
    });
    expect(isMobileViewportSync()).toBe(false);
  });

  it('queries the sm breakpoint minus one pixel so the threshold matches Tailwind exactly', () => {
    const matchMedia = vi.fn(() => ({ matches: true }));
    vi.stubGlobal('window', { matchMedia });
    isMobileViewportSync();
    expect(matchMedia).toHaveBeenCalledWith(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
  });

  it('returns false when window exists but matchMedia is missing (very old browsers, jsdom)', () => {
    vi.stubGlobal('window', {});
    expect(isMobileViewportSync()).toBe(false);
  });
});
