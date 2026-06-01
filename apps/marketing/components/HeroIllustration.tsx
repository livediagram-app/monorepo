'use client';

// Animated hero: three editor windows on a sliding stage.
//   1. Flowchart — shared, a teammate cursor, and the theme-recolour beat
//      (the only window that recolours; its canvas tints to match).
//   2. Mind map — shared, with a laser pointer that rings one node then
//      another.
//   3. Release timeline — private (amber badge, just you, no collaborators).
// The centred window plays its pure-CSS build (globals.css, hero-*); the
// peeking windows render settled (.hero-static), blurred + faded, with the
// stage edges masked so they fade out rather than hard-clip. The stage
// auto-advances every 16s and centres a window when clicked (timer resets on
// interaction). Windows are wider on mobile (less peek, more legible).
//
// It's the page's third 'use client' boundary; with JS off it renders the
// first window centred, and reduced-motion settles every build, the canvas
// tint, and hides the laser.

import { useEffect, useState, type ReactNode } from 'react';
import { Brand } from '@livediagram/ui';

const BLUE_TEXT = '#0c4a6e';
// Geometry: each window is `card`% of the stage with a GAP% gutter, so the
// centred window sits at translateX = (100 - card) / 2 - i * (card + GAP).
// `card` is wider on mobile so the windows stay legible there.
const CARD_WIDE = 68;
const CARD_NARROW = 88;
const GAP = 3;

type TabDef = { name: string; color: string; active?: boolean };
type Theme = { canvas: string; fill: string; stroke: string; text: string };

// Each window sits on its own themed canvas. The flowchart animates between
// these two (the recolour beat, via the hero-theme / hero-theme-canvas
// keyframes); the others hold a single distinct theme.
const FLOW_REST = '#eff6ff'; // blue-50 resting tint of the flowchart canvas
const VIOLET: Theme = { canvas: '#f5f3ff', fill: '#ede9fe', stroke: '#7c3aed', text: '#4c1d95' };
const AMBER: Theme = { canvas: '#fffbeb', fill: '#fef3c7', stroke: '#b45309', text: '#78350f' };

const CARDS: {
  key: string;
  title: string;
  tabs: TabDef[];
  showCursor: boolean;
  shared: boolean;
  theming: boolean;
  canvasTint: string;
}[] = [
  {
    key: 'flowchart',
    title: 'Quarterly planning',
    tabs: [
      { name: 'Overview', color: '#0ea5e9', active: true },
      { name: 'Roadmap', color: '#ec4899' },
      { name: 'Launch', color: '#8b5cf6' },
    ],
    showCursor: true,
    shared: true,
    theming: true,
    canvasTint: FLOW_REST,
  },
  {
    key: 'mindmap',
    title: 'Team mind map',
    tabs: [
      { name: 'Ideas', color: '#0ea5e9', active: true },
      { name: 'Themes', color: '#ec4899' },
      { name: 'Actions', color: '#8b5cf6' },
    ],
    showCursor: false,
    shared: true,
    theming: false,
    canvasTint: VIOLET.canvas,
  },
  {
    key: 'timeline',
    title: 'Release timeline',
    tabs: [
      { name: 'Roadmap', color: '#0ea5e9', active: true },
      { name: 'Milestones', color: '#ec4899' },
      { name: 'Releases', color: '#8b5cf6' },
    ],
    showCursor: false,
    shared: false,
    theming: false,
    canvasTint: AMBER.canvas,
  },
];

// Window width as a % of the stage: narrower peek (wider window) on phones.
function useCardWidth() {
  const [card, setCard] = useState(CARD_WIDE);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const apply = () => setCard(mq.matches ? CARD_WIDE : CARD_NARROW);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return card;
}

