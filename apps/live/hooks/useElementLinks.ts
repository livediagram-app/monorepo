// Element link picker + link actions, lifted out of editor-page.tsx.
// Bundles the picker's open/anchor state with the four handlers that
// read or write an element's `link` field:
//
// - `linkPickerOpenForId`: which element's link picker is open (null =
//   closed). Drives the lazy <TabLinkPicker> JSX gate in the page.
// - `linkPickerAnchorEl`: the DOM node the picker portal anchors to.
//   An effect keeps it pointed at the matching [data-element-id] node
//   so the picker stays attached as the canvas pans / zooms (same
//   trick as NotePopover).
// - `setLinkSelected` / `setDiagramLinkSelected` / `clearLinkSelected`:
//   write or drop the link on the current selection (history-committed).
// - `followLink`: navigate — switch tab for tab/element links, or full
//   page-load to another diagram via `openDiagram`.

import { useEffect, useState } from 'react';
import { type Element, type ElementLink, type Tab } from '@livediagram/diagram';

type ElementLinksDeps = {
  // The active selection resolved to ids. The link writers no-op on an
  // empty selection.
  currentSelectionIds: () => Set<string>;
  // History-aware element mutator (snapshots + emits the log).
  commit: (mapElements: (els: Element[]) => Element[]) => void;
  // Open tabs — followLink only switches to a tab that still exists.
  tabs: Tab[];
  setActiveId: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  setEditingId: (id: string | null) => void;
  setFormatSourceId: (id: string | null) => void;
  setGroupSourceId: (id: string | null) => void;
  // Full page-load navigation to another diagram (for diagram links).
  openDiagram: (id: string) => void;
};

export function useElementLinks(deps: ElementLinksDeps) {
  const {
    currentSelectionIds,
    commit,
    tabs,
    setActiveId,
    setSelectedId,
    setEditingId,
    setFormatSourceId,
    setGroupSourceId,
    openDiagram,
  } = deps;

  // Link-to-tab picker state. Lives at the page level (rather than
  // inside SelectionPopover, where the toolbar button used to host
  // it) so the right-click context menu can open it without having
  // to reach across components.
  const [linkPickerOpenForId, setLinkPickerOpenForId] = useState<string | null>(null);
  const [linkPickerAnchorEl, setLinkPickerAnchorEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (linkPickerOpenForId === null) {
      setLinkPickerAnchorEl(null);
      return;
    }
    const el = document.querySelector(`[data-element-id="${linkPickerOpenForId}"]`);
    setLinkPickerAnchorEl(el instanceof HTMLElement ? el : null);
  }, [linkPickerOpenForId]);

  const setLinkSelected = (tabId: string) => {
    const ids = currentSelectionIds();
    if (ids.size === 0) return;
    commit((els) =>
      els.map((el) => (ids.has(el.id) ? { ...el, link: { kind: 'tab' as const, tabId } } : el)),
    );
  };

  // Pick a diagram from the link picker's "Link to diagram" section.
  // Stores the diagram's name on the element alongside the id so the
  // badge / picker can show the destination without a round-trip.
  const setDiagramLinkSelected = (diagram: { id: string; name: string }) => {
    const ids = currentSelectionIds();
    if (ids.size === 0) return;
    commit((els) =>
      els.map((el) =>
        ids.has(el.id)
          ? { ...el, link: { kind: 'diagram' as const, diagramId: diagram.id, name: diagram.name } }
          : el,
      ),
    );
  };

  const clearLinkSelected = () => {
    const ids = currentSelectionIds();
    if (ids.size === 0) return;
    commit((els) =>
      els.map((el) => {
        if (!ids.has(el.id)) return el;
        const { link: _drop, ...rest } = el;
        return rest as typeof el;
      }),
    );
  };

  const followLink = (link: ElementLink) => {
    if (link.kind === 'tab' || link.kind === 'element') {
      if (!tabs.some((t) => t.id === link.tabId)) return;
      setActiveId(link.tabId);
      setSelectedId(null);
      setEditingId(null);
      setFormatSourceId(null);
      setGroupSourceId(null);
      return;
    }
    if (link.kind === 'diagram') {
      // Navigate to a different diagram entirely. Same shape as
      // openDiagram (which does a full-page load), so saves +
      // realtime room handoff land through the normal hydration
      // path on the destination route.
      openDiagram(link.diagramId);
    }
  };

  return {
    linkPickerOpenForId,
    setLinkPickerOpenForId,
    linkPickerAnchorEl,
    setLinkSelected,
    setDiagramLinkSelected,
    clearLinkSelected,
    followLink,
  };
}
