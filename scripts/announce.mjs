import { collectSiteUrls, submitIndexNow, pingAggregators, SITE_TITLE, SITE_URL, RSS_URL } from './lib/announce.mjs';

const urls = collectSiteUrls();
console.log(`📣 Announcing ${urls.length} PintDownload URLs (IndexNow + RSS pings)...`);

await submitIndexNow(urls, 'full site');
await pingAggregators({ title: SITE_TITLE, url: SITE_URL, rss: RSS_URL });

console.log('🎉 Announcement complete.');
