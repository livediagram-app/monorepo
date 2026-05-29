import type { Tab } from '@livediagram/diagram';

// The single API DTO for a diagram. Mirrors the frontend's StoredDiagram
// shape so the WorkersDiagramStore is a thin pass-through.
export type DiagramDTO = {
  id: string;
  ownerId: string;
  name: string;
  tabs: Tab[];
  savedAt: number;
  createdAt: number;
};

// Lightweight projection for list endpoints — drops `tabs` so listing 100
// diagrams doesn't ship 100 element trees.
export type DiagramSummary = {
  id: string;
  ownerId: string;
  name: string;
  savedAt: number;
  createdAt: number;
};

export type ParticipantDTO = {
  id: string;
  name: string;
  color: string;
  createdAt: number;
};

export type Env = {
  DB: D1Database;
  DIAGRAM_ROOM: DurableObjectNamespace;
};

// Outgoing WebSocket message types. Clients see `presence` (full list of
// connected participants in this room) and `op` (an arbitrary diagram
// change pushed by another client — schema deliberately permissive so
// the room doesn't need to evolve as the editor adds new op kinds).
export type ServerMessage =
  | { kind: 'presence'; participants: ParticipantPresence[] }
  | { kind: 'op'; from: string; op: unknown };

// Incoming WebSocket message types. `hello` is sent on connect to
// identify the participant; `op` is any local mutation the client
// wants other clients to apply.
export type ClientMessage =
  | { kind: 'hello'; participant: ParticipantPresence }
  | { kind: 'op'; op: unknown };

export type ParticipantPresence = {
  id: string;
  name: string;
  color: string;
};
