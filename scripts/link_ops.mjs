import fs from 'node:fs';
import path from 'node:path';

const QUERIES = [
  'pinterest video downloader',
  'download pinterest video',
  'save pinterest video',
  'download pinterest board',
  'pinterest image download',
  'pinterest gif download',
  'pinterest video not downloading',
  'pin.it link not working',
  'download pinterest profile picture',
];

const USER_AGENT = 'pintdownload-linkops/1.0 (+https://pintdownload.app/about; contact: support@pintdownload.app)';
const DATA_DIR = path.join(process.cwd(), 'scripts', 'data');
const STATE_FILE = path.join(DATA_DIR, 'linkops_seen.json');
const CSV_FILE = path.join(DATA_DIR, 'link_opportunities.csv');
const CSV_HEADER = 'discovered_at,source,community,title,url,matched_query,score\n';

const args = process.argv.slice(2);
function argValue(flag, fallback) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
const DAYS = Number(argValue('--days', '7'));
const LIMIT_PER_QUERY = Number(argValue('--limit', '10'));
const CUTOFF_MS = Date.now() - DAYS * 24 * 60 * 60 * 1000;

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveState(state) {
  const entries = Object.entries(state)
    .sort((a, b) => (a[1] < b[1] ? -1 : 1))
    .slice(-5000);
  fs.writeFileSync(STATE_FILE, JSON.stringify(Object.fromEntries(entries), null, 2));
}

function csvEscape(value) {
  const str = String(value ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function decodeEntities(str) {
  return String(str || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function isRelevant(item) {
  const haystack = `${item.title} ${item.url}`.toLowerCase();
  return haystack.includes('pinterest') || haystack.includes('pin.it');
}

async function fetchWithBackoff(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (res.status === 429 || res.status === 403) {
    await new Promise((r) => setTimeout(r, 5000));
    const retry = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!retry.ok) throw new RateLimitError(`HTTP ${retry.status}`);
    return retry;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

class RateLimitError extends Error {}

let redditDisabled = false;

async function fetchReddit(query) {
  if (redditDisabled) return [];
  const url = `https://www.reddit.com/search.rss?q=${encodeURIComponent(query)}&sort=new&t=month`;
  const res = await fetchWithBackoff(url);
  const xml = await res.text();

  const results = [];
  for (const entry of xml.split('<entry>').slice(1)) {
    const title = decodeEntities(entry.match(/<title>(.*?)<\/title>/s)?.[1]);
    const link = entry.match(/<link[^>]*href="([^"]+)"/)?.[1];
    const updated = entry.match(/<updated>(.*?)<\/updated>/s)?.[1];
    if (!title || !link) continue;
    const community = link.match(/reddit\.com\/r\/([^/]+)/)?.[1] || 'reddit';
    results.push({
      id: link.split('?')[0],
      title,
      url: link.split('?')[0],
      community,
      publishedMs: updated ? Date.parse(updated) : NaN,
      score: '',
    });
  }
  return results;
}

async function fetchHackerNews(query) {
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${LIMIT_PER_QUERY}`;
  const res = await fetchWithBackoff(url, 'hackernews');
  const data = await res.json();

  return (data.hits || [])
    .map((hit) => ({
      id: `hn-${hit.objectID}`,
      title: hit.title || hit.story_title || '(untitled)',
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      community: 'news.ycombinator.com',
      publishedMs: Date.parse(hit.created_at),
      score: hit.points != null ? `${hit.points}pts/${hit.num_comments || 0}c` : '',
    }));
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(CSV_FILE)) fs.writeFileSync(CSV_FILE, CSV_HEADER);

  const state = loadState();
  const seenUrls = new Set(
    fs.readFileSync(CSV_FILE, 'utf-8').split('\n').slice(1).map((line) => line.split(',')[4]),
  );

  let added = 0;
  const perSourceCount = {};

  for (const query of QUERIES) {
    for (const [source, fetcher] of [
      ['reddit', fetchReddit],
      ['hackernews', fetchHackerNews],
    ]) {
      let items = [];
      try {
        items = await fetcher(query);
      } catch (err) {
        console.warn(`⚠️ ${source} "${query}" failed: ${err.message}`);
        if (err instanceof RateLimitError && source === 'reddit') {
          redditDisabled = true;
          console.warn('⚠️ Reddit rate-limited this IP — skipping remaining Reddit queries this run.');
        }
        continue;
      }

      let kept = 0;
      for (const item of items) {
        if (kept >= LIMIT_PER_QUERY) break;
        if (!isRelevant(item)) continue;
        if (Number.isFinite(item.publishedMs) && item.publishedMs < CUTOFF_MS) continue;
        if (state[item.id] || seenUrls.has(item.url)) continue;

        state[item.id] = new Date().toISOString();
        seenUrls.add(item.url);
        const row = [
          new Date().toISOString(),
          source,
          item.community,
          item.title,
          item.url,
          query,
          item.score,
        ]
          .map(csvEscape)
          .join(',');
        fs.appendFileSync(CSV_FILE, row + '\n');
        added += 1;
        kept += 1;
        perSourceCount[source] = (perSourceCount[source] || 0) + 1;
      }

      await new Promise((r) => setTimeout(r, source === 'reddit' ? 1500 : 300));
    }
  }

  saveState(state);
  console.log(`\n🔗 Link prospect scan complete: ${added} new opportunit${added === 1 ? 'y' : 'ies'} in last ${DAYS} day(s).`);
  for (const [source, count] of Object.entries(perSourceCount)) {
    console.log(`   ${source}: ${count}`);
  }
  console.log(`📄 Review and answer manually: ${CSV_FILE}`);

  if (added === 0 && Object.keys(state).length === 0) process.exitCode = 1;
}

await main();
