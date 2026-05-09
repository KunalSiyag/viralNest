/**
 * YouTube Extractor
 *
 * Uses YouTube's public oEmbed endpoint + known thumbnail URL patterns.
 * Very reliable — YouTube oEmbed doesn't require auth.
 */

import type { ExtractedData } from '../extractor';
import { extractTagsFromText } from '../content-engine';
import { normalizeSourceUrl } from '../url-normalizer';

const OEMBED_URL = 'https://www.youtube.com/oembed';

/**
 * Extract video ID from various YouTube URL formats
 */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export async function extractYouTube(url: string): Promise<ExtractedData> {
  const normalizedUrl = normalizeSourceUrl(url);
  const videoId = extractVideoId(normalizedUrl);
  const canonicalSource = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : normalizedUrl;

  // Determine media type
  const isShort = url.includes('/shorts/');
  const mediaType = isShort ? 'video' : 'video';

  // Get high-quality thumbnail
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : undefined;

  try {
    const oembedRes = await fetch(
      `${OEMBED_URL}?url=${encodeURIComponent(canonicalSource)}&format=json`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (oembedRes.ok) {
      const data = await oembedRes.json();

      const caption = data.title || '';
      const author = data.author_name || '';
      const tags = extractTagsFromText(`${caption} ${author}`);

      return {
        platform: 'youtube',
        source_url: canonicalSource,
        media_url: undefined,
        thumbnail_url: thumbnailUrl || data.thumbnail_url,
        caption: caption || 'YouTube Video',
        tags,
        media_type: mediaType,
        preview_mode: 'embed',
        download_available: false,
      };
    }
  } catch (e) {
    console.warn('YouTube oEmbed failed:', e);
  }

  // Fallback with video ID
  return {
    platform: 'youtube',
    source_url: canonicalSource,
    media_url: undefined,
    thumbnail_url: thumbnailUrl,
    caption: 'YouTube Video',
    tags: ['youtube'],
    media_type: mediaType,
    preview_mode: 'embed',
    download_available: false,
  };
}
