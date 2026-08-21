import fs from 'node:fs';
import path from 'node:path';

export const HOST = 'pintdownload.app';
export const SITE_TITLE = 'PintDownload — Free Pinterest Downloader';
export const SITE_URL = `https://${HOST}`;
export const RSS_URL = `${SITE_URL}/rss.xml`;
export const INDEXNOW_KEY = '4a8f9c1b2d3e4f5a6b7c8d9e0f1a2b3c';

const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
];

const PING_SERVICES = [
  { name: 'Ping-O-Matic', url: 'http://rpc.pingomatic.com/' },
  { name: 'Blo.gs', url: 'http://ping.blo.gs/' },
];

export function collectSiteUrls() {
  const staticPages = [
    '/',
    '/pinterest-video-downloader',
    '/pinterest-pin-downloader',
    '/pinterest-image-downloader',
    '/pinterest-board-downloader',
    '/pinterest-profile-downloader',
    '/pinterest-profile-picture-downloader',
    '/pinterest-audio-downloader',
    '/pinterest-gif-downloader',
    '/pinterest-to-mp4',
    '/pinterest-carousel-downloader',
    '/pinterest-story-downloader',
    '/pinterest-4k-downloader',
    '/pinterest-seo-title-generator',
    '/download-pinterest-videos-iphone-android',
    '/pinterest-video-downloader-chrome',
    '/how-to-download-pinterest-video-in-gallery',
    '/how-to-download-pinterest-video-on-laptop',
    '/how-to-download-pinterest-videos',
    '/blog',
    '/about',
    '/contact',
  ];

  let blogSlugs = [];
  const distBlogDir = path.join(process.cwd(), 'dist', 'blog');
  if (fs.existsSync(distBlogDir)) {
    blogSlugs = fs
      .readdirSync(distBlogDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && fs.existsSync(path.join(distBlogDir, e.name, 'index.html')))
      .map((e) => `/blog/${e.name}`);
  } else {
    console.warn(`⚠️ ${distBlogDir} not found — run "npm run build" first to include blog posts.`);
  }

  return Array.from(
    new Set([...staticPages, ...blogSlugs].map((p) => `${SITE_URL}${p === '/' ? '/' : p}`)),
  );
}

export async function submitIndexNow(urls, label = '') {
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  let anySuccess = false;
  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });
      const ok = res.ok || res.status === 202;
      console.log(`[IndexNow] ${label || `${urls.length} URL(s)`} -> ${endpoint} : ${res.status}${ok ? ' ✅' : ''}`);
      if (!ok) console.warn(await res.text().then((t) => t.slice(0, 200)).catch(() => ''));
      anySuccess = anySuccess || ok;
    } catch (err) {
      console.warn(`⚠️ [IndexNow] ${endpoint} failed: ${err.message}`);
    }
  }
  return anySuccess;
}

function buildXmlRpcExtendedPing(title, url, rss) {
  return `<?xml version="1.0"?>
<methodCall>
  <methodName>weblogUpdates.extendedPing</methodName>
  <params>
    <param><value><string>${title}</string></value></param>
    <param><value><string>${url}</string></value></param>
    <param><value><string>${url}</string></value></param>
    <param><value><string>${rss}</string></value></param>
  </params>
</methodCall>`;
}

export async function pingAggregators({ title, url, rss }) {
  const payload = buildXmlRpcExtendedPing(title, url, rss);
  for (const service of PING_SERVICES) {
    try {
      const res = await fetch(service.url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml', 'User-Agent': 'PintDownload-PingBot/1.0' },
        body: payload,
        signal: AbortSignal.timeout(5000),
      });
      console.log(`✅ [${service.name}] Status: ${res.status}`);
    } catch (err) {
      console.warn(`⚠️ [${service.name}] Ping skipped: ${err.message}`);
    }
  }
}

export async function announceNewContent({ urls, title, rss }) {
  await submitIndexNow(urls, title || 'new content');
  if (rss && url) {
    await pingAggregators({ title: title || SITE_TITLE, url, rss });
  }
}
