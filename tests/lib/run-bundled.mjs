/**
 * Bundle a TypeScript test entry with esbuild and run it with node --test.
 * `conditions` adds export conditions (the MCP SDK needs `workerd` so the test
 * uses the same JSON Schema validator as the Worker).
 */
import * as esbuild from 'esbuild';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const testsDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export async function runBundledTest(entryName, { conditions } = {}) {
  const entry = path.join(testsDir, entryName);
  const outfile = path.join(testsDir, `.bundle-${entryName.replace(/\.entry\.ts$/, '')}.mjs`);
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile,
    logLevel: 'silent',
    ...(conditions ? { conditions } : {}),
  });
  const result = spawnSync(process.execPath, ['--test', outfile], {
    stdio: 'inherit',
    env: process.env,
    cwd: path.dirname(testsDir),
  });
  if (result.status === 0) {
    try {
      fs.unlinkSync(outfile);
    } catch {
      /* ignore */
    }
  }
  return result.status ?? 1;
}
