'use client';

import { useEffect, useMemo, useState } from 'react';
import { Brand } from '@livediagram/ui';
import type { TelemetryCount, TelemetrySummary, TelemetryWindowKey } from '@livediagram/api-schema';

// Same origin as the editor + api under the router (livediagram.app).
// An origin-relative '/api' is correct even though this app is served
// under '/telemetry' (basePath doesn't rewrite absolute fetch paths).
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '/api';

const WINDOWS: { key: TelemetryWindowKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'last7', label: 'Last 7 days' },
  { key: 'last30', label: 'Last month' },
];

// One-line plain-language explanation per category, shown under the
// group heading so visitors can read the dashboard cold without
// knowing the product. Kept short so the layout stays scannable.
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Diagram:
    'Whole-diagram lifecycle: creating, sharing, joining, exporting, undo/redo, moving between folders.',
  Element:
    'Things on the canvas: shapes, text, stickies, arrows, images. Add, delete, group, link, layer order.',
  Tab: 'Per-tab actions: create, rename, reorder, lock, import JSON, clear content, auto-align.',
  Theme: 'Diagram theme switches (the canvas-content palette: brand, slate, mint, etc.).',
  Canvas: 'Canvas background pattern changes and zoom controls (in, out, fit, reset).',
  Template: 'Template scaffolds picked when starting a new diagram or seeding a fresh tab.',
  Comment: 'Per-element comment threads: add, delete, resolve, reopen, open the popover.',
  Note: 'Per-element notes (a single paragraph, no thread): add, edit, delete, open the popover.',
  Search: 'Global search panel: open, query, picked-result kind.',
  UI: 'Editor chrome: light/dark toggle, dialogs (Settings, Shortcuts, Share, Activity), share-link copy, welcome dismiss.',
  Folder: 'Diagram folders: create, rename, delete, re-parent.',
  Session: 'Account-level events when Clerk auth is configured: sign-in, sign-up, sign-out.',
};

type Group = { category: string; subtotal: number; items: TelemetryCount[] };

function groupByCategory(rows: TelemetryCount[]): Group[] {
  const map = new Map<string, TelemetryCount[]>();
  for (const row of rows) {
    const arr = map.get(row.category) ?? [];
    arr.push(row);
    map.set(row.category, arr);
  }
  return [...map.entries()]
    .map(([category, items]) => ({
      category,
      items: [...items].sort((a, b) => b.count - a.count),
      subtotal: items.reduce((sum, i) => sum + i.count, 0),
    }))
    .sort((a, b) => b.subtotal - a.subtotal);
}

function eventLabel(row: TelemetryCount): string {
  return row.type ? `${row.action} · ${row.type}` : row.action;
}

