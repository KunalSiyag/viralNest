/**
 * TikTok Extractor
 *
 * Uses TikTok's public oEmbed endpoint.
 * TikTok oEmbed is reliable and returns thumbnail + title.
 */

import type { ExtractedData } from '../extractor';
import { extractTagsFromText } from '../content-engine';

const OEMBED_URL = 'https://www.tiktok.com/oembed';

export async function extractTikTok(url: string): Promise<ExtractedData> {
  const cleanUrl = url.split('?')[0];

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
        tags,
        media_type: 'video',
      };
    }
  } catch (e) {
    console.warn('TikTok oEmbed failed:', e);
  }

  // Fallback — try noembed.com (aggregator)
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
          tags,
          media_type: 'video',
        };
      }
    }
  } catch (e) {
    console.warn('TikTok noembed fallback failed:', e);
  }

  return {
    platform: 'tiktok',
    source_url: cleanUrl,
    caption: 'TikTok Video',
    tags: ['tiktok'],
    media_type: 'video',
  };
}
