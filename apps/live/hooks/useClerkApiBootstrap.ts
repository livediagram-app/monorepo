'use client';

import { useAuth } from '@clerk/react';
import { useEffect, useRef } from 'react';
import { apiMigrateGuestData, setTokenProvider } from '@/lib/api-client';

// Two things every page that talks to the api needs to do once Clerk
// is in the tree:
//
//   1. Register `() => getToken()` as the api-client's token provider
//      so every request ships `Authorization: Bearer <jwt>` instead of
//      the legacy `X-Owner-Id` (spec/04 + spec/11). Clear on sign-out
//      / unmount so the guest path resumes cleanly.
//
//   2. Run the guest → authed migration the first time the user is
//      signed in AND `livediagram:v2:self-id` is still in localStorage.
//      `POST /api/migrate` reassigns every `diagrams.owner_id` +
//      `folders.owner_id` row from the guest id to the Clerk userId
//      (spec/04 + spec/11). On success we drop the localStorage key so
//      subsequent loads skip the call entirely. A ref guards against
//      React StrictMode's double-render firing two migration calls
//      in dev.
//
// Both Stage 3 (token provider) and Stage 4 (migration) lived as
// identical copy-paste pairs in editor-page.tsx and new/page.tsx until
// this hook collapsed them — CLAUDE.md's reuse rule kicks in.
//
// Returns the relevant `useAuth` fields so callers don't need to also
// destructure them — there's exactly one place those values come from
// per page.
export function useClerkApiBootstrap(): {
  isSignedIn: boolean | undefined;
  authLoaded: boolean;
  clerkUserId: string | null | undefined;
} {
  const { getToken, isSignedIn, isLoaded: authLoaded, userId: clerkUserId } = useAuth();

  // 1. Token provider registration.
  useEffect(() => {
    if (isSignedIn) {
      setTokenProvider(() => getToken());
    } else {
      setTokenProvider(null);
    }
    return () => setTokenProvider(null);
  }, [isSignedIn, getToken]);

  // 2. Guest → authed migration. Fires at most once per session.
  const migrateAttemptedRef = useRef(false);
  useEffect(() => {
    if (!isSignedIn || !clerkUserId) return;
    if (migrateAttemptedRef.current) return;
    const guestId = window.localStorage.getItem('livediagram:v2:self-id');
    if (!guestId || guestId === clerkUserId) return;
    migrateAttemptedRef.current = true;
    void apiMigrateGuestData(guestId)
      .then((res) => {
        if (res) window.localStorage.removeItem('livediagram:v2:self-id');
      })
      .catch(() => {
        // Network glitch — leave the localStorage id in place so a
        // future load retries.
        migrateAttemptedRef.current = false;
      });
  }, [isSignedIn, clerkUserId]);

  return { isSignedIn, authLoaded, clerkUserId };
}
