// One laser sample on a participant's trail. `t` is a
// performance.now() reading at the time the point was appended, used
// for both age-based drop in this buffer and per-segment fade in
// LaserOverlay.
export type LaserPoint = { x: number; y: number; t: number };

// How long a buffered point sticks around before trimLaserBuffer
// drops it. The overlay's fade window (LIFETIME_MS in
// LaserOverlay.tsx) is shorter than this, so points between
// LIFETIME_MS and TTL_MS sit in the buffer but render at 0 opacity,
// protecting against frame jitter at the fade boundary.
export const LASER_BUFFER_TTL_MS = 1500;

// Hard cap on points per participant trail. Even a peer who sends
// laser ops faster than the throttle would normally allow can't
// grow the buffer without bound: the trim drops anything past the
// most recent LASER_MAX_POINTS samples, in addition to the TTL.
export const LASER_MAX_POINTS = 60;

// Bound a laser-trail buffer in both dimensions: drop samples older
// than LASER_BUFFER_TTL_MS, then cap at the LASER_MAX_POINTS most
// recent. Called on every append (local broadcast + remote receive)
// so even a flood from a misbehaving peer can't grow the buffer
// without bound.
//
// `now` is injectable so tests can pin a deterministic clock; the
// production callers omit it and the default reads
// `performance.now()` at call time.
export function trimLaserBuffer(
  points: LaserPoint[],
  now: number = performance.now(),
): LaserPoint[] {
  const cutoff = now - LASER_BUFFER_TTL_MS;
  const fresh = points.filter((p) => p.t >= cutoff);
  return fresh.length > LASER_MAX_POINTS ? fresh.slice(fresh.length - LASER_MAX_POINTS) : fresh;
}
