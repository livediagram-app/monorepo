'use client';

// Make the editor chrome (buttons, rings, focus outlines, the brand-* accent)
// follow the ACTIVE TAB's theme instead of the fixed light-blue brand (spec/42).
// The brand palette is Tailwind v4 CSS variables (--color-brand-50..950 in
// @livediagram/tailwind-config), so retargeting those variables retargets every
// `brand-*` utility at once. We set them on document.documentElement (not the
// editor root) so body-portaled UI — context menus, dialogs, popovers, toasts —
// inherits them too, and revert on unmount / when the tab is unthemed so the
// rest of the app keeps the default brand.

import { useEffect } from 'react';
import { isLightColor, shade, tint } from '@livediagram/diagram';
import { getTheme } from '@/lib/themes';

const STOPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const;

// Spin a single theme accent (a theme's elementStroke) into an 11-stop ramp
// anchored at 600. A light accent (dark-theme strokes are pale) is darkened
// first so white-on-600 buttons keep contrast.
function brandScaleFromAccent(accent: string): Record<(typeof STOPS)[number], string> {
  const base = isLightColor(accent) ? shade(accent, 0.4) : accent;
  return {
    '50': tint(base, 0.92),
    '100': tint(base, 0.84),
    '200': tint(base, 0.7),
    '300': tint(base, 0.52),
    '400': tint(base, 0.3),
    '500': tint(base, 0.13),
    '600': base,
    '700': shade(base, 0.18),
    '800': shade(base, 0.34),
    '900': shade(base, 0.48),
    '950': shade(base, 0.6),
  };
}

export function useEditorAccent(themeId: string | undefined): void {
  // The default "brand"/Basic theme (and an unthemed tab) has no accent stroke —
  // accent stays null so we leave the built-in light-blue brand in place.
  const accent = (themeId ? getTheme(themeId) : null)?.elementStroke ?? null;

  useEffect(() => {
    const root = document.documentElement;
    if (!accent) {
      for (const s of STOPS) root.style.removeProperty(`--color-brand-${s}`);
      return;
    }
    const scale = brandScaleFromAccent(accent);
    for (const s of STOPS) root.style.setProperty(`--color-brand-${s}`, scale[s]);
    return () => {
      for (const s of STOPS) root.style.removeProperty(`--color-brand-${s}`);
    };
  }, [accent]);
}
