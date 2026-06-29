'use client';

import { useEffect, useState } from 'react';
import { readLocalStorageSafe, writeLocalStorageSafe } from '@/lib/local-storage-safe';

// List vs card layout for the Explorer browse views (spec/67). Device-
// local: a view preference, not account data, so it lives in
// localStorage like the panel-docking / notifications prefs.
export type ExplorerViewMode = 'list' | 'card';

const STORAGE_KEY = 'livediagram:explorer-view';

export function useExplorerViewMode(): [ExplorerViewMode, (mode: ExplorerViewMode) => void] {
  const [mode, setMode] = useState<ExplorerViewMode>('list');

  // Read the saved choice on mount. The static export prerenders with the
  // 'list' default (no window at build), so seeding here rather than in a
  // lazy initializer avoids a hydration mismatch; a returning card-view
  // user sees a brief list flash, acceptable for a layout toggle.
  useEffect(() => {
    const saved = readLocalStorageSafe(STORAGE_KEY);
    if (saved === 'card' || saved === 'list') setMode(saved);
  }, []);

  const update = (next: ExplorerViewMode) => {
    setMode(next);
    writeLocalStorageSafe(STORAGE_KEY, next);
  };

  return [mode, update];
}
