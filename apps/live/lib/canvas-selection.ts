// Pure selection-display derivation for the canvas: given the element
// list, the current selection (single id + marquee multi-set), and the
// editing/mode flags, work out the primary selected element, the
// selection bounds, and every "should this chrome show?" predicate the
// Canvas render reads. Lifted out of Canvas.tsx so this decision logic
// is unit-testable in isolation (the component itself has no tests).
import {
  elementBounds,
  isBoxed,
  selectionMembers,
  unionBoxedBounds,
  type Element,
} from '@livediagram/diagram';

type Bounds = { x: number; y: number; width: number; height: number };

export type CanvasSelection = {
  // Group-expanded membership of the single selection (the element +
  // every other element sharing its groupId). Empty when nothing is
  // singly selected.
  memberIds: Set<string>;
  // First element (in z-order) of an active marquee multi-selection,
  // promoted so the Editor panel can read shared properties from it.
  multiPrimaryId: string | null;
  // The primary selected element: the single selection, else the multi
  // primary. Null when nothing is selected.
  selected: Element | null;
  selectionScope: 'single' | 'multi' | 'group';
  selectedIsBoxed: boolean;
  selectedIsGrouped: boolean;
  selectionBounds: Bounds | null;
  selectedLocked: boolean;
  // Single-selection popover + plus-button visibility.
  showPopover: boolean;
  showPlus: boolean;
  // Per-element resize-handle / arrow-anchor visibility (same predicate
  // for both today). Call with an element id.
  showHandlesFor: (id: string) => boolean;
  showAnchorsFor: (id: string) => boolean;
  // Union (multi / group) resize-handle state.
  unionResizeIds: Set<string> | null;
  unionResizeBounds: Bounds | null;
  unionResizePrimaryId: string | null;
  showUnionResize: boolean;
};

export function deriveCanvasSelection(input: {
  elements: Element[];
  selectedId: string | null;
  multiSelectedIds: Set<string>;
  editingId: string | null;
  isPaintMode: boolean;
  isGroupMode: boolean;
  tabLocked: boolean;
  readOnly: boolean;
}): CanvasSelection {
  const {
    elements,
    selectedId,
    multiSelectedIds,
    editingId,
    isPaintMode,
    isGroupMode,
    tabLocked,
    readOnly,
  } = input;

  const memberIds = selectedId
    ? new Set(selectionMembers(elements, selectedId))
    : new Set<string>();
  const multiPrimaryId =
    multiSelectedIds.size > 0
      ? (elements.find((el) => multiSelectedIds.has(el.id))?.id ?? null)
      : null;
  const selected =
    (selectedId ? (elements.find((el) => el.id === selectedId) ?? null) : null) ??
    (multiPrimaryId ? (elements.find((el) => el.id === multiPrimaryId) ?? null) : null);
  const selectionScope: 'single' | 'multi' | 'group' =
    multiSelectedIds.size > 0 ? 'multi' : selectedId && memberIds.size > 1 ? 'group' : 'single';
  const selectedIsBoxed = selected ? isBoxed(selected) : false;
  const selectedIsGrouped = !!(selected && isBoxed(selected) && selected.groupId !== undefined);

  let selectionBounds: Bounds | null = null;
  if (selected) {
    if (selectedIsBoxed && memberIds.size > 0) {
      selectionBounds = unionBoxedBounds(elements, memberIds);
    } else {
      selectionBounds = elementBounds(selected, elements);
    }
  }

  const selectedLocked = selected ? selected.locked === true : false;
  const showPopover = !!(
    selected &&
    editingId !== selected.id &&
    !isPaintMode &&
    !isGroupMode &&
    multiSelectedIds.size === 0 &&
    !tabLocked
  );
  const showPlus = !!(
    selected &&
    selectedIsBoxed &&
    editingId !== selected.id &&
    !isPaintMode &&
    !isGroupMode &&
    !selectedLocked &&
    !tabLocked &&
    !readOnly
  );
  // Resize handles and arrow anchors share one predicate: a single
  // boxed selection, not being edited, in no edit-blocking mode.
  const handleVisible = (id: string) =>
    selectedIsBoxed &&
    id === selectedId &&
    memberIds.size === 1 &&
    editingId !== id &&
    !isPaintMode &&
    !isGroupMode &&
    !selectedLocked &&
    !tabLocked &&
    !readOnly;

  const unionResizeIds: Set<string> | null =
    multiSelectedIds.size > 1 ? multiSelectedIds : memberIds.size > 1 ? memberIds : null;
  const unionResizeBounds =
    unionResizeIds && selected ? unionBoxedBounds(elements, unionResizeIds) : null;
  const unionResizePrimaryId =
    multiSelectedIds.size > 1
      ? (multiPrimaryId ?? selectedId)
      : memberIds.size > 1
        ? selectedId
        : null;
  const showUnionResize =
    !!unionResizeBounds &&
    !!unionResizePrimaryId &&
    selectedIsBoxed &&
    editingId !== unionResizePrimaryId &&
    !isPaintMode &&
    !isGroupMode &&
    !selectedLocked &&
    !tabLocked &&
    !readOnly;

  return {
    memberIds,
    multiPrimaryId,
    selected,
    selectionScope,
    selectedIsBoxed,
    selectedIsGrouped,
    selectionBounds,
    selectedLocked,
    showPopover,
    showPlus,
    showHandlesFor: handleVisible,
    showAnchorsFor: handleVisible,
    unionResizeIds,
    unionResizeBounds,
    unionResizePrimaryId,
    showUnionResize,
  };
}
