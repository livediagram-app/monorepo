'use client';

// Card view for the Explorer page (spec/67): the same folders + diagrams
// the ListView shows, as a responsive grid of cards with a large SVG
// snapshot. Takes the SAME props as ListView so ExplorerPane can swap the
// two on the view toggle without re-wiring callbacks. Badge + actions
// menu come from diagram-row-shared, so list and card can't drift.

import Link from 'next/link';
import { useRef, useState, type ReactNode } from 'react';
import { relativeSince, useRelativeTimeTick } from '@/lib/relative-time';
import { InlineRenameInput } from '@/components/primitives/InlineRenameInput';
import { MenuItem, PortalMenu } from '@/components/primitives/PortalMenu';
import { DiagramThumbnail } from '@/components/panels/DiagramThumbnail';
import {
  EllipsisIcon,
  FolderIcon,
  MenuFolderIcon,
  MenuPencilIcon,
  MenuTrashIcon,
  PlusIcon,
  SparkleIcon,
} from './icons';
import { DiagramActionsMenu, hrefForDiagram, VisibilityBadge } from './diagram-row-shared';
import type { Folder } from '@/lib/api-client';
import type { PaneDiagram } from './views';

type FolderActions = (
  f: Folder,
  anchor: HTMLElement | null,
) => { rename: () => void; newSubfolder: () => void; move: () => void; delete: () => void };

export function CardView({
  folders,
  diagrams,
  ownerId,
  showUnsortedRow,
  unsortedCount,
  onOpenUnsorted,
  showGeneratedRow = false,
  generatedCount = 0,
  onOpenGenerated,
  onOpenFolder,
  onCommitRenameFolder,
  onCancelRenameFolder,
  renamingFolderId,
  renamingDiagramId,
  onCommitRenameDiagram,
  onCancelRenameDiagram,
  folderActions,
  onStartRenameDiagram,
  onDuplicateDiagram,
  onDeleteDiagram,
  onMoveDiagram,
  onDismissShared,
  childrenCount,
  diagramsCount,
  showOwner = false,
}: {
  folders: Folder[];
  diagrams: PaneDiagram[];
  ownerId: string | null;
  showUnsortedRow: boolean;
  unsortedCount: number;
  onOpenUnsorted: () => void;
  showGeneratedRow?: boolean;
  generatedCount?: number;
  onOpenGenerated?: () => void;
  onOpenFolder: (id: string) => void;
  onCommitRenameFolder: (id: string, name: string) => void;
  onCancelRenameFolder: () => void;
  renamingFolderId: string | null;
  renamingDiagramId: string | null;
  onCommitRenameDiagram: (id: string, name: string) => void;
  onCancelRenameDiagram: () => void;
  folderActions: FolderActions;
  onStartRenameDiagram: (id: string) => void;
  onDuplicateDiagram: (id: string) => void;
  onDeleteDiagram: (id: string) => void;
  onMoveDiagram: (id: string, anchor: HTMLElement | null) => void;
  onDismissShared?: (id: string) => void;
  childrenCount: (id: string) => number;
  diagramsCount: (id: string) => number;
  showOwner?: boolean;
}) {
  useRelativeTimeTick();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {showUnsortedRow ? (
        <SyntheticFolderCard
          icon={<FolderIcon open={false} />}
          label="Unsorted"
          count={unsortedCount}
          onOpen={onOpenUnsorted}
        />
      ) : null}
      {showGeneratedRow && onOpenGenerated ? (
        <SyntheticFolderCard
          icon={<SparkleIcon />}
          label="Generated"
          count={generatedCount}
          onOpen={onOpenGenerated}
        />
      ) : null}
      {folders.map((f) => (
        <FolderCard
          key={f.id}
          folder={f}
          renaming={renamingFolderId === f.id}
          childCount={childrenCount(f.id) + diagramsCount(f.id)}
          onOpen={() => onOpenFolder(f.id)}
          onCommitRename={(name) => onCommitRenameFolder(f.id, name)}
          onCancelRename={onCancelRenameFolder}
          getActions={(anchor) => folderActions(f, anchor)}
        />
      ))}
      {diagrams.map((d) => (
        <DiagramCard
          key={d.id}
          diagram={d}
          ownerId={ownerId}
          showOwner={showOwner}
          renaming={renamingDiagramId === d.id}
          onStartRename={() => onStartRenameDiagram(d.id)}
          onCommitRename={(name) => onCommitRenameDiagram(d.id, name)}
          onCancelRename={onCancelRenameDiagram}
          onDuplicate={() => onDuplicateDiagram(d.id)}
          onDelete={() => onDeleteDiagram(d.id)}
          onMove={(anchor) => onMoveDiagram(d.id, anchor)}
          onDismiss={d.shared && onDismissShared ? () => onDismissShared(d.id) : undefined}
        />
      ))}
    </div>
  );
}

