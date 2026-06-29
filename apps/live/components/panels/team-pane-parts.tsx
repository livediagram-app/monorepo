import { Tooltip } from '@/components/primitives/Tooltip';
import type { TeamMember } from '@/lib/api-client';

// What a member row is called. Self rows use the account display name
// so the list reads as people, not pronouns; everyone else is their
// email's local part prettified ("anna.smith" → "Anna Smith") with
// the full address only in the avatar tooltip territory (kept out of
// the row to stay calm — the local part is the recognisable bit).
export function memberName(
  m: TeamMember,
  isSelf: boolean,
  clerkDisplayName: string | null,
): string {
  if (isSelf && clerkDisplayName) return clerkDisplayName;
  // Real display name once they've joined + used the app (spec/32),
  // resolved server-side from their participant profile. Falls back to
  // the prettified invite email for pending / profile-less rows.
  if (m.name) return m.name;
  if (m.email) return prettifyEmailLocalPart(m.email);
  return isSelf ? 'You' : 'Member';
}

function prettifyEmailLocalPart(email: string): string {
  const local = email.split('@')[0] ?? email;
  const words = local.split(/[._\-+]+/).filter(Boolean);
  if (words.length === 0) return email;
  return words.map((w) => w[0]!.toUpperCase() + w.slice(1)).join(' ');
}

export function RolePill({ member, pinned }: { member: TeamMember; pinned: boolean }) {
  const pill = (
    <span
      className={`inline-flex w-fit shrink-0 items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ${
        member.role === 'admin'
          ? 'bg-brand-50 text-brand-700 ring-brand-200'
          : 'bg-slate-100 text-slate-600 ring-slate-200'
      }`}
    >
      {member.role === 'admin' ? 'Admin' : 'Member'}
    </span>
  );
  if (!pinned) return pill;
  // The only Admin: explain why there's no role select here.
  return (
    <Tooltip
      title="Last Admin"
      description="A team always needs at least one Admin. Promote someone else before changing this role, removing this member, or leaving."
    >
      {pill}
    </Tooltip>
  );
}

export function EllipsisIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <circle cx="3" cy="7" r="1.25" fill="currentColor" />
      <circle cx="7" cy="7" r="1.25" fill="currentColor" />
      <circle cx="11" cy="7" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function LinkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5.93M14 11a5 5 0 0 0-7.07 0L5.5 12.4a5 5 0 0 0 7.07 7.07L13.9 18.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
