import type {
  ArrowElement,
  Element,
  ShapeElement,
  StickyElement,
  TextElement,
} from '@livediagram/diagram';
import { describe, expect, it } from 'vitest';
import { THEMES, getTheme, recolourElementForTheme, type ThemeDefinition } from './themes';

describe('THEMES catalogue', () => {
  it('has a unique id per theme', () => {
    const ids = THEMES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('leads with the brand theme (the un-themed default)', () => {
    expect(THEMES[0]?.id).toBe('brand');
  });

  it('gives every theme a label and a backdrop', () => {
    for (const t of THEMES) {
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.backgroundColor).toMatch(/^#[0-9a-f]{3,8}$/i);
      expect(t.patternColor).toMatch(/^#[0-9a-f]{3,8}$/i);
      expect(t.backgroundPattern).toBeTruthy();
    }
  });
});

describe('getTheme', () => {
  it('returns the matching theme by id', () => {
    const slate = getTheme('slate');
    expect(slate.id).toBe('slate');
  });

  it('falls back to the brand theme for an unknown id', () => {
    expect(getTheme('does-not-exist').id).toBe('brand');
  });

  it('falls back to the brand theme for undefined', () => {
    expect(getTheme(undefined).id).toBe('brand');
  });

  it('returns the exact catalogue object (referential, not a copy)', () => {
    expect(getTheme('forest')).toBe(THEMES.find((t) => t.id === 'forest'));
  });
});

describe('recolourElementForTheme', () => {
  const themed: ThemeDefinition = {
    id: 'slate',
    label: 'Slate',
    backgroundColor: '#f1f5f9',
    backgroundPattern: 'grid',
    patternColor: '#cbd5e1',
    elementFill: '#e2e8f0',
    elementStroke: '#475569',
    elementText: '#0f172a',
  };
  const passthrough: ThemeDefinition = {
    id: 'brand',
    label: 'Brand',
    backgroundColor: '#ffffff',
    backgroundPattern: 'grid',
    patternColor: '#e0f2fe',
    elementFill: null,
    elementStroke: null,
    elementText: null,
  };
  const shape: ShapeElement = {
    id: 's',
    type: 'shape',
    shape: 'square',
    x: 0,
    y: 0,
    width: 100,
    height: 50,
  };
  const text: TextElement = {
    id: 't',
    type: 'text',
    x: 0,
    y: 0,
    width: 100,
    height: 30,
    label: 'hello',
  };
  const arrow: ArrowElement = {
    id: 'a',
    type: 'arrow',
    from: { kind: 'free', x: 0, y: 0 },
    to: { kind: 'free', x: 50, y: 50 },
  };
  const sticky: StickyElement = {
    id: 'n',
    type: 'sticky',
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  };

  it('writes fill, stroke, and text on shapes when the theme overrides each', () => {
    const out = recolourElementForTheme(shape, themed) as ShapeElement;
    expect(out.fillColor).toBe('#e2e8f0');
    expect(out.strokeColor).toBe('#475569');
    expect(out.textColor).toBe('#0f172a');
  });

  it('writes only the text colour on text elements', () => {
    const out = recolourElementForTheme(text, themed) as TextElement;
    expect(out.textColor).toBe('#0f172a');
    // Spot-check: no rogue fill / stroke fields appear on a text element.
    expect((out as unknown as Record<string, unknown>).fillColor).toBeUndefined();
    expect((out as unknown as Record<string, unknown>).strokeColor).toBeUndefined();
  });

  it('writes the stroke colour on arrows so themed templates have themed connectors', () => {
    // This is the path that the in-editor "Browse templates" picker
    // previously skipped, leaving arrows in mindmap / flowchart /
    // flywheel templates stuck at the brand default.
    const out = recolourElementForTheme(arrow, themed) as ArrowElement;
    expect(out.strokeColor).toBe('#475569');
  });

  it('leaves sticky notes untouched so the iconic amber palette survives', () => {
    const out = recolourElementForTheme(sticky, themed);
    expect(out).toEqual(sticky);
  });

  it('no-ops every type when the theme has no element-colour overrides (Brand)', () => {
    const inputs: Element[] = [shape, text, arrow, sticky];
    for (const el of inputs) {
      const out = recolourElementForTheme(el, passthrough);
      expect(out).toEqual(el);
    }
  });
});