const cardShell =
  'group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-brand-300 hover:shadow dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-500/50';
const previewArea =
  'flex aspect-[16/10] w-full items-center justify-center border-b border-slate-100 bg-slate-50/70 dark:border-slate-700/60 dark:bg-slate-900/30';

function DiagramCard({
  diagram,
  ownerId,
  showOwner,
  renaming,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onDuplicate,
  onDelete,
  onMove,
  onDismiss,
}: {
  diagram: PaneDiagram;
  ownerId: string | null;
  showOwner: boolean;
  renaming: boolean;
  onStartRename: () => void;
  onCommitRename: (name: string) => void;
  onCancelRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMove: (anchor: HTMLElement | null) => void;
  onDismiss?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const href = hrefForDiagram(diagram);
  const ownerLabel = showOwner
    ? (diagram.team?.name ??
      diagram.shared?.ownerName ??
      (diagram.shared ? 'Unknown owner' : 'You'))
    : null;

  return (
    <div
      className={cardShell}
      onContextMenu={
        renaming
          ? undefined
          : (e) => {
              e.preventDefault();
              setMenuOpen(true);
            }
      }
    >
      {/* Larger snapshot. The whole preview links to the diagram unless
          we're renaming (then it's inert so the input keeps focus). */}
      {renaming ? (
        <span className={previewArea}>
          <DiagramThumbnail
            ownerId={ownerId}
            diagramId={diagram.id}
            version={diagram.savedAt}
            shareCode={diagram.shared?.shareCode}
            className="h-full w-full"
          />
        </span>
      ) : (
        <Link href={href} className={previewArea} aria-label={`Open ${diagram.name}`}>
          <DiagramThumbnail
            ownerId={ownerId}
            diagramId={diagram.id}
            version={diagram.savedAt}
            shareCode={diagram.shared?.shareCode}
            className="h-full w-full"
          />
        </Link>
      )}

      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <div className="flex items-start gap-1">
          {renaming ? (
            <InlineRenameInput
              initial={diagram.name}
              onCommit={onCommitRename}
              onCancel={onCancelRename}
              className="min-w-0 flex-1 rounded border border-brand-300 bg-white px-1 py-0 text-sm font-medium text-slate-900 dark:border-brand-500/50 dark:bg-slate-900 dark:text-slate-100"
            />
          ) : (
            <Link
              href={href}
              className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900 transition hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-300"
            >
              {diagram.name}
            </Link>
          )}
          {renaming ? null : (
            <button
              ref={menuRef}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((o) => !o);
              }}
              aria-label={`Menu for ${diagram.name}`}
              className="-mr-1 -mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <EllipsisIcon />
            </button>
          )}
        </div>
        {/* Keep every column the list shows: owner, visibility, updated. */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <VisibilityBadge diagram={diagram} />
          <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {relativeSince(diagram.savedAt)}
          </span>
        </div>
        {ownerLabel ? (
          <span className="truncate text-xs text-slate-500 dark:text-slate-400">{ownerLabel}</span>
        ) : null}
      </div>
      {menuOpen ? (
        <DiagramActionsMenu
          diagram={diagram}
          anchor={menuRef.current}
          onClose={() => setMenuOpen(false)}
          onStartRename={onStartRename}
          onDuplicate={onDuplicate}
          onMove={onMove}
          onDelete={onDelete}
          onDismiss={onDismiss}
        />
      ) : null}
    </div>
  );
}

