#!/usr/bin/env node
// Robust local dev entry. Three sources of friction with the bare
// `next dev` invocation were biting us repeatedly:
//
//  1. Port 3002 stays bound after an interrupted `next dev`, so the
//     next start fails with EADDRINUSE and someone has to chase down
//     a stray process by hand.
//  2. The `.next` cache occasionally desynchronises after a route
//     restructure or a shared-import shuffle, leaving the HMR client
//     asking for chunks the bundler no longer emits ("Cannot find
//     module './257.js'"). The dev server happily serves 500s until
//     someone wipes it.
//  3. Wrapping the same logic in package.json's `"dev"` field with
//     shell pipelines is fragile across macOS / Linux xargs flavours.
//
// This script normalises the startup: free the port, clear the
// cache, then exec next dev with the requested bundler flags.

import { execSync, spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, '..');
const PORT = 3002;

function freePort(port) {
  let pids = '';
  try {
    pids = execSync(`lsof -ti:${port}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    // lsof exits non-zero when nothing is bound — nothing to kill.
    return;
  }
  if (!pids) return;
  for (const pid of pids.split(/\s+/)) {
    // Kill children FIRST — `lsof -ti` only returns processes bound
    // to the port, so jest-worker / static-paths-worker etc. are
    // invisible to it. Leaving them alive keeps file handles open
    // on `.next/server`, which races the wipe below and leaves
    // stale `webpack-runtime.js` references to vendor chunks whose
    // pnpm-resolved hashes no longer match. Empirically that's the
    // "Cannot find module './vendor-chunks/...'" crash that needs
    // a manual rm -rf .next to recover from.
    try {
      execSync(`pkill -KILL -P ${pid}`, { stdio: 'ignore' });
    } catch {
      // No children — fine.
    }
    try {
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
    } catch {
      // Already exited between lsof and kill — fine.
    }
  }
  console.log(`[dev] freed port ${port} (killed ${pids.replace(/\s+/g, ', ')} + children)`);
}

function clearCache() {
  rmSync(resolve(appRoot, '.next'), { recursive: true, force: true });
}

freePort(PORT);
clearCache();

// Turbopack is the default bundler now. Webpack's HMR repeatedly
// desynchronises after live edits and serves
// `__webpack_modules__[moduleId] is not a function` until someone
// wipes `.next` and restarts — even with the persistent FS cache
// already disabled in `next.config.ts` and child workers killed
// cleanly here. Turbopack (stable in Next 15) sidesteps that whole
// class of failure. Opt back into webpack only when something
// Turbopack genuinely doesn't support.
const useWebpack = process.argv.includes('--webpack');
const nextArgs = ['next', 'dev', '-p', String(PORT)];
if (!useWebpack) nextArgs.splice(2, 0, '--turbopack');

const child = spawn('pnpm', nextArgs, { stdio: 'inherit', cwd: appRoot });
child.on('exit', (code) => process.exit(code ?? 0));

// Forward SIGINT / SIGTERM so Ctrl+C in the parent kills next cleanly.
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    if (!child.killed) child.kill(sig);
  });
}
