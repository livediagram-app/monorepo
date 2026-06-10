// Team-library folders for the search panel (spec/09 "Search panel" +
// spec/35). Search surfaces team folders alongside personal ones, but
// the libraries live behind one endpoint per team; this hook sweeps
// them in parallel when search opens (and only then, so non-searching
// sessions never pay the requests) and flattens the result into
// breadcrumb-pathed rows tagged with their team.
//
// Best-effort: a team whose library fetch fails just contributes no
// rows this round; the sweep re-runs when the team list changes.

import { useEffect, useRef, useState } from 'react';
import type { Folder } from '@livediagram/api-schema';
import { apiGetTeamLibrary } from '@/lib/api-client';

export type TeamFolderRow = { id: string; path: string; teamId: string; teamName: string };

// Breadcrumb path per folder ("Marketing / Q3") from the flat
// parentId list. Cycle-guarded the same way the explorer's
// breadcrumb walk is (a malformed chain stops rather than spins).
function folderPaths(folders: Folder[]): Map<string, string> {
  const byId = new Map(folders.map((f) => [f.id, f]));
  const out = new Map<string, string>();
  for (const f of folders) {
    const names: string[] = [];
    const seen = new Set<string>();
    let cur: Folder | undefined = f;
    while (cur && !seen.has(cur.id)) {
      seen.add(cur.id);
      names.unshift(cur.name);
      cur = cur.parentId ? byId.get(cur.parentId) : undefined;
    }
    out.set(f.id, names.join(' / '));
  }
  return out;
}

export function useTeamFoldersForSearch(
  ownerId: string | null,
  teams: { id: string; name: string }[],
  opts: { enabled: boolean },
): TeamFolderRow[] {
  const { enabled } = opts;
  const [rows, setRows] = useState<TeamFolderRow[]>([]);
  // One sweep per (owner, team-id set) while enabled; re-arm when the
  // team list changes so a freshly joined team's folders appear.
  const sweptKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !ownerId || teams.length === 0) return;
    const key = `${ownerId}|${teams
      .map((t) => t.id)
      .sort()
      .join(',')}`;
    if (sweptKeyRef.current === key) return;
    sweptKeyRef.current = key;
    let cancelled = false;
    void Promise.all(
      teams.map(async (team) => {
        try {
          const lib = await apiGetTeamLibrary(ownerId, team.id);
          const paths = folderPaths(lib.folders);
          return lib.folders.map((f) => ({
            id: f.id,
            path: paths.get(f.id) ?? f.name,
            teamId: team.id,
            teamName: team.name,
          }));
        } catch {
          return [] as TeamFolderRow[];
        }
      }),
    ).then((perTeam) => {
      if (!cancelled) setRows(perTeam.flat());
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, ownerId, teams]);

  return rows;
}