function FolderCard({
  folder,
  childCount,
  renaming,
  onOpen,
  onCommitRename,
  onCancelRename,
  getActions,
}: {
  folder: Folder;
  childCount: number;
  renaming: boolean;
  onOpen: () => void;
  onCommitRename: (name: string) => void;
  onCancelRename: () => void;
  getActions: (anchor: HTMLElement | null) => {
    rename: () => void;
    newSubfolder: () => void;
    move: () => void;
    delete: () => void;
  };
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const actions = getActions(menuRef.current);
  return (
    <div
      className={cardShell}
      onContextMenu={
        renaming
          ? undefined
          : (e) => {
              e.preventDefault();
              setMenuOpen(true);
            }
      }
    >
      <button
        type="button"
        onClick={onOpen}
        onDoubleClick={onOpen}
        className={`${previewArea} text-brand-400 dark:text-brand-300`}
        aria-label={`Open folder ${folder.name}`}
      >
        <span className="[&_svg]:h-9 [&_svg]:w-9">
          <FolderIcon open={false} />
        </span>
      </button>
      <div className="flex items-start gap-1 p-2.5">
        {renaming ? (
          <InlineRenameInput
            initial={folder.name}
            onCommit={onCommitRename}
            onCancel={onCancelRename}
            className="min-w-0 flex-1 rounded border border-brand-300 bg-white px-1 py-0 text-sm font-medium text-slate-900 dark:border-brand-500/50 dark:bg-slate-900 dark:text-slate-100"
          />
        ) : (
          <button
            type="button"
            onClick={onOpen}
            className="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-900 transition hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-300"
          >
            {folder.name}
            {childCount > 0 ? (
              <span className="ml-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-slate-200 px-1 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {childCount}
              </span>
            ) : null}
          </button>
        )}
        {renaming ? null : (
          <button
            ref={menuRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            aria-label={`Menu for folder ${folder.name}`}
            className="-mr-1 -mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <EllipsisIcon />
          </button>
        )}
      </div>
      {menuOpen ? (
        <PortalMenu anchor={menuRef.current} placement="below" onClose={() => setMenuOpen(false)}>
          <MenuItem
            icon={<MenuPencilIcon />}
            label="Rename"
            onClick={() => {
              actions.rename();
              setMenuOpen(false);
            }}
          />
          <MenuItem
            icon={<PlusIcon />}
            label="New subfolder"
            onClick={() => {
              actions.newSubfolder();
              setMenuOpen(false);
            }}
          />
          <MenuItem
            icon={<MenuFolderIcon />}
            label="Change Folder"
            onClick={() => {
              actions.move();
              setMenuOpen(false);
            }}
          />
          <MenuItem
            icon={<MenuTrashIcon />}
            label="Delete"
            danger
            onClick={() => {
              actions.delete();
              setMenuOpen(false);
            }}
          />
        </PortalMenu>
      ) : null}
    </div>
  );
}

// Unsorted / Generated: a folder-shaped card with no actions (it's a
// synthetic view, not a real folders row).
function SyntheticFolderCard({
  icon,
  label,
  count,
  onOpen,
}: {
  icon: ReactNode;
  label: string;
  count: number;
  onOpen: () => void;
}) {
  return (
    <button type="button" onClick={onOpen} className={`${cardShell} text-left`}>
      <span className={`${previewArea} text-brand-400 dark:text-brand-300`}>
        <span className="[&_svg]:h-9 [&_svg]:w-9">{icon}</span>
      </span>
      <span className="flex items-center gap-1.5 p-2.5">
        <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
          {label}
        </span>
        {count > 0 ? (
          <span className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-slate-200 px-1 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {count}
          </span>
        ) : null}
      </span>
    </button>
  );
}
