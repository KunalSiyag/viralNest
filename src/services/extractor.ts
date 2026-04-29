/**
 * Platform Extractor Interface & Registry
 *
 * Each platform gets a dedicated extractor module that implements
 * a common interface. The registry auto-detects which extractor
 * to use based on the URL domain.
 */

import { PLATFORMS, type PlatformId } from '@/lib/constants';
import { extractInstagram } from './extractors/instagram';
import { extractYouTube } from './extractors/youtube';
import { extractPinterest } from './extractors/pinterest';
import { extractTikTok } from './extractors/tiktok';
import { extractGeneric } from './extractors/generic';

export interface ExtractedData {
  platform: string;
  source_url: string;
  media_url?: string;
  thumbnail_url?: string;
  caption?: string;
  tags: string[];
  media_type: 'video' | 'image' | 'carousel';
}

export type PlatformExtractorFn = (url: string) => Promise<ExtractedData>;

/**
 * Detect which platform a URL belongs to
 */
export function detectPlatform(url: string): PlatformId | 'unknown' {
  const hostname = new URL(url).hostname.toLowerCase();

  for (const [id, platform] of Object.entries(PLATFORMS)) {
    if (platform.domains.some(d => hostname.includes(d))) {
      return id as PlatformId;
    }
  }

  return 'unknown';
}

/**
 * Platform extractor registry
 */
const extractors: Partial<Record<PlatformId | 'unknown', PlatformExtractorFn>> = {
  instagram: extractInstagram,
  youtube: extractYouTube,
  pinterest: extractPinterest,
  tiktok: extractTikTok,
  unknown: extractGeneric,
};

/**
 * Main extraction function.
 * Detects platform → uses platform-specific extractor → falls back to generic.
 */
export async function extractMediaData(url: string): Promise<ExtractedData> {
  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL provided');
  }

  const platform = detectPlatform(url);
  const extractor = extractors[platform] || extractGeneric;

  try {
    const data = await extractor(url);
    return {
      ...data,
      platform: platform === 'unknown' ? data.platform : platform,
    };
  } catch (firstError) {
    // If platform-specific extractor fails, try generic fallback
    if (platform !== 'unknown') {
      console.warn(`Platform extractor for ${platform} failed, trying generic fallback`);
      try {
        const fallbackData = await extractGeneric(url);
        return {
          ...fallbackData,
          platform,
        };
      } catch {
        // Both failed, throw original error
      }
    }
    throw firstError;
  }
}
