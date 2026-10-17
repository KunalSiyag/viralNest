/**
 * Bundles tests/islands.entry.ts with esbuild, then runs node:test
 * (island catalogs, fmt/plural helpers, error codes, routes, SSR, bundle isolation).
 *
 * `virtual:island-catalogs` imports every locale catalog that exists
 * (src/i18n/island/<loc>.ts), so the parity checks cover writers' files as
 * they land without editing this runner.
 */
import * as esbuild from 'esbuild';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(testsDir);
const islandDir = path.join(root, 'src/i18n/island');
const outfile = path.join(testsDir, '.bundle-islands.mjs');

const catalogs = {
  name: 'island-catalogs',
  setup(build) {
    build.onResolve({ filter: /^virtual:island-catalogs$/ }, () => ({ path: 'island-catalogs', namespace: 'virtual' }));
    build.onLoad({ filter: /.*/, namespace: 'virtual' }, () => {
      const locales = fs
        .readdirSync(islandDir)
        .filter((f) => /^[a-z]{2}\.ts$/.test(f) && f !== 'en.ts')
        .map((f) => f.slice(0, 2))
        .sort();
      const lines = locales.map((l, i) => `import * as m${i} from ${JSON.stringify(path.join(islandDir, `${l}.ts`))};`);
      lines.push(`export const CATALOG_MODULES = { ${locales.map((l, i) => `${JSON.stringify(l)}: m${i}`).join(', ')} };`);
      return { contents: lines.join('\n'), loader: 'ts', resolveDir: islandDir };
    });
  },
};

await esbuild.build({
  entryPoints: [path.join(testsDir, 'islands.entry.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  logLevel: 'silent',
  jsx: 'automatic',
  jsxImportSource: 'react',
  loader: { '.css': 'empty' },
  external: ['esbuild'],
  // CommonJS deps (react-dom/server) need require() inside the ESM bundle.
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
  plugins: [catalogs],
});
const result = spawnSync(process.execPath, ['--test', outfile], { stdio: 'inherit', env: process.env, cwd: root });
if (result.status === 0) {
  try {
    fs.unlinkSync(outfile);
  } catch {
    /* ignore */
  }
}
process.exit(result.status ?? 1);
