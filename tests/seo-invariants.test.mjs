/**
 * Bundles real shipped TypeScript sources with esbuild, then runs node:test.
 * Ensures unit tests exercise production modules (urls, seo, blog allowlist).
 */
import * as esbuild from 'esbuild';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(__dirname, 'seo-invariants.entry.ts');
const outfile = path.join(__dirname, '.bundle-seo-invariants.mjs');

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  logLevel: 'silent',
});

const result = spawnSync(process.execPath, ['--test', outfile], {
  stdio: 'inherit',
  env: process.env,
});

// Keep bundle for debugging failures; remove only on success to reduce noise
if (result.status === 0) {
  try {
    fs.unlinkSync(outfile);
  } catch {
    /* ignore */
  }
}

process.exit(result.status ?? 1);
