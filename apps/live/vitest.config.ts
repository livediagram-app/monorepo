import { fileURLToPath } from 'node:url';
import { defineProject } from '@livediagram/vitest-config';

// Node environment is enough for the current pure-logic tests (canvas
// geometry). When component / hook tests land, switch to 'jsdom' and
// add jsdom + @testing-library/react. See specs/18-testing.md.
//
// resolve.alias mirrors tsconfig.json's `"@/*": ["./*"]` so test files
// that import a helper from a component file (e.g.
// commentRowsFromElements out of CommentsPanel.tsx, which itself
// imports `@/lib/relative-time` for hooks the helper never reaches)
// can resolve the module-load chain. Without this the test runner
// fails at import time on any component-co-located pure helper whose
// host module touches the alias.
export default defineProject({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
});
