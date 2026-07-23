/**
 * Pinterest Extractor
 *
 * Extraction chain:
 * 1. Direct OG tag scraping (works well for public pins)
 * 2. Microlink / jsonlink fallback (for when OG scraping fails)
 * 3. Minimal fallback
 */

import type { ExtractedData } from '../extractor';
import { extractTagsFromText } from '../content-engine';
import { fetchMetadataWithFallback } from './metadata-services';
import { normalizeSourceUrl } from '../url-normalizer';

export async function extractPinterest(url: string): Promise<ExtractedData> {
  const cleanUrl = normalizeSourceUrl(url);

  // --- Attempt 1: Direct OG tag scraping ---
  try {
    const res = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const html = await res.text();

      if (html.includes('og:title') || html.includes('og:image')) {
        const { load } = await import('cheerio');
        const $ = load(html);

        const title = $('meta[property="og:title"]').attr('content') || $('title').text();
        const description = $('meta[property="og:description"]').attr('content') || '';
        const image = $('meta[property="og:image"]').attr('content');
        const video = $('meta[property="og:video"]').attr('content') || $('meta[property="og:video:url"]').attr('content');
        const type = $('meta[property="og:type"]').attr('content');

        if (title || image) {
          const fullText = `${title} ${description}`;
          const tags = extractTagsFromText(fullText);

          // Pinterest uses "pinterestapp:pintype" meta for pin type
          const pinType = $('meta[property="pinterestapp:pintype"]').attr('content');

          let mediaType: 'video' | 'image' | 'carousel' = 'image';
          if (video || pinType === 'video' || type?.includes('video')) {
            mediaType = 'video';
          }

          return {
            platform: 'pinterest',
            source_url: cleanUrl,
            media_url: video || image || undefined,
            thumbnail_url: image || undefined,
            caption: title || description || 'Pinterest Pin',
            tags: tags.length > 0 ? tags : ['pinterest'],
            media_type: mediaType,
            preview_mode: video ? 'direct_video' : 'image',
          };
        }
      }
    }
  } catch (e) {
    console.warn('Pinterest OG scrape failed:', e);
  }

  // --- Attempt 2: Third-party metadata services ---
  try {
    const metadata = await fetchMetadataWithFallback(cleanUrl);

    if (metadata && (metadata.title || metadata.image)) {
      const caption = metadata.title || metadata.description || '';
      const tags = extractTagsFromText(`${caption} ${metadata.description || ''}`);

      let mediaType: 'video' | 'image' | 'carousel' = 'image';
      if (metadata.video || metadata.type === 'video') {
        mediaType = 'video';
      }

      return {
        platform: 'pinterest',
        source_url: cleanUrl,
        media_url: metadata.video || metadata.image || undefined,
        thumbnail_url: metadata.image || undefined,
        caption: caption || 'Pinterest Pin',
        tags: tags.length > 0 ? tags : ['pinterest'],
        media_type: mediaType,
        preview_mode: metadata.video ? 'direct_video' : 'image',
      };
    }
  } catch (e) {
    console.warn('Pinterest metadata service fallback failed:', e);
  }

  // --- Attempt 3: Minimal fallback ---
  return {
    platform: 'pinterest',
    source_url: cleanUrl,
    caption: 'Pinterest Pin',
    tags: ['pinterest'],
    media_type: 'image',
    preview_mode: 'external',
  };
}
