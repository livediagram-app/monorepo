'use client';

// Move-destination picker, styled like the LinkPickerDialog (centred
// modal, brand chrome, scrollable row list). Replaces the tiny
// anchored PortalMenu the move flow used to squeeze its destinations
// into: with nested folders (breadcrumb paths) and team libraries
// (spec/35) the list outgrew a popover.
//
// Shared by the /explorer page (diagram + folder moves, team
// destinations) and the editor's floating Explorer panel (diagram
// moves only). Portal-rendered so `position: fixed` escapes
// transformed ancestors like the floating panel.
//
// Generic by design: the caller supplies the destination rows
// (already cycle-filtered + breadcrumb-pathed) and receives the pick
// via the callbacks; this component only renders and filters.

import { useState } from 'react';
import { Portal } from './Portal';
import { useEscape } from '@/hooks/useEscape';
import { matches } from '@/lib/search';

type MoveToFolderDialogProps = {
  // What's being moved, for the header ("Move "Roadmap 2026"").
  subjectName: string;
  // Tweaks the copy: a folder move re-parents, a diagram move files.
  subjectKind: 'diagram' | 'folder';
  // Label for the root destination: "All diagrams" on the explorer
  // page, "Unsorted" in the floating panel (same bucket, the name
  // each surface already uses for it).
  rootLabel: string;
  // Folder destinations by breadcrumb path ("Marketing / Q3"),
  // pre-filtered by the caller (a folder move excludes its own
  // subtree) and pre-sorted.
  folders: { id: string; path: string }[];
  // Team libraries (spec/35). Only diagram moves on the explorer
  // page pass these; omitted = no Teams section.
  teams?: { id: string; name: string }[];
  // Folders inside those team libraries, so a diagram can land in a
  // team folder in one move (rather than team root first, re-folder
  // second). Rendered under each team's root row.
  teamFolders?: { id: string; path: string; teamId: string; teamName: string }[];
  // The subject's current placement; that row gets a "current" chip
  // and is disabled (moving there is a no-op). null = root.
  currentFolderId?: string | null;
  onPickFolder: (folderId: string | null) => void;
  // folderId null = the team's Unsorted root.
  onPickTeam?: (teamId: string, folderId: string | null) => void;
  onClose: () => void;
};

export function MoveToFolderDialog({
  subjectName,
  subjectKind,
  rootLabel,
  folders,
  teams,
  teamFolders,
  currentFolderId,
  onPickFolder,
  onPickTeam,
  onClose,
}: MoveToFolderDialogProps) {
  // Filter box: with a real folder tree the flat path list gets long;
  // same case-insensitive substring matcher the search panel uses.
  const [query, setQuery] = useState('');
  useEscape(onClose, { capture: true, stopPropagation: true });

  const folderRows = folders.filter((f) => matches(query, f.path));
  // Team destinations: each team's root, then its folders as
  // "<Team> / <path>" rows, so a diagram lands in a team folder in
  // one move. The team name matches its whole block.
  const teamRows = (teams ?? []).flatMap((t) => {
    const inside = (teamFolders ?? [])
      .filter((f) => f.teamId === t.id)
      .map((f) => ({
        key: `${t.id}:${f.id}`,
        teamId: t.id,
        folderId: f.id as string | null,
        label: `${t.name} / ${f.path}`,
      }));
    return [
      { key: t.id, teamId: t.id, folderId: null as string | null, label: t.name },
      ...inside,
    ].filter((row) => matches(query, row.label));
  });
  const rootVisible = matches(query, rootLabel);
  const empty = !rootVisible && folderRows.length === 0 && teamRows.length === 0;

  const pickFolder = (id: string | null) => {
    onPickFolder(id);
    onClose();
  };
  const pickTeam = (teamId: string, folderId: string | null) => {
    onPickTeam?.(teamId, folderId);
    onClose();
  };

  const sectionLabel =
    'px-1 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400';

  return (
    <Portal>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm dark:bg-slate-950/60"
      >
        <div className="pointer-events-auto flex max-h-[80vh] w-[28rem] max-w-[92%] animate-fly-up-in flex-col rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 pb-3 pt-5 dark:border-slate-800">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                Move &ldquo;{subjectName}&rdquo;
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {subjectKind === 'folder'
                  ? 'Pick the folder it should live inside.'
                  : 'Pick a destination folder or team.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="border-b border-slate-100 px-5 py-2.5 dark:border-slate-800">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter destinations..."
              aria-label="Filter destinations"
              className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2">
            {empty ? (
              <p className="px-1 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No destination matches.
              </p>
            ) : (
              <>
                {rootVisible ? (
                  <DestinationRow
                    icon={<RootIcon />}
                    label={rootLabel}
                    isCurrent={currentFolderId === null}
                    onClick={() => pickFolder(null)}
                  />
                ) : null}
                {folderRows.length > 0 ? (
                  <>
                    <p className={sectionLabel}>Folders</p>
                    {folderRows.map((f) => (
                      <DestinationRow
                        key={f.id}
                        icon={<FolderIcon />}
                        label={f.path}
                        isCurrent={currentFolderId === f.id}
                        onClick={() => pickFolder(f.id)}
                      />
                    ))}
                  </>
                ) : null}
                {teamRows.length > 0 ? (
                  <>
                    <p className={sectionLabel}>Teams</p>
                    {teamRows.map((t) => (
                      <DestinationRow
                        key={t.key}
                        icon={t.folderId === null ? <TeamIcon /> : <FolderIcon />}
                        label={t.label}
                        isCurrent={false}
                        onClick={() => pickTeam(t.teamId, t.folderId)}
                      />
                    ))}
                  </>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}

function DestinationRow({
  icon,
  label,
  isCurrent,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isCurrent: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isCurrent}
      className={
        isCurrent
          ? 'flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-slate-400 dark:text-slate-500'
          : 'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-slate-700 transition hover:bg-brand-50 hover:text-brand-800 dark:text-slate-200 dark:hover:bg-brand-500/15 dark:hover:text-brand-100'
      }
    >
      <span className="shrink-0 text-slate-400 dark:text-slate-500" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {isCurrent ? (
        <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-700 dark:text-slate-300">
          current
        </span>
      ) : null}
    </button>
  );
}

function FolderIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden
    >
      <path d="M2.5 4.5h4l1.5 1.5h5.5v6.5a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function RootIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden
    >
      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
      <path d="M2.5 6h11" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="6" cy="6" r="2.2" />
      <path d="M2.5 13c.5-2.3 1.7-3.5 3.5-3.5s3 1.2 3.5 3.5" />
      <circle cx="11.5" cy="6.5" r="1.8" />
      <path d="M11 9.6c1.6.1 2.6 1.2 3 3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M3.5 3.5l7 7M3.5 10.5l7-7" />
    </svg>
  );
}
