#!/usr/bin/env node
/**
 * npm run i18n:check — fast content check for locale writers (no Astro build).
 *
 * Validates every src/content/i18n/<locale>/<pageId>.json against the
 * PageContent schema (lengths in code points after NFC, no raw HTML, NFC),
 * the route map (SLUGS, gates), the plan matrix (fixed title/description/H1/
 * primary keyword), inline mini-markup and internal links, honesty and
 * glossary rules, uniqueness within a locale, and the key/token parity of
 * src/i18n/ui/<locale>.ts and src/i18n/island/<locale>.ts against English.
 *
 * Usage:
 *   npm run i18n:check                 all locales
 *   npm run i18n:check -- es pt        only these locales
 *   npm run i18n:check -- --strict     missing pages are errors (release gate)
 *   npm run i18n:check -- --quiet      errors only
 * Exit code 1 when any error is found.
 */
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const strict = args.includes('--strict');
const quiet = args.includes('--quiet');
const only = args.filter((a) => !a.startsWith('--'));

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const exists = (p) => fs.existsSync(path.join(ROOT, p));

// One bundle: rules + routes + schema + every catalog that exists today.
const catalogs = [];
for (const dir of ['ui', 'island']) {
  const abs = path.join(ROOT, 'src/i18n', dir);
  if (!fs.existsSync(abs)) continue;
  for (const f of fs.readdirSync(abs)) if (/^[a-z]{2}\.ts$/.test(f)) catalogs.push({ dir, locale: f.slice(0, 2) });
}
const entry = `
export * as rules from './src/i18n/content-rules.ts';
export { LOCALES, LOCALE_META } from './src/i18n/locales.ts';
export { getAllPosts } from './src/data/blog.ts';
${catalogs.map((c, i) => `export * as cat${i} from './src/i18n/${c.dir}/${c.locale}.ts';`).join('\n')}
`;
const outfile = path.join(os.tmpdir(), `pd-i18n-check-${process.pid}.mjs`);
await esbuild.build({
  stdin: { contents: entry, resolveDir: ROOT, loader: 'ts', sourcefile: 'i18n-check-entry.ts' },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  logLevel: 'error',
  // astro/zod is plain zod; nothing else from Astro is reachable from these modules.
});
let mod;
try {
  mod = await import(pathToFileURL(outfile).href);
} finally {
  fs.rmSync(outfile, { force: true });
}
const { rules, LOCALES, getAllPosts } = mod;

const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/i18n/i18n-plan.json'), 'utf8'));
const enPaths = rules.englishPaths(getAllPosts().map((p) => p.slug));
const locales = LOCALES.filter((l) => !only.length || only.includes(l));
const findings = [];
const counts = {};

const contentRoot = path.join(ROOT, 'src/content/i18n');
if (fs.existsSync(contentRoot)) {
  for (const dir of fs.readdirSync(contentRoot)) {
    if (!fs.statSync(path.join(contentRoot, dir)).isDirectory()) continue;
    if (!LOCALES.includes(dir)) {
      findings.push({ level: 'error', file: rel(path.join(contentRoot, dir)), message: 'not a locale folder' });
    }
  }
}

for (const locale of locales) {
  const dir = path.join(contentRoot, locale);
  const pages = new Map();
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => !f.startsWith('.')) : [];
  for (const name of files) {
    const abs = path.join(dir, name);
    const file = rel(abs);
    if (!name.endsWith('.json')) {
      findings.push({ level: 'error', file, message: 'only <pageId>.json files belong here' });
      continue;
    }
    let data;
    try {
      data = JSON.parse(fs.readFileSync(abs, 'utf8'));
    } catch (e) {
      findings.push({ level: 'error', file, message: `invalid JSON: ${e.message}` });
      continue;
    }
    const { findings: f, page } = rules.checkPageFile(
      { file, data, dirLocale: locale, filePageId: name.slice(0, -5) },
      plan.matrix,
      enPaths,
    );
    findings.push(...f);
    if (page) pages.set(page.pageId, { file, page });
  }
  findings.push(...rules.checkLocale(locale, pages, strict));
  counts[locale] = pages.size;
}

// Catalog parity against English.
for (const kind of ['ui', 'island']) {
  const enIdx = catalogs.findIndex((c) => c.dir === kind && c.locale === 'en');
  const enMod = enIdx >= 0 ? mod[`cat${enIdx}`] : null;
  const enObj = enMod ? Object.values(enMod).find((v) => v && typeof v === 'object' && !Array.isArray(v)) : null;
  for (const locale of locales) {
    const i = catalogs.findIndex((c) => c.dir === kind && c.locale === locale);
    const file = `src/i18n/${kind}/${locale}.ts`;
    if (i < 0) {
      findings.push({
        level: strict ? 'error' : 'warn',
        file,
        message: enObj ? `missing ${kind} catalog (pages fall back to English chrome)` : `missing ${kind} catalog`,
      });
      continue;
    }
    if (!enObj) {
      findings.push({ level: 'warn', file, message: `src/i18n/${kind}/en.ts not published yet: parity not checked` });
      continue;
    }
    const m = mod[`cat${i}`];
    const objs = Object.entries(m).filter(([, v]) => v && typeof v === 'object' && !Array.isArray(v));
    if (objs.length !== 1) {
      findings.push({ level: 'error', file, message: `export exactly one catalog object (found ${objs.map(([k]) => k).join(', ') || 'none'})` });
      continue;
    }
    findings.push(...rules.checkCatalog(file, locale, enObj, objs[0][1]));
  }
}

// Report
const errors = findings.filter((f) => f.level === 'error');
const warns = findings.filter((f) => f.level === 'warn');
const byFile = new Map();
for (const f of quiet ? errors : findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}
for (const [file, list] of [...byFile].sort(([a], [b]) => a.localeCompare(b))) {
  console.log(file);
  for (const f of list) console.log(`  ${f.level === 'error' ? 'ERROR' : 'warn '} ${f.path ? `${f.path}: ` : ''}${f.message}`);
}
const pagesLine = locales.map((l) => `${l} ${counts[l] ?? 0}`).join(', ');
console.log(`\ni18n:check — content files: ${pagesLine}`);
console.log(`${errors.length} error(s), ${warns.length} warning(s)${strict ? ' [strict]' : ''}`);
process.exit(errors.length ? 1 : 0);
