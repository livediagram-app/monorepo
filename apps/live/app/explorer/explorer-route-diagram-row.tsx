'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { relativeSince, useRelativeTimeTick } from '@/lib/relative-time';
import { InlineRenameInput } from '@/components/primitives/InlineRenameInput';
import { MenuItem, PortalMenu } from '@/components/primitives/PortalMenu';
import {
  CloseIcon,
  DiagramIcon,
  EllipsisIcon,
  MenuDuplicateIcon,
  MenuFolderIcon,
  MenuPencilIcon,
  MenuTrashIcon,
  TeamIcon,
} from './icons';
import type { PaneDiagram } from './views';

// One diagram row in the full-page /explorer list (open / rename / move /
// duplicate / delete + the drag source). Split out of views.tsx; rendered
// by FolderRow + the unsorted list there.
export function DiagramRow({
  diagram,
  renaming,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onDuplicate,
  onDelete,
  onMove,
  onDismiss,
  showOwner = false,
}: {
  diagram: PaneDiagram;
  renaming: boolean;
  onStartRename: () => void;
  onCommitRename: (name: string) => void;
  onCancelRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMove: (anchor: HTMLElement | null) => void;
  // Shared-row menu action (spec/35): drop it from "Shared with me".
  onDismiss?: () => void;
  // Adds the desktop Owner cell ("You", the team name, or the sharer).
  showOwner?: boolean;
}) {
  useRelativeTimeTick();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  // Team rows expose member-valid actions (move within the team /
  // remove); shared rows are read-only bar "Dismiss" (spec/35).
  const isTeamRow = !!diagram.team;
  const isSharedRow = !!diagram.shared;
  // Shared diagrams open on the visitor URL (the owner-only path 404s
  // for a non-owner); everything else opens on the owned path.
  const href = diagram.shared
    ? `/diagram/${diagram.id}?s=${encodeURIComponent(diagram.shared.shareCode)}`
    : `/diagram/${diagram.id}`;

  const titleNode = renaming ? (
    <InlineRenameInput
      initial={diagram.name}
      onCommit={onCommitRename}
      onCancel={onCancelRename}
      className="rounded border border-brand-300 bg-white px-1 py-0 text-sm font-medium text-slate-900 dark:border-brand-500/50 dark:bg-slate-900 dark:text-slate-100"
    />
  ) : (
    <Link
      href={href}
      className="truncate text-sm font-medium text-slate-900 transition hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-300"
    >
      {diagram.name}
    </Link>
  );

  return (
    <li
      className={
        'group grid grid-cols-[1fr_140px_40px] items-center gap-2 px-4 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-700 ' +
        (showOwner
          ? 'sm:grid-cols-[1fr_110px_90px_140px_40px]'
          : 'sm:grid-cols-[1fr_90px_140px_40px]')
      }
      // Right-click anywhere on the row opens the same actions menu as the
      // ellipsis button (anchored to it).
      onContextMenu={
        renaming
          ? undefined
          : (e) => {
              e.preventDefault();
              setMenuOpen(true);
            }
      }
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-slate-400 dark:text-slate-500">
          <DiagramIcon />
        </span>
        {titleNode}
      </span>
      {showOwner ? (
        <span className="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">
          {diagram.team?.name ??
            diagram.shared?.ownerName ??
            (isSharedRow ? 'Unknown owner' : 'You')}
        </span>
      ) : null}
      <span className="hidden sm:block">
        {isSharedRow ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
            <svg
              width="9"
              height="9"
              viewBox="0 0 9 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="2" cy="4.5" r="1.4" />
              <circle cx="7" cy="2" r="1.2" />
              <circle cx="7" cy="7" r="1.2" />
              <path d="M3.2 3.8L5.9 2.5M3.2 5.2L5.9 6.5" />
            </svg>
            Shared
          </span>
        ) : isTeamRow ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-700 ring-1 ring-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/30">
            <svg
              width="9"
              height="9"
              viewBox="0 0 9 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              aria-hidden
            >
              <circle cx="3.2" cy="3.2" r="1.4" />
              <path d="M1.2 7.8c.3-1.4 1-2.1 2-2.1s1.7.7 2 2.1" />
              <circle cx="6.6" cy="3.6" r="1.1" />
              <path d="M6.3 5.7c.9.1 1.5.7 1.7 1.8" />
            </svg>
            Team
          </span>
        ) : diagram.shareCode ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
            <svg
              width="9"
              height="9"
              viewBox="0 0 9 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="2" cy="4.5" r="1.4" />
              <circle cx="7" cy="2" r="1.2" />
              <circle cx="7" cy="7" r="1.2" />
              <path d="M3.2 3.8L5.9 2.5M3.2 5.2L5.9 6.5" />
            </svg>
            Shared
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
            <svg
              width="9"
              height="9"
              viewBox="0 0 9 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="1.6" y="4" width="5.8" height="3.6" rx="0.9" />
              <path d="M3 4V2.9a1.5 1.5 0 0 1 3 0V4" />
            </svg>
            Private
          </span>
        )}
      </span>
      <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {relativeSince(diagram.savedAt)}
      </span>
      {renaming ? (
        <span />
      ) : (
        <button
          ref={menuRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((o) => !o);
          }}
          aria-label={`Menu for ${diagram.name}`}
          className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <EllipsisIcon />
        </button>
      )}
      {menuOpen && isSharedRow ? (
        // Shared-with-me rows: open on the share link or dismiss from
        // the list (spec/35). The diagram isn't the viewer's to rename
        // / move / delete.
        <PortalMenu anchor={menuRef.current} placement="below" onClose={() => setMenuOpen(false)}>
          <MenuItem
            icon={<DiagramIcon />}
            label="Open"
            onClick={() => {
              window.location.assign(href);
            }}
          />
          <MenuItem
            icon={<CloseIcon />}
            label="Dismiss"
            onClick={() => {
              onDismiss?.();
              setMenuOpen(false);
            }}
          />
        </PortalMenu>
      ) : null}
      {menuOpen && !isSharedRow ? (
        // One menu for owned + team rows (spec/35): a team diagram is
        // managed by every joined member, so the full set applies.
        // Team rows additionally get "Open Team" to jump to the
        // library page at this diagram's folder.
        <PortalMenu anchor={menuRef.current} placement="below" onClose={() => setMenuOpen(false)}>
          <MenuItem
            icon={<MenuPencilIcon />}
            label="Rename"
            onClick={() => {
              onStartRename();
              setMenuOpen(false);
            }}
          />
          <MenuItem
            icon={<MenuDuplicateIcon />}
            label="Duplicate"
            onClick={() => {
              onDuplicate();
              setMenuOpen(false);
            }}
          />
          <MenuItem
            icon={<MenuFolderIcon />}
            label="Change Folder"
            onClick={() => {
              onMove(menuRef.current);
              setMenuOpen(false);
            }}
          />
          {isTeamRow ? (
            <MenuItem
              icon={<TeamIcon />}
              label="Open Team"
              onClick={() => {
                window.location.assign(
                  `/explorer/team?id=${encodeURIComponent(diagram.team!.id)}${
                    diagram.folderId ? `&folder=${encodeURIComponent(diagram.folderId)}` : ''
                  }`,
                );
              }}
            />
          ) : null}
          <MenuItem
            icon={<MenuTrashIcon />}
            label="Delete"
            danger
            onClick={() => {
              onDelete();
              setMenuOpen(false);
            }}
          />
        </PortalMenu>
      ) : null}
    </li>
  );
}
