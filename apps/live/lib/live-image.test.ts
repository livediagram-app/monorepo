import { describe, expect, it } from 'vitest';
import { liveImageHtml, liveImageMarkdown, liveImageUrlFor } from './live-image';

describe('live-image builders (spec/54 + spec/67)', () => {
  const origin = 'https://livediagram.app';

  it('builds the same-origin /api share-image URL', () => {
    expect(liveImageUrlFor(origin, 'ABC123')).toBe(
      'https://livediagram.app/api/share/ABC123/image.svg',
    );
  });

  it('url-encodes the share code', () => {
    expect(liveImageUrlFor(origin, 'a/b?c')).toBe(
      'https://livediagram.app/api/share/a%2Fb%3Fc/image.svg',
    );
  });

  it('wraps the URL in Markdown image syntax', () => {
    expect(liveImageMarkdown(origin, 'C')).toBe(
      '![diagram](https://livediagram.app/api/share/C/image.svg)',
    );
  });

  it('wraps the URL in an HTML <img>', () => {
    expect(liveImageHtml(origin, 'C')).toBe(
      '<img src="https://livediagram.app/api/share/C/image.svg" alt="diagram" />',
    );
  });
});
