// Pure element transforms for the one-click style presets (spec/48). Kept
// separate from both the commit setters (`hooks/useElementStyle.ts`) and the
// hover-preview hook (`hooks/useStylePreview.ts`) so the two share ONE
// definition of what each preset does to an element — the preview a user sees
// on hover is byte-for-byte the change a click commits.
//
// Colour presets also stamp the preset's stable id onto the shape's
// `colorPreset` so a later theme change can re-derive the variant (see
// `rederiveColorPresetForTheme` in lib/themes). Border + arrow presets carry no
// theme binding, so they only touch their own fields.

import {
  ARROW_THICKNESS_PX,
  type ArrowFlow,
  type ArrowThickness,
  type BorderRadius,
  type BorderStroke,
  type BorderStyle,
  type Element,
} from '@livediagram/diagram';
import type { ShapeColorPreset } from './themes';

// Apply a theme-derived colour preset to a shape (fill + stroke + text), and
// record the preset id so theme changes can re-derive it. No-op on non-shapes.
export function applyColorPresetToEl(el: Element, p: ShapeColorPreset): Element {
  if (el.type !== 'shape') return el;
  return { ...el, fillColor: p.fill, strokeColor: p.stroke, textColor: p.text, colorPreset: p.id };
}

// Apply a border preset (weight × pattern × radius) to a shape. Independent of
// the colour preset, so it leaves `colorPreset` (and the colours) alone.
export function applyBorderPresetToEl(
  el: Element,
  p: { stroke: BorderStroke; style: BorderStyle; radius: BorderRadius },
): Element {
  if (el.type !== 'shape') return el;
  return { ...el, strokeWidth: p.stroke, strokeStyle: p.style, borderRadius: p.radius };
}

// Apply a line preset (pattern × thickness × optional flow) to an arrow. A
// preset without a flow clears any existing animation; one with a flow defaults
// its speed to normal when the arrow had none. No-op on non-arrows.
export function applyArrowPresetToEl(
  el: Element,
  p: { style: BorderStyle; thickness: ArrowThickness; flow?: ArrowFlow },
): Element {
  if (el.type !== 'arrow') return el;
  return {
    ...el,
    strokeStyle: p.style,
    strokeWidth: ARROW_THICKNESS_PX[p.thickness],
    flow: p.flow,
    flowSpeed: p.flow ? (el.flowSpeed ?? 'normal') : el.flowSpeed,
  };
}
