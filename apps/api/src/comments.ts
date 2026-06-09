import type { Comment, Element } from '@livediagram/diagram';
import type { ParticipantDTO } from './types';

// Rewrite newly-added comments so the author fields come from the
// server-trusted participant record, not whatever the client posted.
// Compares each comment's id against the prior tab's comments by
// id: anything new is attributed to the writer (the resolved owner
// of the PUT); anything pre-existing passes through with its
// stored author fields restored. Closes the comment-author
// spoofing surface called out in the security audit (a share-link
// visitor could otherwise stamp another participant's name +
// colour onto a comment, or relabel someone else's existing one).
//
// Pure helper, exported so the api worker's PUT-tab handler and
// the colocated tests both consume the same implementation.
export function rewriteCommentAuthors(
  nextElements: Element[],
  prevElements: Element[],
  writer: ParticipantDTO,
): Element[] {
  // Index existing comments by id so the lookup per new comment is
  // O(1). A comment id collision across two different elements is
  // impossible by construction (uuids) so flat indexing is safe.
  const existingComments = new Map<
    string,
    { authorName: string; authorColor: string; authorId?: string }
  >();
  for (const el of prevElements) {
    const thread = (el as { commentThread?: { comments?: Comment[] } }).commentThread;
    if (!thread?.comments) continue;
    for (const c of thread.comments) {
      existingComments.set(c.id, {
        authorName: c.authorName,
        authorColor: c.authorColor,
        authorId: c.authorId,
      });
    }
  }
  return nextElements.map((el) => {
    const thread = (el as { commentThread?: { comments?: Comment[] } }).commentThread;
    if (!thread?.comments?.length) return el;
    const sanitised = thread.comments.map((c) => {
      const prior = existingComments.get(c.id);
      if (prior) {
        // Existing comment: lock author fields (incl. the author id
        // used for delete-own checks) to whatever was stored. Stops a
        // malicious edit-role visitor from mutating someone else's
        // already-posted comment author or reassigning its ownership.
        return {
          ...c,
          authorName: prior.authorName,
          authorColor: prior.authorColor,
          authorId: prior.authorId,
        };
      }
      // New comment: server-authoritative author (name, colour, and the
      // stable id that later authorises delete-own).
      return { ...c, authorName: writer.name, authorColor: writer.color, authorId: writer.id };
    });
    return { ...el, commentThread: { ...thread, comments: sanitised } } as Element;
  });
}

// Remove a single comment by id from whichever element's thread holds
// it, dropping the thread entirely once its last comment goes (so the
// element's comment badge clears, mirroring the client's deleteComment).
// Returns the elements unchanged when the id isn't present.
export function removeComment(elements: Element[], commentId: string): Element[] {
  return elements.map((el) => {
    const thread = (el as { commentThread?: { comments?: Comment[]; resolved: boolean } })
      .commentThread;
    if (!thread?.comments?.length) return el;
    const remaining = thread.comments.filter((c) => c.id !== commentId);
    if (remaining.length === thread.comments.length) return el;
    if (remaining.length === 0) {
      const { commentThread: _drop, ...rest } = el as { commentThread?: unknown };
      return rest as Element;
    }
    return { ...el, commentThread: { ...thread, comments: remaining } } as Element;
  });
}

// Find a comment by id across all elements and return it (with its
// author id), or null. Used to authorise delete-own before mutating.
export function findComment(elements: Element[], commentId: string): Comment | null {
  for (const el of elements) {
    const thread = (el as { commentThread?: { comments?: Comment[] } }).commentThread;
    const hit = thread?.comments?.find((c) => c.id === commentId);
    if (hit) return hit;
  }
  return null;
}

// Blank the author id on every comment a given visitor did NOT write,
// before serving a tab to a non-owner. The author id is the diagram /
// guest owner id of whoever posted the comment; exposing other people's
// ids to a visitor would re-open the observe-then-claim vector that
// `redactOwner` closes for the diagram owner id. A visitor still sees
// their OWN author id (which they already know — it's their own id), so
// the client can light up a delete button on their own comments. Pass
// the diagram owner's id as `viewerId` to no-op (the owner sees all).
export function redactCommentAuthorIds(elements: Element[], viewerId: string | null): Element[] {
  return elements.map((el) => {
    const thread = (el as { commentThread?: { comments?: Comment[] } }).commentThread;
    if (!thread?.comments?.length) return el;
    const comments = thread.comments.map((c) =>
      c.authorId && c.authorId === viewerId ? c : { ...c, authorId: undefined },
    );
    return { ...el, commentThread: { ...thread, comments } } as Element;
  });
}
