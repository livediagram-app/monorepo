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
