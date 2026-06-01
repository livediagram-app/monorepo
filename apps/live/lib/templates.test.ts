import { describe, expect, it } from 'vitest';
import { buildTemplatedTab, templateCanvasOverrides } from './templates';
import { getTheme } from './themes';

// `buildTemplatedTab` is the seam between /live/new (the welcome
// flow) and the editor: a freshly chosen template + theme has to
// land in the editor as a fully styled tab, or the user opens an
// "Untitled" diagram that doesn't match the option they picked.
// The theming is the bit most likely to silently drift, so the
// tests below pin each element type's recolouring contract.

describe('templateCanvasOverrides', () => {
  it('gives mind maps a softer backdrop opacity', () => {
    // Mind maps sit on a slightly translucent canvas so the central
    // node reads as a focal point rather than competing with the
    // background pattern.
    expect(templateCanvasOverrides('mindmap')).toEqual({ backgroundOpacity: 0.8 });
  });

  it('returns no overrides for any other template', () => {
    expect(templateCanvasOverrides('blank')).toEqual({});
    expect(templateCanvasOverrides('flowchart')).toEqual({});
    expect(templateCanvasOverrides('orgchart')).toEqual({});
  });
});

describe('buildTemplatedTab', () => {
  it('returns a Tab carrying the supplied id, name, and theme metadata', () => {
    const tab = buildTemplatedTab('blank', 'slate', 'tab-1', 'My tab');
    const slate = getTheme('slate');
    expect(tab.id).toBe('tab-1');
    expect(tab.name).toBe('My tab');
    expect(tab.theme).toBe('slate');
    expect(tab.backgroundColor).toBe(slate.backgroundColor);
    expect(tab.backgroundPattern).toBe(slate.backgroundPattern);
    expect(tab.patternColor).toBe(slate.patternColor);
    expect(tab.templateChosen).toBe(true);
  });

  it('applies the mindmap backdrop opacity override', () => {
    const tab = buildTemplatedTab('mindmap', 'brand', 'tab-1', 'mind map');
    expect(tab.backgroundOpacity).toBe(0.8);
  });

  it('leaves non-mindmap templates without a backdrop opacity override', () => {
    const tab = buildTemplatedTab('flowchart', 'brand', 'tab-1', 'flow');
    expect(tab.backgroundOpacity).toBeUndefined();
  });

  it('recolours shape elements with the chosen theme palette', () => {
    // `blank` produces a single shape, which keeps the assertion
    // narrow: any drift in the recolouring loop shows up here as a
    // mismatched fill / stroke / text triple.
    const tab = buildTemplatedTab('blank', 'slate', 'tab-1', 'blank');
    const slate = getTheme('slate');
    const shape = tab.elements.find((el) => el.type === 'shape');
    expect(shape).toBeDefined();
    if (shape && shape.type === 'shape') {
      expect(shape.fillColor).toBe(slate.elementFill);
      expect(shape.strokeColor).toBe(slate.elementStroke);
      expect(shape.textColor).toBe(slate.elementText);
    }
  });

  it('leaves shape colours untouched when the theme provides no overrides', () => {
    // The brand theme has all three element fields null. Recolouring
    // should be a no-op so the template's own defaults show through.
    const tab = buildTemplatedTab('blank', 'brand', 'tab-1', 'blank');
    const shape = tab.elements.find((el) => el.type === 'shape');
    expect(shape).toBeDefined();
    if (shape && shape.type === 'shape') {
      // No fill/stroke/text fields written. The shape's defaults
      // (whatever `createShape` chose) survive intact.
      expect(shape.fillColor).toBeUndefined();
      expect(shape.strokeColor).toBeUndefined();
      expect(shape.textColor).toBeUndefined();
    }
  });

  it('recolours arrow elements with the theme stroke colour only', () => {
    // Mind maps include arrows (central node to branches). The
    // recolouring loop only writes strokeColor on arrows, never a
    // fill or text colour, because arrows don't carry those.
    const tab = buildTemplatedTab('mindmap', 'slate', 'tab-1', 'mind map');
    const slate = getTheme('slate');
    const arrow = tab.elements.find((el) => el.type === 'arrow');
    expect(arrow).toBeDefined();
    if (arrow && arrow.type === 'arrow') {
      expect(arrow.strokeColor).toBe(slate.elementStroke);
    }
  });
});

// Wireframe templates that pair with the device-frame shapes
// (browser / monitor / laptop / phone / tablet). Each test pins
// the template's structural fingerprint, so a future change to the
// template's element count or shape choices either updates these
// expectations or fails CI loudly. None of the runtime helpers
// (theme recolouring, mindmap opacity, etc.) need to be exercised
// again here, they're covered above against the blank + flowchart
// templates.

describe('wireframe templates', () => {
  it('mobile-wireframe drops three phone screens side by side', () => {
    const tab = buildTemplatedTab('mobile-wireframe', 'brand', 'tab-1', 'mobile');
    const phones = tab.elements.filter((el) => el.type === 'shape' && el.shape === 'phone');
    expect(phones).toHaveLength(3);
    expect(phones.map((p) => (p as { label?: string }).label)).toEqual([
      'Login',
      'Feed',
      'Profile',
    ]);
    // Should have ONLY the three phones, no incidental other elements
    // sneaking in.
    expect(tab.elements).toHaveLength(3);
  });

  it('laptop-wireframe drops a laptop frame plus three inner content rectangles', () => {
    const tab = buildTemplatedTab('laptop-wireframe', 'brand', 'tab-1', 'laptop');
    const laptops = tab.elements.filter((el) => el.type === 'shape' && el.shape === 'laptop');
    expect(laptops).toHaveLength(1);
    const squares = tab.elements.filter((el) => el.type === 'shape' && el.shape === 'square');
    expect(squares).toHaveLength(3);
    // Header / Sidebar / Content labels on the squares.
    const squareLabels = squares
      .map((s) => (s as { label?: string }).label)
      .filter((l): l is string => l !== undefined);
    expect(squareLabels.sort()).toEqual(['Content', 'Header', 'Sidebar']);
  });

  it('slide-deck drops four monitor frames in a 2x2 grid', () => {
    const tab = buildTemplatedTab('slide-deck', 'brand', 'tab-1', 'slides');
    const monitors = tab.elements.filter((el) => el.type === 'shape' && el.shape === 'monitor');
    expect(monitors).toHaveLength(4);
    expect(monitors.map((m) => (m as { label?: string }).label)).toEqual([
      'Title',
      'Agenda',
      'Details',
      'Next steps',
    ]);
    // 2x2 layout check: two distinct x positions (left column,
    // right column), two distinct y positions (top row, bottom
    // row). Both axes have two unique values; together the
    // monitors fill the grid (4 cells).
    const xs = new Set(monitors.map((m) => (m as { x: number }).x));
    const ys = new Set(monitors.map((m) => (m as { y: number }).y));
    expect(xs.size).toBe(2);
    expect(ys.size).toBe(2);
  });
});
