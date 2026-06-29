import { describe, expect, it, vi } from 'vitest';
import { deleteAccount } from './account';
import type { Env } from '../types';

// deleteAccount wipes an owner's D1 rows AND the R2 objects the cascade
// can't reach: image bytes (keyed by image id) and diagram SVG snapshots
// (spec/67, keyed thumb/<diagramId>). A bulk `DELETE FROM diagrams` drops
// the ids, so the snapshot keys must be enumerated + deleted first or
// they orphan in R2. These pin that cleanup with a fake D1 + R2.

function fakeEnv(opts: {
  diagramIds?: string[];
  imageIds?: string[];
  images?: { delete: (keys: string[]) => Promise<void> };
}): Env {
  const prepare = (sql: string) => ({
    bind: () => ({
      all: async () => {
        if (sql.includes('FROM images')) {
          return { results: (opts.imageIds ?? []).map((id) => ({ id })) };
        }
        if (sql.includes('FROM diagrams')) {
          return { results: (opts.diagramIds ?? []).map((id) => ({ id })) };
        }
        return { results: [] };
      },
      run: async () => ({ meta: { changes: 1 } }),
    }),
  });
  return { DB: { prepare }, IMAGES: opts.images } as unknown as Env;
}

describe('deleteAccount snapshot cleanup (spec/67)', () => {
  it("bulk-deletes each diagram's thumb/<id> snapshot from R2", async () => {
    const del = vi.fn().mockResolvedValue(undefined);
    const env = fakeEnv({ diagramIds: ['d1', 'd2'], imageIds: ['i1'], images: { delete: del } });

    await deleteAccount(env, 'owner-1');

    // Image bytes AND diagram snapshots both leave R2.
    expect(del).toHaveBeenCalledWith(['i1']);
    expect(del).toHaveBeenCalledWith(['thumb/d1', 'thumb/d2']);
  });

  it('skips R2 cleanup when no bucket is bound (self-host) without throwing', async () => {
    const env = fakeEnv({ diagramIds: ['d1'], imageIds: ['i1'], images: undefined });
    await expect(deleteAccount(env, 'owner-1')).resolves.toMatchObject({
      diagrams: expect.any(Number),
    });
  });

  it('makes no snapshot delete when the owner has no diagrams', async () => {
    const del = vi.fn().mockResolvedValue(undefined);
    const env = fakeEnv({ diagramIds: [], imageIds: [], images: { delete: del } });

    await deleteAccount(env, 'owner-1');

    expect(del).not.toHaveBeenCalled();
  });
});
