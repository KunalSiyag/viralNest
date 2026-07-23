import type { APIRoute } from 'astro';

export const prerender = false;

const INDEXNOW_KEY = '43a9f021b38e4a99ab60a4f5c9e2b174';
const HOST_DOMAIN = 'pintdownload.app';

const URL_LIST = [
  `https://${HOST_DOMAIN}/`,
  `https://${HOST_DOMAIN}/pinterest-pin-downloader`,
  `https://${HOST_DOMAIN}/pinterest-video-downloader`,
  `https://${HOST_DOMAIN}/pinterest-board-downloader`,
  `https://${HOST_DOMAIN}/pinterest-profile-downloader`,
  `https://${HOST_DOMAIN}/pinterest-image-downloader`,
  `https://${HOST_DOMAIN}/pinterest-gif-downloader`,
  `https://${HOST_DOMAIN}/pinterest-story-downloader`,
  `https://${HOST_DOMAIN}/pinterest-audio-downloader`,
  `https://${HOST_DOMAIN}/pinterest-to-mp4`,
  `https://${HOST_DOMAIN}/pinterest-4k-downloader`,
  `https://${HOST_DOMAIN}/how-to-download-pinterest-videos`,
  `https://${HOST_DOMAIN}/blog`,
  `https://${HOST_DOMAIN}/rss.xml`,
  `https://${HOST_DOMAIN}/llms.txt`,
];

export const POST: APIRoute = async () => {
  try {
    const payload = {
      host: HOST_DOMAIN,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST_DOMAIN}/indexnow-43a9f021b38e4a99ab60a4f5c9e2b174.txt`,
      urlList: URL_LIST,
    };

    // Ping Bing IndexNow Endpoint
    const bingRes = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    }).catch(err => ({ ok: false, status: 500, statusText: String(err) }));

    // Ping Yandex IndexNow Endpoint
    const yandexRes = await fetch('https://yandex.com/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    }).catch(err => ({ ok: false, status: 500, statusText: String(err) }));

    return new Response(JSON.stringify({
      success: true,
      message: 'IndexNow submission sent to Bing & Yandex',
      urlsSubmitted: URL_LIST.length,
      bingStatus: bingRes.status,
      yandexStatus: yandexRes.status,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'IndexNow ping failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
