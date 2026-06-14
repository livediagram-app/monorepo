'use client';

// The eraser canvas tool (spec/09). Pressing on the canvas deletes
// whatever element is under the pointer; holding and dragging deletes
// everything the drag passes over. The whole press-drag collapses into a
// SINGLE undo via markCheckpoint() at press + tick() per removal — the
// same checkpoint-then-tick pattern useEditorDrag uses for a move.
//
// Hit-testing rides the DOM rather than re-deriving per-type geometry:
// every element wrapper carries data-element-id, so
// document.elementsFromPoint at the pointer resolves what's underneath
// (shapes, arrows, text, images — all of them). Locked elements, and
// everything on a locked tab, are skipped (spec/09 Locking).
//
// Canvas only calls beginErase (from its capture-phase pointerdown, so it
// intercepts before an element's own select/drag); the move + release of
// the gesture are tracked here via window listeners so an erase keeps
// working even if the pointer leaves the canvas surface mid-drag.

import { useRef } from 'react';
import type { Element, Tab } from '@livediagram/diagram';
import { arrowReferencesAny } from '@/lib/canvas';
import { track } from '@/lib/telemetry';

type EraserDeps = {
  editsBlocked: boolean;
  activeTab: Tab;
  // Element-level write WITHOUT a fresh history checkpoint (see
  // useEditorHistory.tick) — paired with one markCheckpoint() per gesture.
  tick: (mapElements: (els: Element[]) => Element[]) => void;
  markCheckpoint: () => void;
  setSelectedId: (id: string | null) => void;
  setEditingId: (id: string | null) => void;
};

export function useCanvasEraser(deps: EraserDeps) {
  // Latest deps for the window listeners: they attach once per gesture but
  // must read fresh state every move (the active tab shrinks as elements
  // are erased). Mirrors useEditorDrag's depsRef pattern.
  const depsRef = useRef(deps);
  depsRef.current = deps;
  // Ids removed so far this gesture. Dedupes repeat hits as the pointer
  // lingers, and growing it lets the tick filter cascade pinned arrows
  // once an endpoint is erased.
  const erasedRef = useRef<Set<string>>(new Set());

  const eraseAtPoint = (clientX: number, clientY: number) => {
    const { activeTab, tick } = depsRef.current;
    let changed = false;
    for (const node of document.elementsFromPoint(clientX, clientY)) {
      const host = node.closest('[data-element-id]');
      const id = host?.getAttribute('data-element-id');
      if (!id || erasedRef.current.has(id)) continue;
      const el = activeTab.elements.find((e) => e.id === id);
      // Skip unknown ids (a wrapper for something on another layer) and
      // locked elements (protected from deletion).
      if (!el || el.locked === true) continue;
      erasedRef.current.add(id);
      changed = true;
    }
    if (!changed) return;
    const ids = erasedRef.current;
    tick((els) =>
      els.filter((el) => {
        if (el.locked === true) return true;
        if (ids.has(el.id)) return false;
        // Drop arrows pinned to an erased element, matching deleteSelected.
        if (el.type === 'arrow' && arrowReferencesAny(el, ids)) return false;
        return true;
      }),
    );
  };

  const beginErase = (clientX: number, clientY: number) => {
    const { editsBlocked, activeTab, markCheckpoint, setSelectedId, setEditingId } =
      depsRef.current;
    if (editsBlocked || activeTab.locked === true) return;
    erasedRef.current = new Set();
    // One checkpoint up front so the entire press-drag undoes in a single
    // step. Clear selection so a now-erased element's toolbar disappears.
    markCheckpoint();
    setSelectedId(null);
    setEditingId(null);
    eraseAtPoint(clientX, clientY);

    const onMove = (ev: PointerEvent) => eraseAtPoint(ev.clientX, ev.clientY);
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (erasedRef.current.size > 0) track('Element', 'Deleted', 'Eraser');
      erasedRef.current = new Set();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return { beginErase };
}
