'use client';

import type { TelemetrySummary, TelemetryWindowKey } from '@livediagram/api-schema';
import { MetricGroups, type MetricGroup } from './MetricCards';
import { windowLabel } from './windows';

// Acquisition view (spec/22): the top of the funnel, how many fresh browsers
// arrive and how many convert to accounts, plus the account lifecycle on the
// way out. New visitors are the bare `Participant·Created` count; sign-up /
// sign-in / sign-out and account deletion come from `Session` (these only fire
// when Clerk auth is configured, so a pure-guest deploy shows zeroes).
const GROUPS: MetricGroup[] = [
  {
    title: 'Arrivals & conversion',
    metrics: [
      { category: 'Participant', action: 'Created', type: null, title: 'New Visitors' },
      { category: 'Session', action: 'SignedUp', type: null, title: 'Sign-Ups' },
      { category: 'Session', action: 'SignedIn', type: null, title: 'Sign-Ins' },
    ],
  },
  {
    title: 'Account lifecycle',
    metrics: [
      { category: 'Session', action: 'SignedOut', type: null, title: 'Sign-Outs' },
      {
        category: 'Session',
        action: 'Deleted',
        type: 'Account',
        title: 'Accounts Deleted',
        blurb: 'Signed-in users who deleted their account and all of its data.',
      },
    ],
  },
];

export function AcquisitionView({
  summary,
  active,
}: {
  summary: TelemetrySummary;
  active: TelemetryWindowKey;
}) {
  return (
    <div className="mt-8">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Who shows up and who signs up, for{' '}
        <span className="font-medium">{windowLabel(active)}</span>. Account events only fire on
        deployments with sign-in configured.
      </p>
      <MetricGroups groups={GROUPS} summary={summary} active={active} />
    </div>
  );
}