export function HeroIllustration() {
  const [active, setActive] = useState(0);
  const card = useCardWidth();

  // Auto-advance one window per build cycle; reset whenever `active` changes
  // (so a click gives the clicked window a full cycle). Skipped under reduced
  // motion.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % CARDS.length), 16000);
    return () => window.clearInterval(id);
  }, [active]);

  const tx = (100 - card) / 2 - active * (card + GAP);

  return (
    <div
      aria-hidden
      className="mx-auto mt-16 w-full max-w-6xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
    >
      <div
        className="hero-track flex w-full"
        style={{ gap: `${GAP}%`, transform: `translateX(${tx}%)` }}
      >
        {CARDS.map((c, i) => {
          const playing = i === active;
          const diagram =
            c.key === 'mindmap' ? (
              <MindMapDiagram playing={playing} theme={VIOLET} />
            ) : c.key === 'timeline' ? (
              <TimelineDiagram theme={AMBER} />
            ) : (
              <FlowchartDiagram />
            );
          return (
            <button
              key={c.key}
              type="button"
              tabIndex={-1}
              onClick={() => setActive(i)}
              style={{ width: `${card}%` }}
              className={
                'shrink-0 text-left transition duration-500 ' +
                (playing ? '' : 'scale-[0.97] opacity-60 blur-[2px]')
              }
            >
              <EditorWindow
                title={c.title}
                tabs={c.tabs}
                shared={c.shared}
                theming={c.theming}
                canvasTint={c.canvasTint}
                showCursor={c.showCursor}
                playing={playing}
                diagram={diagram}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// One editor-window mock: shared chrome plus a caller-supplied SVG diagram.
// The diagram group is keyed on `playing` so its build animation restarts each
// time the window reaches centre; off-centre it gets .hero-static (settled).
function EditorWindow({
  title,
  tabs,
  diagram,
  playing,
  shared,
  theming,
  canvasTint,
  showCursor,
}: {
  title: string;
  tabs: TabDef[];
  diagram: ReactNode;
  playing: boolean;
  shared: boolean;
  theming: boolean;
  canvasTint: string;
  showCursor: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-brand-500/10">
      <div className="overflow-hidden rounded-lg border border-slate-100">
        {/* Editor header strip (static chrome) */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-white px-3 py-2">
          <Brand size="sm" />
          <div className="flex min-w-0 items-center gap-2">
            <span className="hidden truncate text-xs text-slate-400 sm:inline">{title}</span>
            {shared ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
                <span className="text-emerald-500">
                  <SharedDotIcon />
                </span>
                Shared
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200">
                <span className="text-amber-500">
                  <PrivateDotIcon />
                </span>
                Private
              </span>
            )}
          </div>
          {/* Presence: a shared diagram shows collaborators; a private one
              shows only you. */}
          <div className="flex items-center gap-1.5">
            <Avatar initials="TM" color="#0ea5e9" />
            {shared ? <Avatar initials="JR" color="#ec4899" /> : null}
          </div>
        </div>

        {/* Canvas surface. Each window has its own themed canvas tint; the
            flowchart additionally animates blue→green (overriding the resting
            tint) while it is centred. */}
        <div
          style={{ backgroundColor: canvasTint }}
          className={
            'relative h-[300px] bg-[radial-gradient(circle_at_center,_#cbd5e1_1.2px,_transparent_1.2px)] bg-[size:24px_24px] sm:h-[360px]' +
            (theming && playing ? ' hero-theme-canvas' : '')
          }
        >
          {/* Floating palette mockup (static chrome) */}
          <div className="absolute right-2 top-2 flex w-36 flex-col gap-1 rounded-lg border border-slate-200 bg-white p-1.5 shadow-md">
            <p className="px-1 text-[8px] font-semibold uppercase tracking-wider text-slate-500">
              Palette
            </p>
            <div className="flex flex-wrap gap-0.5">
              {['rect', 'circle', 'diamond', 'cyl', 'para', 'hex', 'doc', 'pill'].map((s) => (
                <span
                  key={s}
                  className="flex h-6 w-6 items-center justify-center rounded text-slate-500"
                >
                  <Shape kind={s} />
                </span>
              ))}
            </div>
          </div>

          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 -60 600 400"
            preserveAspectRatio="xMidYMid meet"
          >
            <g key={playing ? 'play' : 'idle'} className={playing ? undefined : 'hero-static'}>
              {diagram}
            </g>
          </svg>

          {/* Remote collaborator's cursor sweeping the canvas (flowchart card
              only; the mind-map card uses an in-canvas laser pointer, the
              private timeline has no collaborators). */}
          {showCursor && playing ? (
            <span className="hero-cursor pointer-events-none absolute" aria-hidden>
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="#ec4899"
                stroke="white"
                strokeWidth="1"
              >
                <path d="M2 1 L14 8 L8 9 L11 14 L9 15 L6 10 L2 14 Z" />
              </svg>
              <span
                className="absolute -top-3 left-3 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                style={{ backgroundColor: '#ec4899' }}
              >
                JR
              </span>
            </span>
          ) : null}
        </div>

        {/* Bottom tab bar (static chrome): colour-coded tabs relevant to this
            diagram + the toolbelt the page advertises. */}
        <div className="flex items-center gap-2 border-t border-slate-100 bg-white px-2 py-2">
          <span
            className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400"
            aria-hidden
          >
            <TabsLabelIcon />
            Tabs
          </span>
          <div className="flex min-w-0 items-center gap-1">
            {tabs.map((t) => (
              <span
                key={t.name}
                style={{ color: t.color, ...(t.active ? { backgroundColor: `${t.color}1a` } : {}) }}
                className="flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                <span className={t.active ? '' : 'text-slate-500'}>{t.name}</span>
                {t.active ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                    <circle cx="3" cy="7" r="1.25" fill="currentColor" />
                    <circle cx="7" cy="7" r="1.25" fill="currentColor" />
                    <circle cx="11" cy="7" r="1.25" fill="currentColor" />
                  </svg>
                ) : null}
              </span>
            ))}
            <span className="px-1 text-base leading-none text-slate-400">+</span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-slate-400">
            <ToolGlyph kind="search" />
            <ToolGlyph kind="keys" />
            <ToolGlyph kind="gear" />
            <ToolGlyph kind="moon" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <span
      style={{ backgroundColor: color, boxShadow: '0 0 0 2px white, 0 0 0 4px #22c55e' }}
      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
    >
      {initials}
    </span>
  );
}

// Card 1 diagram: a flowchart that builds, recolours (the only window that
// does), renames a box, and gets a comment. Shapes inherit fill/stroke from
// the hero-theme group so the recolour beat repaints the whole diagram.
function FlowchartDiagram() {
  return (
    <>
      <g
        className="hero-theme"
        fill="#dbeafe"
        stroke="#0284c7"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <g className="hero-pop1">
          <rect x="80" y="34" width="120" height="44" rx="22" />
          <text
            x="140"
            y="62"
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="600"
            fontSize="14"
            fill={BLUE_TEXT}
            stroke="none"
          >
            Start
          </text>
        </g>

        <g className="hero-pop2">
          <rect x="80" y="118" width="120" height="52" rx="8" />
          <text
            className="hero-text-out"
            x="140"
            y="150"
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="600"
            fontSize="14"
            fill={BLUE_TEXT}
            stroke="none"
          >
            Plan
          </text>
          <text
            className="hero-text-in"
            x="140"
            y="150"
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="600"
            fontSize="14"
            fill={BLUE_TEXT}
            stroke="none"
          >
            Build
          </text>
        </g>

        <g className="hero-pop3">
          <polygon points="290,108 360,140 290,172 220,140" />
          <text
            x="290"
            y="145"
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="600"
            fontSize="13"
            fill={BLUE_TEXT}
            stroke="none"
          >
            Ready?
          </text>
        </g>

        <g className="hero-pop4">
          <rect x="400" y="118" width="120" height="52" rx="8" />
          <text
            x="460"
            y="150"
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="600"
            fontSize="14"
            fill={BLUE_TEXT}
            stroke="none"
          >
            Ship
          </text>
        </g>

        <g className="hero-pop5">
          <rect x="400" y="206" width="120" height="44" rx="22" />
          <text
            x="460"
            y="234"
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="600"
            fontSize="14"
            fill={BLUE_TEXT}
            stroke="none"
          >
            Done
          </text>
        </g>
      </g>

      {/* Arrows (each a path that traces the line then its barbs, so the head
          draws in last with the stroke). */}
      <g style={{ color: '#0284c7' }} fill="none">
        <path
          className="hero-line1"
          d="M140 78 L140 118 M134 111 L140 118 L146 111"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="hero-line2"
          d="M200 140 L220 140 M214 134 L220 140 L214 146"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="hero-line3"
          d="M360 140 L400 140 M394 134 L400 140 L394 146"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="hero-line4"
          d="M460 170 L460 206 M454 199 L460 206 L466 199"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* A comment thread pops onto the Ship box */}
      <g transform="translate(508 102)">
        <g className="hero-comment">
          <circle cx="0" cy="0" r="9" fill="#f59e0b" stroke="none" />
          <text x="0" y="3.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
            1
          </text>
          <g transform="translate(12 -8)">
            <rect width="96" height="46" rx="6" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="13" cy="14" r="5" fill="#ec4899" />
            <rect x="23" y="10" width="58" height="6" rx="3" fill="#e2e8f0" />
            <rect x="13" y="26" width="70" height="5" rx="2.5" fill="#f1f5f9" />
            <rect x="13" y="35" width="50" height="5" rx="2.5" fill="#f1f5f9" />
          </g>
        </g>
      </g>
    </>
  );
}

// Card 2 diagram: a mind map that builds out from a central node, then (when
// playing) a laser pointer rings the top-left node, moves to the bottom-right
// node and rings it. It does not recolour. Reuses the hero-pop / hero-line
// build keyframes; the laser uses its own hero-laser-* keyframes.
function MindMapDiagram({ playing, theme }: { playing: boolean; theme: Theme }) {
  const nodes = [
    { cls: 'hero-pop2', x: 70, y: 30, w: 110, h: 36, label: 'Research' },
    { cls: 'hero-pop3', x: 420, y: 30, w: 110, h: 36, label: 'Design' },
    { cls: 'hero-pop4', x: 70, y: 214, w: 110, h: 36, label: 'Build' },
    { cls: 'hero-pop5', x: 420, y: 214, w: 110, h: 36, label: 'Launch' },
  ];
  const label = (x: number, y: number, text: string, size = 13) => (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontFamily="ui-sans-serif, system-ui, sans-serif"
      fontWeight="600"
      fontSize={size}
      fill={theme.text}
      stroke="none"
    >
      {text}
    </text>
  );
  return (
    <>
      {/* Branches draw first underneath the nodes. */}
      <g style={{ color: theme.stroke }} fill="none">
        <path
          className="hero-line1"
          d="M255 125 L180 66"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="hero-line2"
          d="M345 125 L420 66"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="hero-line3"
          d="M255 155 L180 214"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="hero-line4"
          d="M345 155 L420 214"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      <g fill={theme.fill} stroke={theme.stroke} strokeWidth="2" strokeLinejoin="round">
        {/* Central node */}
        <g className="hero-pop1">
          <rect x="250" y="120" width="100" height="40" rx="20" />
          {label(300, 145, 'Project')}
        </g>
        {/* Branch nodes */}
        {nodes.map((nd) => (
          <g key={nd.label} className={nd.cls}>
            <rect x={nd.x} y={nd.y} width={nd.w} height={nd.h} rx="8" />
            {label(nd.x + nd.w / 2, nd.y + nd.h / 2 + 4, nd.label)}
          </g>
        ))}
      </g>

      {/* Laser pointer: rings Research (top-left), then moves to Launch
          (bottom-right) and rings it. Only on the active card. */}
      {playing ? (
        <g>
          <ellipse className="hero-laser-ring hero-laser-a" cx="125" cy="48" rx="74" ry="30" />
          <ellipse className="hero-laser-ring hero-laser-b" cx="475" cy="232" rx="74" ry="30" />
          <circle className="hero-laser-dot" cx="0" cy="0" r="4.5" />
        </g>
      ) : null}
    </>
  );
}

// Card 3 diagram: a release timeline. The axis draws left to right (four
// hero-line segments) while milestones pop in above and below it. It does not
// recolour.
function TimelineDiagram({ theme }: { theme: Theme }) {
  const milestones = [
    { cls: 'hero-pop1', x: 80, above: true, title: 'Kickoff', date: 'Jan' },
    { cls: 'hero-pop2', x: 190, above: false, title: 'Design', date: 'Mar' },
    { cls: 'hero-pop3', x: 300, above: true, title: 'Build', date: 'Jun' },
    { cls: 'hero-pop4', x: 410, above: false, title: 'Beta', date: 'Sep' },
    { cls: 'hero-pop5', x: 520, above: true, title: 'Launch', date: 'Dec' },
  ];
  return (
    <>
      {/* Axis, drawn in four segments left to right. */}
      <g style={{ color: theme.stroke }} fill="none">
        <path
          className="hero-line1"
          d="M80 140 L190 140"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="hero-line2"
          d="M190 140 L300 140"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="hero-line3"
          d="M300 140 L410 140"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="hero-line4"
          d="M410 140 L520 140"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      <g fill={theme.fill} stroke={theme.stroke} strokeWidth="2" strokeLinejoin="round">
        {milestones.map((m) => {
          const cardY = m.above ? 70 : 168;
          const connFrom = m.above ? 106 : 168;
          const connTo = m.above ? 134 : 146;
          return (
            <g key={m.title} className={m.cls}>
              <line
                x1={m.x}
                y1={connFrom}
                x2={m.x}
                y2={connTo}
                stroke={theme.stroke}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx={m.x} cy="140" r="6" fill={theme.stroke} stroke="none" />
              <rect x={m.x - 46} y={cardY} width="92" height="36" rx="6" />
              <text
                x={m.x}
                y={cardY + 16}
                textAnchor="middle"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontWeight="600"
                fontSize="12"
                fill={theme.text}
                stroke="none"
              >
                {m.title}
              </text>
              <text
                x={m.x}
                y={cardY + 28}
                textAnchor="middle"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontWeight="500"
                fontSize="9"
                fill="#64748b"
                stroke="none"
              >
                {m.date}
              </text>
            </g>
          );
        })}
      </g>
    </>
  );
}

// Tab-bar "Tabs" label icon, mirroring apps/live/components/TabBar.tsx.
function TabsLabelIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1.5 4.5h3l1 1.25h5v4.25h-9z" />
      <path d="M3 4.5V3h3.25" />
    </svg>
  );
}

// Connected-nodes glyph for the header "Shared" badge, mirroring
// EditorHeader's SharedDotIcon.
function SharedDotIcon() {
  return (
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
  );
}

// Padlock glyph for the header "Private" badge, mirroring EditorHeader's
// PrivateDotIcon.
function PrivateDotIcon() {
  return (
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
      <rect x="2" y="4" width="5" height="3.5" rx="0.8" />
      <path d="M3.25 4V3a1.25 1.25 0 0 1 2.5 0v1" />
    </svg>
  );
}

// Small toolbelt glyphs for the hero's bottom tab bar (search, keyboard
// shortcuts, settings, dark-mode). Decorative, sized for the chrome.
function ToolGlyph({ kind }: { kind: 'search' | 'keys' | 'gear' | 'moon' }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  } as const;
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-md">
      {kind === 'search' ? (
        <svg {...common}>
          <circle cx="7" cy="7" r="4" />
          <path d="M10 10l3.5 3.5" />
        </svg>
      ) : kind === 'keys' ? (
        <svg {...common}>
          <rect x="1.5" y="4" width="13" height="8" rx="1.5" />
          <path d="M4 7h.01M7 7h.01M10 7h.01M5 9.5h6" />
        </svg>
      ) : kind === 'gear' ? (
        <svg {...common}>
          <circle cx="8" cy="8" r="2.2" />
          <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4" />
        </svg>
      ) : (
        <svg {...common}>
          <path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z" />
        </svg>
      )}
    </span>
  );
}

