import type { Dispatch, SetStateAction } from 'react';
import {
  clearCellStyle,
  setTableCell,
  type TableCellStyle,
  type TableElement,
} from '@livediagram/diagram';
import { Tooltip } from '@/components/primitives/Tooltip';
import { AlignIcon, CellLinkIcon, Chevron, TrashIcon } from '@/components/canvas/table-icons';

type CellMenu = 'text' | 'colours' | 'align' | null;

// The floating per-cell formatting toolbar (text / colours / align menus +
// link / clear) shown under a selected table cell. Extracted from TableView.
type TableCellToolbarProps = {
  element: TableElement;
  selectedCell: { r: number; c: number } | null;
  editing: { r: number; c: number } | null;
  showControls: boolean;
  cellMenu: CellMenu;
  setCellMenu: Dispatch<SetStateAction<CellMenu>>;
  applyCellStyle: (r: number, c: number, patch: Partial<TableCellStyle>) => void;
  onCommitTable: (
    id: string,
    patch: Partial<Pick<TableElement, 'cells' | 'colWidths' | 'rowHeights' | 'cellStyles'>>,
  ) => void;
  onLinkCell?: (tableId: string, r: number, c: number) => void;
  colTemplate: string;
  rowTemplate: string;
  invScale: number;
  textColor: string;
};

