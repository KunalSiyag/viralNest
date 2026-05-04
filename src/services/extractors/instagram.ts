/**
 * Instagram Extractor
 *
 * Instagram has completely locked down server-side metadata extraction as of 2025.
 * All approaches (oEmbed, OG scraping, GraphQL, mobile API, headless browsers)
 * return empty/blocked responses without authentication.
 *
 * Strategy:
 * 1. Try oEmbed (occasionally works for some posts)
 * 2. Try Microlink/jsonlink (may get partial metadata)
 * 3. Extract what we can from the URL itself (shortcode, media type)
 * 4. Store the embed URL so the client can render the native Instagram embed
 *
 * The preview page will render the Instagram post using Instagram's native
 * embed iframe, which is the only reliable way to display IG content.
 */

import type { ExtractedData } from '../extractor';
import { extractTagsFromText } from '../content-engine';
import { fetchMetadataWithFallback } from './metadata-services';

const OEMBED_URL = 'https://api.instagram.com/oembed';

/**
 * Extract the shortcode from an Instagram URL
 */
function extractShortcode(url: string): string | null {
  const patterns = [
    /\/(?:p|reel|tv|reels)\/([A-Za-z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
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

  // --- Attempt 1: Instagram oEmbed ---
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
    console.warn('Instagram oEmbed failed:', e instanceof Error ? e.message : e);
  }

  // --- Attempt 2: Third-party metadata services ---
  try {
    const metadata = await fetchMetadataWithFallback(cleanUrl);

    if (metadata) {
      const title = metadata.title || '';
      const description = metadata.description || '';

      // Only use if we got something meaningful (not just "Instagram")
      const hasRealTitle = title && title.toLowerCase() !== 'instagram' && title.length > 15;
      const hasRealImage = metadata.image && !metadata.image.includes('rsrc.php'); // Filter out static IG assets

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
    console.warn('Instagram metadata fallback failed:', e instanceof Error ? e.message : e);
  }

  // --- Attempt 3: Construct embed URL for client-side rendering ---
  // Since server-side extraction is blocked, we provide the embed URL
  // so the preview page can render the actual Instagram post via iframe
  const embedUrl = shortcode
    ? `https://www.instagram.com/p/${shortcode}/embed/`
    : undefined;

  return {
    platform: 'instagram',
    source_url: cleanUrl,
    // Store embed URL as media_url — the preview page will detect instagram
    // platform and render an iframe instead of a video/image
    media_url: embedUrl,
    caption: `Instagram ${mediaType === 'video' ? 'Reel' : 'Post'}`,
    tags: ['instagram'],
    media_type: mediaType,
  };
}
