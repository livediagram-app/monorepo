import type { ClientMessage, ParticipantPresence, ServerMessage } from './types';

// One Durable Object instance per diagram id. Holds the set of currently
// connected WebSockets plus their participant identity, and broadcasts
// presence + op messages so every client sees what every other client is
// doing in real time.
//
// Conflict model: last-writer-wins. Ops are not persisted here; they're
// shaped opaquely (`op: unknown`) so the editor can evolve its
// vocabulary without changing the room. Persistence happens through the
// REST endpoints separately — clients save the full diagram snapshot
// after their local mutation lands. The room is only responsible for
// propagation.
export class DiagramRoom implements DurableObject {
  state: DurableObjectState;
  // `sessions` is keyed by WebSocket; the value is the most recent
  // ParticipantPresence the client identified itself with via `hello`.
  // Null means "connected but hasn't said hello yet" — those clients
  // receive presence but aren't included in the presence list.
  sessions: Map<WebSocket, ParticipantPresence | null> = new Map();

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    // Internal fan-out endpoint, called by the api worker after a
    // privileged action that every connected client should learn
    // about immediately (e.g. share-link revocation). Not exposed
    // publicly: the worker stubs the DO via `env.DIAGRAM_ROOM.get(...)
    // .fetch(...)`, which never traverses Cloudflare's edge, so the
    // path is implicitly internal. Body is `{ op: RoomOp }` and the
    // op gets broadcast with a synthetic `from: 'system'` so the
    // frontend handler can distinguish it from a peer's op.
    if (request.method === 'POST' && url.pathname === '/broadcast') {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return new Response('bad json', { status: 400 });
      }
      const op = (body as { op?: unknown }).op;
      if (!op) return new Response('missing op', { status: 400 });
      this.broadcastSystemOp(op);
      return new Response(null, { status: 204 });
    }
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }
    const pair = new WebSocketPair();
    // WebSocketPair is a 2-property record keyed `0`/`1`. The "client"
    // side is returned to the connecting peer; the "server" side is
    // owned by this Durable Object.
    const client = pair[0]!;
    const server = pair[1]!;
    this.handleSession(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  // Fan an op out to every connected client without a sender. Used
  // for server-originated events (share-link revoked, owner-side
  // forced disconnects). Senders aren't excluded because the
  // originator is the worker itself, not any of the connected peers.
  broadcastSystemOp(op: unknown): void {
    const payload: ServerMessage = { kind: 'op', from: 'system', op };
    const serialized = JSON.stringify(payload);
    for (const ws of this.sessions.keys()) {
      try {
        ws.send(serialized);
      } catch {
        this.sessions.delete(ws);
      }
    }
  }

  handleSession(ws: WebSocket): void {
    ws.accept();
    this.sessions.set(ws, null);

    ws.addEventListener('message', (event) => {
      let msg: ClientMessage;
      try {
        msg = JSON.parse(typeof event.data === 'string' ? event.data : '') as ClientMessage;
      } catch {
        return;
      }
      if (msg.kind === 'hello') {
        this.sessions.set(ws, msg.participant);
        this.broadcastPresence();
        return;
      }
      if (msg.kind === 'op') {
        const sender = this.sessions.get(ws);
        if (!sender) return;
        const payload: ServerMessage = { kind: 'op', from: sender.id, op: msg.op };
        const serialized = JSON.stringify(payload);
        for (const peer of this.sessions.keys()) {
          if (peer !== ws) {
            try {
              peer.send(serialized);
            } catch {
              this.sessions.delete(peer);
            }
          }
        }
      }
    });

    const close = () => {
      this.sessions.delete(ws);
      this.broadcastPresence();
    };
    ws.addEventListener('close', close);
    ws.addEventListener('error', close);
  }

  broadcastPresence(): void {
    const participants: ParticipantPresence[] = [];
    for (const p of this.sessions.values()) {
      if (p) participants.push(p);
    }
    const payload: ServerMessage = { kind: 'presence', participants };
    const serialized = JSON.stringify(payload);
    for (const ws of this.sessions.keys()) {
      try {
        ws.send(serialized);
      } catch {
        this.sessions.delete(ws);
      }
    }
  }
}