// Dispatcher that picks a 14x14 inline SVG glyph for a row. Resolution
// order: (1) type-specific (a known shape kind, dialog target, etc.);
// (2) action-specific (Deleted -> trash regardless of category); (3)
// category fallback. Falls back to a tiny dot when nothing matches, so
// future enum additions still render something instead of throwing.
// All glyphs use `currentColor` so they inherit the row's text colour.
function EventIcon({
  category,
  action,
  type,
}: {
  category: string;
  action: string;
  type: string | null;
}) {
  const t = type ?? '';
  // Shape kinds and other type-specific glyphs first.
  if (t === 'Square' || t === 'Rectangle') return <RectGlyph />;
  if (t === 'Circle' || t === 'Ellipse') return <CircleGlyph />;
  if (t === 'Triangle') return <TriangleGlyph />;
  if (t === 'Diamond') return <DiamondGlyph />;
  if (t === 'Star') return <StarGlyph />;
  if (t === 'Hexagon' || t === 'Pentagon' || t === 'Octagon') return <PolyGlyph />;
  if (t === 'Heart') return <HeartGlyph />;
  if (t === 'Cloud') return <CloudGlyph />;
  if (t === 'Cylinder') return <CylinderGlyph />;
  if (t === 'Arrow') return <ArrowGlyph />;
  if (t === 'Text') return <TextGlyph />;
  if (t === 'Sticky') return <StickyGlyph />;
  if (t === 'Image') return <ImageGlyph />;
  if (t === 'Dark') return <MoonGlyph />;
  if (t === 'Light') return <SunGlyph />;
  if (t === 'Settings') return <GearGlyph />;
  if (t === 'Shortcuts') return <KeyboardGlyph />;
  if (t === 'Share') return <ShareGlyph />;
  if (t === 'Activity') return <ActivityGlyph />;
  if (t === 'Welcome') return <SparkGlyph />;
  if (t === 'ShareLink') return <LinkGlyph />;
  if (t === 'In') return <ZoomInGlyph />;
  if (t === 'Out') return <ZoomOutGlyph />;
  if (t === 'Fit') return <FitGlyph />;
  if (t === 'Reset') return <ResetGlyph />;
  if (t === 'Edit') return <PencilGlyph />;
  if (t === 'View') return <EyeGlyph />;
  if (t === 'JSON' || t === 'Markdown' || t === 'PDF' || t === 'PNG') return <FileGlyph />;
  if (t === 'Front' || t === 'Back') return <LayersGlyph />;
  if (t === 'FormatPainter') return <BrushGlyph />;
  if (t === 'Diagram') return <DiagramGlyph />;
  if (t === 'Folder') return <FolderGlyph />;
  if (t === 'Tab') return <TabGlyph />;
  if (t === 'Element') return <ElementGlyph />;
  // Action-specific overrides (no type or unrecognised type).
  if (action === 'Deleted') return <TrashGlyph />;
  if (action === 'Created' || action === 'Added') return <PlusGlyph />;
  if (action === 'Duplicated') return <CopyGlyph />;
  if (action === 'Locked') return <LockGlyph />;
  if (action === 'Unlocked') return <UnlockGlyph />;
  if (action === 'Renamed') return <PencilGlyph />;
  if (action === 'Undone') return <UndoGlyph />;
  if (action === 'Redone') return <RedoGlyph />;
  if (action === 'Grouped' || action === 'Ungrouped') return <GroupGlyph />;
  if (action === 'Moved') return <MoveGlyph />;
  if (action === 'Reverted') return <RevertGlyph />;
  if (action === 'Reordered') return <LayersGlyph />;
  if (action === 'Aligned') return <AlignGlyph />;
  if (action === 'Cleared') return <ClearGlyph />;
  if (action === 'Linked' || action === 'Unlinked') return <LinkGlyph />;
  if (action === 'Resolved' || action === 'Unresolved') return <CheckGlyph />;
  if (action === 'Searched') return <MagnifierGlyph />;
  if (action === 'Selected') return <PointerGlyph />;
  if (action === 'Opened') return <OpenGlyph />;
  if (action === 'Closed') return <CloseGlyph />;
  if (action === 'Copied') return <ClipboardGlyph />;
  if (action === 'Imported') return <DownloadGlyph />;
  if (action === 'Exported') return <UploadGlyph />;
  if (action === 'Shared') return <ShareGlyph />;
  if (action === 'Joined') return <PersonGlyph />;
  if (action === 'Used') return <SparkGlyph />;
  if (action === 'Changed') return <PencilGlyph />;
  if (action === 'Toggled') return <ToggleGlyph />;
  if (action === 'Zoomed') return <FitGlyph />;
  if (action === 'SignedIn') return <SignInGlyph />;
  if (action === 'SignedUp') return <PersonAddGlyph />;
  if (action === 'SignedOut') return <SignOutGlyph />;
  // Category fallback.
  if (category === 'Diagram') return <DiagramGlyph />;
  if (category === 'Element') return <ElementGlyph />;
  if (category === 'Tab') return <TabGlyph />;
  if (category === 'Theme') return <PaletteGlyph />;
  if (category === 'Canvas') return <CanvasGlyph />;
  if (category === 'Template') return <TemplateGlyph />;
  if (category === 'Comment') return <CommentGlyph />;
  if (category === 'Note') return <NoteGlyph />;
  if (category === 'Search') return <MagnifierGlyph />;
  if (category === 'UI') return <WindowGlyph />;
  if (category === 'Folder') return <FolderGlyph />;
  if (category === 'Session') return <PersonGlyph />;
  return <DotGlyph />;
}

// All glyphs share a frame so the row layout stays stable regardless of
// which icon resolves. 14x14, currentColor, no fill (or subtle fill on
// shapes that need it). Intentionally minimalist line art so a row of
// 20+ icons doesn't get visually noisy.
const SVG_PROPS = {
  width: 14,
  height: 14,
  viewBox: '0 0 14 14',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};
function RectGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="2.5" y="3" width="9" height="8" rx="0.8" />
    </svg>
  );
}
function CircleGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <circle cx="7" cy="7" r="4" />
    </svg>
  );
}
function TriangleGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M7 2.5 L12 11.5 L2 11.5 Z" />
    </svg>
  );
}
function DiamondGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M7 2 L12 7 L7 12 L2 7 Z" />
    </svg>
  );
}
function StarGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M7 2 L8.5 5.5 L12 6 L9.4 8.4 L10 12 L7 10.2 L4 12 L4.6 8.4 L2 6 L5.5 5.5 Z" />
    </svg>
  );
}
function PolyGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M7 2 L11.5 4.5 L11.5 9.5 L7 12 L2.5 9.5 L2.5 4.5 Z" />
    </svg>
  );
}
function HeartGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M7 11.5 C 3 9 2 6.5 3.5 4.5 C 5 2.8 6.5 3.5 7 5 C 7.5 3.5 9 2.8 10.5 4.5 C 12 6.5 11 9 7 11.5 Z" />
    </svg>
  );
}
function CloudGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M3.5 9.5 C 1.8 9.5 1.5 7 3.5 6.5 C 3.5 4.5 6 4 7 5.5 C 8 4 11 5 10.5 7 C 12.5 7.2 12.5 9.5 10.5 9.5 Z" />
    </svg>
  );
}
function CylinderGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <ellipse cx="7" cy="3.5" rx="4" ry="1.3" />
      <path d="M3 3.5 L3 10.5 C 3 11.5 11 11.5 11 10.5 L11 3.5" />
    </svg>
  );
}
function ArrowGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M2 7 L11 7" />
      <path d="M8 4 L11 7 L8 10" />
    </svg>
  );
}
function TextGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M3 4 L11 4" />
      <path d="M7 4 L7 11" />
    </svg>
  );
}
function StickyGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M2.5 3 L11.5 3 L11.5 9 L8 12 L2.5 12 Z" />
      <path d="M8 12 L8 9 L11.5 9" />
    </svg>
  );
}
function ImageGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="2" y="3" width="10" height="8" rx="0.8" />
      <circle cx="5" cy="6" r="0.9" />
      <path d="M2.5 10.5 L5.5 7.5 L8.5 10 L10.5 8.5 L11.5 9.5" />
    </svg>
  );
}
function MoonGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M11 8.5 A 4.5 4.5 0 1 1 5.5 3 A 3.5 3.5 0 0 0 11 8.5 Z" />
    </svg>
  );
}
function SunGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <circle cx="7" cy="7" r="2.5" />
      <path d="M7 1.5 L7 3 M7 11 L7 12.5 M1.5 7 L3 7 M11 7 L12.5 7 M3 3 L4 4 M10 10 L11 11 M3 11 L4 10 M10 4 L11 3" />
    </svg>
  );
}
function GearGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <circle cx="7" cy="7" r="2" />
      <path d="M7 1.5 L7 3 M7 11 L7 12.5 M1.5 7 L3 7 M11 7 L12.5 7 M3 3 L4.2 4.2 M9.8 9.8 L11 11 M3 11 L4.2 9.8 M9.8 4.2 L11 3" />
    </svg>
  );
}
function KeyboardGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="1.5" y="4" width="11" height="6" rx="0.8" />
      <path d="M4 6.5 L4 6.5 M6 6.5 L6 6.5 M8 6.5 L8 6.5 M10 6.5 L10 6.5 M4.5 8.5 L9.5 8.5" />
    </svg>
  );
}
function ShareGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <circle cx="3" cy="7" r="1.6" />
      <circle cx="11" cy="3.5" r="1.6" />
      <circle cx="11" cy="10.5" r="1.6" />
      <path d="M4.4 6.2 L9.6 4 M4.4 7.8 L9.6 10" />
    </svg>
  );
}
function ActivityGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M1.5 7 L4 7 L5.5 3.5 L8.5 10.5 L10 7 L12.5 7" />
    </svg>
  );
}
function SparkGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M7 2 L7.8 6.2 L12 7 L7.8 7.8 L7 12 L6.2 7.8 L2 7 L6.2 6.2 Z" />
    </svg>
  );
}
function LinkGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M6 8 L8 6" />
      <path d="M4.5 9.5 A 2 2 0 0 1 4.5 6.5 L6 5" />
      <path d="M9.5 4.5 A 2 2 0 0 1 9.5 7.5 L8 9" />
    </svg>
  );
}
function ZoomInGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <circle cx="6" cy="6" r="3.2" />
      <path d="M8.4 8.4 L11.5 11.5" />
      <path d="M4.5 6 L7.5 6 M6 4.5 L6 7.5" />
    </svg>
  );
}
function ZoomOutGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <circle cx="6" cy="6" r="3.2" />
      <path d="M8.4 8.4 L11.5 11.5" />
      <path d="M4.5 6 L7.5 6" />
    </svg>
  );
}
function FitGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M2 5 L2 2 L5 2 M9 2 L12 2 L12 5 M12 9 L12 12 L9 12 M5 12 L2 12 L2 9" />
    </svg>
  );
}
function ResetGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M11.5 7 A 4.5 4.5 0 1 1 7 2.5" />
      <path d="M7 1.5 L7 3.5 L9 3.5" />
    </svg>
  );
}
function PencilGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M2.5 11.5 L4.5 11 L11 4.5 L9.5 3 L3 9.5 Z" />
      <path d="M8 5 L9.5 6.5" />
    </svg>
  );
}
function EyeGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M1.5 7 C 3.5 3.5 10.5 3.5 12.5 7 C 10.5 10.5 3.5 10.5 1.5 7 Z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  );
}
function FileGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M3 1.5 L8.5 1.5 L11 4 L11 12.5 L3 12.5 Z" />
      <path d="M8.5 1.5 L8.5 4 L11 4" />
    </svg>
  );
}
function LayersGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M7 2 L12 5 L7 8 L2 5 Z" />
      <path d="M2 8 L7 11 L12 8" />
    </svg>
  );
}
function BrushGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M2 12 C 3 9 5 9 6 10 L8 8 L6 6 L4 8 C 5 9 5 11 2 12 Z" />
      <path d="M6 6 L11 1.5 L12.5 3 L8 8" />
    </svg>
  );
}
function TrashGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M2.5 4 L11.5 4 M4 4 L4 2.5 L10 2.5 L10 4 M3.5 4 L4.5 12 L9.5 12 L10.5 4" />
    </svg>
  );
}
function PlusGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M7 2.5 L7 11.5 M2.5 7 L11.5 7" />
    </svg>
  );
}
function CopyGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="4.5" y="4.5" width="7" height="7" rx="0.8" />
      <path d="M3 9.5 L3 3 C 3 2.5 3.5 2 4 2 L9.5 2" />
    </svg>
  );
}
function LockGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="3" y="6.5" width="8" height="5.5" rx="0.8" />
      <path d="M4.5 6.5 L4.5 4.5 A 2.5 2.5 0 0 1 9.5 4.5 L9.5 6.5" />
    </svg>
  );
}
function UnlockGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="3" y="6.5" width="8" height="5.5" rx="0.8" />
      <path d="M4.5 6.5 L4.5 4.5 A 2.5 2.5 0 0 1 9.5 4.5" />
    </svg>
  );
}
function UndoGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M4 4 L1.5 6.5 L4 9" />
      <path d="M1.5 6.5 L8.5 6.5 A 3.5 3.5 0 0 1 8.5 12" />
    </svg>
  );
}
function RedoGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M10 4 L12.5 6.5 L10 9" />
      <path d="M12.5 6.5 L5.5 6.5 A 3.5 3.5 0 0 0 5.5 12" />
    </svg>
  );
}
function GroupGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="2" y="2" width="5" height="5" rx="0.6" />
      <rect x="7" y="7" width="5" height="5" rx="0.6" />
    </svg>
  );
}
function MoveGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M7 1.5 L7 12.5 M1.5 7 L12.5 7" />
      <path d="M5 3.5 L7 1.5 L9 3.5 M5 10.5 L7 12.5 L9 10.5 M3.5 5 L1.5 7 L3.5 9 M10.5 5 L12.5 7 L10.5 9" />
    </svg>
  );
}
function RevertGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M2 7 L4.5 4.5 L7 7" />
      <path d="M4.5 4.5 L4.5 9 A 3.5 3.5 0 0 0 8 12.5" />
    </svg>
  );
}
function AlignGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M2 3 L12 3 M2 7 L9 7 M2 11 L11 11" />
    </svg>
  );
}
function ClearGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="2.5" y="2.5" width="9" height="9" rx="0.8" />
      <path d="M4.5 4.5 L9.5 9.5 M9.5 4.5 L4.5 9.5" />
    </svg>
  );
}
function CheckGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <circle cx="7" cy="7" r="5" />
      <path d="M4.5 7 L6.3 8.8 L9.5 5.5" />
    </svg>
  );
}
function MagnifierGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <circle cx="6" cy="6" r="3.2" />
      <path d="M8.4 8.4 L11.5 11.5" />
    </svg>
  );
}
function PointerGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M3 2 L3 11 L5.5 8.5 L7.5 12 L9 11 L7 8 L11 8 Z" />
    </svg>
  );
}
function OpenGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M2.5 4 L7 4 L7 1.5 L12.5 6.5 L7 11.5 L7 9 L2.5 9 Z" />
    </svg>
  );
}
function CloseGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <circle cx="7" cy="7" r="5" />
      <path d="M4.5 4.5 L9.5 9.5 M9.5 4.5 L4.5 9.5" />
    </svg>
  );
}
function ClipboardGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="3" y="3" width="8" height="9.5" rx="0.8" />
      <rect x="5" y="1.5" width="4" height="2.5" rx="0.5" />
    </svg>
  );
}
function DownloadGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M7 1.5 L7 9" />
      <path d="M4 6 L7 9 L10 6" />
      <path d="M2 12 L12 12" />
    </svg>
  );
}
function UploadGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M7 12.5 L7 5" />
      <path d="M4 8 L7 5 L10 8" />
      <path d="M2 2 L12 2" />
    </svg>
  );
}
function PersonGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <circle cx="7" cy="5" r="2.2" />
      <path d="M2.5 12 C 3 9 11 9 11.5 12" />
    </svg>
  );
}
function PersonAddGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <circle cx="5.5" cy="5" r="2.2" />
      <path d="M1.5 12 C 2 9 9 9 9.5 12" />
      <path d="M11 2 L11 6 M9 4 L13 4" />
    </svg>
  );
}
function SignInGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M8 1.5 L12.5 1.5 L12.5 12.5 L8 12.5" />
      <path d="M2 7 L9 7" />
      <path d="M6 4 L9 7 L6 10" />
    </svg>
  );
}
function SignOutGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M6 1.5 L1.5 1.5 L1.5 12.5 L6 12.5" />
      <path d="M5 7 L12 7" />
      <path d="M9 4 L12 7 L9 10" />
    </svg>
  );
}
function ToggleGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="1.5" y="4.5" width="11" height="5" rx="2.5" />
      <circle cx="9.5" cy="7" r="1.5" fill="currentColor" />
    </svg>
  );
}
function DiagramGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="2.5" y="2.5" width="9" height="9" rx="0.8" />
      <path d="M2.5 6 L11.5 6" />
    </svg>
  );
}
function ElementGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="3" y="3" width="8" height="8" rx="0.8" />
    </svg>
  );
}
function TabGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M1.5 6 L4 6 L5 4 L9.5 4 L9.5 12 L1.5 12 Z" />
    </svg>
  );
}
function PaletteGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M7 1.5 C 3.5 1.5 1.5 4 1.5 7 C 1.5 10 4 12.5 7 12.5 C 7.5 12.5 8 12 8 11.5 L8 10.5 C 8 10 8.5 9.5 9 9.5 L10.5 9.5 C 11.5 9.5 12.5 9 12.5 7.5 C 12.5 4 10 1.5 7 1.5 Z" />
      <circle cx="4" cy="5.5" r="0.8" fill="currentColor" />
      <circle cx="7" cy="3.5" r="0.8" fill="currentColor" />
      <circle cx="10" cy="5.5" r="0.8" fill="currentColor" />
    </svg>
  );
}
function CanvasGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="1.5" y="2.5" width="11" height="9" rx="0.5" />
      <path
        d="M1.5 5.5 L12.5 5.5 M1.5 8.5 L12.5 8.5 M4.5 2.5 L4.5 11.5 M8 2.5 L8 11.5"
        strokeWidth="0.6"
      />
    </svg>
  );
}
function TemplateGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="2" y="2" width="10" height="3" rx="0.4" />
      <rect x="2" y="6" width="4" height="6" rx="0.4" />
      <rect x="7" y="6" width="5" height="6" rx="0.4" />
    </svg>
  );
}
function CommentGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M1.5 3 L12.5 3 L12.5 9.5 L7 9.5 L4 12 L4 9.5 L1.5 9.5 Z" />
    </svg>
  );
}
function NoteGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M2.5 1.5 L11.5 1.5 L11.5 12.5 L2.5 12.5 Z" />
      <path d="M4.5 4.5 L9.5 4.5 M4.5 7 L9.5 7 M4.5 9.5 L7.5 9.5" strokeWidth="0.7" />
    </svg>
  );
}
function FolderGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M1.5 4 L5 4 L6.5 5.5 L12.5 5.5 L12.5 11.5 L1.5 11.5 Z" />
    </svg>
  );
}
function WindowGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="1.5" y="2.5" width="11" height="9" rx="0.8" />
      <path d="M1.5 5 L12.5 5" />
      <circle cx="3" cy="3.7" r="0.3" fill="currentColor" />
      <circle cx="4.2" cy="3.7" r="0.3" fill="currentColor" />
    </svg>
  );
}
function DotGlyph() {
  return (
    <svg {...SVG_PROPS}>
      <circle cx="7" cy="7" r="1.6" fill="currentColor" />
    </svg>
  );
}

