'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Brand } from '@livediagram/ui';
import { AuthControls } from '@/components/AuthControls';
import { useClerkApiBootstrap } from '@/hooks/useClerkApiBootstrap';
import {
  apiDismissSharedWith,
  apiListDiagrams,
  apiListSharedWith,
  type Folder,
  type SharedWithItem,
} from '@/lib/api-client';
import { clerkEnabled } from '@/lib/clerk-config';
import { useFolders } from '@/hooks/useFolders';
import { formatRelativeTime, useRelativeTimeTick } from '@/lib/relative-time';
import { getTheme, type ThemeId } from '@/lib/themes';

type DiagramItem = { id: string; name: string; folderId: string | null; savedAt: number };

// Full-page Explorer (item #12). Signed-in only — guests still have
// the floating Explorer panel on the editor / new-diagram routes,
// but the standalone page is gated on Clerk because the value of
// the dedicated page is "see everything I own across devices," and
// pure-guest identity is per-browser by definition. The non-Clerk
// deployment renders a permanent "auth not configured" notice (per
// spec/04's three-deployment-modes table).
export default function ExplorerPage() {
  const { authLoaded, isSignedIn, clerkUserId, clerkDisplayName } = useClerkApiBootstrap();
  const [diagrams, setDiagrams] = useState<DiagramItem[]>([]);
  const {
    folders,
    createFolder: hookCreateFolder,
    renameFolder,
    deleteFolder,
    refresh: refreshFolders,
  } = useFolders(clerkUserId ?? null, { autoLoad: false });
  const [shared, setShared] = useState<SharedWithItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Folder id mid-rename so the row swaps to an input until the
  // user commits or escapes. `null` means no folder is being
  // renamed right now.
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Explorer | livediagram';
  }, []);

  const refresh = useCallback(
    async (ownerId: string) => {
      setLoading(true);
      const [list, sharedList] = await Promise.all([
        apiListDiagrams(ownerId).catch(() => null),
        apiListSharedWith(ownerId).catch(() => null),
        refreshFolders(),
      ]);
      setDiagrams(list ?? []);
      setShared(sharedList ?? []);
      setLoading(false);
    },
    [refreshFolders],
  );

  useEffect(() => {
    if (!authLoaded) return;
    if (!isSignedIn || !clerkUserId) {
      setLoading(false);
      return;
    }
    void refresh(clerkUserId);
  }, [authLoaded, isSignedIn, clerkUserId, refresh]);

  const dismissShared = (diagramId: string) => {
    if (!clerkUserId) return;
    setShared((prev) => prev.filter((s) => s.id !== diagramId));
    void apiDismissSharedWith(clerkUserId, diagramId).catch(() => {});
  };

  // Local wrapper around the hook's create — drops the user into
  // rename mode immediately after the optimistic stub lands so they
  // can type the real name. On failure rolls back the renaming
  // state too.
  const createFolder = async () => {
    const created = await hookCreateFolder({});
    if (created) setRenamingFolderId(created.id);
  };

  // Commit a rename via the hook, but also pull the row out of
  // "renaming" mode regardless of whether the new name is empty
  // (empty name → cancel; non-empty → persist).
  const commitRename = (id: string, name: string) => {
    setRenamingFolderId(null);
    renameFolder(id, name);
  };

  if (!clerkEnabled) {
    return (
      <FullPageNotice
        title="Explorer needs auth"
        body="This deployment was built without Clerk, so there's no signed-in workspace to show here. The floating Explorer on the editor still works for per-browser guest sessions."
        cta={{ href: '/live/', label: 'Back to editor' }}
      />
    );
  }
  if (!authLoaded) {
    return null;
  }
  if (!isSignedIn) {
    return (
      <FullPageNotice
        title="Sign in to see your Explorer"
        body="Your owned diagrams, folders, and the diagrams others have shared with you all live here once you sign in."
        cta={{ href: '/live/sign-in/', label: 'Sign in' }}
      />
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-slate-50">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white/85 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Brand href="/" size="md" />
          <span className="text-sm font-medium text-slate-500">Explorer</span>
        </div>
        <AuthControls />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-32 pt-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Hi {clerkDisplayName ?? 'there'} —
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Everything you own and everything that&apos;s been shared with you.
          </p>
        </div>

        <Section
          title="Your diagrams"
          count={diagrams.length}
          accent={
            <Link
              href="/new"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700"
            >
              <PlusIcon />
              New diagram
            </Link>
          }
        >
          {loading ? (
            <SkeletonGrid />
          ) : diagrams.length === 0 ? (
            <EmptyState message="No diagrams yet." cta={{ href: '/new', label: 'Start one' }} />
          ) : (
            <Grid>
              {diagrams
                .slice()
                .sort((a, b) => b.savedAt - a.savedAt)
                .map((d) => (
                  <DiagramCard
                    key={d.id}
                    href={`/diagram/${d.id}`}
                    title={d.name}
                    savedAt={d.savedAt}
                  />
                ))}
            </Grid>
          )}
        </Section>

        <Section
          title="Folders"
          count={folders.length}
          accent={
            <button
              type="button"
              onClick={() => void createFolder()}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700"
            >
              <PlusIcon />
              New folder
            </button>
          }
        >
          {folders.length === 0 ? (
            <EmptyState message="No folders yet. Group related diagrams to keep things tidy." />
          ) : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {folders
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((f) => (
                  <FolderRow
                    key={f.id}
                    folder={f}
                    renaming={renamingFolderId === f.id}
                    onStartRename={() => setRenamingFolderId(f.id)}
                    onCommitRename={(name) => commitRename(f.id, name)}
                    onCancelRename={() => setRenamingFolderId(null)}
                    onDelete={() => deleteFolder(f.id)}
                  />
                ))}
            </ul>
          )}
        </Section>

        {shared.length > 0 ? (
          <Section title="Shared with you" count={shared.length}>
            <Grid>
              {shared.map((s) => (
                <SharedCard
                  key={s.id}
                  href={`/diagram/${s.id}?s=${encodeURIComponent(s.shareCode)}`}
                  title={s.name}
                  role={s.role}
                  savedAt={s.savedAt}
                  onDismiss={() => dismissShared(s.id)}
                />
              ))}
            </Grid>
          </Section>
        ) : null}
      </main>
      {/* Floating "new diagram" action. Lives at z-40 so it stays
          above the sticky header's z-30 backdrop. Aria-label is the
          source of truth — the glyph is decorative. */}
      <Link
        href="/new"
        aria-label="New diagram"
        className="fixed bottom-8 right-8 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/40"
      >
        <PlusIcon size={22} />
      </Link>
    </div>
  );
}

