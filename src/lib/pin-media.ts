/**
 * Pinterest CDN (Akamai/CloudFront) 403s unauthenticated /originals/ images
 * and /videos/.../expMp4/ streams. Public sized variants still work:
 *   images: 1200x > 736x > 564x
 *   videos: /720p/*.mp4 and /1080p/*.mp4 (not expMp4/*_720w.mp4)
 *
 * Video path prefixes rotate (mc/, iht/, …). Treat any non-quality folder
 * under /videos/ as a prefix so expMp4→720p rewrites keep working.
 */

const PINIMG_HOST = /^https?:\/\/[a-z0-9.-]*\.pinimg\.com\//i;

/** Optional folder before the quality dir: /videos/mc/, /videos/iht/, or /videos/. */
const VIDEO_PREFIX =
  /^(https?:\/\/[^/?#]+\/videos\/(?:(?!expMp4|hls|\d+p)[^/]+\/)?)/i;

/** Largest image size Akamai still serves without auth. */
export const PUBLIC_IMAGE_SIZE = '1200x';

export function isPinimgUrl(url: string): boolean {
  return PINIMG_HOST.test(url);
}

export function isMediaContentType(contentType: string | null | undefined): boolean {
  if (!contentType) return false;
  const type = contentType.toLowerCase().split(';')[0].trim();
  return (
    type.startsWith('image/') ||
    type.startsWith('video/') ||
    type.startsWith('audio/') ||
    type === 'application/octet-stream'
  );
}

/**
 * Rewrite a pin/avatar image URL to the largest publicly fetchable size.
 * Leaves already-public sizes (1200x/736x/…) upgraded to 1200x.
 */
export function toPublicPinImageUrl(url: string): string {
  if (!url || !isPinimgUrl(url)) return url;
  return url
    .replace(/\/originals\//gi, `/${PUBLIC_IMAGE_SIZE}/`)
    .replace(/\/orig\//gi, `/${PUBLIC_IMAGE_SIZE}/`)
    .replace(/\/(?:1920x|1360x|1080x)\//gi, `/${PUBLIC_IMAGE_SIZE}/`)
    .replace(/\/(?:236x|474x|564x|736x|750x)\//g, `/${PUBLIC_IMAGE_SIZE}/`)
    .replace(
      /\/(?:30x30_RS|50x50_RS|75x75_RS|140x140_RS|280x280_RS|600x600_RS|150x150|170x|280x280|600x600)\//g,
      `/${PUBLIC_IMAGE_SIZE}/`,
    );
}

/**
 * Convert blocked HLS / expMp4 video URLs to progressive /720p (or matching height) MP4.
 */
export function toPlayablePinVideoUrl(url: string): string {
  if (!url || !isPinimgUrl(url)) return url;

  if (/\.m3u8(\?|$)/i.test(url) && /\/hls\//i.test(url)) {
    return url.replace(/\/hls\//i, '/720p/').replace(/\.m3u8(\?|$)/i, '.mp4$1');
  }

  const prefix = url.match(VIDEO_PREFIX)?.[1];
  const exp = prefix
    ? url.slice(prefix.length).match(/^expMp4\/(.+)_(\d+)w\.mp4(\?.*)?$/i)
    : null;
  if (prefix && exp) {
    return `${prefix}${exp[2]}p/${exp[1]}.mp4${exp[3] || ''}`;
  }

  if (/\/expMp4\//i.test(url) && /_\d+w\.mp4/i.test(url)) {
    return url.replace(/\/expMp4\//i, '/720p/').replace(/_(\d+)w\.mp4/i, '.mp4');
  }

  return url;
}

/** Image + video rewrites so the download proxy is not given a known-403 URL. */
export function toDownloadablePinUrl(url: string): string {
  return toPlayablePinVideoUrl(toPublicPinImageUrl(url));
}

function hostVariants(url: string): string[] {
  if (/\/\/v1-c\.pinimg\.com\//i.test(url)) {
    return [url, url.replace(/\/\/v1-c\.pinimg\.com\//i, '//v1.pinimg.com/')];
  }
  if (/\/\/v1\.pinimg\.com\//i.test(url)) {
    return [url, url.replace(/\/\/v1\.pinimg\.com\//i, '//v1-c.pinimg.com/')];
  }
  return [url];
}

function uniquePinimg(urls: string[]): string[] {
  const out: string[] = [];
  for (const url of urls) {
    if (url && isPinimgUrl(url) && !out.includes(url)) out.push(url);
  }
  return out;
}

/**
 * Ordered fetch candidates. Working public variants come first so the
 * download proxy does not wait on a guaranteed 403.
 */
export function pinMediaCandidates(url: string): string[] {
  if (!url) return [];

  const candidates: string[] = [];
  const playable = toPlayablePinVideoUrl(url);
  const publicImg = toPublicPinImageUrl(url);

  if (playable !== url) candidates.push(playable);
  if (publicImg !== url) candidates.push(publicImg);
  candidates.push(url);

  const imageStem = url.replace(
    /\/(?:originals|orig|1920x|1360x|1080x|1200x|736x|750x|564x|474x|236x|30x30_RS|50x50_RS|75x75_RS|140x140_RS|280x280_RS|600x600_RS|150x150|170x|280x280|600x600)\//i,
    '/__SIZE__/',
  );
  if (imageStem !== url) {
    candidates.push(imageStem.replace('/__SIZE__/', '/1200x/'));
    candidates.push(imageStem.replace('/__SIZE__/', '/736x/'));
    candidates.push(imageStem.replace('/__SIZE__/', '/564x/'));
  }

  const prefix = url.match(VIDEO_PREFIX)?.[1];
  const rest = prefix ? url.slice(prefix.length) : '';
  const videoFile = rest.match(
    /^(?:expMp4|hls|720p|1080p|540p|360p)\/(.+?)(?:_\d+w)?\.(?:mp4|m3u8)(\?.*)?$/i,
  );
  if (prefix && videoFile) {
    const hash = videoFile[1];
    const query = videoFile[2] || '';
    candidates.push(`${prefix}1080p/${hash}.mp4${query}`);
    candidates.push(`${prefix}720p/${hash}.mp4${query}`);
    candidates.push(`${prefix}540p/${hash}.mp4${query}`);
  }

  return uniquePinimg(candidates.flatMap(hostVariants));
}
