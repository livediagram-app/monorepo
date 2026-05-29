import type { Tab } from '@livediagram/diagram';
import type { Participant } from './identity';

// Single HTTP/WS client for the livediagram API. Lives at `/api/*` in
// production (router stitches it onto the same hostname) and in dev too
// once the user runs the router worker alongside the live app.
//
// All requests carry an `X-Owner-Id` header set to the current
// participant's id — the API uses it as the diagram-owner filter and
// for create-time `owner_id`. There's no auth gate yet; this is the
// hook that Clerk will replace in the post-prototype phase.

const API_BASE = '/api';

export type StoredDiagram = {
  id: string;
  name: string;
  tabs: Tab[];
  savedAt: number;
};

export type DiagramSummary = {
  id: string;
  name: string;
  savedAt: number;
};

type DiagramResponse = {
  diagram: {
    id: string;
    ownerId: string;
    name: string;
    tabs: Tab[];
    savedAt: number;
    createdAt: number;
  };
};

type ListResponse = {
  diagrams: {
    id: string;
    name: string;
    savedAt: number;
  }[];
};

type ParticipantResponse = {
  participant: {
    id: string;
    name: string;
    color: string;
    createdAt: number;
  };
};

function ownerHeaders(ownerId: string): HeadersInit {
  return { 'X-Owner-Id': ownerId, 'Content-Type': 'application/json' };
}

export async function apiLoadDiagram(id: string): Promise<StoredDiagram | null> {
  const res = await fetch(`${API_BASE}/diagrams/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`load failed: ${res.status}`);
  const { diagram } = (await res.json()) as DiagramResponse;
  return { id: diagram.id, name: diagram.name, tabs: diagram.tabs, savedAt: diagram.savedAt };
}

export async function apiSaveDiagram(ownerId: string, d: StoredDiagram): Promise<void> {
  const res = await fetch(`${API_BASE}/diagrams/${d.id}`, {
    method: 'PUT',
    headers: ownerHeaders(ownerId),
    body: JSON.stringify({ name: d.name, tabs: d.tabs }),
  });
  // PUT upserts, but the first save on a new id could 404 if the API
  // gate were stricter — today PUT always upserts so the only error path
  // is network. Throw so the caller can show "save failed" UI.
  if (!res.ok) throw new Error(`save failed: ${res.status}`);
}

export async function apiDeleteDiagram(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/diagrams/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) throw new Error(`delete failed: ${res.status}`);
}

export async function apiListDiagrams(ownerId: string): Promise<DiagramSummary[]> {
  const res = await fetch(`${API_BASE}/diagrams`, {
    headers: { 'X-Owner-Id': ownerId },
  });
  if (!res.ok) throw new Error(`list failed: ${res.status}`);
  const { diagrams } = (await res.json()) as ListResponse;
  return diagrams.map((d) => ({ id: d.id, name: d.name, savedAt: d.savedAt }));
}

export async function apiLoadSelf(id: string): Promise<Participant | null> {
  const res = await fetch(`${API_BASE}/participants/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`load self failed: ${res.status}`);
  const { participant } = (await res.json()) as ParticipantResponse;
  return {
    id: participant.id,
    name: participant.name,
    color: participant.color,
    status: 'online',
  };
}

export async function apiSaveSelf(p: Participant): Promise<void> {
  const res = await fetch(`${API_BASE}/participants/${p.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: p.name, color: p.color }),
  });
  if (!res.ok) throw new Error(`save self failed: ${res.status}`);
}

// ---------------------------------------------------------------------
// Realtime room
// ---------------------------------------------------------------------

// Outgoing payloads sent from this client.
export type RoomOutgoing =
  | { kind: 'hello'; participant: { id: string; name: string; color: string } }
  | { kind: 'op'; op: { kind: 'tabs'; tabs: Tab[]; name: string } };

// Incoming payloads from the room (broadcast by the Durable Object).
export type RoomIncoming =
  | {
      kind: 'presence';
      participants: { id: string; name: string; color: string }[];
    }
  | { kind: 'op'; from: string; op: { kind: 'tabs'; tabs: Tab[]; name: string } };

export type RoomHandlers = {
  onPresence: (participants: { id: string; name: string; color: string }[]) => void;
  onOp: (from: string, op: { kind: 'tabs'; tabs: Tab[]; name: string }) => void;
  onClose?: () => void;
};

export function connectRoom(
  diagramId: string,
  participant: { id: string; name: string; color: string },
  handlers: RoomHandlers,
): {
  send: (msg: RoomOutgoing) => void;
  close: () => void;
} {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const url = `${proto}//${window.location.host}${API_BASE}/diagrams/${diagramId}/ws`;
  const ws = new WebSocket(url);
  ws.addEventListener('open', () => {
    ws.send(JSON.stringify({ kind: 'hello', participant } satisfies RoomOutgoing));
  });
  ws.addEventListener('message', (e) => {
    try {
      const msg = JSON.parse(e.data) as RoomIncoming;
      if (msg.kind === 'presence') handlers.onPresence(msg.participants);
      else if (msg.kind === 'op') handlers.onOp(msg.from, msg.op);
    } catch {
      // Malformed frame — ignore. Production would log here.
    }
  });
  ws.addEventListener('close', () => handlers.onClose?.());
  return {
    send: (msg) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
    },
    close: () => ws.close(),
  };
}
