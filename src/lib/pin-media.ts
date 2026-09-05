/**
 * Pinterest CDN (Akamai/CloudFront) sometimes 403s unauthenticated
 * /originals/ images and certain video paths.
 *
 *   Images: 1200x > 736x > 564x
 *   GIFs: keep .gif (rewriting originals → 1200x often returns a still JPG)
 *   Videos: expMp4 and progressive (/720p, /1080p) availability rotates
 *           per CDN prefix (mc/, iht/, …). Candidates tries both.
 */

const PINIMG_HOST = /^https?:\/\/[a-z0-9.-]*\.pinimg\.com\//i;

/** Optional folder before the quality dir: /videos/mc/, /videos/iht/, or /videos/. */
const VIDEO_PREFIX =
  /^(https?:\/\/[^/?#]+\/videos\/(?:(?!expMp4|hls|\d+p)[^/]+\/)?)/i;

/**
 * Image CDN path: /{size}/{aa}/{bb}/{cc}/{hash}[.{ext}]
 * Does not match /videos/… streams.
 */
const PINIMG_IMAGE_HASH =
  /^https?:\/\/([^/?#]+)\/([^/?#]+)\/([0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]+)(\.[a-z0-9]+)?/i;

/** Largest image size Akamai still serves without auth. */
export const PUBLIC_IMAGE_SIZE = '1200x';

export function isPinimgUrl(url: string): boolean {
  return PINIMG_HOST.test(url);
}

export function isGifUrl(url: string): boolean {
  return /\.gif(?:[?#]|$)/i.test(url);
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

/** Filename extension from a CDN URL, ignoring query/hash. */
export function mediaFileExtension(url: string, fallback = 'jpg'): string {
  if (!url) return fallback;
  const clean = url.split(/[?#]/)[0];
  const m = clean.match(/\.([a-z0-9]{2,5})$/i);
  if (!m) return fallback;
  const ext = m[1].toLowerCase();
  if (ext === 'jpeg') return 'jpg';
  return ext;
}

/**
 * Animated GIF candidates. Pinterest often 403s /originals/*.gif from
 * unauthenticated clients, but 1200x/736x .gif still loops.
 * Passing a .jpg/.png pin image URL still yields .gif guesses from the hash.
 */
export function gifCandidateUrls(url: string): string[] {
  if (!url || !isPinimgUrl(url) || /\/videos\//i.test(url)) return [];
  const m = url.match(PINIMG_IMAGE_HASH);
  if (!m) return isGifUrl(url) ? [url] : [];
  const host = m[1];
  const hash = m[3];
  const sizes = ['originals', '1200x', '736x', '564x'];
  const out: string[] = [];
  if (isGifUrl(url)) out.push(url);
  for (const size of sizes) {
    out.push(`https://${host}/${size}/${hash}.gif`);
  }
  return uniquePinimg(out);
}

/**
 * Rewrite a pin/avatar image URL to the largest publicly fetchable size.
 * Leaves already-public sizes (1200x/736x/…) upgraded to 1200x.
 */
export function toPublicPinImageUrl(url: string): string {
  if (!url || !isPinimgUrl(url)) return url;
  // Rewriting a GIF to 1200x usually returns a still JPEG of frame 1.
  if (isGifUrl(url)) return url;
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
 * Convert blocked HLS m3u8 playlist URLs to progressive /720p MP4.
 * expMp4 URLs are left as-is — Pinterest CDN rotates between expMp4 and
 * progressive being accessible; pinMediaCandidates tries both variants.
 */
export function toPlayablePinVideoUrl(url: string): string {
  if (!url || !isPinimgUrl(url)) return url;

  if (/\.m3u8(\?|$)/i.test(url) && /\/hls\//i.test(url)) {
    return url.replace(/\/hls\//i, '/720p/').replace(/\.m3u8(\?|$)/i, '.mp4$1');
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

  // Animated GIFs first so the proxy never waits on a flattened 1200x JPG.
  if (isGifUrl(url)) {
    candidates.push(...gifCandidateUrls(url));
  }

  if (playable !== url) candidates.push(playable);
  if (publicImg !== url) candidates.push(publicImg);
  candidates.push(url);

  const imageStem = url.replace(
    /\/(?:originals|orig|1920x|1360x|1080x|1200x|736x|750x|564x|474x|236x|30x30_RS|50x50_RS|75x75_RS|140x140_RS|280x280_RS|600x600_RS|150x150|170x|280x280|600x600)\//i,
    '/__SIZE__/',
  );
  if (imageStem !== url && !isGifUrl(url)) {
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
    // 720p first — most likely to be public and much smaller than 1080p,
    // so the download starts streaming sooner. 1080p is next if it exists.
    candidates.push(`${prefix}720p/${hash}.mp4${query}`);
    candidates.push(`${prefix}1080p/${hash}.mp4${query}`);
    candidates.push(`${prefix}540p/${hash}.mp4${query}`);
    candidates.push(`${prefix}expMp4/${hash}_720w.mp4${query}`);
  }

  // Primary hosts first so a v1 + v1-c pair of the same 403 path is not
  // the first probe batch (that delayed first-byte by ~3s).
  const primary = uniquePinimg(candidates);
  const extras = primary.flatMap(hostVariants).filter((u) => !primary.includes(u));
  return [...primary, ...extras];
}
