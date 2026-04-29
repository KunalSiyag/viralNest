/**
 * Pinterest Extractor
 *
 * Pinterest is relatively scraping-friendly — OG tags work well
 * for public pins. We also support their oEmbed endpoint.
 */

import type { ExtractedData } from '../extractor';
import { extractTagsFromText } from '../content-engine';

export async function extractPinterest(url: string): Promise<ExtractedData> {
  const cleanUrl = url.split('?')[0];

  try {
    // Pinterest OG tags are usually well-structured
    const res = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const html = await res.text();
    const { load } = await import('cheerio');
    const $ = load(html);

    const title = $('meta[property="og:title"]').attr('content') || $('title').text();
    const description = $('meta[property="og:description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content');
    const video = $('meta[property="og:video"]').attr('content') || $('meta[property="og:video:url"]').attr('content');
    const type = $('meta[property="og:type"]').attr('content');

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
      tags,
      media_type: mediaType,
    };
  } catch (e) {
    console.warn('Pinterest extraction failed:', e);
    return {
      platform: 'pinterest',
      source_url: cleanUrl,
      caption: 'Pinterest Pin',
      tags: ['pinterest'],
      media_type: 'image',
    };
  }
}
