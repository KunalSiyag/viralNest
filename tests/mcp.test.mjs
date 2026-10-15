/**
 * Bundles tests/mcp.entry.ts with the `workerd` export condition (the MCP SDK
 * then uses the same cf-worker JSON Schema validator as the deployed Worker)
 * and runs it with node:test.
 */
import { runBundledTest } from './lib/run-bundled.mjs';

process.exit(await runBundledTest('mcp.entry.ts', { conditions: ['workerd', 'worker'] }));
