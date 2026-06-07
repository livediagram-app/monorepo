import { defaultTextAlign, type Element, type ShapeElement } from '@livediagram/diagram';
import { describe, expect, it } from 'vitest';
import { deriveCanvasSelection, deriveSelectedElementFields } from './canvas-selection';

const box = (id: string, overrides: Partial<ShapeElement> = {}): ShapeElement => ({
  id,
  type: 'shape',
  shape: 'square',
  x: 0,
  y: 0,
  width: 100,
  height: 60,
  ...overrides,
});

// Default "clean editor" flags: nothing being edited, no modes, unlocked,
// editable. Individual tests override what they exercise.
const base = {
  editingId: null,
  isPaintMode: false,
  isGroupMode: false,
  tabLocked: false,
  readOnly: false,
};

function derive(over: Partial<Parameters<typeof deriveCanvasSelection>[0]>) {
  return deriveCanvasSelection({
    elements: [],
    selectedId: null,
    multiSelectedIds: new Set<string>(),
    ...base,
    ...over,
  });
}

describe('deriveCanvasSelection', () => {
  it('reports nothing selected when there is no selection', () => {
    const s = derive({ elements: [box('a')] });
    expect(s.selected).toBeNull();
    expect(s.selectionBounds).toBeNull();
    expect(s.showPopover).toBe(false);
    expect(s.showPlus).toBe(false);
    expect(s.showHandlesFor('a')).toBe(false);
    expect(s.showUnionResize).toBe(false);
  });

  it('resolves a single boxed selection and shows all single-select chrome', () => {
    const a = box('a');
    const s = derive({ elements: [a], selectedId: 'a' });
    expect(s.selected).toBe(a);
    expect(s.selectionScope).toBe('single');
    expect(s.selectedIsBoxed).toBe(true);
    expect(s.selectionBounds).toEqual({ x: 0, y: 0, width: 100, height: 60 });
    expect(s.showPopover).toBe(true);
    expect(s.showPlus).toBe(true);
    expect(s.showHandlesFor('a')).toBe(true);
    expect(s.showAnchorsFor('a')).toBe(true);
    // Predicates are per-id: a different element never shows handles.
    expect(s.showHandlesFor('b')).toBe(false);
    expect(s.showUnionResize).toBe(false);
  });

  it('hides handles + plus while editing the selected element (popover hides too)', () => {
    const s = derive({ elements: [box('a')], selectedId: 'a', editingId: 'a' });
    expect(s.showPopover).toBe(false);
    expect(s.showPlus).toBe(false);
    expect(s.showHandlesFor('a')).toBe(false);
  });

  it('a locked element keeps the popover but loses plus + handles', () => {
    const s = derive({ elements: [box('a', { locked: true })], selectedId: 'a' });
    expect(s.selectedLocked).toBe(true);
    expect(s.showPopover).toBe(true); // popover does NOT gate on the element lock
    expect(s.showPlus).toBe(false);
    expect(s.showHandlesFor('a')).toBe(false);
  });

  it('read-only keeps the popover but suppresses plus + handles', () => {
    const s = derive({ elements: [box('a')], selectedId: 'a', readOnly: true });
    expect(s.showPopover).toBe(true); // popover does NOT gate on readOnly
    expect(s.showPlus).toBe(false);
    expect(s.showHandlesFor('a')).toBe(false);
  });

  it('a locked tab suppresses every chrome including the popover', () => {
    const s = derive({ elements: [box('a')], selectedId: 'a', tabLocked: true });
    expect(s.showPopover).toBe(false);
    expect(s.showPlus).toBe(false);
    expect(s.showHandlesFor('a')).toBe(false);
  });

  it('format-paint / group mode suppress single-select chrome', () => {
    const paint = derive({ elements: [box('a')], selectedId: 'a', isPaintMode: true });
    expect(paint.showPopover).toBe(false);
    expect(paint.showHandlesFor('a')).toBe(false);
    const group = derive({ elements: [box('a')], selectedId: 'a', isGroupMode: true });
    expect(group.showPopover).toBe(false);
    expect(group.showHandlesFor('a')).toBe(false);
  });

  it('a marquee multi-selection uses union resize and hides the single popover', () => {
    const els: Element[] = [box('a'), box('b', { x: 200 })];
    const s = derive({
      elements: els,
      selectedId: null,
      multiSelectedIds: new Set(['a', 'b']),
    });
    expect(s.selectionScope).toBe('multi');
    expect(s.multiPrimaryId).toBe('a');
    expect(s.showPopover).toBe(false); // per-element popover is meaningless for many
    expect(s.showUnionResize).toBe(true);
    expect(s.unionResizePrimaryId).toBe('a');
    // Per-element single-handles stay off when the selection is a group/multi.
    expect(s.showHandlesFor('a')).toBe(false);
  });

  it('a group selection (>1 member) shows union resize, not per-element handles', () => {
    const els: Element[] = [box('a', { groupId: 'g' }), box('b', { x: 200, groupId: 'g' })];
    const s = derive({ elements: els, selectedId: 'a' });
    expect(s.memberIds.size).toBe(2);
    expect(s.selectionScope).toBe('group');
    expect(s.showUnionResize).toBe(true);
    expect(s.unionResizePrimaryId).toBe('a');
    expect(s.showHandlesFor('a')).toBe(false); // memberIds.size !== 1
  });
});

