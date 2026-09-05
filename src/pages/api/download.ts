import type { APIRoute } from 'astro';
import {
  isGifUrl,
  isMediaContentType,
  isPinimgUrl,
  pinMediaCandidates,
} from '../../lib/pin-media';

export const prerender = false;

const DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const FETCH_ATTEMPTS: Record<string, string>[] = [
  {
    'User-Agent': DESKTOP_UA,
    Referer: 'https://www.pinterest.com/',
    Origin: 'https://www.pinterest.com',
    Accept: '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'identity',
    'Cache-Control': 'no-cache',
  },
  {
    'User-Agent': DESKTOP_UA,
    Accept: '*/*',
    'Accept-Encoding': 'identity',
  },
];

const CANDIDATE_TIMEOUT_MS = 6000;
const PROBE_BATCH = 2;

function fallbackType(url: string): string {
  if (/\.mp4(\?|$)/i.test(url)) return 'video/mp4';
  if (/\.webm(\?|$)/i.test(url)) return 'video/webm';
  if (/\.gif(\?|$)/i.test(url)) return 'image/gif';
  if (/\.png(\?|$)/i.test(url)) return 'image/png';
  if (/\.webp(\?|$)/i.test(url)) return 'image/webp';
  return 'image/jpeg';
}

function safeFilename(name: string): string {
  const cleaned = name.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_').trim();
  return cleaned.slice(0, 120) || 'pinterest_download';
}

async function fetchMedia(
  url: string,
  signal: AbortSignal,
  range?: string | null,
): Promise<Response | null> {
  for (const base of FETCH_ATTEMPTS) {
    if (signal.aborted) return null;
    try {
      const headers: Record<string, string> = { ...base };
      if (range) headers.Range = range;
      const res = await fetch(url, { headers, redirect: 'follow', signal });
      // 200 full body or 206 partial — both are usable media.
      if (!(res.ok || res.status === 206) || !res.body) {
        try {
          await res.body?.cancel();
        } catch {
          /* ignore */
        }
        continue;
      }
      const contentType = res.headers.get('content-type');
      const looksLikeFile = /\.(mp4|webm|gif|jpe?g|png|webp)(\?|$)/i.test(url);
      if (!isMediaContentType(contentType) && !(looksLikeFile && !contentType)) {
        try {
          await res.body.cancel();
        } catch {
          /* ignore */
        }
        continue;
      }
      return res;
    } catch {
      continue;
    }
  }
  return null;
}

async function fetchFirstWorking(
  urls: string[],
  range?: string | null,
): Promise<{ res: Response; url: string } | null> {
  for (let i = 0; i < urls.length; i += PROBE_BATCH) {
    const batch = urls.slice(i, i + PROBE_BATCH);
    const controllers = batch.map(() => new AbortController());
    const timers = controllers.map((c) =>
      setTimeout(() => c.abort(), CANDIDATE_TIMEOUT_MS),
    );
    try {
      const winner = await Promise.any(
        batch.map(async (url, idx) => {
          const res = await fetchMedia(url, controllers[idx].signal, range);
          if (!res) throw new Error('no media');
          return { res, url, idx };
        }),
      );
      controllers.forEach((c, idx) => {
        if (idx !== winner.idx) c.abort();
      });
      return { res: winner.res, url: winner.url };
    } catch {
      // entire batch failed — try the next pair
    } finally {
      timers.forEach(clearTimeout);
    }
  }
  return null;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const reqUrl = new URL(request.url);
    const mediaUrl = reqUrl.searchParams.get('url');
    const customFilename = safeFilename(
      reqUrl.searchParams.get('filename') || 'pinterest_download.mp4',
    );
    const inline = reqUrl.searchParams.get('inline') === '1';
    const range = request.headers.get('Range');

    if (!mediaUrl) {
      return new Response('Missing media URL', { status: 400 });
    }

    if (!isPinimgUrl(mediaUrl)) {
      return new Response('Invalid media URL host', { status: 400 });
    }

    const found = await fetchFirstWorking(pinMediaCandidates(mediaUrl), range);
    if (!found?.res.body) {
      console.warn(`Pinterest CDN returned no media for ${mediaUrl}`);
      return new Response('Failed to retrieve media from Pinterest servers', { status: 400 });
    }

    const { res: fetchRes, url: usedUrl } = found;
    const contentType = fetchRes.headers.get('content-type') || fallbackType(usedUrl);
    const disposition = inline
      ? `inline; filename="${customFilename}"`
      : `attachment; filename="${customFilename}"`;

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', disposition);
    headers.set('Cache-Control', 'no-store');
    headers.set('Accept-Ranges', fetchRes.headers.get('accept-ranges') || 'bytes');
    const contentLength = fetchRes.headers.get('content-length');
    if (contentLength) headers.set('Content-Length', contentLength);
    const contentRange = fetchRes.headers.get('content-range');
    if (contentRange) headers.set('Content-Range', contentRange);
    if (isGifUrl(usedUrl) || contentType.includes('gif')) {
      headers.set('X-Content-Type-Options', 'nosniff');
    }

    return new Response(fetchRes.body, {
      status: fetchRes.status === 206 ? 206 : 200,
      headers,
    });
  } catch (error: any) {
    console.error('Download Proxy Error:', error);
    return new Response('An error occurred during file download proxying.', { status: 500 });
  }
};
