import { ImageResponse } from 'next/og';

// iOS home-screen tile. Next.js convention: app/apple-icon.tsx →
// /apple-icon.png + the <link rel="apple-touch-icon"> tag at build
// time. We render it (rather than reuse public/livediagram-icon-*.png)
// because iOS composites apple-touch-icons onto an OPAQUE tile: a
// transparent PNG renders its empty pixels as black, which would frame
// the thin brand mark in a black square. So we paint a white
// background and centre the same glyph as app/icon.svg on it. iOS adds
// its own rounded-corner mask, so we ship a full-bleed square.
//
// `dynamic = 'force-static'` is required for `output: 'export'`: the
// route handler must resolve fully at build time, the same gate
// opengraph-image.tsx / robots.ts / sitemap.ts use.

export const dynamic = 'force-static';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// The brand mark, identical to app/icon.svg. Passed to <img> as a data
// URI so next/og's resvg pass rasterises it with full SVG fidelity
// (including the decorative arc paths).
const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><g stroke="#0ea5e9" stroke-width="1.4" stroke-linecap="round" opacity="0.3"><path d="M16.8 3.8 A9.5 9.5 0 0 1 16.8 20.2"/><path d="M7.2 20.2 A9.5 9.5 0 0 1 7.2 3.8"/></g><path d="M15 11.6 C15 14.4 10.2 11.4 10 14.2" stroke="#0ea5e9" stroke-width="2.4" stroke-linecap="round" fill="none"/><circle cx="15.2" cy="9" r="2.9" fill="#0ea5e9"/><rect x="6.6" y="12.4" width="5.8" height="5.8" rx="1.9" fill="#0ea5e9"/></svg>`;

const ICON_DATA_URI = `data:image/svg+xml,${encodeURIComponent(ICON_SVG)}`;

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
      }}
    >
      <img src={ICON_DATA_URI} width={132} height={132} alt="" />
    </div>,
    { ...size },
  );
}
