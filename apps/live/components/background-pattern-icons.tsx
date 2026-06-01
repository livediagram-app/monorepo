// 28x20 SVG previews used in the Current Tab → Canvas accordion's
// pattern picker (CommandPalette / TabSection). Each icon depicts
// the pattern at a glance. Pulled out of CommandPalette.tsx to keep
// that file focused on the picker UI rather than the SVG vocabulary.
//
// Visual contract: 28px x 20px, viewBox="0 0 28 20", a rounded
// rect frame stroked at currentColor with opacity 0.5, and the
// pattern motif inside. The matching PatternButton wrapper drives
// active / hover state via colour, so every icon keeps stroke at
// currentColor + fill at currentColor (or named tailwind shades for
// the confetti accent dots).

export function BackgroundGridIcon() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden>
      <rect
        width="28"
        height="20"
        rx="2"
        fill="white"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.5"
      />
      {Array.from({ length: 4 }).flatMap((_, i) =>
        Array.from({ length: 3 }).map((__, j) => (
          <circle key={`${i}-${j}`} cx={4 + i * 6} cy={4 + j * 6} r="0.8" fill="currentColor" />
        )),
      )}
    </svg>
  );
}

export function BackgroundBlankIcon() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden>
      <rect
        width="28"
        height="20"
        rx="2"
        fill="white"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.5"
      />
    </svg>
  );
}

export function BackgroundLinesIcon() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden>
      <rect
        width="28"
        height="20"
        rx="2"
        fill="white"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.5"
      />
      <line x1="2" y1="6" x2="26" y2="6" stroke="currentColor" strokeWidth="0.7" />
      <line x1="2" y1="11" x2="26" y2="11" stroke="currentColor" strokeWidth="0.7" />
      <line x1="2" y1="16" x2="26" y2="16" stroke="currentColor" strokeWidth="0.7" />
    </svg>
  );
}

export function BackgroundGraphIcon() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden>
      <rect
        width="28"
        height="20"
        rx="2"
        fill="white"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.5"
      />
      {[5, 10, 15].map((y) => (
        <line key={`h${y}`} x1="0" y1={y} x2="28" y2={y} stroke="currentColor" strokeWidth="0.4" />
      ))}
      {[5, 10, 15, 20, 25].map((x) => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="20" stroke="currentColor" strokeWidth="0.4" />
      ))}
    </svg>
  );
}

export function BackgroundCrosshatchIcon() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden>
      <rect
        width="28"
        height="20"
        rx="2"
        fill="white"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.5"
      />
      <line x1="0" y1="6" x2="22" y2="20" stroke="currentColor" strokeWidth="0.5" />
      <line x1="6" y1="0" x2="28" y2="14" stroke="currentColor" strokeWidth="0.5" />
      <line x1="0" y1="14" x2="14" y2="0" stroke="currentColor" strokeWidth="0.5" />
      <line x1="14" y1="20" x2="28" y2="6" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  );
}

export function BackgroundConfettiIcon() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden>
      <rect
        width="28"
        height="20"
        rx="2"
        fill="white"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.5"
      />
      <circle cx="5" cy="6" r="1.3" fill="rgb(248 113 113)" />
      <circle cx="13" cy="4" r="1" fill="rgb(96 165 250)" />
      <circle cx="22" cy="8" r="1.3" fill="rgb(250 204 21)" />
      <circle cx="8" cy="14" r="1.3" fill="rgb(167 139 250)" />
      <circle cx="18" cy="13" r="1" fill="rgb(52 211 153)" />
      <circle cx="24" cy="16" r="1.3" fill="rgb(236 72 153)" />
    </svg>
  );
}

export function BackgroundStripesIcon() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden>
      <rect width="28" height="20" rx="2" fill="white" stroke="currentColor" strokeWidth="0.5" />
      {[6, 12, 18, 24].map((x) => (
        <line key={x} x1={x} y1="3" x2={x} y2="17" stroke="currentColor" strokeWidth="0.75" />
      ))}
    </svg>
  );
}

export function BackgroundDiagonalIcon() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden>
      <rect width="28" height="20" rx="2" fill="white" stroke="currentColor" strokeWidth="0.5" />
      {[-6, 0, 6, 12, 18, 24].map((x) => (
        <line key={x} x1={x} y1="20" x2={x + 16} y2="4" stroke="currentColor" strokeWidth="0.75" />
      ))}
    </svg>
  );
}

export function BackgroundWavesIcon() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden>
      <rect width="28" height="20" rx="2" fill="white" stroke="currentColor" strokeWidth="0.5" />
      {[6, 12, 17].map((y) => (
        <path
          key={y}
          d={`M2 ${y} Q 8 ${y - 2.5} 14 ${y} T 26 ${y}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
        />
      ))}
    </svg>
  );
}

export function BackgroundBricksIcon() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden>
      <rect width="28" height="20" rx="2" fill="white" stroke="currentColor" strokeWidth="0.5" />
      {/* Row 1: full cells. */}
      <line x1="2" y1="6" x2="26" y2="6" stroke="currentColor" strokeWidth="0.75" />
      <line x1="2" y1="14" x2="26" y2="14" stroke="currentColor" strokeWidth="0.75" />
      <line x1="10" y1="2" x2="10" y2="6" stroke="currentColor" strokeWidth="0.75" />
      <line x1="18" y1="2" x2="18" y2="6" stroke="currentColor" strokeWidth="0.75" />
      <line x1="6" y1="6" x2="6" y2="14" stroke="currentColor" strokeWidth="0.75" />
      <line x1="14" y1="6" x2="14" y2="14" stroke="currentColor" strokeWidth="0.75" />
      <line x1="22" y1="6" x2="22" y2="14" stroke="currentColor" strokeWidth="0.75" />
      <line x1="10" y1="14" x2="10" y2="18" stroke="currentColor" strokeWidth="0.75" />
      <line x1="18" y1="14" x2="18" y2="18" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}

export function BackgroundPlusIcon() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden>
      <rect width="28" height="20" rx="2" fill="white" stroke="currentColor" strokeWidth="0.5" />
      {[
        { x: 7, y: 6 },
        { x: 21, y: 6 },
        { x: 14, y: 13 },
      ].map((c) => (
        <g key={`${c.x}-${c.y}`} stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
          <line x1={c.x - 2} y1={c.y} x2={c.x + 2} y2={c.y} />
          <line x1={c.x} y1={c.y - 2} x2={c.x} y2={c.y + 2} />
        </g>
      ))}
    </svg>
  );
}

export function BackgroundStarsIcon() {
  // Tiny five-point stars sized to read as decorative sprinkles.
  const star = (cx: number, cy: number, key: string) => {
    const r = 2;
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const radius = i % 2 === 0 ? r : r * 0.45;
      pts.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
    }
    return <polygon key={key} points={pts.join(' ')} fill="currentColor" />;
  };
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden>
      <rect width="28" height="20" rx="2" fill="white" stroke="currentColor" strokeWidth="0.5" />
      {star(7, 6, 'a')}
      {star(20, 5, 'b')}
      {star(14, 13, 'c')}
      {star(23, 15, 'd')}
    </svg>
  );
}
