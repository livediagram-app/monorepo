import type { ArrowElement } from '@livediagram/diagram';
import { describe, expect, it } from 'vitest';
import { arrowReferencesAny, MIN_SIZE, nextBounds, type ShapeBounds } from './canvas';

const baseBounds: ShapeBounds = { x: 100, y: 200, width: 80, height: 40 };

describe('nextBounds — move', () => {
  it('translates the box by the cursor delta and leaves dimensions untouched', () => {
    const out = nextBounds(baseBounds, 'move', 50, -25, false);
    expect(out).toEqual({ x: 150, y: 175, width: 80, height: 40 });
  });

  it('ignores aspectLocked for move (no resize axis to compress onto)', () => {
    const out = nextBounds(baseBounds, 'move', 50, -25, true);
    expect(out).toEqual({ x: 150, y: 175, width: 80, height: 40 });
  });
});

describe('nextBounds — free corner resize', () => {
  it('grows SE corner outward, leaving x/y pinned to the NW corner', () => {
    const out = nextBounds(baseBounds, 'resize-se', 20, 10, false);
    expect(out).toEqual({ x: 100, y: 200, width: 100, height: 50 });
  });

  it('pulls SW corner inward by adjusting x to keep the eastern edge fixed', () => {
    const out = nextBounds(baseBounds, 'resize-sw', 20, 10, false);
    // signX is -1 here, so dx=20 shrinks width by 20 → 60; x slides right
    // by (80 - 60) = 20 so the east edge (x=180) stays put.
    expect(out).toEqual({ x: 120, y: 200, width: 60, height: 50 });
  });

  it('pulls NE corner inward in y, keeping the south edge fixed', () => {
    const out = nextBounds(baseBounds, 'resize-ne', 20, 10, false);
    // signY is -1 here, so dy=10 shrinks height by 10 → 30; y slides
    // down by (40 - 30) = 10 so the south edge (y=240) stays put.
    expect(out).toEqual({ x: 100, y: 210, width: 100, height: 30 });
  });

  it('pulls NW corner inward in both axes, keeping the south-east corner pinned', () => {
    const out = nextBounds(baseBounds, 'resize-nw', 20, 10, false);
    expect(out).toEqual({ x: 120, y: 210, width: 60, height: 30 });
  });

  it('clamps each side at MIN_SIZE when the cursor would shrink past it', () => {
    const out = nextBounds(baseBounds, 'resize-se', -200, -200, false);
    expect(out.width).toBe(MIN_SIZE);
    expect(out.height).toBe(MIN_SIZE);
  });
});

describe('nextBounds — aspect-locked corner resize', () => {
  it('lets the dominant axis (x here) drive both dimensions', () => {
    // baseBounds is 80×40 (ratio 2:1). dx=40 > dy=5, so width wins.
    const out = nextBounds(baseBounds, 'resize-se', 40, 5, true);
    expect(out.width).toBe(120);
    expect(out.height).toBe(60); // 120 / 2
    expect(out.x).toBe(100);
    expect(out.y).toBe(200);
  });

  it('lets the dominant axis (y here) drive both dimensions when dy wins', () => {
    // dx=5 < dy=40, so height wins. candH = 80; newW = 80 * (80/40) = 160.
    const out = nextBounds(baseBounds, 'resize-se', 5, 40, true);
    expect(out.height).toBe(80);
    expect(out.width).toBe(160);
  });

  it('clamps locked resize at MIN_SIZE on each axis', () => {
    const out = nextBounds(baseBounds, 'resize-se', -200, -200, true);
    expect(out.width).toBeGreaterThanOrEqual(MIN_SIZE);
    expect(out.height).toBeGreaterThanOrEqual(MIN_SIZE);
  });
});

const freeArrow: ArrowElement = {
  type: 'arrow',
  id: 'a1',
  from: { kind: 'free', x: 0, y: 0 },
  to: { kind: 'free', x: 100, y: 100 },
};

const pinnedFromArrow: ArrowElement = {
  ...freeArrow,
  from: { kind: 'pinned', elementId: 'el-from', anchor: 'e' },
};

const pinnedToArrow: ArrowElement = {
  ...freeArrow,
  to: { kind: 'pinned', elementId: 'el-to', anchor: 'w' },
};

const bothPinnedArrow: ArrowElement = {
  type: 'arrow',
  id: 'a2',
  from: { kind: 'pinned', elementId: 'el-from', anchor: 'e' },
  to: { kind: 'pinned', elementId: 'el-to', anchor: 'w' },
};

describe('arrowReferencesAny', () => {
  it('returns false for an arrow with no pinned endpoints', () => {
    expect(arrowReferencesAny(freeArrow, new Set(['el-from', 'el-to']))).toBe(false);
  });

  it('matches when the `from` endpoint is pinned to a listed id', () => {
    expect(arrowReferencesAny(pinnedFromArrow, new Set(['el-from']))).toBe(true);
  });

  it('matches when the `to` endpoint is pinned to a listed id', () => {
    expect(arrowReferencesAny(pinnedToArrow, new Set(['el-to']))).toBe(true);
  });

  it('matches when either endpoint of a fully-pinned arrow is listed', () => {
    expect(arrowReferencesAny(bothPinnedArrow, new Set(['el-from']))).toBe(true);
    expect(arrowReferencesAny(bothPinnedArrow, new Set(['el-to']))).toBe(true);
  });

  it('returns false when the pinned endpoints are not in the id set', () => {
    expect(arrowReferencesAny(bothPinnedArrow, new Set(['unrelated']))).toBe(false);
  });

  it('returns false against an empty id set', () => {
    expect(arrowReferencesAny(bothPinnedArrow, new Set())).toBe(false);
  });
});
