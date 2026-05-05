/**
 * Instagram Extractor
 *
 * Uses a headless browser to load the Instagram page, dismiss the login
 * popup, and intercept network requests to capture the actual media URL.
 *
 * Extraction chain:
 * 1. Headless browser — load page, capture video/image from network traffic
 * 2. oEmbed fallback (occasionally works)
 * 3. Third-party metadata services (Microlink/jsonlink)
 * 4. Embed URL fallback for client-side rendering
 */

import type { ExtractedData } from '../extractor';
import { extractTagsFromText } from '../content-engine';
import { extractWithBrowser } from './browser-extractor';
import { fetchMetadataWithFallback } from './metadata-services';

const OEMBED_URL = 'https://api.instagram.com/oembed';

/**
 * Extract the shortcode from an Instagram URL
 */
function extractShortcode(url: string): string | null {
  const match = url.match(/\/(?:p|reel|tv|reels)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Determine media type from URL
 */
function detectMediaType(url: string): 'video' | 'image' {
  if (url.includes('/reel') || url.includes('/tv/') || url.includes('/reels/')) {
    return 'video';
  }
  return 'image';
}

export async function extractInstagram(url: string): Promise<ExtractedData> {
  const cleanUrl = url.split('?')[0];
  const shortcode = extractShortcode(cleanUrl);
  const mediaType = detectMediaType(cleanUrl);

  // --- Attempt 1: Headless browser extraction ---
  // Load the page in Chrome, dismiss login popup, capture media from network
  try {
    console.log('[Instagram] Attempting browser-based extraction...');
    const result = await extractWithBrowser(cleanUrl);

    if (result.mediaUrl || result.thumbnailUrl) {
      const caption = result.caption || `Instagram ${mediaType === 'video' ? 'Reel' : 'Post'}`;
      const tags = extractTagsFromText(caption);

      console.log('[Instagram] Browser extraction succeeded:', {
        hasVideo: !!result.mediaUrl,
        hasThumbnail: !!result.thumbnailUrl,
        captionLength: caption.length,
      });

      return {
        platform: 'instagram',
        source_url: cleanUrl,
        media_url: result.mediaUrl || undefined,
        thumbnail_url: result.thumbnailUrl || undefined,
        caption,
        tags: tags.length > 0 ? tags : ['instagram'],
        media_type: result.mediaUrl ? 'video' : mediaType,
      };
    }
  } catch (e) {
    console.warn('[Instagram] Browser extraction failed:', e instanceof Error ? e.message : e);
  }

  // --- Attempt 2: oEmbed ---
  try {
    const oembedRes = await fetch(`${OEMBED_URL}?url=${encodeURIComponent(cleanUrl)}&omitscript=true`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; viralNest/1.0)' },
      signal: AbortSignal.timeout(8000),
    });

    if (oembedRes.ok) {
      const contentType = oembedRes.headers.get('content-type') || '';
      if (contentType.includes('json')) {
        const data = await oembedRes.json();
        const caption = data.title || '';
        const tags = extractTagsFromText(caption);

        return {
          platform: 'instagram',
          source_url: cleanUrl,
          thumbnail_url: data.thumbnail_url || undefined,
          caption: caption || 'Instagram Post',
          tags: tags.length > 0 ? tags : ['instagram'],
          media_type: mediaType,
        };
      }
    }
  } catch (e) {
    console.warn('[Instagram] oEmbed failed:', e instanceof Error ? e.message : e);
  }

  // --- Attempt 3: Third-party metadata services ---
  try {
    const metadata = await fetchMetadataWithFallback(cleanUrl);

    if (metadata) {
      const title = metadata.title || '';
      const description = metadata.description || '';
      const hasRealTitle = title && title.toLowerCase() !== 'instagram' && title.length > 15;
      const hasRealImage = metadata.image && !metadata.image.includes('rsrc.php');

      if (hasRealTitle || hasRealImage) {
        const caption = hasRealTitle ? title : (description || '');
        const tags = extractTagsFromText(`${caption} ${description}`);

        return {
          platform: 'instagram',
          source_url: cleanUrl,
          media_url: metadata.video || undefined,
          thumbnail_url: hasRealImage ? metadata.image : undefined,
          caption: caption || 'Instagram Post',
          tags: tags.length > 0 ? tags : ['instagram'],
          media_type: metadata.video ? 'video' : mediaType,
        };
      }
    }
  } catch (e) {
    console.warn('[Instagram] Metadata fallback failed:', e instanceof Error ? e.message : e);
  }

  // --- Attempt 4: Embed URL fallback ---
  const embedUrl = shortcode
    ? `https://www.instagram.com/p/${shortcode}/embed/`
    : undefined;

  return {
    platform: 'instagram',
    source_url: cleanUrl,
    media_url: embedUrl,
    caption: `Instagram ${mediaType === 'video' ? 'Reel' : 'Post'}`,
    tags: ['instagram'],
    media_type: mediaType,
  };
}
