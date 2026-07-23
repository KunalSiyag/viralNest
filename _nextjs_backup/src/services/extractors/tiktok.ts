/**
 * TikTok Extractor
 *
 * Extraction chain:
 * 1. TikTok oEmbed endpoint (usually reliable)
 * 2. noembed.com aggregator (existing fallback)
 * 3. Microlink / jsonlink (new fallback for edge cases)
 * 4. Minimal fallback
 */

import type { ExtractedData } from '../extractor';
import { extractTagsFromText } from '../content-engine';
import { fetchMetadataWithFallback } from './metadata-services';
import { normalizeSourceUrl } from '../url-normalizer';

const OEMBED_URL = 'https://www.tiktok.com/oembed';

export async function extractTikTok(url: string): Promise<ExtractedData> {
  const cleanUrl = normalizeSourceUrl(url);

  // --- Attempt 1: TikTok oEmbed ---
  try {
    const oembedRes = await fetch(
      `${OEMBED_URL}?url=${encodeURIComponent(cleanUrl)}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (oembedRes.ok) {
      const data = await oembedRes.json();

      const caption = data.title || '';
      const author = data.author_name || '';
      const tags = extractTagsFromText(`${caption} ${author}`);

      return {
        platform: 'tiktok',
        source_url: cleanUrl,
        media_url: undefined, // TikTok oEmbed doesn't provide direct video URL
        thumbnail_url: data.thumbnail_url || undefined,
        caption: caption || 'TikTok Video',
        tags: tags.length > 0 ? tags : ['tiktok'],
        media_type: 'video',
      };
    }
  } catch (e) {
    console.warn('TikTok oEmbed failed:', e);
  }

  // --- Attempt 2: noembed.com aggregator ---
  try {
    const noembedRes = await fetch(
      `https://noembed.com/embed?url=${encodeURIComponent(cleanUrl)}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (noembedRes.ok) {
      const data = await noembedRes.json();

      if (!data.error) {
        const tags = extractTagsFromText(data.title || '');
        return {
          platform: 'tiktok',
          source_url: cleanUrl,
          thumbnail_url: data.thumbnail_url || undefined,
          caption: data.title || 'TikTok Video',
          tags: tags.length > 0 ? tags : ['tiktok'],
          media_type: 'video',
        };
      }
    }
  } catch (e) {
    console.warn('TikTok noembed fallback failed:', e);
  }

  // --- Attempt 3: Third-party metadata services ---
  try {
    const metadata = await fetchMetadataWithFallback(cleanUrl);

    if (metadata && (metadata.title || metadata.image)) {
      const caption = metadata.title || metadata.description || '';
      const tags = extractTagsFromText(`${caption} ${metadata.description || ''}`);

      return {
        platform: 'tiktok',
        source_url: cleanUrl,
        media_url: metadata.video || undefined,
        thumbnail_url: metadata.image || undefined,
        caption: caption || 'TikTok Video',
        tags: tags.length > 0 ? tags : ['tiktok'],
        media_type: 'video',
      };
    }
  } catch (e) {
    console.warn('TikTok metadata service fallback failed:', e);
  }

  // --- Attempt 4: Minimal fallback ---
  return {
    platform: 'tiktok',
    source_url: cleanUrl,
    caption: 'TikTok Video',
    tags: ['tiktok'],
    media_type: 'video',
  };
}
