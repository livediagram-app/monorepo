import { describe, expect, it } from 'vitest';
import { canvasCursorClass, computeDockAnchor } from './canvas-chrome';

describe('computeDockAnchor', () => {
  const canvas = { left: 0, top: 0, width: 1000 };
  const popover = 256;

  it('centres the popover under a mid-canvas button', () => {
    const a = computeDockAnchor({ left: 480, bottom: 40, width: 40 }, canvas, popover);
    // button centre = 500; left = 500 - 128 = 372; arrow points back to centre.
    expect(a.left).toBe(372);
    expect(a.top).toBe(40);
    expect(a.arrowOffset).toBe(128);
  });

  it('clamps to 8px from the left edge and keeps the arrow on the button', () => {
    const a = computeDockAnchor({ left: 0, bottom: 30, width: 40 }, canvas, popover);
    expect(a.left).toBe(8); // would be 20-128 = -108, clamped to 8
    expect(a.arrowOffset).toBe(12); // centre 20 - left 8
  });

  it('clamps to 8px from the right edge', () => {
    const a = computeDockAnchor({ left: 960, bottom: 30, width: 40 }, canvas, popover);
    // centre 980; max left = 1000 - 256 - 8 = 736
    expect(a.left).toBe(736);
    expect(a.arrowOffset).toBe(980 - 736);
  });

  it('subtracts the canvas offset so the anchor is canvas-relative', () => {
    const offsetCanvas = { left: 100, top: 50, width: 1000 };
    const a = computeDockAnchor({ left: 580, bottom: 90, width: 40 }, offsetCanvas, popover);
    expect(a.top).toBe(40); // 90 - 50
    // centre = 580 + 20 - 100 = 500; left = 372
    expect(a.left).toBe(372);
  });
});

describe('canvasCursorClass', () => {
  const rest = {
    pendingDraw: false,
    pan: false,
    marquee: false,
    canvasTool: 'pan',
    spaceHeld: false,
    isPaintMode: false,
    isGroupMode: false,
  };

  it('a pending draw wins over everything', () => {
    expect(canvasCursorClass({ ...rest, pendingDraw: true, pan: true })).toBe('cursor-crosshair');
  });
  it('an active pan shows the grabbing cursor', () => {
    expect(canvasCursorClass({ ...rest, pan: true })).toBe('cursor-grabbing');
  });
  it('an active marquee shows crosshair', () => {
    expect(canvasCursorClass({ ...rest, marquee: true })).toBe('cursor-crosshair');
  });
  it('the laser tool shows crosshair unless Space is held', () => {
    expect(canvasCursorClass({ ...rest, canvasTool: 'laser' })).toBe('cursor-crosshair');
    // Space held suppresses the laser cursor, falling through to the rest
    // (pan tool here -> grab).
    expect(canvasCursorClass({ ...rest, canvasTool: 'laser', spaceHeld: true })).toBe(
      'cursor-grab',
    );
  });
  it('the resting pan tool shows grab; select shows crosshair', () => {
    expect(canvasCursorClass({ ...rest, canvasTool: 'pan' })).toBe('cursor-grab');
    expect(canvasCursorClass({ ...rest, canvasTool: 'select' })).toBe('cursor-crosshair');
  });
  it('format-paint mode shows copy, group mode shows crosshair', () => {
    expect(canvasCursorClass({ ...rest, canvasTool: 'x', isPaintMode: true })).toBe('cursor-copy');
    expect(canvasCursorClass({ ...rest, canvasTool: 'x', isGroupMode: true })).toBe(
      'cursor-crosshair',
    );
  });
  it('falls back to grab', () => {
    expect(canvasCursorClass({ ...rest, canvasTool: 'x' })).toBe('cursor-grab');
  });
});
