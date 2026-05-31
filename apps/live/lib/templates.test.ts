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
