import { describe, expect, it } from 'vitest';
import { byteLength } from './limits';

// byteLength gates JSON payload sizes against MAX_TAB_BYTES /
// MAX_THEME_DEF_BYTES / MAX_BODY_BYTES. It must measure UTF-8 bytes, not
// JS string length: a `.length` char count under-counts multi-byte
// content, which would let an oversized payload slip past the cap.
describe('byteLength', () => {
  it('counts ASCII as one byte each', () => {
    expect(byteLength('')).toBe(0);
    expect(byteLength('abc')).toBe(3);
  });

  it('counts UTF-8 bytes for multi-byte characters', () => {
    expect(byteLength('é')).toBe(2); // U+00E9
    expect(byteLength('€')).toBe(3); // U+20AC
    expect(byteLength('😀')).toBe(4); // U+1F600 (astral / surrogate pair)
  });

  it('exceeds the JS string length for astral characters (the reason it exists)', () => {
    expect(byteLength('😀')).toBeGreaterThan('😀'.length); // 4 > 2
  });
});
