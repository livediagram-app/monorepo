'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { CustomTheme, CustomThemeDefinition } from '@livediagram/api-schema';
import {
  apiCreateCustomTheme,
  apiDeleteCustomTheme,
  apiListCustomThemes,
  apiUpdateCustomTheme,
} from '@/lib/api-client';
import {
  registerCustomTheme,
  registerCustomThemes,
  unregisterCustomTheme,
} from '@/lib/custom-theme-registry';
import { track } from '@/lib/telemetry';

// Reactive owner-scoped custom-theme list + CRUD (spec/44). Wraps the
// editor and the Explorer so the theme picker / builder / Themes pane
// share one source of truth. Every mutation writes THROUGH to the
// module registry (custom-theme-registry.ts) so the synchronous
// getTheme path stays current; the React state drives re-renders so a
// custom-themed tab repaints the moment the boot fetch lands or a theme
// is edited. A null ownerId (auth still bootstrapping) is "not ready":
// no fetch, mutations no-op.

type CustomThemeContextValue = {
  themes: CustomTheme[];
  loading: boolean;
  // Create + persist; returns the saved theme (with its `custom:` id) or
  // undefined on failure. The id is minted here.
  createTheme: (
    name: string,
    definition: CustomThemeDefinition,
  ) => Promise<CustomTheme | undefined>;
  updateTheme: (
    id: string,
    patch: { name?: string; definition?: CustomThemeDefinition },
  ) => Promise<CustomTheme | undefined>;
  deleteTheme: (id: string) => void;
};

const CustomThemeContext = createContext<CustomThemeContextValue | null>(null);

// Safe consumer: returns an inert value when there's no provider (e.g. a
// surface that doesn't mount one), so callers don't have to null-check.
export function useCustomThemes(): CustomThemeContextValue {
  return (
    useContext(CustomThemeContext) ?? {
      themes: [],
      loading: false,
      createTheme: async () => undefined,
      updateTheme: async () => undefined,
      deleteTheme: () => {},
    }
  );
}

export function CustomThemeProvider({
  ownerId,
  children,
}: {
  ownerId: string | null;
  children: ReactNode;
}) {
  const [themes, setThemes] = useState<CustomTheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ownerId) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    void (async () => {
      try {
        const list = await apiListCustomThemes(ownerId);
        if (!alive) return;
        registerCustomThemes(list);
        setThemes(list);
      } catch {
        // Silent: custom themes are optional; diagrams fall back to
        // built-ins via getTheme. The next mount retries.
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [ownerId]);

  const createTheme = useCallback(
    async (name: string, definition: CustomThemeDefinition) => {
      if (!ownerId) return undefined;
      const id = `custom:${crypto.randomUUID()}`;
      try {
        const theme = await apiCreateCustomTheme(ownerId, {
          id,
          name: name.trim() || 'My theme',
          definition,
        });
        registerCustomTheme(theme);
        setThemes((prev) => [theme, ...prev]);
        track('Theme', 'Created', 'Custom');
        return theme;
      } catch {
        return undefined;
      }
    },
    [ownerId],
  );

  const updateTheme = useCallback(
    async (id: string, patch: { name?: string; definition?: CustomThemeDefinition }) => {
      if (!ownerId) return undefined;
      try {
        const theme = await apiUpdateCustomTheme(ownerId, id, patch);
        registerCustomTheme(theme);
        setThemes((prev) => prev.map((t) => (t.id === id ? theme : t)));
        track('Theme', 'Changed', 'CustomEdited');
        return theme;
      } catch {
        return undefined;
      }
    },
    [ownerId],
  );

  const deleteTheme = useCallback(
    (id: string) => {
      if (!ownerId) return;
      setThemes((prev) => prev.filter((t) => t.id !== id));
      unregisterCustomTheme(id);
      void apiDeleteCustomTheme(ownerId, id).catch(() => {});
      track('Theme', 'Deleted', 'Custom');
    },
    [ownerId],
  );

  return (
    <CustomThemeContext.Provider value={{ themes, loading, createTheme, updateTheme, deleteTheme }}>
      {children}
    </CustomThemeContext.Provider>
  );
}
