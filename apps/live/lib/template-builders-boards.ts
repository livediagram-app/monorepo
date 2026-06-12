// Board templates lifted out of template-builders.ts: retrospective
// (Mad / Sad / Glad columns), kanban (five Backlog-to-Done lanes),
// and SWOT (2x2 quadrants). All three share the same shape: a tinted
// container holds a header label + a stack of sticky-note rows. The
// grouping mirrors the picker's own "Boards / 2x2 layouts" rhythm.
//
// Venn deliberately stays in the parent file alongside Timeline:
// it's a 2D-overlap layout, not a column / lane grid, so it doesn't
// belong with this thematic group.
//
// Each builder is still pure: takes a centre (cx, cy), returns a
// fresh Element[]. See spec/09 "Templates" for the catalogue.

import { createShape, createSticky, createText, type Element } from '@livediagram/diagram';

// Classic "Mad / Sad / Glad" retro. Each column lives inside its own
// tinted container shape (red / blue / green) so the framework's
// emotional groupings read at a glance. Header text + three sticky
// notes sit on top of the container; the container is the first
// element pushed per column so subsequent label + sticky elements
// render above it.
export function buildRetrospective(cx: number, cy: number): Element[] {
  const containerW = 460;
  const containerSpacing = 500;
  const colW = 400;
  const headerH = 80;
  const stickyH = 170;
  const stickyGap = 28;
  const topPadding = 24;
  const headerGap = 24;
  const bottomPadding = 24;
  const stickiesPerColumn = 5;
  const containerH =
    topPadding +
    headerH +
    headerGap +
    stickiesPerColumn * stickyH +
    (stickiesPerColumn - 1) * stickyGap +
    bottomPadding;

  const columns: { label: string; fill: string; stroke: string }[] = [
    { label: 'Mad', fill: '#fee2e2', stroke: '#fca5a5' },
    { label: 'Sad', fill: '#dbeafe', stroke: '#93c5fd' },
    { label: 'Glad', fill: '#dcfce7', stroke: '#86efac' },
  ];

  const firstColCenterX = cx - containerSpacing;
  const containerY = cy - containerH / 2 + 40;

  const elements: Element[] = [];
  columns.forEach((col, i) => {
    const centerX = firstColCenterX + i * containerSpacing;
    const containerX = centerX - containerW / 2;

    elements.push({
      ...createShape('square', containerX, containerY),
      width: containerW,
      height: containerH,
      fillColor: col.fill,
      strokeColor: col.stroke,
      textSize: 'md',
    });

    const innerX = centerX - colW / 2;
    const headerY = containerY + topPadding;
    elements.push({
      ...createText(innerX, headerY),
      width: colW,
      height: headerH,
      label: col.label,
      textSize: 'lg',
      textAlignX: 'center',
    });

    for (let j = 0; j < stickiesPerColumn; j++) {
      const stickyY = headerY + headerH + headerGap + j * (stickyH + stickyGap);
      elements.push({
        ...createSticky(innerX, stickyY),
        width: colW,
        height: stickyH,
        textSize: 'sm',
      });
    }
  });

  return elements;
}

// Four-column Kanban board (Todo List / In Progress / Under Review /
// Done) under a bold sprint title. Each lane is a tall container with a
// centred header and a stack of six cards; each card is a body square
// with the ticket description on top and a "priority" chip strip glued
// across its lower edge (a separate element so the priority can be
// edited / recoloured without retyping the ticket). Geometry mirrors a
// hand-built reference (505x835 lanes, 457x112 cards), re-centred on the
// supplied canvas point. Colours are left to the theme
// (recolourElementsForTheme); cards read via their borders + the chip.
export function buildKanban(cx: number, cy: number): Element[] {
  const colW = 505;
  const colH = 835;
  const colGap = 23;
  const colPitch = colW + colGap;
  const columns = ['Todo List', 'In Progress', 'Under Review', 'Done'];
  const boardW = columns.length * colW + (columns.length - 1) * colGap;

  const titleH = 64;
  const titleGap = 46;
  const totalH = titleH + titleGap + colH;
  const startX = cx - boardW / 2;
  const startY = cy - totalH / 2;
  const columnsTop = startY + titleH + titleGap;

  const cardsPerColumn = 6;
  const firstCardTop = 71; // relative to the column top
  const cardPitch = 125;
  const cardBodyH = 112;
  const ticket = 'TICKET-001: Investigate and implement a solution while measuring the outcome';

  const elements: Element[] = [];

  // Board title across the full width of the lanes.
  elements.push({
    ...createText(startX, startY),
    width: boardW,
    height: titleH,
    label: 'Sprint 12 · September 2027',
    textSize: 'lg',
    textBold: true,
  });

  columns.forEach((header, ci) => {
    const colX = startX + ci * colPitch;
    // Lane container.
    elements.push({
      ...createShape('square', colX, columnsTop),
      width: colW,
      height: colH,
      textSize: 'md',
    });
    // Lane header.
    elements.push({
      ...createText(colX, columnsTop + 5),
      width: colW,
      height: 64,
      label: header,
      textSize: 'lg',
      textAlignX: 'center',
    });
    // Cards: body + ticket text + priority chip.
    for (let i = 0; i < cardsPerColumn; i++) {
      const cardTop = columnsTop + firstCardTop + i * cardPitch;
      elements.push({
        ...createShape('square', colX + 24, cardTop),
        width: 457,
        height: cardBodyH,
        textSize: 'md',
      });
      elements.push({
        ...createText(colX + 32, cardTop + 6),
        width: 441,
        height: 64,
        label: ticket,
        textSize: 'sm',
        textAlignX: 'left',
      });
      elements.push({
        ...createShape('square', colX + 30, cardTop + 76),
        width: 445,
        height: 28,
        label: 'High priority',
        textSize: 'sm',
      });
    }
  });

  return elements;
}

