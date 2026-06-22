// Palette catalogue-tab illustrations (spec/55): the Components, Devices, Icons,
// and Technology tabs of the floating palette. Composed only from the shared
// primitives so the house style holds; the four scenes share one catalogue
// frame so the palette chrome is drawn once, not redrawn per tab.

import type { ReactNode } from 'react';

import { Scene, Panel, Tabs, Label, TextBar } from './primitives';

/** The palette panel framing every catalogue tab: a titled panel with the
 *  catalogue tab strip and a search field, with the tab body drawn by callers.
 *  Reused by all four catalogue scenes so the chrome lives in one place. */
function CatalogueGrid({
  active,
  search,
  children,
}: {
  active: number;
  search: string;
  children: ReactNode;
}) {
  return (
    <Scene w={400} h={240} bg="plain">
      <Panel x={40} y={20} w={320} h={200} title="PALETTE">
        <Tabs
          x={52}
          y={50}
          items={['Components', 'Devices', 'Icons', 'Technology']}
          active={active}
          tabW={74}
          h={22}
        />
        {/* Search field */}
        <rect
          x={52}
          y={80}
          width={296}
          height={24}
          rx={7}
          className="fill-slate-50 stroke-slate-200"
          strokeWidth={1.5}
        />
        <circle cx={66} cy={92} r={5} className="fill-none stroke-slate-400" strokeWidth={1.6} />
        <path
          d="M69.5 95.5 L74 100"
          className="stroke-slate-400"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
        <Label x={80} y={93} size={11} tone="muted">
          {search}
        </Label>
        {children}
      </Panel>
    </Scene>
  );
}

/** Components tab: pre-assembled blocks (a banner, a callout, a stat row) shown
 *  as cards in the catalogue. */
export function ComponentsCatalogue() {
  return (
    <CatalogueGrid active={0} search="Search components">
      {/* Banner card */}
      <rect
        x={52}
        y={116}
        width={142}
        height={42}
        rx={8}
        className="fill-white stroke-slate-200"
        strokeWidth={1.5}
      />
      <rect x={52} y={116} width={6} height={42} rx={3} className="fill-brand-500" />
      <Label x={68} y={130} size={10} weight={700} tone="strong">
        Banner
      </Label>
      <TextBar x={68} y={142} w={96} />
      {/* Callout card */}
      <rect
        x={206}
        y={116}
        width={142}
        height={42}
        rx={8}
        className="fill-brand-50 stroke-brand-200"
        strokeWidth={1.5}
      />
      <circle cx={222} cy={131} r={7} className="fill-brand-400" />
      <Label x={222} y={132} anchor="middle" size={9} weight={700} tone="onAccent">
        i
      </Label>
      <TextBar x={236} y={126} w={92} tone="accent" />
      <TextBar x={236} y={138} w={70} tone="faint" />
      {/* Stat row card */}
      <rect
        x={52}
        y={166}
        width={296}
        height={42}
        rx={8}
        className="fill-white stroke-slate-200"
        strokeWidth={1.5}
      />
      {[0, 1, 2].map((i) => {
        const sx = 64 + i * 96;
        return (
          <g key={i}>
            <rect
              x={sx}
              y={174}
              width={84}
              height={26}
              rx={5}
              className="fill-slate-50 stroke-slate-200"
              strokeWidth={1}
            />
            <Label x={sx + 42} y={184} anchor="middle" size={11} weight={700} tone="accent">
              {['98%', '1.2k', '4.7'][i]}
            </Label>
            <TextBar x={sx + 22} y={192} w={40} tone="faint" />
          </g>
        );
      })}
    </CatalogueGrid>
  );
}

/** Devices tab: wireframe device frames (a browser window, a phone, a laptop)
 *  shown side by side in the catalogue. */
export function DevicesCatalogue() {
  return (
    <CatalogueGrid active={1} search="Search devices">
      {/* Browser window */}
      <g>
        <rect
          x={56}
          y={120}
          width={148}
          height={88}
          rx={8}
          className="fill-white stroke-slate-300"
          strokeWidth={2}
        />
        <rect x={56} y={120} width={148} height={18} rx={8} className="fill-slate-100" />
        <rect x={56} y={132} width={148} height={6} className="fill-slate-100" />
        <circle cx={66} cy={129} r={2.5} className="fill-slate-300" />
        <circle cx={74} cy={129} r={2.5} className="fill-slate-300" />
        <circle cx={82} cy={129} r={2.5} className="fill-slate-300" />
        <rect
          x={92}
          y={125}
          width={104}
          height={8}
          rx={4}
          className="fill-white stroke-slate-200"
          strokeWidth={1}
        />
        <TextBar x={66} y={150} w={120} tone="faint" />
        <TextBar x={66} y={164} w={92} tone="faint" />
        <rect x={66} y={178} width={60} height={20} rx={4} className="fill-brand-100" />
        <Label x={130} y={214} anchor="middle" size={9} tone="muted">
          Web Browser
        </Label>
      </g>
      {/* Phone */}
      <g>
        <rect
          x={224}
          y={120}
          width={48}
          height={88}
          rx={9}
          className="fill-white stroke-slate-300"
          strokeWidth={2}
        />
        <rect x={236} y={124} width={24} height={3} rx={1.5} className="fill-slate-200" />
        <TextBar x={232} y={138} w={32} tone="faint" />
        <rect x={232} y={148} width={32} height={22} rx={4} className="fill-brand-100" />
        <TextBar x={232} y={178} w={32} tone="faint" />
        <TextBar x={232} y={188} w={22} tone="faint" />
        <Label x={248} y={214} anchor="middle" size={9} tone="muted">
          Phone
        </Label>
      </g>
      {/* Laptop */}
      <g>
        <rect
          x={290}
          y={122}
          width={58}
          height={40}
          rx={4}
          className="fill-white stroke-slate-300"
          strokeWidth={2}
        />
        <rect x={296} y={128} width={46} height={28} rx={2} className="fill-slate-50" />
        <path
          d="M284 166 H354 L350 158 H288 Z"
          className="fill-slate-100 stroke-slate-300"
          strokeWidth={1.5}
        />
        <Label x={319} y={214} anchor="middle" size={9} tone="muted">
          Laptop
        </Label>
      </g>
    </CatalogueGrid>
  );
}

