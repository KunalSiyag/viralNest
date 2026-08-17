import type { APIRoute } from 'astro';
import {
  isMediaContentType,
  isPinimgUrl,
  pinMediaCandidates,
} from '../../lib/pin-media';

export const prerender = false;

const DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1';

const FETCH_ATTEMPTS: Record<string, string>[] = [
  {
    'User-Agent': DESKTOP_UA,
    Referer: 'https://www.pinterest.com/',
    Accept: '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
  },
  {
    'User-Agent': IOS_UA,
    Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  },
];

function fallbackType(url: string): string {
  if (/\.mp4(\?|$)/i.test(url)) return 'video/mp4';
  if (/\.webm(\?|$)/i.test(url)) return 'video/webm';
  if (/\.gif(\?|$)/i.test(url)) return 'image/gif';
  if (/\.png(\?|$)/i.test(url)) return 'image/png';
  if (/\.webp(\?|$)/i.test(url)) return 'image/webp';
  return 'image/jpeg';
}

async function fetchMedia(url: string): Promise<Response | null> {
  for (const headers of FETCH_ATTEMPTS) {
    try {
      const res = await fetch(url, { headers, redirect: 'follow' });
      if (!res.ok || !res.body) continue;
      const contentType = res.headers.get('content-type');
      if (!isMediaContentType(contentType)) {
        // Do not proxy HTML/XML error pages as "downloads".
        continue;
      }
      return res;
    } catch {
      continue;
    }
  }
  return null;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const reqUrl = new URL(request.url);
    const mediaUrl = reqUrl.searchParams.get('url');
    const customFilename = reqUrl.searchParams.get('filename') || 'pinterest_download.mp4';

    if (!mediaUrl) {
      return new Response('Missing media URL', { status: 400 });
    }

    if (!isPinimgUrl(mediaUrl)) {
      return new Response('Invalid media URL host', { status: 400 });
    }

    let fetchRes: Response | null = null;
    let usedUrl = mediaUrl;
    for (const candidate of pinMediaCandidates(mediaUrl)) {
      fetchRes = await fetchMedia(candidate);
      if (fetchRes) {
        usedUrl = candidate;
        break;
      }
    }

    if (!fetchRes?.body) {
      console.warn(`Pinterest CDN returned no media for ${mediaUrl}`);
      return new Response('Failed to retrieve media from Pinterest servers', { status: 400 });
    }

    const contentType = fetchRes.headers.get('content-type') || fallbackType(usedUrl);

    return new Response(fetchRes.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(customFilename)}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Download Proxy Error:', error);
    return new Response('An error occurred during file download proxying.', { status: 500 });
  }
};
