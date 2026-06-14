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

import {
  createArrow,
  createShape,
  createSticky,
  createText,
  runsPlainText,
  type Element,
  type TextRun,
} from '@livediagram/diagram';

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
  // The ticket reference reads as a bold lead-in (the id) followed by the
  // plain summary — the per-range rich-text model (spec/09). A fresh run
  // array is built per card so no two cards share a mutable reference.
  const ticketRuns = (): TextRun[] => [
    { text: 'TICKET-001:', bold: true },
    { text: ' Investigate and implement a solution while measuring the outcome' },
  ];

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
      const runs = ticketRuns();
      elements.push({
        ...createText(colX + 32, cardTop + 6),
        width: 441,
        height: 64,
        label: runsPlainText(runs),
        richText: runs,
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
    // so the text rail aligns crisply down the quadrant's left edge. The
    // bullet marker is tinted to the quadrant's header hue (per-range
    // rich text, spec/09) so each line ties back to its quadrant while
    // the body text stays theme-neutral.
    q.bullets.forEach((bullet, i) => {
      const runs: TextRun[] = [{ text: '• ', color: q.headerColor }, { text: bullet }];
      elements.push({
        ...createText(
          x + headerPadding,
          y + headerPadding + headerH + bulletGap + i * (bulletH + bulletGap),
        ),
        width: cellW - headerPadding * 2,
        height: bulletH,
        label: runsPlainText(runs),
        richText: runs,
        textSize: 'md',
        textAlignX: 'left',
      });
    });
  }

  return elements;
}

// Impact / Effort prioritisation chart. Two crossed value/effort axes
// (a centred double-headed quadrant divider plus an L-frame of single-
// headed axes along the left + bottom) with a handful of items
// scattered across the field for the user to drag into the right
// quadrant. Geometry mirrors a hand-built reference (its bounding box
// spans 0..1542 x 0..1218), re-centred on the supplied canvas point.
// The axes carry the brand accent; items + labels are left to the theme.
export function buildPrioritizationMatrix(cx: number, cy: number): Element[] {
  const ox = cx - 771;
  const oy = cy - 609;
  const AXIS = '#0ea5e9'; // brand accent

  const elements: Element[] = [];

  // Axes: a centred double-headed divider (the quadrant cross) and an
  // L-frame whose single arrowheads point toward "more" on each axis.
  const axis = (x1: number, y1: number, x2: number, y2: number, ends: 'both' | 'to'): Element => ({
    ...createArrow(x1 + ox, y1 + oy, x2 + ox, y2 + oy),
    arrowEnds: ends,
    strokeColor: AXIS,
  });
  elements.push(axis(394, 627, 1568, 627, 'both'));
  elements.push(axis(981, 1131, 981, 158, 'both'));
  elements.push(axis(373, 1152, 1547, 1152, 'to'));
  elements.push(axis(373, 1152, 373, 179, 'to'));

  // Axis labels at the ends of the value (vertical) + effort (horizontal) axes.
  const label = (x: number, y: number, text: string): Element => ({
    ...createText(x + ox, y + oy),
    width: 190,
    height: 42,
    label: text,
    textSize: 'lg',
    textBold: true,
  });
  elements.push(label(158, 183, 'High Value'));
  elements.push(label(158, 1107, 'Low Value'));
  elements.push(label(372, 1176, 'Low Effort'));
  elements.push(label(1352, 1176, 'High Effort'));

  // Items scattered across the field — the user drags each into the
  // quadrant that matches its value / effort.
  const items: { x: number; y: number; label: string }[] = [
    { x: 1408, y: 183, label: 'Item 1' },
    { x: 824, y: 679, label: 'Item 2' },
    { x: 1325, y: 770, label: 'Item 3' },
    { x: 1147, y: 932, label: 'Item 4' },
    { x: 621, y: 183, label: 'Item 5' },
  ];
  for (const it of items) {
    elements.push({
      ...createShape('square', it.x + ox, it.y + oy),
      width: 122,
      height: 49,
      label: it.label,
      textSize: 'sm',
    });
  }

  return elements;
}
