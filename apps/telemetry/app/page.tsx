'use client';

import { useEffect, useMemo, useState } from 'react';
import { Brand } from '@livediagram/ui';
import type { TelemetryCount, TelemetrySummary, TelemetryWindowKey } from '@livediagram/api-schema';

// Same origin as the editor + api under the router (livediagram.app).
// An origin-relative '/api' is correct even though this app is served
// under '/telemetry' (basePath doesn't rewrite absolute fetch paths).
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '/api';

const WINDOWS: { key: TelemetryWindowKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'last7', label: 'Last 7 days' },
  { key: 'last30', label: 'Last month' },
];

type Group = { category: string; subtotal: number; items: TelemetryCount[] };

function groupByCategory(rows: TelemetryCount[]): Group[] {
  const map = new Map<string, TelemetryCount[]>();
  for (const row of rows) {
    const arr = map.get(row.category) ?? [];
    arr.push(row);
    map.set(row.category, arr);
  }
  return [...map.entries()]
    .map(([category, items]) => ({
      category,
      items: [...items].sort((a, b) => b.count - a.count),
      subtotal: items.reduce((sum, i) => sum + i.count, 0),
    }))
    .sort((a, b) => b.subtotal - a.subtotal);
}

function eventLabel(row: TelemetryCount): string {
  return row.type ? `${row.action} · ${row.type}` : row.action;
}

export default function TelemetryDashboard() {
  const [summary, setSummary] = useState<TelemetrySummary | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [active, setActive] = useState<TelemetryWindowKey>('last7');

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/telemetry/summary`)
      .then((r) => (r.ok ? (r.json() as Promise<TelemetrySummary>) : Promise.reject(r.status)))
      .then((data) => {
        if (cancelled) return;
        setSummary(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const window = summary?.enabled ? summary.windows[active] : null;
  const groups = useMemo(() => groupByCategory(window?.rows ?? []), [window]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <div className="flex items-center justify-between gap-4">
        <Brand href="/" size="md" />
        <a href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Back to livediagram
        </a>
      </div>

      <h1 className="mt-10 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        Telemetry, in the open
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
        This is everything we measure. We record anonymous, first-party product events to learn
        which features actually help. There are no third-party analytics or tracking vendors, no
        user content (never a diagram name, your name, or anything you type), and the data is never
        sold or shared beyond this page.
      </p>

      {status === 'loading' ? (
        <p className="mt-12 text-slate-500">Loading…</p>
      ) : status === 'error' ? (
        <p className="mt-12 text-slate-500">Couldn&rsquo;t load the numbers right now.</p>
      ) : !summary?.enabled ? (
        <div className="mt-12 rounded-lg border border-slate-200 bg-white p-6">
          <p className="font-medium text-slate-900">Telemetry isn&rsquo;t enabled here.</p>
          <p className="mt-1 text-sm text-slate-600">
            This deployment hasn&rsquo;t turned telemetry on, so there&rsquo;s nothing to show.
          </p>
        </div>
      ) : (
        <>
          {/* Fixed timeframes only (Today / Last 7 days / Last month) so
              the queries stay simple and cacheable (spec/22). */}
          <div className="mt-10 inline-flex rounded-lg border border-slate-200 bg-white p-1">
            {WINDOWS.map((w) => (
              <button
                key={w.key}
                type="button"
                onClick={() => setActive(w.key)}
                className={
                  'rounded-md px-4 py-1.5 text-sm font-medium transition ' +
                  (active === w.key
                    ? 'bg-brand-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100')
                }
              >
                {w.label}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Total events
            </p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-900">
              {(window?.total ?? 0).toLocaleString()}
            </p>
          </div>

          {groups.length === 0 ? (
            <p className="mt-8 text-slate-500">No events recorded in this window yet.</p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {groups.map((group) => (
                <div
                  key={group.category}
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-base font-semibold text-slate-900">{group.category}</h2>
                    <span className="text-sm font-medium text-slate-400">
                      {group.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <ul className="mt-3 divide-y divide-slate-100">
                    {group.items.map((row) => (
                      <li
                        key={`${row.action}:${row.type ?? ''}`}
                        className="flex items-center justify-between gap-3 py-1.5 text-sm"
                      >
                        <span className="text-slate-600">{eventLabel(row)}</span>
                        <span className="font-medium text-slate-900">
                          {row.count.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {summary.generatedAt ? (
            <p className="mt-10 text-xs text-slate-400">
              Anonymous, first-party, no vendors. Updated a few minutes at a time.
            </p>
          ) : null}
        </>
      )}
    </main>
  );
}
