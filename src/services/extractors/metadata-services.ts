/**
 * Third-party Metadata Extraction Services
 *
 * Shared utilities for extracting metadata from URLs using free, public
 * services that handle JavaScript rendering internally. Used as fallbacks
 * when platform-specific oEmbed/OG-scrape methods fail.
 *
 * Services used (all free, no API key required):
 * - Microlink (api.microlink.io) — headless Chrome, 50 req/day free
 * - jsonlink.io — fast metadata extraction
 */

export interface ExtractedMetadata {
  title?: string;
  description?: string;
  image?: string;
  video?: string;
  author?: string;
  site?: string;
  type?: string; // 'video', 'article', etc.
}

/**
 * Microlink — most reliable, uses headless Chrome internally.
 * Free tier: 50 requests/day, no API key needed.
 * https://microlink.io/docs/api/getting-started/overview
 */
export async function fetchMicrolinkMetadata(url: string): Promise<ExtractedMetadata | null> {
  try {
    const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;

    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; viralNest/1.0)',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) return null;

    const json = await res.json();

    if (json.status !== 'success' || !json.data) return null;

    const data = json.data;

    return {
      title: data.title || undefined,
      description: data.description || undefined,
      image: data.image?.url || undefined,
      video: data.video?.url || undefined,
      author: data.author || undefined,
      site: data.publisher || undefined,
      type: data.video ? 'video' : 'article',
    };
  } catch (e) {
    console.warn('Microlink metadata fetch failed:', e);
    return null;
  }
}

/**
 * jsonlink.io — fast, free metadata extraction.
 * No API key required, no documented rate limits.
 * https://jsonlink.io
 */
export async function fetchJsonlinkMetadata(url: string): Promise<ExtractedMetadata | null> {
  try {
    const apiUrl = `https://jsonlink.io/api/extract?url=${encodeURIComponent(url)}`;

    const res = await fetch(apiUrl, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;

    const data = await res.json();

    if (!data || data.error) return null;

    // jsonlink returns images as an array
    const images: string[] = data.images || [];
    const primaryImage = images.length > 0 ? images[0] : undefined;

    return {
      title: data.title || undefined,
      description: data.description || undefined,
      image: primaryImage,
      video: undefined, // jsonlink doesn't extract video URLs
      author: undefined,
      site: data.domain || undefined,
      type: undefined,
    };
  } catch (e) {
    console.warn('jsonlink metadata fetch failed:', e);
    return null;
  }
}

/**
 * Try multiple metadata services in order, return first success.
 * The chain stops as soon as one service returns data with at least a title or image.
 */
export async function fetchMetadataWithFallback(url: string): Promise<ExtractedMetadata | null> {
  // Try Microlink first (most reliable for social media)
  const microlink = await fetchMicrolinkMetadata(url);
  if (microlink && (microlink.title || microlink.image)) {
    return microlink;
  }

  // Try jsonlink as fallback
  const jsonlink = await fetchJsonlinkMetadata(url);
  if (jsonlink && (jsonlink.title || jsonlink.image)) {
    return jsonlink;
  }

  return null;
}
