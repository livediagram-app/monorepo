import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Tab } from '@livediagram/diagram';
import { readLocalStorageSafe, writeLocalStorageSafe } from '@/lib/local-storage-safe';

// One folder group in the tab bar (spec/30). Collapsed it shows just
// the folder name + member count; expanded it shows the chip plus the
// member tab pills, which are rendered by the parent via `renderTab`
// so they're byte-for-byte the same pills loose tabs use (selection,
// presence, drag-reorder, ellipsis menu). The folder is a contiguous
// run of same-folder tabs — membership and ordering are owned upstream;
// this component only handles the collapse affordance + rename.

// Collapse state is UI-only and per-browser: never persisted to D1,
// never broadcast. Keyed by diagram + folder so two diagrams (or two
// folders) don't share a toggle.
function collapseKey(diagramId: string, folder: string): string {
  return `tabfolder:${diagramId}:${folder}`;
}

type TabFolderChipProps = {
  name: string;
  tabs: Tab[];
  activeId: string;
  diagramId: string;
  readOnly: boolean;
  // Render one member pill — the parent's per-tab renderer, reused so
  // folder members behave exactly like loose tabs.
  renderTab: (tab: Tab) => ReactNode;
  // Drop a dragged tab next to this folder. Reorder-only (membership is
  // menu-only, spec/30); the parent normalizes afterwards.
  onReorder: (sourceId: string, targetId: string) => void;
  onRename: (oldName: string, newName: string) => void;
};

export function TabFolderChip({
  name,
  tabs,
  activeId,
  diagramId,
  readOnly,
  renderTab,
  onReorder,
  onRename,
}: TabFolderChipProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Hydrate the persisted collapse state after mount (localStorage is
  // client-only; reading during render would desync SSR/CSR markup).
  useEffect(() => {
    setCollapsed(readLocalStorageSafe(collapseKey(diagramId, name)) === '1');
  }, [diagramId, name]);

  const containsActive = tabs.some((t) => t.id === activeId);
  // Force-expand while the active tab lives in this folder so the user
  // can always see where they are (spec/30 edge case).
  const showMembers = !collapsed || containsActive;

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    writeLocalStorageSafe(collapseKey(diagramId, name), next ? '1' : '0');
  };

  return (
    <div
      className={`flex shrink-0 items-center gap-1 rounded-md border border-slate-200 px-1 py-0.5 dark:border-slate-700 ${
        dragOver ? 'ring-2 ring-brand-400 ring-offset-1' : ''
      }`}
      onDragOver={
        readOnly
          ? undefined
          : (e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (!dragOver) setDragOver(true);
            }
      }
      onDragLeave={() => dragOver && setDragOver(false)}
      onDrop={
        readOnly
          ? undefined
          : (e) => {
              e.preventDefault();
              setDragOver(false);
              const src = e.dataTransfer.getData('text/plain');
              // Reorder relative to the folder's first member so the
              // dropped tab lands next to the run (it does NOT join the
              // folder — membership is menu-only).
              const firstMember = tabs[0];
              if (src && firstMember && src !== firstMember.id) onReorder(src, firstMember.id);
            }
      }
    >
      {editing && !readOnly ? (
        <FolderNameEditor
          initial={name}
          onCommit={(next) => {
            const trimmed = next.trim();
            if (trimmed && trimmed !== name) onRename(name, trimmed);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <button
          type="button"
          onClick={toggle}
          onDoubleClick={readOnly ? undefined : () => setEditing(true)}
          title={collapsed ? `Expand folder "${name}"` : `Collapse folder "${name}"`}
          className="flex items-center gap-1 rounded px-1.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ChevronIcon open={showMembers} />
          <FolderGlyph />
          <span>{name}</span>
          <span className="text-slate-400 dark:text-slate-500">{tabs.length}</span>
        </button>
      )}
      {showMembers ? <div className="flex items-center gap-1">{tabs.map(renderTab)}</div> : null}
    </div>
  );
}

function FolderNameEditor({
  initial,
  onCommit,
  onCancel,
}: {
  initial: string;
  onCommit: (name: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (node) {
      node.focus();
      node.select();
    }
  }, []);
  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onCommit(value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onCommit(value);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      }}
      className="w-28 rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-800 outline-none ring-1 ring-brand-300 dark:bg-slate-800 dark:text-slate-100 dark:ring-brand-400"
    />
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 120ms' }}
    >
      <path d="M4 2.5L8 6L4 9.5" />
    </svg>
  );
}

function FolderGlyph() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 4.5h4l1.25 1.5H14v6.5H2z" />
    </svg>
  );
}