export default function TelemetryDashboard() {
  const [summary, setSummary] = useState<TelemetrySummary | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [active, setActive] = useState<TelemetryWindowKey>('last7');

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/telemetry/summary`)
      .then((r) => (r.ok ? (r.json() as Promise<TelemetrySummary>) : Promise.reject(r.status)))
      .then((data) => {
        if (cancelled) return;
        setSummary(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const window = summary?.enabled ? summary.windows[active] : null;
  const groups = useMemo(() => groupByCategory(window?.rows ?? []), [window]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <div className="flex items-center justify-between gap-4">
        <Brand href="/" size="md" />
        <a href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Back to livediagram
        </a>
      </div>

      <h1 className="mt-10 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        Telemetry, in the open
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
        This is everything we measure. We record anonymous, first-party product events to learn
        which features actually help. There are no third-party analytics or tracking vendors, no
        user content (never a diagram name, your name, or anything you type), and the data is never
        sold or shared beyond this page.
      </p>

      {status === 'loading' ? (
        <p className="mt-12 text-slate-500">Loading…</p>
      ) : status === 'error' ? (
        <p className="mt-12 text-slate-500">Couldn&rsquo;t load the numbers right now.</p>
      ) : !summary?.enabled ? (
        <div className="mt-12 rounded-lg border border-slate-200 bg-white p-6">
          <p className="font-medium text-slate-900">Telemetry isn&rsquo;t enabled here.</p>
          <p className="mt-1 text-sm text-slate-600">
            This deployment hasn&rsquo;t turned telemetry on, so there&rsquo;s nothing to show.
          </p>
        </div>
      ) : (
        <>
          {/* Fixed timeframes only (Today / Last 7 days / Last month) so
              the queries stay simple and cacheable (spec/22). */}
          <div className="mt-10 inline-flex rounded-lg border border-slate-200 bg-white p-1">
            {WINDOWS.map((w) => (
              <button
                key={w.key}
                type="button"
                onClick={() => setActive(w.key)}
                className={
                  'rounded-md px-4 py-1.5 text-sm font-medium transition ' +
                  (active === w.key
                    ? 'bg-brand-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100')
                }
              >
                {w.label}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Total events
            </p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900">
              {(window?.total ?? 0).toLocaleString()}
            </p>
          </div>

          {groups.length === 0 ? (
            <p className="mt-8 text-slate-500">No events recorded in this window yet.</p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {groups.map((group) => (
                <div
                  key={group.category}
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-base font-semibold text-slate-900">{group.category}</h2>
                    <span className="text-sm font-medium text-slate-400">
                      {group.subtotal.toLocaleString()}
                    </span>
                  </div>
                  {CATEGORY_DESCRIPTIONS[group.category] ? (
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {CATEGORY_DESCRIPTIONS[group.category]}
                    </p>
                  ) : null}
                  <ul className="mt-3 divide-y divide-slate-100">
                    {group.items.map((row) => (
                      <li
                        key={`${row.action}:${row.type ?? ''}`}
                        className="flex items-center justify-between gap-3 py-1.5 text-sm"
                      >
                        <span className="flex min-w-0 flex-1 items-center gap-2 text-slate-600">
                          <span className="shrink-0 text-slate-400">
                            <EventIcon
                              category={row.category}
                              action={row.action}
                              type={row.type ?? null}
                            />
                          </span>
                          <span className="truncate">{eventLabel(row)}</span>
                        </span>
                        <span className="font-medium text-slate-900">
                          {row.count.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {summary.generatedAt ? (
            <p className="mt-10 text-xs text-slate-400">
              Anonymous, first-party, no vendors. Updated a few minutes at a time.
            </p>
          ) : null}
        </>
      )}
    </main>
  );
}
