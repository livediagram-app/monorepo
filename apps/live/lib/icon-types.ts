// Shared types for the icon catalogue + its data modules (icon-catalog-*.ts).
// Split out of icons.ts so the catalogue data files can import the shape
// without pulling in the whole module.

export type IconPrim =
  | { t: 'path'; d: string }
  | { t: 'circle'; cx: number; cy: number; r: number }
  | { t: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { t: 'rect'; x: number; y: number; w: number; h: number; rx?: number }
  | { t: 'polyline'; points: string }
  | { t: 'polygon'; points: string }
  | { t: 'ellipse'; cx: number; cy: number; rx: number; ry: number };

export type IconDef = {
  id: string;
  label: string;
  // Extra search terms beyond the label, so "db" finds "database" and
  // "gear" finds "settings".
  keywords: string;
  prims: IconPrim[];
};
