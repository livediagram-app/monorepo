import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COMPONENT_SCHEMAS } from './schemas.generated';
import { ROUTE_MANIFEST } from './manifest';
import { buildOpenApiDocument } from './document';
import type { JsonSchema } from './types';

// Drift guards for the OpenAPI surface (spec/37). The worker dispatch is
// segment-based and imperative, so the manifest is the declaration of the
// surface and these tests pin it to reality: a route segment added to the
// dispatch without a manifest entry, a schema reference that doesn't exist, or
// a DTO change that wasn't regenerated all turn CI red.

// The set of top-level resource segments the worker actually dispatches, read
// straight from index.ts's `case '<segment>':` labels. Reading the source
// keeps this honest without a parallel hand-list that could itself drift.
function dispatchedSegments(): Set<string> {
  const source = readFileSync(new URL('../index.ts', import.meta.url), 'utf8');
  const segments = new Set<string>();
  for (const m of source.matchAll(/case '([^']+)':/g)) if (m[1]) segments.add(m[1]);
  return segments;
}

describe('OpenAPI manifest ↔ dispatch parity', () => {
  it('documents exactly the segments the worker dispatches', () => {
    const dispatched = dispatchedSegments();
    const documented = new Set(ROUTE_MANIFEST.map((r) => r.segment));

    // Every dispatched segment has at least one documented endpoint.
    const undocumented = [...dispatched].filter((s) => !documented.has(s));
    expect(
      undocumented,
      `dispatched but missing from the manifest: ${undocumented.join(', ')}`,
    ).toEqual([]);

    // Every documented segment is really dispatched (no stale entries).
    const phantom = [...documented].filter((s) => !dispatched.has(s));
    expect(phantom, `in the manifest but not dispatched: ${phantom.join(', ')}`).toEqual([]);
  });

  it("each entry's path starts with its declared segment", () => {
    for (const route of ROUTE_MANIFEST) {
      expect(route.path.startsWith(`/${route.segment}`), `${route.method} ${route.path}`).toBe(
        true,
      );
    }
  });

  it('has no duplicate (method, path) pairs', () => {
    const seen = new Set<string>();
    for (const route of ROUTE_MANIFEST) {
      const key = `${route.method} ${route.path}`;
      expect(seen.has(key), `duplicate ${key}`).toBe(false);
      seen.add(key);
    }
  });
});

describe('OpenAPI schema references', () => {
  const known = new Set([...Object.keys(COMPONENT_SCHEMAS), 'Error']);

  // Collect every `#/components/schemas/<Name>` referenced anywhere in the
  // manifest's inline bodies + string schema names.
  function refsIn(value: unknown, out: Set<string>): void {
    if (Array.isArray(value)) {
      for (const v of value) refsIn(v, out);
    } else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        if (k === '$ref' && typeof v === 'string') {
          const name = v.replace('#/components/schemas/', '');
          out.add(name);
        } else {
          refsIn(v, out);
        }
      }
    }
  }

  it('every referenced component schema exists', () => {
    const refs = new Set<string>();
    for (const route of ROUTE_MANIFEST) {
      if (typeof route.requestSchema === 'string') refs.add(route.requestSchema);
      else if (route.requestSchema) refsIn(route.requestSchema, refs);
      if (typeof route.responseSchema === 'string') refs.add(route.responseSchema);
      else if (route.responseSchema) refsIn(route.responseSchema, refs);
    }
    const missing = [...refs].filter((r) => !known.has(r));
    expect(missing, `referenced but not generated: ${missing.join(', ')}`).toEqual([]);
  });

  it('the assembled document references only known schemas', () => {
    const doc = buildOpenApiDocument();
    const refs = new Set<string>();
    refsIn(doc.paths, refs);
    const missing = [...refs].filter((r) => !known.has(r));
    expect(missing, `document refs missing from components: ${missing.join(', ')}`).toEqual([]);
  });
});

describe('generated component schemas are up to date', () => {
  it('match a fresh generation from @livediagram/api-schema', async () => {
    // Computed URL so tsc doesn't try to resolve the JS build script (it has no
    // types); the script imports the heavy generator, kept out of the worker
    // bundle. Regenerate with `pnpm --filter @livediagram/api gen:openapi`.
    const url = new URL('../../scripts/gen-openapi-schemas.mjs', import.meta.url).href;
    const mod = (await import(url)) as {
      generateComponentSchemas: () => Record<string, JsonSchema>;
    };
    const fresh = mod.generateComponentSchemas();
    expect(
      fresh,
      'schemas.generated.ts is stale — run: pnpm --filter @livediagram/api gen:openapi',
    ).toEqual(COMPONENT_SCHEMAS);
    // Generous timeout: this dynamically imports the heavy schema generator
    // (kept out of the worker bundle), which is cold-loaded here and overran
    // vitest's 5s default on CI.
  }, 30_000);
});

describe('buildOpenApiDocument', () => {
  it('assembles a well-formed document for every manifest entry', () => {
    const doc = buildOpenApiDocument();
    expect(doc.openapi).toBe('3.1.0');
    for (const route of ROUTE_MANIFEST) {
      const op = doc.paths[route.path]?.[route.method.toLowerCase()];
      expect(op, `${route.method} ${route.path} missing from document`).toBeDefined();
    }
    // Error envelope is always present for handlers to reference.
    expect(doc.components.schemas.Error).toBeDefined();
  });
});