export function TableCellToolbar({
  element,
  selectedCell,
  editing,
  showControls,
  cellMenu,
  setCellMenu,
  applyCellStyle,
  onCommitTable,
  onLinkCell,
  colTemplate,
  rowTemplate,
  invScale,
  textColor,
}: TableCellToolbarProps) {
  return showControls && selectedCell && !editing ? (
    <div
      className="pointer-events-none absolute inset-0 z-[var(--z-panel)] grid"
      style={{ gridTemplateColumns: colTemplate, gridTemplateRows: rowTemplate }}
    >
      <div
        className="relative"
        style={{ gridColumn: selectedCell.c + 1, gridRow: selectedCell.r + 1 }}
      >
        <div
          data-table-ui
          onPointerDown={(e) => e.stopPropagation()}
          className="pointer-events-auto absolute bottom-0 left-1/2 z-[var(--z-overlay)] flex items-center animate-pop-in rounded-lg border border-slate-200 bg-white/90 backdrop-blur-sm p-0.5 shadow-lg dark:border-slate-700 dark:bg-slate-800/90"
          style={{
            transform: `translate(-50%, calc(100% + 4px)) scale(${invScale})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Title line, below the bar — the cell toolbar always sits below
                  its cell (so it never clashes with the element toolbar, which
                  floats above the selection), so the caption sits on the far
                  side, beneath the bar. */}
          <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-700 dark:text-white dark:ring-0">
            Selected Cell
          </span>
          {(() => {
            const sc = element.cellStyles?.[selectedCell.r]?.[selectedCell.c] ?? null;
            const rr = selectedCell.r;
            const cc = selectedCell.c;
            const isHeaderSel =
              (element.headerRow && rr === 0) || (element.headerColumn && cc === 0);
            const sep = <div className="mx-0.5 h-5 w-px bg-slate-200 dark:bg-slate-700" />;
            const secCls = (active: boolean) =>
              `flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium ${
                active
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-600 hover:bg-brand-50 dark:text-slate-200 dark:hover:bg-slate-700'
              }`;
            const tog = (on: boolean) =>
              `flex h-7 w-7 items-center justify-center rounded text-sm ${
                on
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/30 dark:text-brand-200'
                  : 'text-slate-600 hover:bg-brand-50 dark:text-slate-200 dark:hover:bg-slate-700'
              }`;
            const panel =
              'absolute left-0 top-full z-[var(--z-modal)] mt-1 animate-pop-in rounded-lg border border-slate-200 bg-white/90 backdrop-blur-sm p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800/90';
            return (
              <>
                {/* Text */}
                <div className="relative">
                  <Tooltip
                    title="Text formatting"
                    description="Open bold, italic, underline, and text-size options for this cell."
                  >
                    <button
                      type="button"
                      className={secCls(cellMenu === 'text')}
                      onClick={() => setCellMenu((m) => (m === 'text' ? null : 'text'))}
                    >
                      Text <Chevron />
                    </button>
                  </Tooltip>
                  {cellMenu === 'text' ? (
                    <div className={`${panel} w-44`}>
                      <div className="flex gap-1">
                        <Tooltip title="Bold" description="Toggle bold text for this cell.">
                          <button
                            type="button"
                            className={tog(
                              sc?.bold ?? (isHeaderSel || (element.textBold ?? false)),
                            )}
                            onClick={() =>
                              applyCellStyle(rr, cc, {
                                bold: !(sc?.bold ?? (isHeaderSel || element.textBold)),
                              })
                            }
                          >
                            <span className="font-bold">B</span>
                          </button>
                        </Tooltip>
                        <Tooltip title="Italic" description="Toggle italic text for this cell.">
                          <button
                            type="button"
                            className={tog(sc?.italic ?? element.textItalic ?? false)}
                            onClick={() =>
                              applyCellStyle(rr, cc, {
                                italic: !(sc?.italic ?? element.textItalic),
                              })
                            }
                          >
                            <span className="italic">I</span>
                          </button>
                        </Tooltip>
                        <Tooltip
                          title="Underline"
                          description="Toggle underlined text for this cell."
                        >
                          <button
                            type="button"
                            className={tog(sc?.underline ?? element.textUnderline ?? false)}
                            onClick={() =>
                              applyCellStyle(rr, cc, {
                                underline: !(sc?.underline ?? element.textUnderline),
                              })
                            }
                          >
                            <span className="underline">U</span>
                          </button>
                        </Tooltip>
                      </div>
                      <div className="mt-1.5 grid grid-cols-4 gap-1">
                        {(['sm', 'md', 'lg', 'scale'] as const).map((sz) => (
                          <Tooltip
                            key={sz}
                            title={sz === 'scale' ? 'Scale to fit' : `Size ${sz}`}
                            description={
                              sz === 'scale'
                                ? 'Scale the cell text to fit the row height.'
                                : `Set this cell's text to the ${sz} size.`
                            }
                          >
                            <button
                              type="button"
                              className={tog((sc?.textSize ?? element.textSize ?? 'md') === sz)}
                              onClick={() => applyCellStyle(rr, cc, { textSize: sz })}
                            >
                              <span style={{ fontSize: sz === 'sm' ? 9 : sz === 'lg' ? 15 : 12 }}>
                                {sz === 'scale' ? '\u2195' : 'A'}
                              </span>
                            </button>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                {sep}
                {/* Colours */}
                <div className="relative">
                  <Tooltip
                    title="Cell colours"
                    description="Set the background and text colour for this cell."
                  >
                    <button
                      type="button"
                      className={secCls(cellMenu === 'colours')}
                      onClick={() => setCellMenu((m) => (m === 'colours' ? null : 'colours'))}
                    >
                      Colours <Chevron />
                    </button>
                  </Tooltip>
                  {cellMenu === 'colours' ? (
                    <div className={`${panel} w-40`}>
                      <label className="flex items-center justify-between gap-2 rounded px-1 py-1 text-[11px] text-slate-600 hover:bg-brand-50 dark:text-slate-200 dark:hover:bg-slate-700">
                        Background
                        <span
                          className="relative h-5 w-5 overflow-hidden rounded border border-slate-300"
                          style={{ backgroundColor: sc?.bg ?? '#ffffff' }}
                        >
                          <input
                            type="color"
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            value={sc?.bg ?? '#ffffff'}
                            onChange={(e) => applyCellStyle(rr, cc, { bg: e.target.value })}
                          />
                        </span>
                      </label>
                      <label className="flex items-center justify-between gap-2 rounded px-1 py-1 text-[11px] text-slate-600 hover:bg-brand-50 dark:text-slate-200 dark:hover:bg-slate-700">
                        Text
                        <span
                          className="relative h-5 w-5 overflow-hidden rounded border border-slate-300"
                          style={{ backgroundColor: sc?.textColor ?? textColor }}
                        >
                          <input
                            type="color"
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            value={sc?.textColor ?? textColor}
                            onChange={(e) => applyCellStyle(rr, cc, { textColor: e.target.value })}
                          />
                        </span>
                      </label>
                    </div>
                  ) : null}
                </div>
                {sep}
                {/* Alignment */}
                <div className="relative">
                  <Tooltip
                    title="Text alignment"
                    description="Align this cell's text to the left, centre, or right."
                  >
                    <button
                      type="button"
                      className={secCls(cellMenu === 'align')}
                      onClick={() => setCellMenu((m) => (m === 'align' ? null : 'align'))}
                    >
                      Align <Chevron />
                    </button>
                  </Tooltip>
                  {cellMenu === 'align' ? (
                    <div className={`${panel} flex gap-1`}>
                      {(['left', 'center', 'right'] as const).map((al) => (
                        <Tooltip
                          key={al}
                          title={`Align ${al}`}
                          description={`Align this cell's text to the ${al}.`}
                        >
                          <button
                            type="button"
                            className={tog((sc?.alignX ?? element.textAlignX ?? 'center') === al)}
                            onClick={() => applyCellStyle(rr, cc, { alignX: al })}
                          >
                            <AlignIcon dir={al} />
                          </button>
                        </Tooltip>
                      ))}
                    </div>
                  ) : null}
                </div>
                {sep}
                {onLinkCell ? (
                  <Tooltip
                    title={sc?.link ? 'Edit cell link' : 'Link cell'}
                    description="Jump to a tab, another diagram, or a web address."
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLinkCell(element.id, rr, cc);
                      }}
                      className={
                        sc?.link
                          ? 'flex h-7 w-7 items-center justify-center rounded bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200'
                          : 'flex h-7 w-7 items-center justify-center rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }
                    >
                      <CellLinkIcon />
                    </button>
                  </Tooltip>
                ) : null}
                {onLinkCell ? sep : null}
                <Tooltip
                  title="Clear cell"
                  description="Remove the text and all formatting from this cell."
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Text + formatting in ONE commit: separate commits
                      // both read the same stale `element`, so the second
                      // overwrote the first and the text reappeared.
                      onCommitTable(element.id, {
                        cells: setTableCell(element, rr, cc, '').cells,
                        cellStyles: clearCellStyle(element, rr, cc).cellStyles ?? [],
                      });
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950"
                  >
                    <TrashIcon />
                  </button>
                </Tooltip>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  ) : null;
}