function Section({
  title,
  count,
  accent,
  children,
}: {
  title: string;
  count: number;
  accent?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
          <span className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-slate-200 px-1.5 text-[10px] font-medium text-slate-600">
            {count}
          </span>
        </h2>
        {accent}
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>;
}

// A larger, glanceable card: a thin themed accent bar across the
// top hints at "this is one of my diagrams" without needing a real
// thumbnail (we don't fetch tab snapshots client-side here). Title
// gets two lines of breathing room, the timestamp drops to a muted
// caption.
function DiagramCard({ href, title, savedAt }: { href: string; title: string; savedAt: number }) {
  useRelativeTimeTick();
  // Cheap deterministic accent per diagram — hash the id-ish title
  // into the theme palette so cards aren't all one colour. Keeps
  // /explorer feeling like a personal library without making a
  // network call for the active tab's theme.
  const accent = pickAccent(title);
  return (
    <li>
      <Link
        href={href}
        className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
      >
        <div className="h-1.5" style={{ backgroundColor: accent }} />
        <div className="p-4">
          <p className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-brand-700">
            {title}
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-wider text-slate-400">
            Updated {formatRelativeTime(Date.now() - savedAt)}
          </p>
        </div>
      </Link>
    </li>
  );
}

function SharedCard({
  href,
  title,
  role,
  savedAt,
  onDismiss,
}: {
  href: string;
  title: string;
  role: 'edit' | 'view';
  savedAt: number;
  onDismiss: () => void;
}) {
  useRelativeTimeTick();
  return (
    <li className="group relative">
      <Link
        href={href}
        className="block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
      >
        <div className="h-1.5 bg-emerald-400" />
        <div className="p-4">
          <p className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-brand-700">
            {title}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-400">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
              {role === 'edit' ? 'Edit' : 'View'}
            </span>
            <span>Updated {formatRelativeTime(Date.now() - savedAt)}</span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onDismiss();
        }}
        aria-label="Dismiss"
        className="absolute right-2.5 top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white/90 text-slate-500 opacity-0 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 focus:opacity-100 group-hover:opacity-100"
      >
        <CloseIcon />
      </button>
    </li>
  );
}

