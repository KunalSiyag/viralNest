import { posts } from '../src/data/blog.ts';

const HOST = 'pintdownload.app';
const KEY = '4a8f9c1b2d3e4f5a6b7c8d9e0f1a2b3c';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const staticPages = [
  `https://${HOST}/`,
  `https://${HOST}/pinterest-video-downloader`,
  `https://${HOST}/pinterest-board-downloader`,
  `https://${HOST}/pinterest-profile-downloader`,
  `https://${HOST}/pinterest-audio-downloader`,
  `https://${HOST}/pinterest-4k-downloader`,
  `https://${HOST}/pinterest-story-downloader`,
  `https://${HOST}/pinterest-image-downloader`,
  `https://${HOST}/pinterest-gif-downloader`,
  `https://${HOST}/pinterest-pin-downloader`,
  `https://${HOST}/pinterest-to-mp4`,
  `https://${HOST}/pinterest-seo-title-generator`,
  `https://${HOST}/download-pinterest-videos-iphone-android`,
  `https://${HOST}/pinterest-carousel-downloader`,
  `https://${HOST}/pinterest-video-downloader-chrome`,
  `https://${HOST}/how-to-download-pinterest-video-in-gallery`,
  `https://${HOST}/how-to-download-pinterest-video-on-laptop`,
  `https://${HOST}/pinterest-profile-picture-downloader`,
  `https://${HOST}/how-to-download-pinterest-videos`,
  `https://${HOST}/about`,
  `https://${HOST}/contact`,
  `https://${HOST}/privacy-policy`,
  `https://${HOST}/terms-of-service`,
  `https://${HOST}/blog`,
];

const blogPages = posts.map((p) => `https://${HOST}/blog/${p.slug}`);

const urlList = Array.from(new Set([...staticPages, ...blogPages]));

console.log(`Preparing IndexNow submission for ${urlList.length} URLs to Bing...`);

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList,
};

async function submitIndexNow() {
  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });

      console.log(`[IndexNow] ${endpoint} -> Status ${res.status}`);
      if (res.ok || res.status === 202) {
        console.log(`SUCCESS: Submitted ${urlList.length} URLs to ${endpoint}`);
      } else {
        const text = await res.text();
        console.warn(`Response body: ${text}`);
      }
    } catch (e) {
      console.error(`Failed to submit to ${endpoint}:`, e.message);
    }
  }
}

submitIndexNow();
