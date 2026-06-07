import { describe, expect, it } from 'vitest';
import { shufflePinned } from './shuffle';

describe('shufflePinned', () => {
  const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }];
  const isA = (item: { id: string }) => item.id === 'a';

  it('keeps the pinned item first', () => {
    // A constant rng of 0 makes Fisher-Yates a deterministic rotation,
    // but whatever order the tail lands in, the pin stays at index 0.
    const out = shufflePinned(items, isA, () => 0);
    expect(out[0]).toEqual({ id: 'a' });
  });

  it('preserves the relative order of multiple pinned items', () => {
    const isAorC = (item: { id: string }) => item.id === 'a' || item.id === 'c';
    const out = shufflePinned(items, isAorC, () => 0.99);
    expect(out.slice(0, 2)).toEqual([{ id: 'a' }, { id: 'c' }]);
  });

  it('returns every item exactly once (a permutation)', () => {
    const out = shufflePinned(items, isA, () => 0.42);
    expect([...out].sort((x, y) => x.id.localeCompare(y.id))).toEqual(
      [...items].sort((x, y) => x.id.localeCompare(y.id)),
    );
  });

  it('does not mutate the input array', () => {
    const original = [...items];
    shufflePinned(items, isA, () => 0.5);
    expect(items).toEqual(original);
  });

  it('actually reorders the non-pinned tail for a non-trivial rng', () => {
    // rng = 0 makes every Fisher-Yates pass swap rest[i] with rest[0],
    // rotating the tail [b,c,d,e] → [c,d,e,b]: a known permutation
    // distinct from the input order.
    const out = shufflePinned(items, isA, () => 0);
    expect(out.map((i) => i.id)).toEqual(['a', 'c', 'd', 'e', 'b']);
  });

  it('handles a list with no pinned item', () => {
    const out = shufflePinned(
      items,
      () => false,
      () => 0,
    );
    expect(out).toHaveLength(items.length);
  });
});