// SWOT 2×2 grid sized to give each quadrant real working room. Each
// quadrant carries a role icon in its top-right (award / trending-down
// / sun / alert-octagon) and 3 starter bullets the user can swap for
// their own. Quadrant tints follow the conventional emotional weighting
// — Strengths green / Opportunities blue (positives), Weaknesses red /
// Threats amber (concerns). Each bullet is its own Text element so
// users can move/delete individual lines without breaking the scaffold.
export function buildSwot(cx: number, cy: number): Element[] {
  const cellW = 560;
  const cellH = 440;
  const gap = 28;
  const headerH = 64;
  const headerPadding = 20;
  const bulletGap = 14;
  const bulletH = 56;
  const iconSize = 58;

  const quadrants: {
    label: string;
    col: 0 | 1;
    row: 0 | 1;
    fill: string;
    stroke: string;
    headerColor: string;
    // A glyph in the quadrant's top-right that signals its role at a
    // glance (award = strengths, trending-down = weaknesses, etc.).
    icon: string;
    bullets: string[];
  }[] = [
    {
      label: 'Strengths',
      col: 0,
      row: 0,
      fill: '#dcfce7',
      stroke: '#86efac',
      headerColor: '#15803d',
      icon: 'award',
      bullets: ['Strong brand recognition', 'Loyal customer base', 'Proven, profitable product'],
    },
    {
      label: 'Weaknesses',
      col: 1,
      row: 0,
      fill: '#fee2e2',
      stroke: '#fca5a5',
      headerColor: '#b91c1c',
      icon: 'trending-down',
      bullets: ['Limited geographic reach', 'High operational costs', 'Slow product delivery'],
    },
    {
      label: 'Opportunities',
      col: 0,
      row: 1,
      fill: '#dbeafe',
      stroke: '#93c5fd',
      headerColor: '#1d4ed8',
      icon: 'sun',
      bullets: ['Expand to new markets', 'Strategic partnerships', 'Emerging tech trends'],
    },
    {
      label: 'Threats',
      col: 1,
      row: 1,
      fill: '#fef3c7',
      stroke: '#fcd34d',
      headerColor: '#a16207',
      icon: 'alert-octagon',
      bullets: ['Aggressive competitors', 'Regulatory changes', 'Economic downturn'],
    },
  ];

  const elements: Element[] = [];
  for (const q of quadrants) {
    const x = cx - cellW - gap / 2 + q.col * (cellW + gap);
    const y = cy - cellH - gap / 2 + q.row * (cellH + gap);

    // Quadrant container
    elements.push({
      ...createShape('square', x, y),
      width: cellW,
      height: cellH,
      fillColor: q.fill,
      strokeColor: q.stroke,
      textSize: 'md',
    });

    // Header label rendered in the matching deeper hue so each
    // quadrant has visual weight from across the canvas.
    elements.push({
      ...createText(x + headerPadding, y + headerPadding),
      width: cellW - headerPadding * 2,
      height: headerH,
      label: q.label,
      textSize: 'lg',
      textAlignX: 'left',
      textColor: q.headerColor,
    });

    // Role glyph in the top-right corner, tinted to match the header.
    elements.push({
      ...createShape('icon', x + cellW - headerPadding - iconSize, y + headerPadding),
      width: iconSize,
      height: iconSize,
      iconId: q.icon,
      strokeColor: q.headerColor,
    });

    // Starter bullets sit under the header. Width matches the header
    // so the text rail aligns crisply down the quadrant's left edge.
    q.bullets.forEach((bullet, i) => {
      elements.push({
        ...createText(
          x + headerPadding,
          y + headerPadding + headerH + bulletGap + i * (bulletH + bulletGap),
        ),
        width: cellW - headerPadding * 2,
        height: bulletH,
        label: `• ${bullet}`,
        textSize: 'md',
        textAlignX: 'left',
      });
    });
  }

  return elements;
}