function Shape({ kind }: { kind: string }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    'aria-hidden': true,
  } as const;
  switch (kind) {
    case 'rect':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="10" height="10" rx="2" />
        </svg>
      );
    case 'circle':
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="5" />
        </svg>
      );
    case 'diamond':
      return (
        <svg {...common}>
          <polygon points="8,3 13,8 8,13 3,8" strokeLinejoin="round" />
        </svg>
      );
    case 'cyl':
      return (
        <svg {...common}>
          <path d="M3 5 L3 12 A5 1.5 0 0 0 13 12 L13 5" strokeLinejoin="round" />
          <ellipse cx="8" cy="5" rx="5" ry="1.5" />
        </svg>
      );
    case 'para':
      return (
        <svg {...common}>
          <polygon points="4,3 13,3 12,13 3,13" strokeLinejoin="round" />
        </svg>
      );
    case 'hex':
      return (
        <svg {...common}>
          <polygon points="4,3 11,3 14,8 11,13 4,13 1,8" strokeLinejoin="round" />
        </svg>
      );
    case 'doc':
      return (
        <svg {...common}>
          <path
            d="M3 3 L13 3 L13 12 C11 13.4 9.5 11.5 8 12.6 C6.5 13.7 5 11.5 3 12.6 Z"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'pill':
      return (
        <svg {...common}>
          <rect x="2" y="5" width="12" height="6" rx="3" />
        </svg>
      );
  }
  return null;
}
