/**
 * Instagram Extractor
 *
 * Uses Instagram's public oEmbed endpoint (no auth required).
 * Falls back to OG tag scraping if oEmbed is unavailable.
 */

import type { ExtractedData } from '../extractor';
import { extractTagsFromText } from '../content-engine';

const OEMBED_URL = 'https://api.instagram.com/oembed';

export async function extractInstagram(url: string): Promise<ExtractedData> {
  // Normalize URL (remove query params, ensure proper format)
  const cleanUrl = url.split('?')[0];

  try {
    // Try oEmbed first — most reliable for public posts
    const oembedRes = await fetch(`${OEMBED_URL}?url=${encodeURIComponent(cleanUrl)}&omitscript=true`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; viralNest/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (oembedRes.ok) {
      const data = await oembedRes.json();

      const caption = data.title || '';
      const tags = extractTagsFromText(caption);

      return {
        platform: 'instagram',
        source_url: cleanUrl,
        media_url: undefined, // oEmbed doesn't provide direct media URLs
        thumbnail_url: data.thumbnail_url || undefined,
        caption: caption || 'Instagram Post',
        tags,
        media_type: cleanUrl.includes('/reel') ? 'video' : 'image',
      };
    }
  } catch (e) {
    console.warn('Instagram oEmbed failed:', e);
  }

  // Fallback: try to scrape OG tags
  try {
    const res = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
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

    return {
      platform: 'instagram',
      source_url: cleanUrl,
      media_url: video || undefined,
      thumbnail_url: image || undefined,
      caption: title || description || 'Instagram Content',
      tags,
      media_type: type?.includes('video') || video ? 'video' : 'image',
    };
  } catch (e) {
    console.warn('Instagram OG scrape failed:', e);
    // Return minimal data — at least we know the platform
    return {
      platform: 'instagram',
      source_url: cleanUrl,
      caption: 'Instagram Content',
      tags: ['instagram'],
      media_type: cleanUrl.includes('/reel') ? 'video' : 'image',
    };
  }
}
