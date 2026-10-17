/** Media URL pickers and HTML media scanners (moved verbatim from src/pages/api/extract.ts). */
import {
  findGifUrlFromImages,
  isGifUrl,
  toPlayablePinVideoUrl,
  toPublicPinImageUrl,
} from '../pin-media';
import type { MediaItem } from './types';

/**
 * Upgrade any avatar-sized Pinterest image URL to 1200x (the pin rule). Avatars
 * often 403 at 1200x, so the extractor probes avatarSizeCandidates() instead
 * (upstream.ts resolveAvatarUrl) and keeps this only as a synchronous guess.
 */
export function upgradeAvatarUrl(url: string): string {
  return toPublicPinImageUrl(url);
}

const AVATAR_SIZE_SEGMENT =
  /\/(?:originals|orig|1200x|736x|564x|474x|236x|30x30_RS|50x50_RS|75x75_RS|140x140_RS|280x280_RS|600x600_RS|150x150|170x|280x280|600x600)\//;

/**
 * Sizes of one avatar file to try, largest first, ending with the URL Pinterest
 * itself returned. Which sizes exist differs per account (live, 2026-10: one
 * avatar answers at 1200x, another only at /originals/ and 280x280_RS), so
 * none can be assumed.
 */
export function avatarSizeCandidates(url: string): string[] {
  if (!url || !/^https:\/\/i\.pinimg\.com\//.test(url) || !AVATAR_SIZE_SEGMENT.test(url) || isGifUrl(url)) return url ? [url] : [];
  const sizes = ['originals', '1200x', '736x', '600x600_RS', '564x', '280x280_RS'];
  return [...new Set([...sizes.map((size) => url.replace(AVATAR_SIZE_SEGMENT, `/${size}/`)), url])];
}

/**
 * Check if a pinimg URL looks like a profile avatar (as opposed to a pin/board image).
 * Avatar URLs typically live under specific size-prefixed directories.
 */
export function isPinimgAvatarUrl(url: string): boolean {
  return /i\.pinimg\.com\/(?:30x30_RS|50x50_RS|75x75_RS|140x140_RS|280x280_RS|600x600_RS|150x150|170x|280x280|originals)\//.test(url);
}

/**
 * Extract the user's profile avatar URL from the page HTML, as Pinterest gives
 * it (resolve the size to serve with upstream.ts resolveAvatarUrl).
 * Strategy (in priority order):
 *   1. Parse initialReduxState.users for image_xlarge_url / image_large_url
 *   2. Scan <img> tags whose src matches pinimg.com avatar size patterns
 *   3. Look for avatar URLs in JSON-LD or inline script data
 */
export function extractAvatarFromHtml(html: string, targetUsername?: string): string | null {
  // ── 1. Redux state: users object ────────────────────────────────
  const scriptMatches = [...html.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const s of scriptMatches) {
    try {
      const obj = JSON.parse(s[1]);
      const reduxState = obj?.initialReduxState;
      if (reduxState?.users) {
        const rawUsers = Object.values(reduxState.users) as any[];
        for (const u of rawUsers) {
          // Match by username if available, otherwise take the first user with an avatar
          if (targetUsername && u?.username?.toLowerCase() !== targetUsername.toLowerCase()) continue;
          const avatarUrl =
            u?.image_xlarge_url ||
            u?.image_large_url ||
            u?.image_medium_url ||
            u?.image_small_url ||
            null;
          if (avatarUrl && avatarUrl.includes('pinimg.com')) {
            return avatarUrl;
          }
        }
        // If username didn't match, try any user as fallback
        if (targetUsername) {
          for (const u of rawUsers) {
            const avatarUrl =
              u?.image_xlarge_url ||
              u?.image_large_url ||
              u?.image_medium_url ||
              u?.image_small_url ||
              null;
            if (avatarUrl && avatarUrl.includes('pinimg.com')) {
              return avatarUrl;
            }
          }
        }
      }
    } catch {}
  }

  // ── 2. Scan for avatar-sized <img> tags ─────────────────────────
  // Pinterest renders the profile picture as <img class="..." src="https://i.pinimg.com/280x280_RS/...">
  const imgMatches = [
    ...html.matchAll(/<img[^>]+src=["'](https:\/\/i\.pinimg\.com\/(?:280x280_RS|150x150|170x|75x75_RS|140x140_RS|600x600_RS)\/[^"']+)["'][^>]*>/gi),
  ];
  if (imgMatches.length > 0) {
    // Prefer the largest available avatar
    const sizeOrder = ['600x600_RS', '280x280_RS', '170x', '150x150', '140x140_RS', '75x75_RS'];
    imgMatches.sort((a, b) => {
      const aIdx = sizeOrder.findIndex((s) => a[1].includes(s));
      const bIdx = sizeOrder.findIndex((s) => b[1].includes(s));
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });
    return imgMatches[0][1];
  }

  // ── 3. Look for avatar in inline JSON (non-Redux script blocks) ─
  // Sometimes the avatar URL appears in <script> blocks as "profile_image" or "image_url" near the username
  const inlineScripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const s of inlineScripts) {
    try {
      // Look for avatar-sized pinimg URLs near "image" keys
      const avatarInScript = s[1].match(
        /["'](?:image_xlarge_url|image_large_url|image_medium_url|profile_image|user_image|avatar)["']\s*:\s*["'](https?:\/\/i\.pinimg\.com\/[^"']+)["']/i,
      );
      if (avatarInScript?.[1]) {
        return avatarInScript[1];
      }
    } catch {}
  }

  return null;
}

export function upgradePinImageUrl(url?: string | null): string | null {
  if (!url) return null;
  return toPublicPinImageUrl(url);
}

export function extractVideoUrlsFromHtml(
  html: string,
): { label: string; url: string; width?: number; height?: number }[] {
  const qualities: { label: string; url: string; width?: number; height?: number }[] = [];
  const seen = new Set<string>();

  // 1. Scan for HLS .m3u8 streams and convert them to progressive /720p MP4
  const m3u8Matches = [
    ...html.matchAll(/(https?:\\?\/\\?[^"\s']+\.m3u8[^"\s']*)/gi),
  ].map((m) => m[1].replace(/\\/g, ''));

  for (const m3u8 of m3u8Matches) {
    if (m3u8.includes('pinimg.com/videos/')) {
      const mp4 = toPlayablePinVideoUrl(m3u8);
      if (!seen.has(mp4)) {
        seen.add(mp4);
        qualities.push({ label: '720p HD MP4', url: mp4 });
      }
    }
  }

  // 2. Scan for direct mp4 URLs (rewrite blocked expMp4 variants)
  const mp4Matches = [
    ...html.matchAll(/(https?:\\?\/\\?[^"\s']+\.mp4[^"\s']*)/gi),
  ].map((m) => m[1].replace(/\\/g, ''));

  for (const raw of mp4Matches) {
    if (!raw.includes('pinimg.com/videos/')) continue;
    const mp4 = toPlayablePinVideoUrl(raw);
    if (seen.has(mp4)) continue;
    seen.add(mp4);
    let label = 'SD MP4';
    if (mp4.includes('720w') || mp4.includes('/720p/')) label = '720p HD MP4';
    else if (mp4.includes('1080w') || mp4.includes('/1080p/')) label = '1080p Full HD';
    else if (mp4.includes('540w') || mp4.includes('/540p/')) label = '540p MP4';
    qualities.push({ label, url: mp4 });
  }

  return qualities;
}

/**
 * A real pin GIF lives on i.pinimg.com under /originals/ or a sized folder,
 * named by its 32-hex hash. Anything else that ends in .gif on a pinimg host
 * (Akamai beacons such as pinimg-com-eip-akadns-net.pinimg.com/_/_/r21.gif,
 * s.pinimg.com site assets) is not pin media.
 */
export const PIN_GIF_URL =
  /^https:\/\/i\.pinimg\.com\/(?:originals|\d+x)\/[0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]{2}\/([0-9a-f]{32})\.gif$/i;

/** The 32-hex media hash in an i.pinimg.com image URL, or null. */
export function pinimgImageHash(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/\/[0-9a-f]{2}\/[0-9a-f]{2}\/[0-9a-f]{2}\/([0-9a-f]{32})\.[a-z0-9]+(?:[?#]|$)/i);
  return m ? m[1].toLowerCase() : null;
}

/**
 * Pin GIFs referenced in the page HTML. When the pin's own image URLs are
 * known, only a GIF with the same hash counts: the page also carries related
 * pins, and their GIFs are not this pin.
 */
export function extractGifUrlsFromHtml(html: string, ownImageUrls: Array<string | null | undefined> = []): string[] {
  const matches = [
    ...html.matchAll(/(https?:\\?\/\\?[^"'\s<>]+\.gif(?:\?[^"'\s<>]*)?)/gi),
  ].map((m) => m[1].replace(/\\/g, '').split(/[?#]/)[0]);
  const ownHashes = new Set(
    ownImageUrls.map(pinimgImageHash).filter((h): h is string => Boolean(h)),
  );
  const out: string[] = [];
  for (const url of matches) {
    const m = url.match(PIN_GIF_URL);
    if (!m || !isGifUrl(url)) continue;
    if (ownHashes.size && !ownHashes.has(m[1].toLowerCase())) continue;
    if (!out.includes(url)) out.push(url);
  }
  return out;
}

/** Pinterest site chrome (share cards, logos), never a pin's media. */
export function isPinterestSiteAsset(url: string | null | undefined): boolean {
  return Boolean(url && /^https?:\/\/s\.pinimg\.com\//i.test(url));
}

export function applyGifToMediaItems(
  mediaItems: MediaItem[],
  gifUrl: string,
  thumbnailUrl?: string | null,
  title?: string,
): MediaItem[] {
  if (mediaItems.length === 0) {
    return [
      {
        index: 0,
        type: 'gif',
        url: gifUrl,
        thumbnail_url: thumbnailUrl || gifUrl,
        title: title || 'Pinterest Pin',
      },
    ];
  }
  if (mediaItems.length === 1 && mediaItems[0].type !== 'video') {
    return [
      {
        ...mediaItems[0],
        type: 'gif',
        url: gifUrl,
        thumbnail_url: mediaItems[0].thumbnail_url || thumbnailUrl || gifUrl,
      },
    ];
  }
  return mediaItems.map((item) =>
    item.type === 'image' && !isGifUrl(item.url)
      ? item
      : item.type === 'gif'
        ? { ...item, url: isGifUrl(item.url) ? item.url : gifUrl }
        : item,
  );
}

export function pickBestImageFromImagesMap(images: any): string | null {
  if (!images || typeof images !== 'object') return null;
  const gif = findGifUrlFromImages(images);
  if (gif) return gif;
  const order = ['1200x', '736x', '750x', '564x', '474x', 'orig', 'originals', '1360x', '236x'];
  for (const key of order) {
    const entry = images[key];
    if (entry?.url) return upgradePinImageUrl(entry.url) || entry.url;
  }
  for (const entry of Object.values(images) as any[]) {
    if (entry && typeof entry === 'object' && entry.url) {
      return upgradePinImageUrl(entry.url) || entry.url;
    }
  }
  return null;
}

export function pickThumbFromImagesMap(images: any): string | null {
  if (!images || typeof images !== 'object') return null;
  return (
    images['236x']?.url ||
    images['474x']?.url ||
    images['564x']?.url ||
    images['736x']?.url ||
    pickBestImageFromImagesMap(images)
  );
}

export function isPinVideoFileUrl(url: string): boolean {
  return /\.(mp4|m3u8)(?:\?|$)/i.test(url);
}

export function pickBestVideoUrl(videos: any): string | null {
  if (!videos) return null;
  const list = videos.video_list || videos.videoList || videos;
  if (!list || typeof list !== 'object') return null;

  const entries = Object.entries(list) as [string, any][];
  const score = (url: string) => {
    // iht/expMp4 is the file that actually 200s; progressive iht/720p 403s.
    if (/\/videos\/iht\/expMp4\//i.test(url)) return 5;
    if (/\/1080p\//i.test(url) || /1080w/i.test(url)) return 4;
    if (/\/720p\//i.test(url) || /720w/i.test(url)) return 3;
    if (/expMp4/i.test(url)) return 2;
    return 1;
  };
  const mp4s = entries
    .filter(([, v]) => v?.url && typeof v.url === 'string' && isPinVideoFileUrl(v.url))
    .map(([key, v]) => ({
      key,
      url: toPlayablePinVideoUrl(v.url as string),
      height: Number(v.height || 0),
      width: Number(v.width || 0),
    }))
    .sort((a, b) => score(b.url) - score(a.url) || b.height - a.height || b.width - a.width);

  return mp4s[0]?.url || null;
}

export function videoQualitiesFromList(videos: any): { label: string; url: string; width?: number; height?: number }[] {
  if (!videos) return [];
  const list = videos.video_list || videos.videoList;
  if (!list || typeof list !== 'object') return [];
  const out: { label: string; url: string; width?: number; height?: number }[] = [];
  for (const [key, item] of Object.entries(list) as [string, any][]) {
    if (item?.url && isPinVideoFileUrl(String(item.url))) {
      const url = toPlayablePinVideoUrl(item.url);
      if (out.some((q) => q.url === url)) continue;
      out.push({
        label: key.replace(/^V_/, '').replace(/EXP/i, 'HD ').replace(/HLSV3_MOBILE/i, '720p HD MP4'),
        url,
        width: item.width,
        height: item.height,
      });
    }
  }
  return out;
}

export function mediaItemsFromCarousel(carouselData: any): MediaItem[] {
  const slots = carouselData?.carousel_slots || carouselData?.carouselSlots;
  if (!Array.isArray(slots) || !slots.length) return [];

  const items: MediaItem[] = [];
  slots.forEach((slot: any, idx: number) => {
    const images = slot?.images;
    const imageUrl = pickBestImageFromImagesMap(images);
    const thumb = pickThumbFromImagesMap(images) || imageUrl || undefined;
    const videoUrl = pickBestVideoUrl(slot?.videos);

    if (videoUrl) {
      items.push({
        index: idx,
        type: 'video',
        url: videoUrl,
        thumbnail_url: thumb,
        title: slot?.title || slot?.details || `Slide ${idx + 1}`,
      });
    } else if (imageUrl) {
      items.push({
        index: idx,
        type: isGifUrl(imageUrl) ? 'gif' : 'image',
        url: imageUrl,
        thumbnail_url: thumb,
        title: slot?.title || slot?.details || `Slide ${idx + 1}`,
      });
    }
  });
  return items;
}

export function mediaItemsFromStoryPages(pages: any[]): MediaItem[] {
  if (!Array.isArray(pages) || !pages.length) return [];
  const items: MediaItem[] = [];

  pages.forEach((page: any, idx: number) => {
    const blockVideo = (page.blocks || []).find(
      (b: any) => b?.video || b?.type === 'story_pin_video_block' || b?.block_type === 3,
    );
    const videoUrl =
      pickBestVideoUrl(page.video) ||
      pickBestVideoUrl(blockVideo?.video) ||
      pickBestVideoUrl(page.native_video) ||
      null;

    const blockImage = (page.blocks || []).find(
      (b: any) =>
        b?.image?.images ||
        b?.type === 'story_pin_image_block' ||
        b?.block_type === 2,
    );
    const imageUrl =
      pickBestImageFromImagesMap(page.image?.images) ||
      pickBestImageFromImagesMap(page.image_adjusted?.images) ||
      pickBestImageFromImagesMap(page.images) ||
      pickBestImageFromImagesMap(blockImage?.image?.images) ||
      upgradePinImageUrl(page.images_originals?.url || page.image?.url) ||
      null;

    const thumb =
      pickThumbFromImagesMap(page.image?.images) ||
      pickThumbFromImagesMap(page.image_adjusted?.images) ||
      imageUrl ||
      undefined;

    if (videoUrl) {
      items.push({
        index: idx,
        type: 'video',
        url: videoUrl,
        thumbnail_url: thumb,
        title: `Page ${idx + 1}`,
      });
    } else if (imageUrl) {
      items.push({
        index: idx,
        type: isGifUrl(imageUrl) ? 'gif' : 'image',
        url: imageUrl,
        thumbnail_url: thumb,
        title: `Page ${idx + 1}`,
      });
    }
  });

  return items;
}
