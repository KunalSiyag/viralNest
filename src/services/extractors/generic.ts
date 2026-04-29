/**
 * Generic Extractor (Fallback)
 *
 * Works for any website by reading OpenGraph meta tags.
 * Used when no platform-specific extractor is available,
 * or as a fallback when a platform extractor fails.
 */

import type { ExtractedData } from '../extractor';
import { extractTagsFromText } from '../content-engine';

export async function extractGeneric(url: string): Promise<ExtractedData> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch URL: HTTP ${res.status} ${res.statusText}`);
    }

    const html = await res.text();
    const { load } = await import('cheerio');
    const $ = load(html);

    // Extract all OG metadata
    const title = $('meta[property="og:title"]').attr('content')
      || $('meta[name="title"]').attr('content')
      || $('title').text()
      || '';

    const description = $('meta[property="og:description"]').attr('content')
      || $('meta[name="description"]').attr('content')
      || '';

    const image = $('meta[property="og:image"]').attr('content')
      || $('meta[property="og:image:url"]').attr('content');

    const video = $('meta[property="og:video"]').attr('content')
      || $('meta[property="og:video:url"]').attr('content')
      || $('meta[property="og:video:secure_url"]').attr('content');

    const type = $('meta[property="og:type"]').attr('content');
    const siteName = $('meta[property="og:site_name"]').attr('content') || '';

    // Detect platform from site name
    let platform = 'unknown';
    const siteNameLower = siteName.toLowerCase();
    if (siteNameLower.includes('instagram')) platform = 'instagram';
    else if (siteNameLower.includes('pinterest')) platform = 'pinterest';
    else if (siteNameLower.includes('youtube')) platform = 'youtube';
    else if (siteNameLower.includes('tiktok')) platform = 'tiktok';
    else if (siteNameLower.includes('twitter') || siteNameLower.includes('x')) platform = 'twitter';

    // Extract tags from all text content
    const fullText = `${title} ${description}`;
    const tags = extractTagsFromText(fullText);

    // Determine media type
    let mediaType: 'video' | 'image' | 'carousel' = 'image';
    if (video || type?.includes('video')) {
      mediaType = 'video';
    }

    return {
      platform,
      source_url: url,
      media_url: video || undefined,
      thumbnail_url: image || undefined,
      caption: title || description || 'Extracted Content',
      tags,
      media_type: mediaType,
    };
  } catch (error) {
    console.error('Generic extraction failed:', error);
    throw new Error('Failed to extract content. The URL might be invalid or the site blocked the request.');
  }
}
