import type { PlatformId } from '@/lib/constants';

const TRACKING_PARAM_PREFIXES = ['utm_'];
const TRACKING_PARAMS = new Set([
  'fbclid',
  'gclid',
  'igshid',
  'mc_cid',
  'mc_eid',
  'si',
  'feature',
]);

function isTrackingParam(param: string): boolean {
  if (TRACKING_PARAMS.has(param)) return true;
  return TRACKING_PARAM_PREFIXES.some(prefix => param.startsWith(prefix));
}

function platformFromHostname(hostname: string): PlatformId | 'unknown' {
  const host = hostname.toLowerCase();

  if (host.includes('instagram.com') || host.includes('instagr.am')) return 'instagram';
  if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
  if (host.includes('pinterest.com') || host.includes('pin.it')) return 'pinterest';
  if (host.includes('tiktok.com')) return 'tiktok';
  if (host.includes('twitter.com') || host.includes('x.com')) return 'twitter';

  return 'unknown';
}

function normalizeYouTube(url: URL): string {
  const host = url.hostname.toLowerCase();

  if (host.includes('youtu.be')) {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id ? `https://youtu.be/${id}` : 'https://youtu.be';
  }

  const pathname = url.pathname;
  const segments = pathname.split('/').filter(Boolean);

  if (pathname === '/watch') {
    const videoId = url.searchParams.get('v');
    if (videoId) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return 'https://www.youtube.com/watch';
  }

  if (segments[0] === 'shorts' && segments[1]) {
    return `https://www.youtube.com/shorts/${segments[1]}`;
  }

  if (segments[0] === 'embed' && segments[1]) {
    return `https://www.youtube.com/embed/${segments[1]}`;
  }

  if (segments[0] === 'v' && segments[1]) {
    return `https://www.youtube.com/v/${segments[1]}`;
  }

  const cleaned = new URL(url.toString());
  cleaned.hash = '';
  for (const key of Array.from(cleaned.searchParams.keys())) {
    if (isTrackingParam(key)) {
      cleaned.searchParams.delete(key);
    }
  }
  return cleaned.toString();
}

function normalizeInstagram(url: URL): string {
  const clean = new URL(url.toString());
  clean.hash = '';
  clean.search = '';
  return clean.toString();
}

function normalizePinterest(url: URL): string {
  const clean = new URL(url.toString());
  clean.hash = '';
  clean.search = '';
  return clean.toString();
}

function normalizeTikTok(url: URL): string {
  const clean = new URL(url.toString());
  clean.hash = '';
  clean.search = '';
  return clean.toString();
}

function normalizeGeneric(url: URL): string {
  const clean = new URL(url.toString());
  clean.hash = '';
  for (const key of Array.from(clean.searchParams.keys())) {
    if (isTrackingParam(key)) {
      clean.searchParams.delete(key);
    }
  }
  return clean.toString();
}

export function normalizeSourceUrl(inputUrl: string): string {
  let parsed: URL;
  try {
    parsed = new URL(inputUrl);
  } catch {
    return inputUrl;
  }

  const platform = platformFromHostname(parsed.hostname);

  switch (platform) {
    case 'youtube':
      return normalizeYouTube(parsed);
    case 'instagram':
      return normalizeInstagram(parsed);
    case 'pinterest':
      return normalizePinterest(parsed);
    case 'tiktok':
      return normalizeTikTok(parsed);
    default:
      return normalizeGeneric(parsed);
  }
}

