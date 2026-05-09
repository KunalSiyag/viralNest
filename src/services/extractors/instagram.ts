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
import { normalizeSourceUrl } from '../url-normalizer';
import { parseEngagementCount } from '../media-capabilities';

const OEMBED_URL = 'https://api.instagram.com/oembed';

/**
 * Extract the shortcode from an Instagram URL
 */
function extractShortcode(url: string): string | null {
  const match = url.match(/\/(?:p|reel|tv|reels)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

function extractInstagramContentType(url: string): 'p' | 'reel' | 'reels' | 'tv' | null {
  const match = url.match(/\/(p|reel|reels|tv)\//);
  return match ? (match[1] as 'p' | 'reel' | 'reels' | 'tv') : null;
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

function extractMetricsFromText(text: string) {
  const metrics: { likes?: number | null; comments?: number | null; views?: number | null } = {};
  const compact = text.toLowerCase().replace(/\s+/g, ' ');

  const likesMatch = compact.match(/([\d.,]+(?:\s*[km])?)\s+likes?/);
  const commentsMatch = compact.match(/([\d.,]+(?:\s*[km])?)\s+comments?/);
  const viewsMatch = compact.match(/([\d.,]+(?:\s*[km])?)\s+views?/);

  if (likesMatch) metrics.likes = parseEngagementCount(likesMatch[1]);
  if (commentsMatch) metrics.comments = parseEngagementCount(commentsMatch[1]);
  if (viewsMatch) metrics.views = parseEngagementCount(viewsMatch[1]);

  return metrics;
}

export async function extractInstagram(url: string): Promise<ExtractedData> {
  const cleanUrl = normalizeSourceUrl(url);
  const shortcode = extractShortcode(cleanUrl);
  const mediaType = detectMediaType(cleanUrl);
  const contentType = extractInstagramContentType(cleanUrl);

  // --- Attempt 1: Headless browser extraction ---
  // Load the page in Chrome, dismiss login popup, capture media from network
  try {
    console.log('[Instagram] Attempting browser-based extraction...');
    const result = await extractWithBrowser(cleanUrl);

    const caption = result.caption || '';
    const isLoginWall = 
      (result.thumbnailUrl && result.thumbnailUrl.includes('rsrc.php')) ||
      caption.toLowerCase().includes('log in to instagram') ||
      caption.toLowerCase().includes("page isn't available") ||
      caption.toLowerCase().includes('create an account');

    if (isLoginWall && !result.mediaUrl) {
      throw new Error('Browser extraction hit Instagram login wall');
    }

    if (result.mediaUrl || result.thumbnailUrl) {
      const finalCaption = caption || `Instagram ${mediaType === 'video' ? 'Reel' : 'Post'}`;
      const tags = extractTagsFromText(finalCaption);
      const platformMetrics = {
        ...extractMetricsFromText(finalCaption),
        ...result.platformMetrics,
        author_handle: result.author || null,
      };

      console.log('[Instagram] Browser extraction succeeded:', {
        hasVideo: !!result.mediaUrl,
        hasThumbnail: !!result.thumbnailUrl,
        captionLength: finalCaption.length,
      });

      return {
        platform: 'instagram',
        source_url: cleanUrl,
        media_url: result.mediaUrl || undefined,
        thumbnail_url: result.thumbnailUrl || undefined,
        caption: finalCaption,
        tags: tags.length > 0 ? tags : ['instagram'],
        media_type: result.mediaUrl ? 'video' : mediaType,
        platform_metrics: platformMetrics,
        preview_mode: 'embed',
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
        const platformMetrics = {
          ...extractMetricsFromText(caption),
          author_name: data.author_name || null,
          author_handle: data.author_name || null,
        };

        return {
          platform: 'instagram',
          source_url: cleanUrl,
          thumbnail_url: data.thumbnail_url || undefined,
          caption: caption || 'Instagram Post',
          tags: tags.length > 0 ? tags : ['instagram'],
          media_type: mediaType,
          platform_metrics: platformMetrics,
          preview_mode: 'embed',
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
          platform_metrics: extractMetricsFromText(`${title} ${description}`),
          preview_mode: 'embed',
        };
      }
    }
  } catch (e) {
    console.warn('[Instagram] Metadata fallback failed:', e instanceof Error ? e.message : e);
  }

  // --- Attempt 4: Embed URL fallback ---
  let embedUrl: string | undefined;
  if (shortcode) {
    if (contentType === 'reel' || contentType === 'reels') {
      embedUrl = `https://www.instagram.com/reel/${shortcode}/embed/`;
    } else if (contentType === 'tv') {
      embedUrl = `https://www.instagram.com/tv/${shortcode}/embed/`;
    } else {
      embedUrl = `https://www.instagram.com/p/${shortcode}/embed/`;
    }
  }

  return {
    platform: 'instagram',
    source_url: cleanUrl,
    media_url: undefined, // Embed URL is not a direct media download link
    caption: `Instagram ${mediaType === 'video' ? 'Reel' : 'Post'}`,
    tags: ['instagram'],
    media_type: mediaType,
    preview_mode: 'embed',
  };
}
