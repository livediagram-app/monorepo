import { describe, expect, it } from 'vitest';
import { subpageMetadata } from './subpage-metadata';

// subpageMetadata is the single factory every marketing subpage
// (FAQ, Terms, Privacy, /alternatives, /alternatives/<slug>) uses
// for its Next `metadata` block, so a regression here ripples
// across the whole non-landing surface. The tests below pin the
// shape Google + Twitter + sister-page canonical-checks all
// depend on: a value drift in `openGraph.type` from 'article' to
// 'website', or in `locale` from 'en_GB' to 'en-GB' (BCP 47 form
// rather than the OG-required underscore form), would break
// social cards on every subpage at once.

describe('subpageMetadata', () => {
  it('passes title + description through to the top-level fields', () => {
    const md = subpageMetadata({
      title: 'FAQ | livediagram',
      description: 'Questions and answers',
      path: '/faq',
    });
    expect(md.title).toBe('FAQ | livediagram');
    expect(md.description).toBe('Questions and answers');
  });

  it('uses the supplied path as the canonical', () => {
    // The metadataBase in app/layout.tsx resolves the relative
    // path against the production origin, so `/faq` becomes
    // `https://livediagram.app/faq` in the emitted <link>. The
    // factory's job is to surface the supplied path verbatim.
    const md = subpageMetadata({ title: 't', description: 'd', path: '/terms' });
    expect(md.alternates).toEqual({ canonical: '/terms' });
  });

  it('emits an `article`-type openGraph block with the marketing siteName + en_GB locale', () => {
    const md = subpageMetadata({
      title: 'Terms | livediagram',
      description: 'Legal terms',
      path: '/terms',
    });
    // OG locale uses the underscore form (en_GB), not BCP 47's
    // hyphen form (en-GB). They look interchangeable but they
    // mean different things to different parsers, and the
    // OG spec is strict on the underscore one.
    expect(md.openGraph).toMatchObject({
      type: 'article',
      url: '/terms',
      siteName: 'livediagram',
      title: 'Terms | livediagram',
      description: 'Legal terms',
      locale: 'en_GB',
    });
  });

  it('emits a `summary_large_image` twitter card with title + description mirrors', () => {
    const md = subpageMetadata({
      title: 'Alternatives | livediagram',
      description: 'How livediagram compares',
      path: '/alternatives',
    });
    expect(md.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'Alternatives | livediagram',
      description: 'How livediagram compares',
    });
  });

  it('does not set openGraph.images itself (the app/opengraph-image.tsx fallback supplies it)', () => {
    // Next.js's convention auto-promotes app/opengraph-image.tsx
    // to og:image for every route under that app/ tree. If this
    // factory ever started setting `images` explicitly it would
    // override that fallback for every subpage at once, so we
    // pin the explicit absence here. The same applies to twitter
    // (which inherits og:image when its own image is missing).
    const md = subpageMetadata({ title: 't', description: 'd', path: '/privacy' });
    const og = md.openGraph as Record<string, unknown> | undefined;
    expect(og?.images).toBeUndefined();
    const tw = md.twitter as Record<string, unknown> | undefined;
    expect(tw?.images).toBeUndefined();
  });

  it('returns a fresh object on each call (call sites compose into Next metadata at module load)', () => {
    // Each page's `export const metadata` evaluates the factory
    // once at build time; a shared mutable reference would mean a
    // future revision that mutated the result (e.g. adding a
    // per-page image) leaked across pages. Asserting distinct
    // references rules out an accidental return-the-singleton
    // refactor.
    const a = subpageMetadata({ title: 'a', description: 'd', path: '/faq' });
    const b = subpageMetadata({ title: 'b', description: 'd', path: '/terms' });
    expect(a).not.toBe(b);
    expect(a.openGraph).not.toBe(b.openGraph);
  });
});
