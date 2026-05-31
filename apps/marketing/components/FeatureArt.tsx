// Per-card mini illustrations for the landing page feature grids.
//
// Each export is a small, self-contained mock of the real editor surface
// the card describes — built from the same visual vocabulary as the hero
// (dot-grid canvas, brand-blue rounded shapes, pinned arrows, presence
// avatars, the floating palette / explorer / activity panels). Motion is
// pure CSS (classes + keyframes live in globals.css) so it survives the
// static export with no JS and degrades to a settled frame under
// prefers-reduced-motion.
//
// Shared timing classes: fa-pop, fa-draw, fa-pulse, fa-grow, fa-hl,
// fa-theme-*, fa-arrow-*, fa-paint, fa-lww, fa-tab, fa-reveal, fa-chev,
// fa-laser, fa-spin, fa-dip, fa-swap-*, fa-knob, fa-on/off, fa-fade.

import type { CSSProperties, ReactNode } from 'react';

const BLUE_FILL = '#dbeafe';
const BLUE_STROKE = '#0284c7';
const BLUE_TEXT = '#0c4a6e';
const PINK = '#ec4899';
const SKY = '#0ea5e9';

// Bordered surface every illustration sits in. `canvas` paints the
// editor's dot-grid; otherwise it's a plain panel (explorer, dialog…).
function Frame({ children, canvas = false }: { children: ReactNode; canvas?: boolean }) {
  return (
    <div
      aria-hidden
      className={
        'relative mb-5 h-24 w-full overflow-hidden rounded-md border border-slate-200 ' +
        (canvas
          ? 'bg-white bg-[radial-gradient(circle_at_center,_#d8dee8_1px,_transparent_1px)] bg-[size:13px_13px]'
          : 'bg-slate-50')
      }
    >
      {children}
    </div>
  );
}

function Avatar({
  initials,
  color,
  className = '',
  style,
}: {
  initials: string;
  color: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={
        'flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-semibold text-white ' +
        className
      }
      style={{ backgroundColor: color, boxShadow: '0 0 0 2px white, 0 0 0 4px #22c55e', ...style }}
    >
      {initials}
    </span>
  );
}

