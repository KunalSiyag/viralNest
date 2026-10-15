/**
 * Bundles tests/extract-parity.entry.ts with esbuild, then runs node:test.
 * RECORD_GOLDEN=1 node tests/extract-parity.test.mjs re-records the golden.
 */
import { runBundledTest } from './lib/run-bundled.mjs';

process.exit(await runBundledTest('extract-parity.entry.ts'));