describe('deriveSelectedElementFields (per-type control gating)', () => {
  const align = defaultTextAlign(box('x'));

  it('a shape exposes shapeKind + border + text, no arrow fields', () => {
    const f = deriveSelectedElementFields(box('s'), true, align);
    expect(f.shapeKind).toBe('square');
    expect(f.textSize).not.toBeNull();
    expect(f.borderRadius).not.toBeNull();
    expect(f.fillColor).not.toBeNull();
    expect(f.arrowEnds).toBeNull();
  });

  it('an image nulls out text + colour fields but stays boxed for padding/aspect', () => {
    const img = {
      id: 'i',
      type: 'image',
      x: 0,
      y: 0,
      width: 80,
      height: 80,
      imageId: 'x',
    } as unknown as Element;
    const f = deriveSelectedElementFields(img, false, null);
    expect(f.textSize).toBeNull();
    expect(f.textColor).toBeNull();
    expect(f.textBold).toBeNull();
    expect(f.shapeKind).toBeNull();
    expect(f.arrowEnds).toBeNull();
    expect(f.aspectLocked).not.toBeNull(); // boxed -> aspect-lock control shows
    expect(f.padding).not.toBeNull();
  });

  it('an arrow exposes arrow fields, no shape/text/box fields', () => {
    const arrowEl = {
      id: 'a',
      type: 'arrow',
      from: { kind: 'free', x: 0, y: 0 },
      to: { kind: 'free', x: 50, y: 50 },
    } as unknown as Element;
    const f = deriveSelectedElementFields(arrowEl, true, null);
    expect(f.arrowEnds).not.toBeNull();
    expect(f.arrowThickness).not.toBeNull();
    expect(f.arrowStyle).not.toBeNull();
    expect(f.shapeKind).toBeNull();
    expect(f.textSize).toBeNull();
    expect(f.aspectLocked).toBeNull(); // not boxed
    expect(f.strokeColor).not.toBeNull();
  });

  it('a text element shows text but no shape kind or border radius', () => {
    const text = {
      id: 't',
      type: 'text',
      x: 0,
      y: 0,
      width: 100,
      height: 40,
    } as unknown as Element;
    const f = deriveSelectedElementFields(text, true, align);
    expect(f.textSize).not.toBeNull();
    expect(f.shapeKind).toBeNull();
    expect(f.borderRadius).toBeNull();
    expect(f.arrowEnds).toBeNull();
  });
});