/** Icons tab: a searchable grid of single-colour glyph icons. */
export function IconsCatalogue() {
  const glyphs: ReactNode[] = [
    // server
    <g key="g">
      <rect
        x={-8}
        y={-7}
        width={16}
        height={6}
        rx={1.5}
        className="stroke-brand-500"
        strokeWidth={1.6}
        fill="none"
      />
      <rect
        x={-8}
        y={2}
        width={16}
        height={6}
        rx={1.5}
        className="stroke-brand-500"
        strokeWidth={1.6}
        fill="none"
      />
      <circle cx={-4} cy={-4} r={1} className="fill-brand-500" />
      <circle cx={-4} cy={5} r={1} className="fill-brand-500" />
    </g>,
    // heart
    <path
      key="h"
      d="M0 6 C-8 0 -6 -8 0 -3 C6 -8 8 0 0 6 Z"
      className="stroke-brand-500"
      strokeWidth={1.6}
      fill="none"
    />,
    // calendar
    <g key="c">
      <rect
        x={-8}
        y={-6}
        width={16}
        height={13}
        rx={2}
        className="stroke-brand-500"
        strokeWidth={1.6}
        fill="none"
      />
      <path d="M-8 -2 H8 M-4 -8 V-4 M4 -8 V-4" className="stroke-brand-500" strokeWidth={1.6} />
    </g>,
    // user
    <g key="u">
      <circle cx={0} cy={-3} r={3.5} className="stroke-brand-500" strokeWidth={1.6} fill="none" />
      <path d="M-6 7 a6 6 0 0 1 12 0" className="stroke-brand-500" strokeWidth={1.6} fill="none" />
    </g>,
    // lock
    <g key="l">
      <rect
        x={-6}
        y={-1}
        width={12}
        height={9}
        rx={2}
        className="stroke-brand-500"
        strokeWidth={1.6}
        fill="none"
      />
      <path
        d="M-3 -1 V-4 a3 3 0 0 1 6 0 V-1"
        className="stroke-brand-500"
        strokeWidth={1.6}
        fill="none"
      />
    </g>,
    // file
    <g key="f">
      <path
        d="M-5 -8 H3 L7 -4 V8 H-5 Z"
        className="stroke-brand-500"
        strokeWidth={1.6}
        fill="none"
      />
      <path d="M3 -8 V-4 H7" className="stroke-brand-500" strokeWidth={1.6} fill="none" />
    </g>,
    // chart
    <g key="ch">
      <path d="M-7 8 V-7 M-7 8 H8" className="stroke-brand-500" strokeWidth={1.6} fill="none" />
      <path
        d="M-3 4 V0 M1 4 V-3 M5 4 V-5"
        className="stroke-brand-500"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </g>,
    // arrow
    <path
      key="a"
      d="M-7 0 H6 M2 -4 L6 0 L2 4"
      className="stroke-brand-500"
      strokeWidth={1.8}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
    // bin
    <g key="b">
      <path
        d="M-6 -3 H6 M-4 -3 V7 H4 V-3 M-3 -3 V-5 H3 V-3"
        className="stroke-brand-500"
        strokeWidth={1.6}
        fill="none"
        strokeLinejoin="round"
      />
    </g>,
    // gear
    <g key="ge">
      <circle r={3} className="stroke-brand-500" strokeWidth={1.6} fill="none" />
      <path
        d="M0 -7 V-4 M0 4 V7 M-7 0 H-4 M4 0 H7 M-5 -5 L-3 -3 M5 5 L3 3 M5 -5 L3 -3 M-5 5 L-3 3"
        className="stroke-brand-500"
        strokeWidth={1.4}
      />
    </g>,
    // cloud
    <path
      key="cl"
      d="M-6 5 a4 4 0 0 1 0 -8 a5 5 0 0 1 10 0 a3.5 3.5 0 0 1 0 8 Z"
      className="stroke-brand-500"
      strokeWidth={1.6}
      fill="none"
    />,
    // star
    <path
      key="s"
      d="M0 -7 L2 -2 L7 -2 L3 1 L5 6 L0 3 L-5 6 L-3 1 L-7 -2 L-2 -2 Z"
      className="stroke-brand-500"
      strokeWidth={1.4}
      fill="none"
      strokeLinejoin="round"
    />,
  ];
  return (
    <CatalogueGrid active={2} search="server">
      {glyphs.map((g, i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        const tx = 52 + col * 50;
        const ty = 116 + row * 46;
        const sel = i === 0;
        return (
          <g key={i}>
            <rect
              x={tx}
              y={ty}
              width={42}
              height={38}
              rx={7}
              className={sel ? 'fill-brand-50 stroke-brand-500' : 'fill-white stroke-slate-200'}
              strokeWidth={sel ? 2 : 1.5}
            />
            <g transform={`translate(${tx + 21} ${ty + 19})`}>{g}</g>
          </g>
        );
      })}
    </CatalogueGrid>
  );
}

