import { describe, it, expect } from 'vitest';
import { generateApiToken, isApiTokenFormat, hashApiToken, apiTokenExpiry } from './api-token';

describe('generateApiToken', () => {
  it('mints an lvd_-prefixed token that passes the format check', () => {
    const t = generateApiToken();
    expect(t.startsWith('lvd_')).toBe(true);
    expect(isApiTokenFormat(t)).toBe(true);
  });

  it('is unique across calls', () => {
    const set = new Set(Array.from({ length: 100 }, () => generateApiToken()));
    expect(set.size).toBe(100);
  });
});

describe('isApiTokenFormat', () => {
  it('rejects a Clerk-style JWT (no lvd_ prefix)', () => {
    expect(isApiTokenFormat('eyJhbGciOi.payload.sig')).toBe(false);
  });
  it('rejects a too-short lvd_ string', () => {
    expect(isApiTokenFormat('lvd_short')).toBe(false);
  });
});

describe('hashApiToken', () => {
  it('is deterministic and 64 hex chars', async () => {
    const a = await hashApiToken('lvd_abc');
    const b = await hashApiToken('lvd_abc');
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
  it('differs for different tokens', async () => {
    expect(await hashApiToken('lvd_a')).not.toBe(await hashApiToken('lvd_b'));
  });
});

describe('apiTokenExpiry', () => {
  it('is six months after creation', () => {
    const created = Date.UTC(2026, 0, 15); // 15 Jan 2026
    expect(apiTokenExpiry(created)).toBe(Date.UTC(2026, 6, 15)); // 15 Jul 2026
  });
  it('is always in the future relative to creation', () => {
    const created = Date.now();
    expect(apiTokenExpiry(created)).toBeGreaterThan(created);
  });
});
