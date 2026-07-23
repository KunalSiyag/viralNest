/**
 * Platform Extractor Interface & Registry
 *
 * Each platform gets a dedicated extractor module that implements
 * a common interface. The registry auto-detects which extractor
 * to use based on the URL domain.
 */

import { PLATFORMS, type PlatformId } from '@/lib/constants';
import { extractInstagram } from './extractors/instagram';
import { extractPinterest } from './extractors/pinterest';
import { extractTikTok } from './extractors/tiktok';
import { extractGeneric } from './extractors/generic';
import {
  derivePreviewMode,
  isDownloadAvailable,
  sanitizeMediaUrl,
  type PlatformMetrics,
  type PreviewMode,
} from './media-capabilities';
import { normalizeSourceUrl } from './url-normalizer';

export interface ExtractedData {
  platform: string;
  source_url: string;
  media_url?: string;
  thumbnail_url?: string;
  caption?: string;
  tags: string[];
  media_type: 'video' | 'image' | 'carousel';
  platform_metrics?: PlatformMetrics;
  preview_mode?: PreviewMode;
  download_available?: boolean;
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

  const normalizedUrl = normalizeSourceUrl(url);
  const platform = detectPlatform(normalizedUrl);
  const extractor = extractors[platform] || extractGeneric;

  try {
    const data = await extractor(normalizedUrl);
    const resolvedPlatform = platform === 'unknown' ? data.platform : platform;
    const safeMediaUrl = sanitizeMediaUrl(data.media_url);
    return {
      ...data,
      platform: resolvedPlatform,
      source_url: normalizeSourceUrl(data.source_url || normalizedUrl),
      media_url: safeMediaUrl,
      preview_mode: data.preview_mode || derivePreviewMode(resolvedPlatform, safeMediaUrl, data.media_type),
      download_available: typeof data.download_available === 'boolean'
        ? data.download_available
        : isDownloadAvailable(safeMediaUrl),
    };
  } catch (firstError) {
    // If platform-specific extractor fails, try generic fallback
    if (platform !== 'unknown') {
      console.warn(`Platform extractor for ${platform} failed, trying generic fallback`);
      try {
        const fallbackData = await extractGeneric(normalizedUrl);
        const safeMediaUrl = sanitizeMediaUrl(fallbackData.media_url);
        return {
          ...fallbackData,
          platform,
          source_url: normalizeSourceUrl(fallbackData.source_url || normalizedUrl),
          media_url: safeMediaUrl,
          preview_mode: fallbackData.preview_mode || derivePreviewMode(platform, safeMediaUrl, fallbackData.media_type),
          download_available: typeof fallbackData.download_available === 'boolean'
            ? fallbackData.download_available
            : isDownloadAvailable(safeMediaUrl),
        };
      } catch {
        // Both failed, throw original error
      }
    }
    throw firstError;
  }
}