/** Technology tab: a grid of full-colour infrastructure brand tiles in their
 *  own accent hues, each captioned. */
export function TechnologyCatalogue() {
  const tiles: { label: string; fill: string; glyph: ReactNode }[] = [
    {
      label: 'S3',
      fill: 'fill-emerald-500',
      glyph: (
        <path
          d="M-7 -5 a7 3 0 0 0 14 0 v10 a7 3 0 0 1 -14 0 Z M-7 -5 a7 3 0 0 0 14 0"
          className="stroke-white"
          strokeWidth={1.6}
          fill="none"
        />
      ),
    },
    {
      label: 'Lambda',
      fill: 'fill-amber-500',
      glyph: (
        <path
          d="M-6 6 L-1 -6 L1 -6 L7 6 M-3 0 L3 0"
          className="stroke-white"
          strokeWidth={1.8}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
    {
      label: 'EC2',
      fill: 'fill-rose-500',
      glyph: (
        <g>
          <rect
            x={-6}
            y={-6}
            width={12}
            height={12}
            rx={1.5}
            className="stroke-white"
            strokeWidth={1.6}
            fill="none"
          />
          <path
            d="M-3 -8 V8 M3 -8 V8 M-8 -3 H8 M-8 3 H8"
            className="stroke-white"
            strokeWidth={1.2}
          />
        </g>
      ),
    },
    {
      label: 'Azure SQL',
      fill: 'fill-indigo-500',
      glyph: (
        <path
          d="M-6 -4 a6 3 0 0 0 12 0 v8 a6 3 0 0 1 -12 0 Z M-6 -4 a6 3 0 0 0 12 0 M-6 0 a6 3 0 0 0 12 0"
          className="stroke-white"
          strokeWidth={1.4}
          fill="none"
        />
      ),
    },
    {
      label: 'Functions',
      fill: 'fill-teal-500',
      glyph: (
        <path
          d="M-5 6 q-2 0 -2 -3 v-6 q0 -3 -2 -3 M5 6 q2 0 2 -3 v-6 q0 -3 2 -3"
          className="stroke-white"
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
        />
      ),
    },
    {
      label: 'Kubernetes',
      fill: 'fill-violet-500',
      glyph: (
        <g>
          <path
            d="M0 -7 L6 -3 L4 5 L-4 5 L-6 -3 Z"
            className="stroke-white"
            strokeWidth={1.4}
            fill="none"
            strokeLinejoin="round"
          />
          <circle r={2} className="stroke-white" strokeWidth={1.2} fill="none" />
        </g>
      ),
    },
    {
      label: 'Postgres',
      fill: 'fill-brand-500',
      glyph: (
        <g>
          <ellipse rx={6} ry={7} className="stroke-white" strokeWidth={1.5} fill="none" />
          <path d="M0 -3 a3 3 0 0 1 0 6" className="stroke-white" strokeWidth={1.4} fill="none" />
        </g>
      ),
    },
    {
      label: 'Redis',
      fill: 'fill-rose-500',
      glyph: (
        <path
          d="M-7 -3 L0 -6 L7 -3 L0 0 Z M-7 1 L0 -2 L7 1 L0 4 Z"
          className="stroke-white"
          strokeWidth={1.3}
          fill="none"
          strokeLinejoin="round"
        />
      ),
    },
  ];
  return (
    <CatalogueGrid active={3} search="Search technology">
      {tiles.map((t, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const tx = 56 + col * 76;
        const ty = 116 + row * 48;
        return (
          <g key={i}>
            <rect x={tx} y={ty} width={36} height={36} rx={8} className={t.fill} />
            <g transform={`translate(${tx + 18} ${ty + 18})`}>{t.glyph}</g>
            <Label x={tx + 18} y={ty + 44} anchor="middle" size={8} tone="muted">
              {t.label}
            </Label>
          </g>
        );
      })}
    </CatalogueGrid>
  );
}
