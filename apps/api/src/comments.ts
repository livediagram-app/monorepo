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
  const existingComments = new Map<string, { authorName: string; authorColor: string }>();
  for (const el of prevElements) {
    const thread = (el as { commentThread?: { comments?: Comment[] } }).commentThread;
    if (!thread?.comments) continue;
    for (const c of thread.comments) {
      existingComments.set(c.id, { authorName: c.authorName, authorColor: c.authorColor });
    }
  }
  return nextElements.map((el) => {
    const thread = (el as { commentThread?: { comments?: Comment[] } }).commentThread;
    if (!thread?.comments?.length) return el;
    const sanitised = thread.comments.map((c) => {
      const prior = existingComments.get(c.id);
      if (prior) {
        // Existing comment: lock author fields to whatever was
        // stored. Stops a malicious edit-role visitor from
        // mutating someone else's already-posted comment author.
        return { ...c, authorName: prior.authorName, authorColor: prior.authorColor };
      }
      // New comment: server-authoritative author.
      return { ...c, authorName: writer.name, authorColor: writer.color };
    });
    return { ...el, commentThread: { ...thread, comments: sanitised } } as Element;
  });
}
