'use client';

// OAuth round-trip handler. Clerk redirects here after the social
// provider; the AuthenticateWithRedirectCallback component completes
// the flow and bounces to the editor. Mirrors MT's
// apps/dashboard/app/sso-callback/page.tsx with livediagram fallback
// destinations.

// Import from @clerk/react (framework-agnostic) so the static export
// build doesn't pull in @clerk/nextjs's Server Actions — see
// components/providers/ClerkProvider.tsx for the same rationale.
import { AuthenticateWithRedirectCallback } from '@clerk/react';

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
      <div className="rounded-xl border border-slate-200 bg-white px-8 py-6 text-center shadow-lg shadow-slate-900/10">
        <p className="text-sm text-slate-600">Completing sign in…</p>
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl="/live/"
          signUpFallbackRedirectUrl="/live/"
        />
      </div>
    </div>
  );
}