// One folder row — collapsed to a small pill in the grid. Click the
// label to rename inline; the trailing × deletes (server promotes
// any contents to Unsorted). Renaming is uncommitted until Enter or
// blur; Escape reverts.
function FolderRow({
  folder,
  renaming,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onDelete,
}: {
  folder: Folder;
  renaming: boolean;
  onStartRename: () => void;
  onCommitRename: (name: string) => void;
  onCancelRename: () => void;
  onDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(folder.name);

  useEffect(() => {
    if (renaming) {
      setDraft(folder.name);
      const t = window.setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
      return () => window.clearTimeout(t);
    }
  }, [renaming, folder.name]);

  return (
    <li className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:border-brand-300">
      <span className="text-slate-400">
        <FolderGlyph />
      </span>
      {renaming ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onCommitRename(draft)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onCommitRename(draft);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              onCancelRename();
            }
          }}
          className="min-w-0 flex-1 rounded border border-brand-300 bg-white px-1.5 py-0.5 text-sm text-slate-800 outline-none focus:border-brand-500"
        />
      ) : (
        <button
          type="button"
          onClick={onStartRename}
          className="min-w-0 flex-1 truncate text-left text-sm text-slate-700 transition hover:text-brand-700"
        >
          {folder.name}
        </button>
      )}
      {renaming ? null : (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete folder"
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-700 focus:opacity-100 group-hover:opacity-100"
        >
          <CloseIcon />
        </button>
      )}
    </li>
  );
}

function SkeletonGrid() {
  return (
    <Grid>
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
        />
      ))}
    </Grid>
  );
}

function EmptyState({ message, cta }: { message: string; cta?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <p className="text-sm text-slate-500">{message}</p>
      {cta ? (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-brand-600"
        >
          <PlusIcon />
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}

function FullPageNotice({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <Brand href="/" size="md" />
        <h1 className="mt-4 text-lg font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{body}</p>
        <Link
          href={cta.href}
          className="mt-5 inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-brand-600"
        >
          {cta.label}
        </Link>
      </div>
    </div>
  );
}

function FolderGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-400"
      aria-hidden
    >
      <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h2.4a1 1 0 0 1 .77.37l1 1.24A1 1 0 0 0 8.45 5h4.05A1.5 1.5 0 0 1 14 6.5v5A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5v-7z" />
    </svg>
  );
}

function PlusIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M3.5 3.5l7 7M3.5 10.5l7-7" />
    </svg>
  );
}

// Deterministic accent picker — hashes the diagram name into the
// theme palette so each card gets a stable colour stripe without
// needing the active tab data. Same string → same colour across
// renders, which keeps the grid visually settled.
function pickAccent(seed: string): string {
  const themeIds: ThemeId[] = [
    'brand',
    'forest',
    'sunset',
    'lavender',
    'ocean',
    'crimson',
    'rose',
    'indigo',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const id = themeIds[hash % themeIds.length]!;
  const theme = getTheme(id);
  return theme.elementStroke ?? theme.patternColor ?? '#0ea5e9';
}
