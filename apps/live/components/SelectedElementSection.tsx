import {
  Accordion,
  AlignmentGrid,
  ColorSwatch,
  LabelButton,
  SizeButton,
  ToggleSwitch,
} from './palette-controls';
import type { BorderRadius, BorderStroke, BorderStyle, ShapeKind } from '@livediagram/diagram';
import {
  BoldIcon,
  BorderRadiusIcon,
  BorderStrokeIcon,
  BorderStyleIcon,
  BringToFrontIcon,
  DotsIcon,
  ItalicIcon,
  NonePaddingIcon,
  PaddingIcon,
  ScaleIcon,
  SendToBackIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from './palette-icons';
import { ArrowLineControls, ArrowPointerControls } from './arrow-controls';
import { ShapeIcon } from './shape-icon';
import { Tooltip } from './Tooltip';
import { FontSelect } from './FontSelect';

import type { SelectedElementControls } from './CommandPalette';

export type SelectedAccordionState = {
  shape: boolean;
  table: boolean;
  layer: boolean;
  text: boolean;
  colours: boolean;
  border: boolean;
  line: boolean;
  pointer: boolean;
};

// All-closed snapshot used by the three sites that reset / initialise
// the accordion state: the ContextPanel's useState initial value, its
// `closeAll` reducer, and SelectedElementSection's `toggle` reducer.
// Listing every key in three places was a footgun, the most recent
// accordion to land (`line`, in the Line / Pointer split) needed
// three matching edits and any future addition would too.
//
// `as const satisfies` keeps the literal narrowed AND lets the
// satisfies check fail at compile time if a new key shows up on
// SelectedAccordionState without being added here.
export const ALL_SELECTED_ACCORDIONS_CLOSED = {
  shape: false,
  table: false,
  layer: false,
  text: false,
  colours: false,
  border: false,
  line: false,
  pointer: false,
} as const satisfies SelectedAccordionState;

export function SelectedElementSection({
  selection,
  open,
  setOpen,
}: {
  selection: SelectedElementControls;
  open: SelectedAccordionState;
  setOpen: React.Dispatch<React.SetStateAction<SelectedAccordionState>>;
}) {
  // Mutually exclusive: opening an accordion closes every other one.
  // Same key being toggled flips it shut. Keeps the panel compact
  // even when several accordion-eligible sections apply.
  const toggle = (key: keyof SelectedAccordionState) =>
    setOpen((prev) => {
      if (prev[key]) return ALL_SELECTED_ACCORDIONS_CLOSED;
      return { ...ALL_SELECTED_ACCORDIONS_CLOSED, [key]: true };
    });

  // Only surface the Text accordion once the element actually has a
  // label: with no text, size / style / alignment / padding have
  // nothing to act on, so the accordion is just noise.
  const showText =
    selection.hasText && (selection.textSize !== null || selection.textAlignX !== null);
  const showColours =
    selection.textColor !== null || selection.fillColor !== null || selection.strokeColor !== null;

  return (
    <div className="flex flex-col">
      {/* Aspect-lock for elements without the Shape accordion (icons, text,
          sticky, ...). Icons default to locked so the glyph never warps, but
          the user can unlock to size the box freely — the morphable shapes
          keep their copy inside the Shape accordion below. */}
      {selection.aspectLocked !== null && selection.shapeKind === null ? (
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
              Lock aspect ratio
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Keep width-to-height fixed when resizing.
            </span>
          </div>
          <ToggleSwitch
            checked={selection.aspectLocked}
            onChange={selection.onToggleAspectLock}
            label="Lock aspect ratio"
          />
        </div>
      ) : null}
      {selection.shapeKind !== null ? (
        <Accordion title="Shape" open={open.shape} onToggle={() => toggle('shape')}>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Change shape</p>
          <div className="mt-1 grid grid-cols-4 gap-1">
            {(
              [
                'square',
                'circle',
                'diamond',
                'cylinder',
                'parallelogram',
                'hexagon',
                'document',
                'stadium',
                'actor',
                'cloud',
                'triangle',
                'trapezoid',
                'star',
                'speech-bubble',
                'browser',
                'monitor',
                'laptop',
                'phone',
                'tablet',
                'smartwatch',
              ] as const
            ).map((kind) => (
              <Tooltip
                key={kind}
                title={SHAPE_LABEL[kind]}
                description={`Morph the selected element into a ${SHAPE_LABEL[kind].toLowerCase()}.`}
              >
                <SizeButton
                  active={selection.shapeKind === kind}
                  onClick={() => selection.onSetShapeKind(kind)}
                >
                  <ShapeIcon kind={kind} />
                </SizeButton>
              </Tooltip>
            ))}
          </div>
          {selection.aspectLocked !== null ? (
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                  Lock aspect ratio
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Keep width-to-height fixed when resizing.
                </span>
              </div>
              <ToggleSwitch
                checked={selection.aspectLocked}
                onChange={selection.onToggleAspectLock}
                label="Lock aspect ratio"
              />
            </div>
          ) : null}
        </Accordion>
      ) : null}

      {selection.tableHeaderRow !== null ? (
        <Accordion title="Table" open={open.table} onToggle={() => toggle('table')}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                Header row
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Style the first row as a header.
              </span>
            </div>
            <ToggleSwitch
              checked={selection.tableHeaderRow ?? false}
              onChange={selection.onToggleTableHeaderRow}
              label="Header row"
            />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                Header column
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Style the first column as a header.
              </span>
            </div>
            <ToggleSwitch
              checked={selection.tableHeaderColumn ?? false}
              onChange={selection.onToggleTableHeaderColumn}
              label="Header column"
            />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                Zebra striping
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Tint alternate body rows.
              </span>
            </div>
            <ToggleSwitch
              checked={selection.tableZebra ?? false}
              onChange={selection.onToggleTableZebra}
              label="Zebra striping"
            />
          </div>
        </Accordion>
      ) : null}

      <Accordion title="Layer" open={open.layer} onToggle={() => toggle('layer')}>
        <div className="flex items-center gap-1">
          <Tooltip title="Bring to front" description="Render this element above everything else.">
            <LabelButton onClick={selection.onBringToFront} label="Front">
              <BringToFrontIcon />
            </LabelButton>
          </Tooltip>
          <Tooltip title="Send to back" description="Render this element behind everything else.">
            <LabelButton onClick={selection.onSendToBack} label="Back">
              <SendToBackIcon />
            </LabelButton>
          </Tooltip>
        </div>
        <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />
        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-300">Opacity</p>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(selection.opacity * 100)}
            onChange={(e) => selection.onSetOpacity(Number(e.target.value) / 100)}
            aria-label="Opacity"
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-500 dark:bg-slate-700"
          />
          <span className="w-10 text-right text-xs font-medium text-slate-700 dark:text-slate-200">
            {Math.round(selection.opacity * 100)}%
          </span>
        </div>
      </Accordion>

      {showText ? (
        <Accordion title="Text" open={open.text} onToggle={() => toggle('text')}>
          <div className="mb-3 flex flex-col gap-1">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Font</p>
            <FontSelect
              value={selection.font}
              defaultLabel="Tab default"
              ariaLabel="Element font"
              onChange={selection.onSetFont}
            />
          </div>
          {selection.textSize !== null ? (
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Size</p>
              <div className="grid grid-cols-4 gap-1">
                <Tooltip title="Scale" description="Auto-fit the label to the element's size.">
                  <SizeButton
                    active={selection.textSize === 'scale'}
                    onClick={() => selection.onSetTextSize('scale')}
                  >
                    <ScaleIcon />
                  </SizeButton>
                </Tooltip>
                <Tooltip title="Small" description="Fixed small font size.">
                  <SizeButton
                    active={selection.textSize === 'sm'}
                    onClick={() => selection.onSetTextSize('sm')}
                  >
                    <DotsIcon count={1} />
                  </SizeButton>
                </Tooltip>
                <Tooltip title="Medium" description="Fixed medium font size.">
                  <SizeButton
                    active={selection.textSize === 'md'}
                    onClick={() => selection.onSetTextSize('md')}
                  >
                    <DotsIcon count={2} />
                  </SizeButton>
                </Tooltip>
                <Tooltip title="Large" description="Fixed large font size.">
                  <SizeButton
                    active={selection.textSize === 'lg'}
                    onClick={() => selection.onSetTextSize('lg')}
                  >
                    <DotsIcon count={3} />
                  </SizeButton>
                </Tooltip>
              </div>
            </div>
          ) : null}
          {selection.textBold !== null ? (
            <div className="mt-3 flex flex-col gap-1 border-t border-slate-100 pt-3 dark:border-slate-800">
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Style</p>
              <div className="grid grid-cols-4 gap-1">
                <Tooltip block title="Bold" description="Make the label bold.">
                  <SizeButton
                    active={selection.textBold === true}
                    onClick={selection.onToggleTextBold}
                  >
                    <BoldIcon />
                  </SizeButton>
                </Tooltip>
                <Tooltip block title="Italic" description="Italicise the label.">
                  <SizeButton
                    active={selection.textItalic === true}
                    onClick={selection.onToggleTextItalic}
                  >
                    <ItalicIcon />
                  </SizeButton>
                </Tooltip>
                <Tooltip block title="Underline" description="Underline the label.">
                  <SizeButton
                    active={selection.textUnderline === true}
                    onClick={selection.onToggleTextUnderline}
                  >
                    <UnderlineIcon />
                  </SizeButton>
                </Tooltip>
                <Tooltip block title="Strikethrough" description="Strike through the label.">
                  <SizeButton
                    active={selection.textStrikethrough === true}
                    onClick={selection.onToggleTextStrikethrough}
                  >
                    <StrikethroughIcon />
                  </SizeButton>
                </Tooltip>
              </div>
            </div>
          ) : null}
          {selection.textAlignX !== null && selection.textAlignY !== null ? (
            <div className="mt-3 flex flex-col gap-1 border-t border-slate-100 pt-3 dark:border-slate-800">
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Alignment
              </p>
              <AlignmentGrid
                alignX={selection.textAlignX}
                alignY={selection.textAlignY}
                onChange={selection.onSetTextAlign}
              />
            </div>
          ) : null}
          {selection.padding !== null ? (
            <div className="mt-3 flex flex-col gap-1 border-t border-slate-100 pt-3 dark:border-slate-800">
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Padding</p>
              <div className="grid grid-cols-4 gap-1">
                {(['none', 'sm', 'md', 'lg'] as const).map((p) => (
                  <Tooltip
                    key={p}
                    block
                    title={
                      p === 'none' ? 'None' : p === 'sm' ? 'Small' : p === 'md' ? 'Medium' : 'Large'
                    }
                    description="Padding around the label."
                  >
                    <SizeButton
                      active={selection.padding === p}
                      onClick={() => selection.onSetPadding(p)}
                    >
                      {p === 'none' ? <NonePaddingIcon /> : <PaddingIcon size={p} />}
                    </SizeButton>
                  </Tooltip>
                ))}
              </div>
            </div>
          ) : null}
        </Accordion>
      ) : null}

      {showColours ? (
        <Accordion title="Colours" open={open.colours} onToggle={() => toggle('colours')}>
          <div className="flex flex-wrap items-stretch gap-1">
            {selection.textColor !== null ? (
              <Tooltip title="Text colour" description="Set the colour of the element's label.">
                <ColorSwatch
                  label="Text"
                  value={selection.textColor}
                  onChange={selection.onSetTextColor}
                />
              </Tooltip>
            ) : null}
            {selection.fillColor !== null ? (
              <Tooltip title="Background" description="The element's fill colour.">
                <ColorSwatch
                  label="Background"
                  value={selection.fillColor}
                  onChange={selection.onSetFillColor}
                />
              </Tooltip>
            ) : null}
            {selection.strokeColor !== null ? (
              <Tooltip title="Border" description="The element's outline colour.">
                <ColorSwatch
                  label="Border"
                  value={selection.strokeColor}
                  onChange={selection.onSetStrokeColor}
                />
              </Tooltip>
            ) : null}
            {selection.tableHeaderFill !== null ? (
              <Tooltip
                title="Header background"
                description="Background of a table's header row / column."
              >
                <ColorSwatch
                  label="Header bg"
                  value={selection.tableHeaderFill}
                  onChange={selection.onSetTableHeaderFill}
                />
              </Tooltip>
            ) : null}
            {selection.tableHeaderTextColor !== null ? (
              <Tooltip
                title="Header text"
                description="Text colour in a table's header row / column."
              >
                <ColorSwatch
                  label="Header text"
                  value={selection.tableHeaderTextColor}
                  onChange={selection.onSetTableHeaderTextColor}
                />
              </Tooltip>
            ) : null}
          </div>
          <button
            type="button"
            onClick={selection.onResetColors}
            className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-500/60 dark:hover:bg-brand-500/15"
          >
            Reset to theme
          </button>
        </Accordion>
      ) : null}

      {/* Border accordion: visible when a shape is selected (shapes
          carry the strokeWidth / strokeStyle fields). Mirrors the
          Pointer accordion's icon-button-row pattern so shape borders
          feel like a peer of arrow pointers. The Radius row below is
          gated separately: only the free-corner rectangles (square /
          browser) expose it, so borderRadius is null for every other
          shape and the row is hidden without hiding the accordion. */}
      {selection.borderStroke !== null && selection.borderStyle !== null ? (
        <Accordion title="Border" open={open.border} onToggle={() => toggle('border')}>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Strength</p>
          <div className="mt-1 grid grid-cols-5 gap-1">
            {(['none', 'thin', 'medium', 'thick', 'extra-thick'] as const).map((value) => (
              <Tooltip
                key={value}
                block
                title={BORDER_STROKE_LABEL[value]}
                description={`Border thickness: ${BORDER_STROKE_LABEL[value].toLowerCase()}.`}
              >
                <SizeButton
                  active={selection.borderStroke === value}
                  onClick={() => selection.onSetBorderStroke(value)}
                >
                  <BorderStrokeIcon value={value} />
                </SizeButton>
              </Tooltip>
            ))}
          </div>
          <p className="mt-3 text-[10px] font-medium text-slate-500 dark:text-slate-300">Pattern</p>
          <div className="mt-1 grid grid-cols-3 gap-1">
            {BORDER_STYLE_ORDER.map((value) => (
              <Tooltip
                key={value}
                block
                title={BORDER_STYLE_LABEL[value]}
                description={`Border pattern: ${BORDER_STYLE_LABEL[value].toLowerCase()}.`}
              >
                <SizeButton
                  active={selection.borderStyle === value}
                  onClick={() => selection.onSetBorderStyle(value)}
                >
                  <BorderStyleIcon value={value} />
                </SizeButton>
              </Tooltip>
            ))}
          </div>
          {selection.borderRadius !== null ? (
            <>
              <p className="mt-3 text-[10px] font-medium text-slate-500 dark:text-slate-300">
                Radius
              </p>
              <div className="mt-1 grid grid-cols-4 gap-1">
                {(['none', 'sm', 'md', 'lg'] as const).map((value) => (
                  <Tooltip
                    key={value}
                    block
                    title={BORDER_RADIUS_LABEL[value]}
                    description={`Corner radius: ${BORDER_RADIUS_LABEL[value].toLowerCase()}.`}
                  >
                    <SizeButton
                      active={selection.borderRadius === value}
                      onClick={() => selection.onSetBorderRadius(value)}
                    >
                      <BorderRadiusIcon value={value} />
                    </SizeButton>
                  </Tooltip>
                ))}
              </div>
            </>
          ) : null}
        </Accordion>
      ) : null}

      {selection.arrowEnds !== null &&
      (selection.arrowThickness !== null ||
        selection.arrowStyle !== null ||
        selection.arrowStrokeStyle !== null) ? (
        <Accordion title="Line" open={open.line} onToggle={() => toggle('line')}>
          <ArrowLineControls
            thickness={selection.arrowThickness}
            style={selection.arrowStyle}
            strokeStyle={selection.arrowStrokeStyle}
            onSetThickness={selection.onSetArrowThickness}
            onSetStyle={selection.onSetArrowStyle}
            onSetStrokeStyle={selection.onSetArrowStrokeStyle}
          />
        </Accordion>
      ) : null}

      {selection.arrowEnds !== null ? (
        <Accordion title="Pointer" open={open.pointer} onToggle={() => toggle('pointer')}>
          <ArrowPointerControls
            ends={selection.arrowEnds}
            headSize={selection.arrowheadSize}
            headShape={selection.arrowheadShape}
            onSetEnds={selection.onSetArrowEnds}
            onSetHeadSize={selection.onSetArrowheadSize}
            onSetHeadShape={selection.onSetArrowheadShape}
          />
        </Accordion>
      ) : null}
    </div>
  );
}

const SHAPE_LABEL: Record<ShapeKind, string> = {
  square: 'Square',
  circle: 'Circle',
  diamond: 'Diamond',
  cylinder: 'Cylinder',
  parallelogram: 'Parallelogram',
  hexagon: 'Hexagon',
  document: 'Document',
  stadium: 'Stadium',
  actor: 'User',
  cloud: 'Cloud',
  triangle: 'Triangle',
  trapezoid: 'Trapezoid',
  star: 'Star',
  'speech-bubble': 'Speech bubble',
  browser: 'Web browser',
  monitor: 'Computer monitor',
  laptop: 'Laptop',
  phone: 'Phone',
  tablet: 'Tablet',
  smartwatch: 'Smartwatch',
  // Not offered in the morph grid (an icon needs a chosen glyph added via
  // the Icons picker; a frame is a transparent container, not a box you
  // morph into); present here only so the label map stays exhaustive.
  icon: 'Icon',
  frame: 'Frame',
};

// Border-accordion labels + glyphs. Three rows: stroke strength,
// stroke pattern, corner radius. Each glyph renders a horizontal
// line / squiggle whose visual weight or pattern hints at the preset
// the button maps to, matching the Pointer accordion's row
// conventions so the two reads as siblings.

const BORDER_STROKE_LABEL: Record<BorderStroke, string> = {
  none: 'None',
  thin: 'Thin',
  medium: 'Medium',
  thick: 'Thick',
  'extra-thick': 'Extra-thick',
};

const BORDER_STYLE_LABEL: Record<BorderStyle, string> = {
  solid: 'Solid',
  dashed: 'Dashed',
  dotted: 'Dotted',
  'dash-dot': 'Dash-dot',
  'long-dash': 'Long dash',
  'dash-dot-dot': 'Dash-dot-dot',
};

// Shared display order for the border/line pattern pickers.
const BORDER_STYLE_ORDER: readonly BorderStyle[] = [
  'solid',
  'dashed',
  'dotted',
  'dash-dot',
  'long-dash',
  'dash-dot-dot',
];

const BORDER_RADIUS_LABEL: Record<BorderRadius, string> = {
  none: 'None',
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
};
