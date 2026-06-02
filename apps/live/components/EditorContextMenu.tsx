'use client';

// Right-click context menu for the editor, lifted out of
// editor-page.tsx. Renders one of two menus depending on what was
// clicked: an element-scoped menu (duplicate / link / layer order /
// note / comment) or a canvas-scoped menu (change theme / canvas,
// auto-align, add shape / sticky).
//
// Purely presentational: every action is a callback prop, and each
// item closes the menu after firing (the close-then-act pattern the
// inline version used). The page owns the open/closed state + the
// handlers; this component only decides which items to show.

import { isBoxed, type Element, type ShapeKind } from '@livediagram/diagram';
import { ContextMenu, ContextMenuDivider } from '@/components/ContextMenu';
import {
  AutoAlignIcon,
  CanvasMenuIcon,
  CircleMenuIcon,
  CommentMenuIcon,
  DuplicateMenuIcon,
  LayerDownIcon,
  LayerUpIcon,
  LinkMenuIcon,
  NoteMenuIcon,
  PaletteMenuIcon,
  SquareMenuIcon,
  StickyMenuIcon,
} from '@/components/context-menu-icons';
import { MenuItem } from '@/components/PortalMenu';

// Cursor position + which menu to show. `element` carries the clicked
// element id; `canvas` is the empty-canvas right-click. Exported so
// the page can type its own context-menu state against it.
export type EditorContextMenuState =
  | { mode: 'element'; elementId: string; x: number; y: number }
  | { mode: 'canvas'; x: number; y: number };

type EditorContextMenuProps = {
  menu: EditorContextMenuState;
  // The active tab's elements — used to resolve the clicked element
  // (for the element menu) and read its link / note state.
  elements: Element[];
  onClose: () => void;
  onDuplicate: () => void;
  onLinkElement: (elementId: string) => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onOpenNote: (elementId: string) => void;
  onOpenComments: (elementId: string) => void;
  onChangeTheme: () => void;
  onChangeCanvas: () => void;
  onAutoAlign: () => void;
  onAddShape: (kind: ShapeKind) => void;
  onAddSticky: () => void;
};

export function EditorContextMenu(props: EditorContextMenuProps) {
  const { menu, elements, onClose } = props;
  const position = { x: menu.x, y: menu.y };

  if (menu.mode === 'element') {
    const target = elements.find((el) => el.id === menu.elementId);
    if (!target) return null;
    const boxed = isBoxed(target);
    return (
      <ContextMenu position={position} onClose={onClose}>
        <MenuItem
          icon={<DuplicateMenuIcon />}
          label="Duplicate"
          onClick={() => {
            props.onDuplicate();
            onClose();
          }}
        />
        <MenuItem
          icon={<LinkMenuIcon />}
          label={target.link ? 'Edit link' : 'Link Element'}
          onClick={() => {
            props.onLinkElement(target.id);
            onClose();
          }}
        />
        <ContextMenuDivider />
        <MenuItem
          icon={<LayerUpIcon />}
          label="Bring to front"
          onClick={() => {
            props.onBringToFront();
            onClose();
          }}
        />
        <MenuItem
          icon={<LayerDownIcon />}
          label="Send to back"
          onClick={() => {
            props.onSendToBack();
            onClose();
          }}
        />
        <ContextMenuDivider />
        {boxed ? (
          <MenuItem
            icon={<NoteMenuIcon />}
            label={target.note ? 'Edit note' : 'Add note'}
            onClick={() => {
              props.onOpenNote(target.id);
              onClose();
            }}
          />
        ) : null}
        <MenuItem
          icon={<CommentMenuIcon />}
          label="Comment"
          onClick={() => {
            props.onOpenComments(target.id);
            onClose();
          }}
        />
      </ContextMenu>
    );
  }

  return (
    <ContextMenu position={position} onClose={onClose}>
      <MenuItem
        icon={<PaletteMenuIcon />}
        label="Change Theme"
        onClick={() => {
          props.onChangeTheme();
          onClose();
        }}
      />
      <MenuItem
        icon={<CanvasMenuIcon />}
        label="Change Canvas"
        onClick={() => {
          props.onChangeCanvas();
          onClose();
        }}
      />
      <ContextMenuDivider />
      <MenuItem
        icon={<AutoAlignIcon />}
        label="Auto-align tab"
        onClick={() => {
          props.onAutoAlign();
          onClose();
        }}
      />
      <ContextMenuDivider />
      <MenuItem
        icon={<SquareMenuIcon />}
        label="Add square"
        onClick={() => {
          props.onAddShape('square');
          onClose();
        }}
      />
      <MenuItem
        icon={<CircleMenuIcon />}
        label="Add circle"
        onClick={() => {
          props.onAddShape('circle');
          onClose();
        }}
      />
      <MenuItem
        icon={<StickyMenuIcon />}
        label="Add sticky"
        onClick={() => {
          props.onAddSticky();
          onClose();
        }}
      />
    </ContextMenu>
  );
}