// Impact / Effort prioritisation matrix. Same 2×2 scaffold as SWOT, but
// the quadrants encode a decision rule (Quick wins / Major projects /
// Fill-ins / Time sinks) and two axis labels orient the grid: Effort
// runs left→right along the top, Impact runs bottom→top down the left.
// A PM favourite and a cheap variant of the SWOT builder.
export function buildPrioritizationMatrix(cx: number, cy: number): Element[] {
  const cellW = 520;
  const cellH = 400;
  const gap = 28;
  const headerH = 60;
  const subH = 40;
  const headerPadding = 20;
  const bulletGap = 12;
  const bulletH = 52;
  const iconSize = 54;

  const quadrants: {
    label: string;
    sub: string;
    col: 0 | 1;
    row: 0 | 1;
    fill: string;
    stroke: string;
    headerColor: string;
    icon: string;
    bullets: string[];
  }[] = [
    {
      label: 'Quick wins',
      sub: 'High impact · Low effort',
      col: 0,
      row: 0,
      fill: '#dcfce7',
      stroke: '#86efac',
      headerColor: '#15803d',
      icon: 'zap',
      bullets: ['Do these first', 'Highest value for the cost'],
    },
    {
      label: 'Major projects',
      sub: 'High impact · High effort',
      col: 1,
      row: 0,
      fill: '#dbeafe',
      stroke: '#93c5fd',
      headerColor: '#1d4ed8',
      icon: 'layers',
      bullets: ['Plan and resource', 'Break into phases'],
    },
    {
      label: 'Fill-ins',
      sub: 'Low impact · Low effort',
      col: 0,
      row: 1,
      fill: '#fef3c7',
      stroke: '#fcd34d',
      headerColor: '#a16207',
      icon: 'box',
      bullets: ['Nice to have', 'Batch when idle'],
    },
    {
      label: 'Time sinks',
      sub: 'Low impact · High effort',
      col: 1,
      row: 1,
      fill: '#fee2e2',
      stroke: '#fca5a5',
      headerColor: '#b91c1c',
      icon: 'clock',
      bullets: ['Avoid or defer', 'Question the value'],
    },
  ];

  const elements: Element[] = [];

  // Axis labels frame the grid. Effort along the top, Impact down the
  // left, each pointing toward the "more" direction.
  const gridLeft = cx - cellW - gap / 2;
  const gridTop = cy - cellH - gap / 2;
  const gridW = cellW * 2 + gap;
  elements.push({
    ...createText(gridLeft, gridTop - 56),
    width: gridW,
    height: 40,
    label: 'Effort  →',
    textSize: 'md',
    textBold: true,
    textAlignX: 'center',
  });
  elements.push({
    ...createText(gridLeft - 150, cy - 20),
    width: 130,
    height: 40,
    label: 'Impact  ↑',
    textSize: 'md',
    textBold: true,
    textAlignX: 'right',
  });

  for (const q of quadrants) {
    const x = cx - cellW - gap / 2 + q.col * (cellW + gap);
    const y = cy - cellH - gap / 2 + q.row * (cellH + gap);

    // Quadrant container.
    elements.push({
      ...createShape('square', x, y),
      width: cellW,
      height: cellH,
      fillColor: q.fill,
      strokeColor: q.stroke,
      textSize: 'md',
    });

    // Title + the impact/effort reading beneath it.
    elements.push({
      ...createText(x + headerPadding, y + headerPadding),
      width: cellW - headerPadding * 2 - iconSize,
      height: headerH,
      label: q.label,
      textSize: 'lg',
      textAlignX: 'left',
      textColor: q.headerColor,
    });
    elements.push({
      ...createText(x + headerPadding, y + headerPadding + headerH),
      width: cellW - headerPadding * 2,
      height: subH,
      label: q.sub,
      textSize: 'sm',
      textAlignX: 'left',
    });

    // Role glyph in the top-right corner, tinted to match the header.
    elements.push({
      ...createShape('icon', x + cellW - headerPadding - iconSize, y + headerPadding),
      width: iconSize,
      height: iconSize,
      iconId: q.icon,
      strokeColor: q.headerColor,
    });

    // Starter bullets under the header band.
    q.bullets.forEach((bullet, i) => {
      elements.push({
        ...createText(
          x + headerPadding,
          y + headerPadding + headerH + subH + bulletGap + i * (bulletH + bulletGap),
        ),
        width: cellW - headerPadding * 2,
        height: bulletH,
        label: `• ${bullet}`,
        textSize: 'md',
        textAlignX: 'left',
      });
    });
  }

  return elements;
}
