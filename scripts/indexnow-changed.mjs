/**
 * IndexNow for what a deploy actually changed — never the whole site on a timer.
 * Bing asks for changed URLs only; resubmitting unchanged URLs wastes the crawl
 * budget it gives a low-authority site.
 *
 *   node scripts/indexnow-changed.mjs diff <out.txt>   before `wrangler deploy`
 *   node scripts/indexnow-changed.mjs submit <in.txt>  after the live check
 *
 * `diff` compares the built dist/ against production: URLs new to the sitemap,
 * URLs dropped from it (now noindex, redirected or gone) and URLs whose content
 * fingerprint differs. The fingerprint covers title, meta description, robots,
 * canonical, hreflang, JSON-LD and visible text, so asset-hash churn does not count.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const HOST = 'pintdownload.app';
const SITE = `https://${HOST}`;
const KEY = '4a8f9c1b2d3e4f5a6b7c8d9e0f1a2b3c';
const DIST = path.join(process.cwd(), 'dist');
const UA = 'Mozilla/5.0 (compatible; pintdownload-deploy/1.0; +https://pintdownload.app/about)';

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

function fingerprint(html) {
  const pick = (re) => [...html.matchAll(re)].map((m) => m[1]).join('\n');
  const head = [
    pick(/<title>([^<]*)<\/title>/gi),
    pick(/<meta\s+name="(?:description|robots)"\s+content="([^"]*)"/gi),
    pick(/<link\s+rel="(?:canonical|alternate)"[^>]*href="([^"]*)"/gi),
    pick(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
  ].join('\n');
  const text = html
    .replace(/<(script|style|svg|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return createHash('sha256').update(`${head}\n${text}`).digest('hex');
}

function distHtml(url) {
  const p = new URL(url).pathname.replace(/\/+$/, '');
  const candidates = p ? [path.join(DIST, p, 'index.html'), path.join(DIST, `${p}.html`)] : [path.join(DIST, 'index.html')];
  const file = candidates.find((f) => fs.existsSync(f));
  return file ? fs.readFileSync(file, 'utf8') : null;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'manual', signal: AbortSignal.timeout(15000) });
  return res.status === 200 ? res.text() : null;
}

async function pool(items, size, fn) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) {
        const item = items[i++];
        out.push(await fn(item));
      }
    }),
  );
  return out;
}

async function diff(outFile) {
  const builtXml = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
  const liveXml = await fetchText(`${SITE}/sitemap.xml`).catch(() => null);
  if (!liveXml) {
    // Without the live sitemap there is no baseline: submit nothing rather than everything.
    console.warn('⚠️ Could not read the live sitemap; no IndexNow submission this deploy.');
    fs.writeFileSync(outFile, '');
    return;
  }
  const built = locs(builtXml);
  const live = new Set(locs(liveXml));
  const builtSet = new Set(built);

  const added = built.filter((u) => !live.has(u));
  const removed = [...live].filter((u) => !builtSet.has(u));
  const kept = built.filter((u) => live.has(u));

  const changed = (
    await pool(kept, 8, async (url) => {
      const local = distHtml(url);
      if (!local) return url;
      const remote = await fetchText(url).catch(() => null);
      return remote && fingerprint(remote) === fingerprint(local) ? null : url;
    })
  ).filter(Boolean);

  const urls = [...new Set([...added, ...removed, ...changed])].sort();
  console.log(`IndexNow diff: ${added.length} added, ${removed.length} removed, ${changed.length} changed, ${kept.length - changed.length} unchanged.`);
  for (const u of urls) console.log(`  ${u}`);
  fs.writeFileSync(outFile, urls.join('\n') + (urls.length ? '\n' : ''));
}

async function submit(inFile) {
  const urls = fs.existsSync(inFile) ? fs.readFileSync(inFile, 'utf8').split('\n').filter(Boolean) : [];
  if (urls.length === 0) {
    console.log('IndexNow: nothing changed, nothing submitted.');
    return;
  }
  // api.indexnow.org shares each submission with Bing, Yandex, Naver, Seznam and the rest.
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls.slice(0, 10000) }),
  });
  console.log(`IndexNow: ${urls.length} URL(s) -> ${res.status}`);
  if (!res.ok) {
    console.warn((await res.text().catch(() => '')).slice(0, 300));
    process.exitCode = 1;
  }
}

const [cmd, file] = process.argv.slice(2);
if (cmd === 'diff' && file) await diff(file);
else if (cmd === 'submit' && file) await submit(file);
else {
  console.error('Usage: node scripts/indexnow-changed.mjs diff|submit <file>');
  process.exitCode = 2;
}
