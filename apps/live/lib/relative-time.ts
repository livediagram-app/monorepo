// Relative-time formatting shared by the footer save indicator, the
// Explorer's "Your diagrams" list, and the Activity panel rows.
// Kept here so all three panels read identically — previously each
// surface had its own slightly different copy.
//
// Two flavours:
//   formatRelativeTime         — verbose ("2 minutes ago"), used wherever
//                                horizontal room is plentiful.
//   formatRelativeTimeShort    — compact ("2 min ago"), used inside the
//                                Activity panel rows where space is tight.

import { useEffect, useState } from 'react';

export function formatRelativeTime(deltaMs: number): string {
  const seconds = Math.floor(deltaMs / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

export function formatRelativeTimeShort(deltaMs: number): string {
  const seconds = Math.floor(deltaMs / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return '1 min ago';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

// Re-render every 30 seconds so any inline relative-time strings stay
// fresh. Returns a tick counter the caller doesn't need to read —
// just calling the hook is enough to subscribe to the re-render
// cadence. Cheap because every interval is cleared on unmount.
export function useRelativeTimeTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return tick;
}
