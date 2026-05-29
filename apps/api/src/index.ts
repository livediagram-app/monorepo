import {
  deleteDiagram,
  getDiagram,
  getParticipant,
  listDiagramsByOwner,
  upsertDiagram,
  upsertParticipant,
} from './db';
import { DiagramRoom } from './diagram-room';
import type { DiagramDTO, Env, ParticipantDTO } from './types';

export { DiagramRoom };

// CORS for the browser. Live app runs at the same hostname as the API
// (router stitches them together) so this is mostly a safety net for
// local dev where origins may differ. Headers list is the minimum the
// live app sends today.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Owner-Id',
  'Access-Control-Max-Age': '86400',
};

function json(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
  return new Response(JSON.stringify(body), { ...init, headers });
}

function notFound(): Response {
  return json({ error: 'not_found' }, { status: 404 });
}

function badRequest(msg: string): Response {
  return json({ error: 'bad_request', message: msg }, { status: 400 });
}

function ownerOf(request: Request): string | null {
  return request.headers.get('X-Owner-Id');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const segments = url.pathname.replace(/^\//, '').split('/');
    if (segments[0] !== 'api') return notFound();

    try {
      // ---------- /api/diagrams ----------
      if (segments[1] === 'diagrams') {
        // GET /api/diagrams                — list owner's diagrams
        // POST /api/diagrams               — create
        if (segments.length === 2) {
          if (request.method === 'GET') {
            const owner = ownerOf(request);
            if (!owner) return badRequest('missing X-Owner-Id');
            const diagrams = await listDiagramsByOwner(env, owner);
            return json({ diagrams });
          }
          if (request.method === 'POST') {
            const body = (await request.json()) as Partial<DiagramDTO>;
            const owner = ownerOf(request);
            if (!owner) return badRequest('missing X-Owner-Id');
            if (!body.id || !body.name || !body.tabs) {
              return badRequest('missing id/name/tabs');
            }
            const now = Date.now();
            const diagram: DiagramDTO = {
              id: body.id,
              ownerId: owner,
              name: body.name,
              tabs: body.tabs,
              savedAt: now,
              createdAt: body.createdAt ?? now,
            };
            await upsertDiagram(env, diagram);
            return json({ diagram }, { status: 201 });
          }
        }

        // /api/diagrams/<id>
        if (segments.length === 3) {
          const id = segments[2]!;
          if (request.method === 'GET') {
            const d = await getDiagram(env, id);
            return d ? json({ diagram: d }) : notFound();
          }
          if (request.method === 'PUT') {
            const body = (await request.json()) as Partial<DiagramDTO>;
            const owner = ownerOf(request);
            if (!owner) return badRequest('missing X-Owner-Id');
            if (!body.name || !body.tabs) return badRequest('missing name/tabs');
            const existing = await getDiagram(env, id);
            const now = Date.now();
            const diagram: DiagramDTO = {
              id,
              ownerId: existing?.ownerId ?? owner,
              name: body.name,
              tabs: body.tabs,
              savedAt: now,
              createdAt: existing?.createdAt ?? now,
            };
            await upsertDiagram(env, diagram);
            return json({ diagram });
          }
          if (request.method === 'DELETE') {
            await deleteDiagram(env, id);
            return new Response(null, { status: 204, headers: CORS_HEADERS });
          }
        }

        // /api/diagrams/<id>/ws — Durable Object WebSocket
        if (segments.length === 4 && segments[3] === 'ws') {
          const id = segments[2]!;
          const stub = env.DIAGRAM_ROOM.get(env.DIAGRAM_ROOM.idFromName(id));
          return stub.fetch(request);
        }
      }

      // ---------- /api/participants/<id> ----------
      if (segments[1] === 'participants' && segments.length === 3) {
        const id = segments[2]!;
        if (request.method === 'GET') {
          const p = await getParticipant(env, id);
          return p ? json({ participant: p }) : notFound();
        }
        if (request.method === 'PUT') {
          const body = (await request.json()) as Partial<ParticipantDTO>;
          if (!body.name || !body.color) return badRequest('missing name/color');
          const existing = await getParticipant(env, id);
          const now = Date.now();
          const p: ParticipantDTO = {
            id,
            name: body.name,
            color: body.color,
            createdAt: existing?.createdAt ?? now,
          };
          await upsertParticipant(env, p);
          return json({ participant: p });
        }
      }
    } catch (err) {
      console.error('api error', err);
      return json(
        { error: 'internal_error', message: String((err as Error).message ?? err) },
        { status: 500 },
      );
    }

    return notFound();
  },
} satisfies ExportedHandler<Env>;