function Cursor({ color, label }: { color: string; label?: string }) {
  return (
    <span className="relative">
      <svg width="13" height="13" viewBox="0 0 16 16" fill={color} stroke="white" strokeWidth="1">
        <path d="M2 1 L14 8 L8 9 L11 14 L9 15 L6 10 L2 14 Z" />
      </svg>
      {label ? (
        <span
          className="absolute -top-2.5 left-3 whitespace-nowrap rounded px-1 py-0.5 text-[8px] font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}

/* ───────────────────────── Section: the canvas ───────────────────── */

export function TemplatesArt() {
  const tiles = ['Flowchart', 'Mind map', 'Kanban'];
  return (
    <Frame>
      <div className="flex h-full items-center justify-center gap-2 px-3">
        {tiles.map((name, i) => (
          <div
            key={name}
            className="relative h-16 w-1/3 overflow-hidden rounded border border-slate-200 bg-white p-1"
          >
            <span
              className="fa-hl pointer-events-none absolute inset-0 rounded ring-2 ring-brand-500"
              style={{ animationDelay: `${i * 2}s` }}
            />
            <svg viewBox="0 0 60 32" className="h-8 w-full">
              {i === 0 ? (
                <g fill={BLUE_FILL} stroke={BLUE_STROKE} strokeWidth="1.5">
                  <rect x="22" y="2" width="16" height="8" rx="2" />
                  <rect x="22" y="20" width="16" height="8" rx="2" />
                  <line x1="30" y1="10" x2="30" y2="20" stroke={BLUE_STROKE} />
                </g>
              ) : i === 1 ? (
                <g fill={BLUE_FILL} stroke={BLUE_STROKE} strokeWidth="1.5">
                  <line x1="30" y1="16" x2="12" y2="6" />
                  <line x1="30" y1="16" x2="48" y2="6" />
                  <line x1="30" y1="16" x2="14" y2="26" />
                  <circle cx="30" cy="16" r="5" />
                  <circle cx="11" cy="6" r="3.5" />
                  <circle cx="49" cy="6" r="3.5" />
                  <circle cx="13" cy="26" r="3.5" />
                </g>
              ) : (
                <g fill={BLUE_FILL} stroke={BLUE_STROKE} strokeWidth="1.2">
                  <rect x="4" y="3" width="14" height="26" rx="2" fill="#f1f5f9" stroke="#cbd5e1" />
                  <rect
                    x="23"
                    y="3"
                    width="14"
                    height="26"
                    rx="2"
                    fill="#f1f5f9"
                    stroke="#cbd5e1"
                  />
                  <rect
                    x="42"
                    y="3"
                    width="14"
                    height="26"
                    rx="2"
                    fill="#f1f5f9"
                    stroke="#cbd5e1"
                  />
                  <rect x="6" y="6" width="10" height="5" rx="1.5" />
                  <rect x="25" y="6" width="10" height="5" rx="1.5" />
                  <rect x="25" y="13" width="10" height="5" rx="1.5" />
                </g>
              )}
            </svg>
            <p className="mt-0.5 text-center text-[7px] font-medium text-slate-500">{name}</p>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function ThemesArt() {
  return (
    <Frame>
      <svg viewBox="0 0 220 96" className="absolute inset-0 h-full w-full">
        <rect className="fa-theme-bg" x="40" y="14" width="140" height="68" rx="8" />
        <g className="fa-theme" strokeWidth="2">
          <rect x="58" y="30" width="46" height="22" rx="6" />
          <rect x="120" y="46" width="46" height="22" rx="6" />
        </g>
        <line
          className="fa-theme"
          x1="104"
          y1="41"
          x2="120"
          y2="57"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute bottom-1.5 right-2 rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-medium text-slate-500 shadow-sm">
        one click
      </span>
    </Frame>
  );
}

const SHAPES: { d: ReactNode }[] = [
  { d: <rect x="-11" y="-8" width="22" height="16" rx="3" /> },
  { d: <circle cx="0" cy="0" r="9" /> },
  { d: <polygon points="0,-10 11,0 0,10 -11,0" strokeLinejoin="round" /> },
  { d: <rect x="-12" y="-7" width="24" height="14" rx="7" /> },
  {
    d: (
      <g>
        <path d="M-9 -6 L-9 6 A9 2.5 0 0 0 9 6 L9 -6" strokeLinejoin="round" />
        <ellipse cx="0" cy="-6" rx="9" ry="2.5" />
      </g>
    ),
  },
  { d: <polygon points="-8,-7 12,-7 8,7 -12,7" strokeLinejoin="round" /> },
  { d: <polygon points="-7,-8 7,-8 12,0 7,8 -7,8 -12,0" strokeLinejoin="round" /> },
  {
    d: (
      <path d="M-11 -7 L11 -7 L11 5 C7 9 3 4 -1 6.5 C-5 9 -8 4 -11 6.5 Z" strokeLinejoin="round" />
    ),
  },
];

export function ShapesArt() {
  return (
    <Frame canvas>
      <svg viewBox="0 0 220 96" className="absolute inset-0 h-full w-full">
        {SHAPES.map((s, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const cx = 35 + col * 50;
          const cy = 30 + row * 38;
          return (
            <g
              key={i}
              className="fa-pop"
              style={{ animationDelay: `${i * 0.55}s` }}
              transform={`translate(${cx} ${cy})`}
              fill={BLUE_FILL}
              stroke={BLUE_STROKE}
              strokeWidth="2"
            >
              {s.d}
            </g>
          );
        })}
      </svg>
    </Frame>
  );
}

export function ArrowsArt() {
  return (
    <Frame canvas>
      <svg viewBox="0 0 220 96" className="absolute inset-0 h-full w-full">
        {/* fixed source box */}
        <g fill={BLUE_FILL} stroke={BLUE_STROKE} strokeWidth="2">
          <rect x="26" y="35" width="54" height="26" rx="6" />
        </g>
        <text x="53" y="52" textAnchor="middle" fontSize="11" fontWeight="600" fill={BLUE_TEXT}>
          API
        </text>
        {/* stretching shaft */}
        <rect
          className="fa-arrow-grow"
          x="80"
          y="46.7"
          width="28"
          height="2.6"
          fill={BLUE_STROKE}
        />
        {/* moving target box + arrowhead travel together */}
        <g className="fa-arrow-move">
          <polygon points="108,43 117,48 108,53" fill={BLUE_STROKE} />
          <rect
            x="118"
            y="35"
            width="54"
            height="26"
            rx="6"
            fill={BLUE_FILL}
            stroke={BLUE_STROKE}
            strokeWidth="2"
          />
          <text x="145" y="52" textAnchor="middle" fontSize="11" fontWeight="600" fill={BLUE_TEXT}>
            DB
          </text>
        </g>
      </svg>
    </Frame>
  );
}

export function MarqueeArt() {
  const boxes = [
    { x: 24, y: 30 },
    { x: 86, y: 46 },
    { x: 150, y: 26 },
  ];
  return (
    <Frame canvas>
      <svg viewBox="0 0 220 96" className="absolute inset-0 h-full w-full">
        {boxes.map((b, i) => (
          <g key={i}>
            <rect
              x={b.x}
              y={b.y}
              width="40"
              height="22"
              rx="5"
              fill={BLUE_FILL}
              stroke={BLUE_STROKE}
              strokeWidth="2"
            />
            <rect
              className="fa-pulse"
              x={b.x - 3}
              y={b.y - 3}
              width="46"
              height="28"
              rx="7"
              fill="none"
              stroke={SKY}
              strokeWidth="1.5"
              style={{ animationDelay: '1.2s' }}
            />
          </g>
        ))}
        {/* marquee selection rectangle */}
        <rect
          className="fa-grow"
          x="20"
          y="22"
          width="174"
          height="56"
          rx="2"
          fill="rgba(14,165,233,0.08)"
          stroke={SKY}
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      </svg>
      <span
        className="fa-pop absolute left-1/2 top-1.5 -translate-x-1/2 rounded bg-slate-900 px-1.5 py-0.5 text-[8px] font-semibold text-white"
        style={{ animationDelay: '1.4s' }}
      >
        3 selected
      </span>
    </Frame>
  );
}

export function CommentsArt() {
  return (
    <Frame canvas>
      <svg viewBox="0 0 220 96" className="absolute inset-0 h-full w-full">
        <rect
          x="26"
          y="34"
          width="58"
          height="30"
          rx="6"
          fill={BLUE_FILL}
          stroke={BLUE_STROKE}
          strokeWidth="2"
        />
      </svg>
      {/* comment count badge on the element */}
      <span className="absolute left-[34%] top-5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-white shadow">
        <span className="fa-pulse absolute inset-0 rounded-full bg-amber-400" />
        <span className="relative">2</span>
      </span>
      {/* thread popover */}
      <div className="fa-fade absolute right-2 top-3 w-[52%] rounded-md border border-slate-200 bg-white p-1.5 shadow-md">
        <div className="flex items-center gap-1">
          <span
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[6px] font-bold text-white"
            style={{ backgroundColor: PINK }}
          >
            JR
          </span>
          <span className="text-[7px] font-semibold text-slate-600">Jordan</span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded bg-slate-100" />
        <div className="mt-0.5 h-1.5 w-3/4 rounded bg-slate-100" />
      </div>
    </Frame>
  );
}

export function FormatPainterArt() {
  return (
    <Frame canvas>
      <svg viewBox="0 0 220 96" className="absolute inset-0 h-full w-full">
        {/* styled source */}
        <rect
          x="26"
          y="35"
          width="54"
          height="26"
          rx="6"
          fill={BLUE_FILL}
          stroke={BLUE_STROKE}
          strokeWidth="2"
        />
        {/* target adopts the style */}
        <rect className="fa-paint" x="140" y="35" width="54" height="26" rx="6" strokeWidth="2" />
        {/* travelling brush */}
        <g className="fa-brush">
          <circle cx="92" cy="34" r="8" fill="white" stroke="#94a3b8" strokeWidth="1.5" />
          <path d="M88 34 l4 -4 l3 3 l-4 4 z" fill={BLUE_STROKE} />
        </g>
      </svg>
    </Frame>
  );
}

export function TabsArt() {
  const tabs = ['Overview', 'Backend', 'Data'];
  return (
    <Frame>
      <div className="flex h-full flex-col">
        <div className="relative flex items-center gap-1 border-b border-slate-200 px-2 pt-2">
          {/* sliding active indicator */}
          <span
            className="fa-tab absolute bottom-0 left-2 h-[2px] w-[52px] rounded bg-brand-500"
            aria-hidden
          />
          {tabs.map((t) => (
            <span
              key={t}
              className="rounded-t px-1.5 py-1 text-[8px] font-medium text-slate-600"
              style={{ width: 52, display: 'inline-block', textAlign: 'center' }}
            >
              {t}
            </span>
          ))}
          <span className="px-1 text-[10px] text-slate-400">+</span>
        </div>
        <div className="relative flex-1">
          <svg viewBox="0 0 220 56" className="absolute inset-0 h-full w-full">
            <rect
              x="30"
              y="14"
              width="46"
              height="20"
              rx="5"
              fill={BLUE_FILL}
              stroke={BLUE_STROKE}
              strokeWidth="1.8"
            />
            <rect
              x="120"
              y="20"
              width="46"
              height="20"
              rx="5"
              fill={BLUE_FILL}
              stroke={BLUE_STROKE}
              strokeWidth="1.8"
            />
            <line
              className="fa-draw"
              x1="76"
              y1="24"
              x2="120"
              y2="30"
              stroke={BLUE_STROKE}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          {/* cross-tab link chip */}
          <span
            className="fa-fade absolute right-3 top-2 flex items-center gap-0.5 rounded bg-white px-1 py-0.5 text-[7px] font-medium text-brand-600 shadow-sm ring-1 ring-slate-200"
            style={{ animationDelay: '0.6s' }}
          >
            ↗ Data
          </span>
        </div>
      </div>
    </Frame>
  );
}

export function FoldersArt() {
  return (
    <Frame>
      <div className="flex h-full flex-col justify-center gap-1 px-3 text-[8px] text-slate-600">
        <div className="flex items-center gap-1 font-medium">
          <svg
            className="fa-chev"
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
          >
            <path d="M2 1 L5 4 L2 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <FolderIcon />
          <span>Product</span>
        </div>
        <div className="fa-reveal ml-4 flex items-center gap-1" style={{ animationDelay: '0s' }}>
          <DiagramIcon />
          <span className="text-slate-500">Architecture</span>
        </div>
        <div className="fa-reveal ml-4 flex items-center gap-1" style={{ animationDelay: '0.15s' }}>
          <DiagramIcon />
          <span className="text-slate-500">Onboarding flow</span>
        </div>
        <div className="ml-0 flex items-center gap-1 text-slate-400">
          <FolderIcon muted />
          <span>Unsorted</span>
        </div>
      </div>
    </Frame>
  );
}

function FolderIcon({ muted = false }: { muted?: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 16 16"
      fill={muted ? '#cbd5e1' : '#7dd3fc'}
      stroke={muted ? '#94a3b8' : BLUE_STROKE}
      strokeWidth="1"
    >
      <path d="M1.5 4 L6 4 L7.5 5.5 L14.5 5.5 L14.5 13 L1.5 13 Z" strokeLinejoin="round" />
    </svg>
  );
}

function DiagramIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#94a3b8" strokeWidth="1.4">
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <line x1="5" y1="6" x2="11" y2="6" />
      <line x1="5" y1="9" x2="9" y2="9" />
    </svg>
  );
}

/* ─────────────────────── Section: real-time ──────────────────────── */

export function PresenceArt() {
  const people = [
    { initials: 'TM', color: SKY },
    { initials: 'JR', color: PINK },
    { initials: 'AL', color: '#8b5cf6' },
  ];
  return (
    <Frame>
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <span className="text-[9px] font-semibold text-slate-900">
          live<span className="text-brand-600">[diagram]</span>
        </span>
        <div className="flex items-center gap-1.5">
          {people.map((p, i) => (
            <Avatar
              key={p.initials}
              initials={p.initials}
              color={p.color}
              className="fa-pop"
              style={{ animationDelay: `${0.4 + i * 0.9}s` }}
            />
          ))}
        </div>
      </div>
      <div className="flex h-[calc(100%-33px)] items-center justify-center gap-4 text-[8px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> online
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> away
        </span>
      </div>
    </Frame>
  );
}

export function SelectionGlowArt() {
  return (
    <Frame canvas>
      <svg viewBox="0 0 220 96" className="absolute inset-0 h-full w-full">
        <rect
          x="78"
          y="33"
          width="64"
          height="32"
          rx="6"
          fill={BLUE_FILL}
          stroke={BLUE_STROKE}
          strokeWidth="2"
        />
        {/* remote collaborator's coloured glow */}
        <rect
          className="fa-pulse"
          x="73"
          y="28"
          width="74"
          height="42"
          rx="9"
          fill="none"
          stroke={PINK}
          strokeWidth="2.5"
        />
      </svg>
      <span
        className="absolute left-[60%] top-4 rounded px-1 py-0.5 text-[8px] font-semibold text-white shadow"
        style={{ backgroundColor: PINK }}
      >
        JR
      </span>
      <span className="absolute bottom-3 right-6">
        <Cursor color={PINK} />
      </span>
    </Frame>
  );
}

export function RealtimeArt() {
  return (
    <Frame canvas>
      <svg viewBox="0 0 220 96" className="absolute inset-0 h-full w-full">
        <rect className="fa-lww" x="79" y="34" width="62" height="30" rx="6" strokeWidth="2" />
      </svg>
      <span className="absolute left-6 top-5">
        <Cursor color={SKY} label="TM" />
      </span>
      <span className="absolute bottom-4 right-5">
        <Cursor color={PINK} label="JR" />
      </span>
      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-medium text-slate-500 shadow-sm">
        last write wins
      </span>
    </Frame>
  );
}

export function ShareLinksArt() {
  const links = [
    { code: '/d/9fk2…', role: 'Edit', cls: 'bg-brand-100 text-brand-700' },
    { code: '/d/qp7x…', role: 'View', cls: 'bg-slate-200 text-slate-600' },
  ];
  return (
    <Frame>
      <div className="flex h-full flex-col gap-1.5 px-3 py-2">
        <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-700">
          <LinkIcon /> Share
        </div>
        {links.map((l, i) => (
          <div
            key={l.role}
            className="fa-pop flex items-center justify-between rounded border border-slate-200 bg-white px-1.5 py-1"
            style={{ animationDelay: `${0.4 + i * 0.7}s` }}
          >
            <span className="font-mono text-[8px] text-slate-500">{l.code}</span>
            <span className={'rounded px-1.5 py-0.5 text-[7px] font-semibold ' + l.cls}>
              {l.role}
            </span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function LinkIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 16 16"
      fill="none"
      stroke={BLUE_STROKE}
      strokeWidth="1.5"
    >
      <path
        d="M6.5 9.5 L9.5 6.5 M7 4.5 L9 2.5 a3 3 0 0 1 4 4 L11 8.5 M9 11.5 L7 13.5 a3 3 0 0 1 -4 -4 L5 7.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LaserArt() {
  return (
    <Frame canvas>
      <svg viewBox="0 0 220 96" className="absolute inset-0 h-full w-full">
        {/* faint reference diagram */}
        <g opacity="0.6">
          <rect
            x="24"
            y="20"
            width="40"
            height="18"
            rx="4"
            fill="#eef2f7"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />
          <rect
            x="150"
            y="58"
            width="40"
            height="18"
            rx="4"
            fill="#eef2f7"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />
        </g>
        {/* glowing laser trail */}
        <path
          className="fa-laser"
          d="M44 30 C 90 34, 110 70, 170 66"
          fill="none"
          stroke="#f43f5e"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 3px rgba(244,63,94,0.8))' }}
        />
        <circle className="fa-pulse" cx="170" cy="66" r="3.5" fill="#f43f5e" />
      </svg>
      <span className="absolute bottom-1.5 right-2 rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-medium text-rose-500 shadow-sm">
        laser
      </span>
    </Frame>
  );
}

export function ActivityArt() {
  const rows = [
    { c: SKY, who: 'You', what: 'added “Ready?”', revert: true },
    { c: PINK, who: 'Jordan', what: 'recoloured 3' },
    { c: '#8b5cf6', who: 'Alex', what: 'grouped 2' },
  ];
  return (
    <Frame>
      <div className="flex h-full flex-col gap-1 px-3 py-2">
        <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">Activity</p>
        {rows.map((r, i) => (
          <div
            key={i}
            className="fa-pop flex items-center gap-1.5 rounded px-1 py-0.5 text-[8px]"
            style={{ animationDelay: `${0.3 + i * 0.6}s` }}
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: r.c }} />
            <span className="text-slate-600">
              <span className="font-semibold text-slate-700">{r.who}</span> {r.what}
            </span>
            {r.revert ? (
              <span className="fa-pulse ml-auto flex items-center gap-0.5 rounded bg-slate-100 px-1 py-0.5 text-[7px] font-medium text-slate-500">
                <RevertIcon /> revert
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </Frame>
  );
}

function RevertIcon() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M3 8 a5 5 0 1 1 1.5 3.6" strokeLinecap="round" />
      <path d="M3 4 L3 8 L7 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RevokeArt() {
  return (
    <Frame>
      <div className="flex h-full flex-col items-center justify-center gap-2 px-3">
        {/* status badge crossfades Shared ⇄ Private */}
        <div className="relative h-4 w-14 text-center">
          <span className="fa-on absolute inset-0 rounded-full bg-brand-100 text-[8px] font-semibold leading-4 text-brand-700">
            Shared
          </span>
          <span className="fa-off absolute inset-0 rounded-full bg-rose-100 text-[8px] font-semibold leading-4 text-rose-600">
            Private
          </span>
        </div>
        {/* toggle */}
        <span className="relative inline-flex h-4 w-8 items-center rounded-full bg-slate-200">
          <span className="fa-on absolute inset-0 rounded-full bg-brand-500" />
          <span className="fa-knob relative z-10 ml-0.5 h-3 w-3 rounded-full bg-white shadow" />
        </span>
        {/* link row, struck through when revoked */}
        <div className="relative flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5">
          <span className="font-mono text-[8px] text-slate-500">/d/9fk2…</span>
          <span className="fa-off absolute left-1.5 top-1/2 h-[1px] w-[46px] -translate-y-1/2 bg-rose-400" />
        </div>
      </div>
    </Frame>
  );
}

export function NameArt() {
  return (
    <Frame>
      <div className="flex h-full items-center justify-center gap-2 px-3">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold text-white"
          style={{ backgroundColor: '#10b981' }}
        >
          BP
        </span>
        <div className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1">
          <div className="relative h-3 w-24">
            <span className="fa-swap-a absolute inset-0 text-[10px] font-medium text-slate-700">
              Bright Porcupine
            </span>
            <span className="fa-swap-b absolute inset-0 text-[10px] font-medium text-slate-700">
              Swift Otter
            </span>
          </div>
          <ShuffleIcon />
        </div>
      </div>
    </Frame>
  );
}

function ShuffleIcon() {
  return (
    <svg
      className="fa-spin"
      width="11"
      height="11"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#64748b"
      strokeWidth="1.5"
    >
      <path
        d="M2 4 L5 4 L13 12 L14 12 M2 12 L5 12 L8 9 M11 8 L14 5 M11 2 L14 5 L11 8 M2 4 L5 4 L8 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RefreshArt() {
  return (
    <Frame canvas>
      <svg viewBox="0 0 220 96" className="absolute inset-0 h-full w-full">
        <g className="fa-dip" fill={BLUE_FILL} stroke={BLUE_STROKE} strokeWidth="2">
          <rect x="36" y="34" width="48" height="24" rx="6" />
          <rect x="132" y="34" width="48" height="24" rx="6" />
          <line x1="84" y1="46" x2="132" y2="46" stroke={BLUE_STROKE} strokeWidth="2" />
        </g>
        {/* reload glyph */}
        <g
          className="fa-spin"
          transform="translate(110 78)"
          stroke="#94a3b8"
          strokeWidth="1.8"
          fill="none"
        >
          <path d="M-6 0 a6 6 0 1 1 1.8 4.3" strokeLinecap="round" />
          <path d="M-6 -4 L-6 0 L-2 0" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
      <span className="absolute bottom-1 right-2 rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-medium text-slate-500 shadow-sm">
        reload · intact
      </span>
    </Frame>
  );
}

/* ─────────────────────── Section: foundations ────────────────────── */

export function MitArt() {
  return (
    <Frame>
      <div className="flex h-full flex-col items-center justify-center gap-1.5">
        <div
          className="fa-pop flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 shadow-sm"
          style={{ animationDelay: '0.3s' }}
        >
          <GitHubIcon />
          <span className="text-[9px] font-semibold text-slate-700">livediagram</span>
          <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[7px] font-semibold text-white">
            MIT
          </span>
        </div>
        <span className="text-[7px] text-slate-400">editor · api · marketing — all public</span>
      </div>
    </Frame>
  );
}

function GitHubIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="#334155">
      <path d="M8 0C3.6 0 0 3.6 0 8c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-3.9 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3.7 0 1.4.1 2 .3 1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1.5.5.8 1.2.8 2.1 0 3-1.8 3.7-3.6 3.9.3.3.6.8.6 1.6v2.3c0 .2.1.5.6.4C13.7 14.5 16 11.5 16 8c0-4.4-3.6-8-8-8z" />
    </svg>
  );
}

export function NoServersArt() {
  const nodes = ['marketing', 'live', 'api', 'router'];
  return (
    <Frame>
      <div className="flex h-full flex-col items-center justify-center gap-2 px-3">
        <div className="flex items-center gap-1 text-[8px] font-medium text-slate-400">
          <CloudIcon /> Cloudflare edge
        </div>
        <div className="flex items-center gap-1.5">
          {nodes.map((n, i) => (
            <span
              key={n}
              className="relative rounded border border-slate-200 bg-white px-1.5 py-1 text-[7px] font-medium text-slate-600"
            >
              <span
                className="fa-pulse absolute inset-0 rounded ring-2 ring-brand-400"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
              <span className="relative">{n}</span>
            </span>
          ))}
        </div>
        <span className="text-[7px] text-slate-400">no VMs · no containers</span>
      </div>
    </Frame>
  );
}

function CloudIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="#f59e0b">
      <path d="M4 12 a3 3 0 0 1 0-6 a4 4 0 0 1 7.6-1 A3 3 0 0 1 12 12 Z" />
    </svg>
  );
}

export function NoTrackingArt() {
  return (
    <Frame>
      <div className="flex h-full flex-col items-center justify-center gap-1.5">
        <svg width="56" height="34" viewBox="0 0 56 34">
          {/* eye */}
          <path
            d="M6 17 C 16 4, 40 4, 50 17 C 40 30, 16 30, 6 17 Z"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <circle cx="28" cy="17" r="5" fill="none" stroke="#94a3b8" strokeWidth="2" />
          {/* slash drawing across it */}
          <line
            className="fa-draw"
            x1="8"
            y1="29"
            x2="48"
            y2="5"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <span
          className="fa-fade text-[8px] font-medium text-slate-500"
          style={{ animationDelay: '0.4s' }}
        >
          0 trackers · no telemetry
        </span>
      </div>
    </Frame>
  );
}
