// Animated mini-editor illustration shown in the hero. Mirrors the real
// editor's visual vocabulary — dot-grid canvas, brand-coloured shapes
// with rounded corners, pinned arrows, participant avatars in the
// top-right — so the landing page actually shows what the product
// looks like. The animation loops every ~14 seconds, building a small
// flowchart-style diagram and then settling.

export function HeroIllustration() {
  return (
    <div
      aria-hidden
      className="mx-auto mt-16 max-w-4xl rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-brand-500/10"
    >
      <div className="overflow-hidden rounded-lg border border-slate-100">
        {/* Editor header strip */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              live<span className="text-brand-600">[diagram]</span>
            </span>
          </div>
          <div className="text-xs text-slate-400">Quarterly planning</div>
          <div className="flex items-center gap-1.5">
            <span
              style={{
                backgroundColor: '#0ea5e9',
                boxShadow: '0 0 0 2px white, 0 0 0 4px #22c55e',
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
            >
              TM
            </span>
            <span
              style={{
                backgroundColor: '#ec4899',
                boxShadow: '0 0 0 2px white, 0 0 0 4px #22c55e',
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white animate-hero-presence-2"
            >
              JR
            </span>
          </div>
        </div>

        {/* Canvas surface */}
        <div className="relative h-[280px] bg-[radial-gradient(circle_at_center,_#cbd5e1_1.2px,_transparent_1.2px)] bg-[size:24px_24px]">
          {/* Floating palette mockup */}
          <div className="absolute right-3 top-3 flex w-44 flex-col gap-1 rounded-lg border border-slate-200 bg-white p-1.5 shadow-md">
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

          {/* Diagram shapes */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 600 280"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Arrow defs */}
            <defs>
              <marker
                id="hero-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
              </marker>
            </defs>

            {/* Start (stadium) */}
            <g className="hero-shape hero-shape-1">
              <rect
                x="80"
                y="34"
                width="120"
                height="44"
                rx="22"
                fill="#dbeafe"
                stroke="#0284c7"
                strokeWidth="2"
              />
              <text
                x="140"
                y="62"
                textAnchor="middle"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontWeight="600"
                fontSize="14"
                fill="#0c4a6e"
              >
                Start
              </text>
            </g>

            {/* Process box */}
            <g className="hero-shape hero-shape-2">
              <rect
                x="80"
                y="118"
                width="120"
                height="52"
                rx="8"
                fill="#dbeafe"
                stroke="#0284c7"
                strokeWidth="2"
              />
              <text
                x="140"
                y="150"
                textAnchor="middle"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontWeight="600"
                fontSize="14"
                fill="#0c4a6e"
              >
                Plan
              </text>
            </g>

            {/* Decision diamond */}
            <g className="hero-shape hero-shape-3">
              <polygon
                points="290,108 360,140 290,172 220,140"
                fill="#dbeafe"
                stroke="#0284c7"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <text
                x="290"
                y="145"
                textAnchor="middle"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontWeight="600"
                fontSize="13"
                fill="#0c4a6e"
              >
                Ready?
              </text>
            </g>

            {/* Ship */}
            <g className="hero-shape hero-shape-4">
              <rect
                x="400"
                y="118"
                width="120"
                height="52"
                rx="8"
                fill="#dbeafe"
                stroke="#0284c7"
                strokeWidth="2"
              />
              <text
                x="460"
                y="150"
                textAnchor="middle"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontWeight="600"
                fontSize="14"
                fill="#0c4a6e"
              >
                Ship
              </text>
            </g>

            {/* End stadium */}
            <g className="hero-shape hero-shape-5">
              <rect
                x="400"
                y="206"
                width="120"
                height="44"
                rx="22"
                fill="#dbeafe"
                stroke="#0284c7"
                strokeWidth="2"
              />
              <text
                x="460"
                y="234"
                textAnchor="middle"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontWeight="600"
                fontSize="14"
                fill="#0c4a6e"
              >
                Done
              </text>
            </g>

            {/* Arrows */}
            <g style={{ color: '#0284c7' }}>
              <line
                className="hero-arrow hero-arrow-1"
                x1="140"
                y1="78"
                x2="140"
                y2="118"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                markerEnd="url(#hero-arrow)"
              />
              <line
                className="hero-arrow hero-arrow-2"
                x1="200"
                y1="140"
                x2="220"
                y2="140"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                markerEnd="url(#hero-arrow)"
              />
              <line
                className="hero-arrow hero-arrow-3"
                x1="360"
                y1="140"
                x2="400"
                y2="140"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                markerEnd="url(#hero-arrow)"
              />
              <line
                className="hero-arrow hero-arrow-4"
                x1="460"
                y1="170"
                x2="460"
                y2="206"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                markerEnd="url(#hero-arrow)"
              />
            </g>
          </svg>

          {/* Remote-collaborator cursor + selection ring */}
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
        </div>
      </div>
    </div>
  );
}

function Shape({ kind }: { kind: string }) {
  switch (kind) {
    case 'rect':
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <rect x="3" y="3" width="10" height="10" rx="2" />
        </svg>
      );
    case 'circle':
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <circle cx="8" cy="8" r="5" />
        </svg>
      );
    case 'diamond':
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <polygon points="8,3 13,8 8,13 3,8" strokeLinejoin="round" />
        </svg>
      );
    case 'cyl':
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M3 5 L3 12 A5 1.5 0 0 0 13 12 L13 5" strokeLinejoin="round" />
          <ellipse cx="8" cy="5" rx="5" ry="1.5" />
        </svg>
      );
    case 'para':
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <polygon points="4,3 13,3 12,13 3,13" strokeLinejoin="round" />
        </svg>
      );
    case 'hex':
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <polygon points="4,3 11,3 14,8 11,13 4,13 1,8" strokeLinejoin="round" />
        </svg>
      );
    case 'doc':
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path
            d="M3 3 L13 3 L13 12 C11 13.4 9.5 11.5 8 12.6 C6.5 13.7 5 11.5 3 12.6 Z"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'pill':
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <rect x="2" y="5" width="12" height="6" rx="3" />
        </svg>
      );
  }
  return null;
}
