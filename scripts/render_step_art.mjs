#!/usr/bin/env node
/**
 * Render the how-to step illustrations (src/assets/steps/step{1,2,3}.svg) to
 * public/images/step{1,2,3}.webp at their fixed pixel sizes.
 *
 * Usage:
 *   node scripts/render_step_art.mjs [--out <dir>] [--max-kb 40]
 *
 * Needs Playwright with Chromium. It is not a project dependency, so either install it
 * where Node can resolve it, or point PLAYWRIGHT_DIR at any folder whose node_modules
 * has it:
 *   PLAYWRIGHT_DIR=/path/to/folder-with-playwright node scripts/render_step_art.mjs
 *
 * How it works: each SVG is inlined into a blank page with Big Shoulders Display loaded
 * from public/fonts (as data URIs, so no server is needed), screenshotted at exactly the
 * target size (deviceScaleFactor 1), then encoded to WebP by Chromium's canvas encoder.
 * Lossless is used when it fits the size budget, otherwise the highest lossy quality that
 * does. The output sizes are fixed: the HowTo JSON-LD and <img> tags reference these
 * files, so the filenames and dimensions must not drift.
 *
 * The URL text and the few small sans labels use the DESIGN.md body stack (system-ui
 * first), so they print in the render machine's UI sans, like the live input does; the
 * committed files were rendered on Linux, where that is DejaVu Sans. Layout leaves room
 * for that wide face. Everything else is Big Shoulders Display, which is bundled.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Fixed output sizes (match the files referenced by src/pages/index.astro). */
const ART = [
  { name: 'step1', width: 859, height: 573 },
  { name: 'step2', width: 881, height: 575 },
  { name: 'step3', width: 883, height: 574 },
];

const args = process.argv.slice(2);
const argVal = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const outDir = resolve(argVal('--out', join(root, 'public/images')));
const maxBytes = Number(argVal('--max-kb', '40')) * 1024;

async function loadChromium() {
  const dir = process.env.PLAYWRIGHT_DIR;
  if (dir) {
    const req = createRequire(join(resolve(dir), 'package.json'));
    const mod = await import(pathToFileURL(req.resolve('playwright')).href);
    return mod.chromium ?? mod.default.chromium;
  }
  const mod = await import('playwright');
  return mod.chromium ?? mod.default.chromium;
}

function fontFaces() {
  const face = (weight) => {
    const file = join(root, `public/fonts/big-shoulders-display-latin-${weight}-normal.woff2`);
    const b64 = readFileSync(file).toString('base64');
    return `@font-face{font-family:'Big Shoulders Display';font-style:normal;font-weight:${weight};src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
  };
  return face(800) + face(900);
}

/** Read the VP8/VP8L/VP8X header so the script can prove the output size. */
function webpSize(buf) {
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  if (chunk === 'VP8L') {
    const v = buf.readUInt32LE(21);
    return [(v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1];
  }
  if (chunk === 'VP8X') return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
  throw new Error(`not a WebP (${chunk})`);
}

const chromium = await loadChromium();
const browser = await chromium.launch();
const css = `${fontFaces()}html,body{margin:0;padding:0;background:#C8281A}svg{display:block}`;
mkdirSync(outDir, { recursive: true });
let failed = false;

for (const { name, width, height } of ART) {
  const svg = readFileSync(join(root, `src/assets/steps/${name}.svg`), 'utf8')
    .replace(/(<svg\b[^>]*?)\swidth="[^"]*"/, `$1 width="${width}"`)
    .replace(/(<svg\b[^>]*?)\sheight="[^"]*"/, `$1 height="${height}"`);
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${svg}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  const fontsOk = await page.evaluate(
    () => document.fonts.check("900 40px 'Big Shoulders Display'") && document.fonts.check("800 40px 'Big Shoulders Display'"),
  );
  if (!fontsOk) throw new Error('Big Shoulders Display did not load');
  const png = await page.screenshot({ clip: { x: 0, y: 0, width, height }, type: 'png' });

  // Encode in the page: lossless first, then descending lossy quality until it fits.
  const encoded = await page.evaluate(
    async ({ b64, w, h, max }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d').drawImage(img, 0, 0);
      const tries = [];
      for (const q of [1, 0.95, 0.92, 0.9, 0.85, 0.8]) {
        const url = c.toDataURL('image/webp', q);
        if (!url.startsWith('data:image/webp')) throw new Error('canvas cannot encode WebP');
        const data = url.slice(url.indexOf(',') + 1);
        const bytes = Math.floor((data.length * 3) / 4);
        tries.push({ q, bytes });
        if (bytes <= max) return { q, data, tries };
      }
      return { q: null, data: null, tries };
    },
    { b64: png.toString('base64'), w: width, h: height, max: maxBytes },
  );
  await page.close();

  if (!encoded.data) {
    console.error(`${name}: no quality fits ${maxBytes} bytes`, encoded.tries);
    failed = true;
    continue;
  }
  const buf = Buffer.from(encoded.data, 'base64');
  const [w, h] = webpSize(buf);
  if (w !== width || h !== height) throw new Error(`${name}: got ${w}x${h}, want ${width}x${height}`);
  const out = join(outDir, `${name}.webp`);
  writeFileSync(out, buf);
  console.log(`${name}.webp ${w}x${h} ${(buf.length / 1024).toFixed(1)} KB ${encoded.q === 1 ? 'lossless' : `q=${encoded.q}`} -> ${out}`);
}

await browser.close();
if (failed) process.exit(1);
