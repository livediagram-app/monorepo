'use client';

// Sign-in CTA shown inside the Explorer (and any future surface that
// wants the same "this would sync to an account" prompt). Three
// states:
//
//   - Clerk disabled  → renders nothing (no auth to prompt for).
//   - Signed in       → renders nothing (the user already has the
//                       account that would sync the diagrams).
//   - Signed out      → renders the prompt linking to /live/sign-in/.
//
// Same module-load enabled/disabled hook-swap pattern as AuthControls
// and useClerkApiBootstrap — calling useAuth outside a ClerkProvider
// would throw, so the disabled branch never touches Clerk.

import { useAuth } from '@clerk/react';
import Link from 'next/link';
import { clerkEnabled } from '@/lib/clerk-config';

function SignInPromptEnabled() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded || isSignedIn) return null;
  return (
    <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/60 px-3 py-3 text-xs text-slate-600">
      <p className="font-medium text-slate-800">Sign in to keep your diagrams</p>
      <p className="mt-1 leading-relaxed text-slate-500">
        A free account syncs your diagrams across devices.
      </p>
      <Link
        href="/live/sign-in/"
        className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-brand-600"
      >
        Sign in
      </Link>
    </div>
  );
}

function SignInPromptDisabled() {
  return null;
}

export const SignInPrompt = clerkEnabled ? SignInPromptEnabled : SignInPromptDisabled;
