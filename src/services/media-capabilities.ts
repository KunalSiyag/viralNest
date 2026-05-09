export type PreviewMode = 'embed' | 'direct_video' | 'image' | 'external';

export interface PlatformMetrics {
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  reposts?: number | null;
  views?: number | null;
  author_name?: string | null;
  author_handle?: string | null;
}

const DIRECT_MEDIA_EXTENSIONS = new Set([
  '.mp4',
  '.webm',
  '.mov',
  '.m4v',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
]);

const DIRECT_MEDIA_HOST_HINTS = [
  'cdninstagram.com',
  'fbcdn.net',
  'scontent',
  'ytimg.com',
  'pinimg.com',
];

function hasDirectMediaExtension(pathname: string): boolean {
  const lowerPath = pathname.toLowerCase();
  for (const ext of DIRECT_MEDIA_EXTENSIONS) {
    if (lowerPath.endsWith(ext)) return true;
  }
  return false;
}

export function isLikelyDirectMediaUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') return false;

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();

  if (path.includes('/embed/')) return false;
  if (host.includes('youtube.com') || host.includes('youtu.be')) return false;
  if (host.includes('instagram.com') && !host.includes('cdninstagram.com')) return false;
  if (host.includes('pinterest.com') && path.includes('/pin/')) return false;
  if (host.includes('tiktok.com') && !hasDirectMediaExtension(path)) return false;

  if (hasDirectMediaExtension(path)) return true;
  return DIRECT_MEDIA_HOST_HINTS.some(hint => host.includes(hint));
}

export function sanitizeMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  return isLikelyDirectMediaUrl(url) ? url : undefined;
}

export function derivePreviewMode(
  platform: string,
  mediaUrl: string | null | undefined,
  mediaType: string
): PreviewMode {
  if (mediaUrl && isLikelyDirectMediaUrl(mediaUrl)) {
    return mediaType === 'image' ? 'image' : 'direct_video';
  }

  if (platform === 'youtube' || platform === 'instagram' || platform === 'tiktok') {
    return 'embed';
  }

  if (mediaType === 'image') return 'image';

  return 'external';
}

export function isDownloadAvailable(mediaUrl: string | null | undefined): boolean {
  return !!(mediaUrl && isLikelyDirectMediaUrl(mediaUrl));
}

export function isMediaContentType(contentType: string): boolean {
  const normalized = contentType.toLowerCase();
  return normalized.startsWith('video/') || normalized.startsWith('image/');
}

export function extensionFromContentType(contentType: string): string {
  const normalized = contentType.toLowerCase();

  if (normalized.includes('image/jpeg')) return '.jpg';
  if (normalized.includes('image/png')) return '.png';
  if (normalized.includes('image/webp')) return '.webp';
  if (normalized.includes('image/gif')) return '.gif';
  if (normalized.includes('video/webm')) return '.webm';
  if (normalized.includes('video/mp4')) return '.mp4';
  if (normalized.includes('video/quicktime')) return '.mov';

  return '.bin';
}

export function parseEngagementCount(input: string): number | null {
  const normalized = input.toLowerCase().replace(/,/g, '').trim();
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*([km])?$/);
  if (!match) return null;

  const base = Number.parseFloat(match[1]);
  if (Number.isNaN(base)) return null;

  const unit = match[2];
  if (unit === 'k') return Math.round(base * 1_000);
  if (unit === 'm') return Math.round(base * 1_000_000);
  return Math.round(base);
}

