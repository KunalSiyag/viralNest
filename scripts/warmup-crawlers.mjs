import fetch from 'node-fetch';
import { posts } from '../src/data/blog.ts';

const HOST = 'pintdownload.app';

const urls = [
  `https://${HOST}/`,
  `https://${HOST}/pinterest-video-downloader`,
  `https://${HOST}/pinterest-pin-downloader`,
  `https://${HOST}/pinterest-board-downloader`,
  `https://${HOST}/pinterest-profile-downloader`,
  `https://${HOST}/pinterest-image-downloader`,
  `https://${HOST}/pinterest-gif-downloader`,
  `https://${HOST}/pinterest-story-downloader`,
  `https://${HOST}/pinterest-to-mp4`,
  `https://${HOST}/pinterest-4k-downloader`,
  `https://${HOST}/pinterest-audio-downloader`,
  `https://${HOST}/download-pinterest-videos-iphone-android`,
  `https://${HOST}/pinterest-carousel-downloader`,
  `https://${HOST}/pinterest-video-downloader-chrome`,
  `https://${HOST}/how-to-download-pinterest-video-in-gallery`,
  `https://${HOST}/how-to-download-pinterest-video-on-laptop`,
  `https://${HOST}/pinterest-profile-picture-downloader`,
  ...posts.map((p) => `https://${HOST}/blog/${p.slug}`),
];

const USER_AGENTS = [
  { name: 'Twitterbot', ua: 'Twitterbot/1.0' },
  { name: 'FacebookExternalHit', ua: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' },
  { name: 'TelegramBot', ua: 'TelegramBot (like TwitterBot)' },
  { name: 'WhatsApp', ua: 'WhatsApp/2.21.12.21 A' },
  { name: 'Googlebot', ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
];

async function warmupSocialCrawlers() {
  console.log(`🚀 Starting Automated Crawler Cache Warmup for ${urls.length} URLs across 5 Crawler User-Agents...`);

  for (const url of urls) {
    for (const crawler of USER_AGENTS) {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'User-Agent': crawler.ua },
        });
        console.log(`[${crawler.name}] -> ${url} (${res.status})`);
      } catch (err) {
        console.warn(`⚠️ [${crawler.name}] Failed to reach ${url}: ${err.message}`);
      }
    }
  }

  console.log(`✅ Crawler Cache Warmup Completed for ${urls.length} URLs!`);
}

warmupSocialCrawlers();
