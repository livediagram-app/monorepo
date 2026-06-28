// Full-colour brand icons for the "Technology" palette category
// (spec/41) — the AWS / Azure / generic-infrastructure marks people put
// on system-architecture diagrams. They are a DELIBERATELY separate
// catalogue from the line-art glyphs in `icons.ts`: those are
// single-weight strokes tinted by the element's stroke colour, whereas
// these are fixed multi-colour brand marks that must NOT be recoloured
// (an orange Lambda only reads as Lambda in orange).
//
// A Technology icon reuses the `shape: 'icon'` element — `element.iconId`
// keys here instead of the line-art catalogue. The render path
// (BoxedElementView → tech-icon-glyph) dispatches on `isTechIconId` so the
// id resolves to the right renderer; an id in neither catalogue still
// falls back to the line-art placeholder.
//
// Each mark is authored in-repo as a brand-coloured rounded tile + a white
// line-art glyph (the AWS resource-icon visual language, applied uniformly
// for a cohesive palette). It is NOT the verbatim vendor asset pack — that
// keeps the bundle small, renders crisply at icon size, and avoids
// redistributing proprietary SVGs from a public MIT repo (spec/03,
// spec/06). Swapping in a vendor's official SVG later is a per-id edit.

import { TECH_ICON_CATALOG_PART_1 } from './tech-icons-catalog-1';
import { TECH_ICON_CATALOG_PART_2 } from './tech-icons-catalog-2';

// Drag-from-palette MIME for a Technology tile dropped on the canvas.
// Distinct from ICON_DND_MIME so the tile creates a STANDALONE icon
// element and is ignored by the shape drop-target (a coloured brand tile
// beside a shape's text is meaningless, and the inline-icon renderer only
// knows line-art prims). Value carried = the tech-icon id.
export const TECH_ICON_DND_MIME = 'application/x-livediagram-tech-icon';

export type TechProvider = 'aws' | 'azure' | 'cloudflare' | 'firebase' | 'generic';

export type TechIconDef = {
  id: string;
  label: string;
  // Optional shorter caption for the palette tile, where a long label
  // would truncate (and e.g. "Virtual Machine" / "Virtual Network" would
  // clip to the same ambiguous prefix). The full `label` is still used for
  // search, the aria-label, and the on-canvas element. Omit when `label`
  // already fits.
  short?: string;
  provider: TechProvider;
  // Extra search terms beyond the label (so "object storage" finds S3).
  keywords: string;
  // Tile fill — the service / brand colour.
  color: string;
  // Inner SVG markup in a 0..24 art box, drawn on top of the tile. The
  // renderer wraps it in a white line-art group, so a bare <path>/<circle>
  // strokes white; a filled mark sets fill="#fff" stroke="none" itself.
  glyph: string;
};

// Provider display names for the palette filter + tooltips.
export const TECH_PROVIDERS: { id: TechProvider; label: string }[] = [
  { id: 'aws', label: 'AWS' },
  { id: 'azure', label: 'Azure' },
  { id: 'cloudflare', label: 'Cloudflare' },
  { id: 'firebase', label: 'Firebase' },
  { id: 'generic', label: 'Generic' },
];

export const TECH_ICON_CATALOG: TechIconDef[] = [
  ...TECH_ICON_CATALOG_PART_1,
  ...TECH_ICON_CATALOG_PART_2,
];

const TECH_ICON_BY_ID = new Map(TECH_ICON_CATALOG.map((i) => [i.id, i]));

// True when the id resolves in this catalogue — the render path uses it to
// pick the coloured brand renderer over the line-art one.
export function isTechIconId(id: string | undefined): boolean {
  return !!id && TECH_ICON_BY_ID.has(id);
}

export function getTechIcon(id: string | undefined): TechIconDef | undefined {
  return id ? TECH_ICON_BY_ID.get(id) : undefined;
}

// Case-insensitive search over label + keywords + id, optionally narrowed
// to one provider. Empty query returns the (filtered) catalogue.
export function searchTechIcons(query: string, provider: TechProvider | 'all'): TechIconDef[] {
  const base =
    provider === 'all'
      ? TECH_ICON_CATALOG
      : TECH_ICON_CATALOG.filter((i) => i.provider === provider);
  const q = query.trim().toLowerCase();
  if (!q) return base;
  return base.filter(
    (i) =>
      i.label.toLowerCase().includes(q) ||
      i.keywords.includes(q) ||
      i.id.includes(q) ||
      i.provider.includes(q),
  );
}
