// Per-element comment threads: the Comment / CommentThread shapes plus the
// helpers that create a comment and count the active (unresolved) ones. Split
// out of index.ts so the comments model lives in one focused module. Re-exported
// from ./index, so the public `@livediagram/diagram` surface is unchanged.

// A single comment inside a thread. The author is the participant who
// wrote it (per `apps/live/lib/identity.ts`). The participant model is
// local-session-only today; the comment carries a denormalised copy of
// the name + colour so the badge keeps rendering even if the participant
// list later evolves (e.g. user renames themselves mid-session).
export type Comment = {
  id: string;
  text: string;
  createdAt: number; // unix ms
  authorName: string;
  authorColor: string;
  // Stable id of the participant who wrote it (their Clerk sub or guest
  // owner id). Server-stamped and server-trusted, never read from the
  // client. Lets a view-role visitor delete their OWN comments without
  // being able to touch anyone else's. When serving a diagram to a
  // non-owner the API blanks this on comments they didn't write (same
  // anti-claim redaction `redactOwner` applies to the diagram owner id),
  // so a visitor only ever sees their own author id. Optional so
  // comments written before this field existed still parse.
  authorId?: string;
};

// Threads live on elements (currently boxed only). `resolved` is sticky:
// users can resolve and unresolve a thread without losing the comments.
export type CommentThread = {
  comments: Comment[];
  resolved: boolean;
};

export function createComment(
  text: string,
  author: { id?: string; name: string; color: string },
): Comment {
  return {
    id: crypto.randomUUID(),
    text,
    createdAt: Date.now(),
    authorName: author.name,
    authorColor: author.color,
    authorId: author.id,
  };
}

// Count of comments shown on the badge. Resolved threads return 0 so the
// badge hides — the comments still exist and reappear on unresolve.
export function activeCommentCount(thread: CommentThread | undefined): number {
  if (!thread || thread.resolved) return 0;
  return thread.comments.length;
}
