import { describe, expect, it } from 'vitest';
import {
  TECH_ICON_CATALOG,
  TECH_PROVIDERS,
  getTechIcon,
  isTechIconId,
  searchTechIcons,
} from './tech-icons';

describe('tech-icon catalogue', () => {
  it('is non-empty and has unique ids', () => {
    expect(TECH_ICON_CATALOG.length).toBeGreaterThan(0);
    const ids = TECH_ICON_CATALOG.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every icon has a label, glyph markup, a hex colour, and a known provider', () => {
    const providers = new Set(TECH_PROVIDERS.map((p) => p.id));
    for (const icon of TECH_ICON_CATALOG) {
      expect(icon.label.length).toBeGreaterThan(0);
      expect(icon.glyph.length).toBeGreaterThan(0);
      expect(icon.color).toMatch(/^#[0-9a-fA-F]{3,8}$/);
      expect(providers.has(icon.provider)).toBe(true);
    }
  });

  it('covers every advertised provider', () => {
    for (const { id } of TECH_PROVIDERS) {
      expect(
        TECH_ICON_CATALOG.some((i) => i.provider === id),
        `no icons for provider "${id}"`,
      ).toBe(true);
    }
  });
});

describe('isTechIconId / getTechIcon', () => {
  it('recognises a catalogue id and resolves it', () => {
    expect(isTechIconId('aws-s3')).toBe(true);
    expect(getTechIcon('aws-s3')?.label).toBe('S3');
  });

  it('rejects unknown / missing ids (so line-art ids fall through)', () => {
    expect(isTechIconId('server')).toBe(false);
    expect(isTechIconId(undefined)).toBe(false);
    expect(getTechIcon('does-not-exist')).toBeUndefined();
    expect(getTechIcon(undefined)).toBeUndefined();
  });
});

describe('searchTechIcons', () => {
  it('returns the whole catalogue for an empty query with no provider filter', () => {
    expect(searchTechIcons('', 'all')).toHaveLength(TECH_ICON_CATALOG.length);
    expect(searchTechIcons('   ', 'all')).toHaveLength(TECH_ICON_CATALOG.length);
  });

  it('narrows to a single provider', () => {
    const aws = searchTechIcons('', 'aws');
    expect(aws.length).toBeGreaterThan(0);
    expect(aws.every((i) => i.provider === 'aws')).toBe(true);
  });

  it('matches on label, keywords, and provider case-insensitively', () => {
    expect(searchTechIcons('LAMBDA', 'all').some((i) => i.id === 'aws-lambda')).toBe(true);
    // S3 carries the keyword 'bucket'.
    expect(searchTechIcons('bucket', 'all').some((i) => i.id === 'aws-s3')).toBe(true);
  });

  it('combines the search query with the provider filter', () => {
    // 'database' keyword exists under both aws and azure; the filter scopes it.
    const azure = searchTechIcons('database', 'azure');
    expect(azure.length).toBeGreaterThan(0);
    expect(azure.every((i) => i.provider === 'azure')).toBe(true);
  });

  it('returns an empty array when nothing matches', () => {
    expect(searchTechIcons('zzzznotanicon', 'all')).toEqual([]);
  });
});
