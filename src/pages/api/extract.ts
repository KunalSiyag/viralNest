import type { APIRoute } from 'astro';
import {
  findGifUrlFromImages,
  isGifUrl,
  pinLooksLikeGif,
  resolvePinGifUrl,
  toPlayablePinVideoUrl,
  toPublicPinImageUrl,
} from '../../lib/pin-media';

export const prerender = false;

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const RESERVED_PATHS = new Set([
  'pin',
  'ideas',
  'search',
  'categories',
  'today',
  'business',
  'about',
  'blog',
  'settings',
  'resource',
  'videos',
  'news_hub',
  'premium',
  'shop',
  'shopping',
  'homefeed',
  'following',
  'login',
  'signup',
  'join',
  'password',
  'secure',
  'oauth',
  'css',
  'js',
  '_',
  'webapp',
]);

/** Profile sub-paths that look like a second segment but still mean "profile" */
const PROFILE_SUB_PATHS = new Set([
  '_saved',
  '_pins',
  '_created',
  '_activity',
  '_followers',
  '_following',
  '_tried',
]);

type UrlKind = 'pin' | 'board' | 'profile' | 'other';

interface CollectionPin {
  pin_id: string;
  url: string;
  title: string;
  image_url: string;
  thumbnail_url: string;
  video_url?: string | null;
  is_video: boolean;
}

/** One slide of a carousel / multi-page Idea Pin */
interface MediaItem {
  index: number;
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnail_url?: string;
  title?: string;
}

// Helper to generate 5 harmonious colors from a dominant hex color
function generatePalette(baseHex?: string | null): string[] {
  let hex = (baseHex || '#E11D48').replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(hex)) hex = 'E11D48';

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const toHex = (num: number) =>
    Math.min(255, Math.max(0, Math.round(num))).toString(16).padStart(2, '0');

  const c1 = `#${hex.toUpperCase()}`;
  const c2 =
    `#${toHex(r + (255 - r) * 0.45)}${toHex(g + (255 - g) * 0.45)}${toHex(b + (255 - b) * 0.45)}`.toUpperCase();
  const c3 = `#${toHex(r * 0.55)}${toHex(g * 0.55)}${toHex(b * 0.55)}`.toUpperCase();
  const c4 =
    `#${toHex(255 - r * 0.75)}${toHex(255 - g * 0.75)}${toHex(255 - b * 0.75)}`.toUpperCase();
  const c5 = `#${toHex((r + 240) / 2)}${toHex((g + 240) / 2)}${toHex((b + 240) / 2)}`.toUpperCase();

  return [c1, c2, c3, c4, c5];
}

function extractTagsFromText(text?: string | null): string[] {
  if (!text) return [];
  const found: string[] = [];

  const hashtagMatches = text.match(/#([a-zA-Z0-9_]+)/g);
  if (hashtagMatches) {
    hashtagMatches.forEach((tag) => found.push(tag.replace('#', '').toLowerCase()));
  }

  const words = text
    .replace(/[^\w\s]/gi, ' ')
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 3 &&
        ![
          'http',
          'https',
          'www',
          'pinterest',
          'com',
          'this',
          'that',
          'with',
          'from',
          'your',
          'have',
          'more',
          'about',
        ].includes(w.toLowerCase()),
    );

  words.forEach((w) => found.push(w.toLowerCase()));
  return Array.from(new Set(found)).slice(0, 10);
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => {
      try {
        return String.fromCodePoint(Number(n));
      } catch {
        return _;
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => {
      try {
        return String.fromCodePoint(parseInt(h, 16));
      } catch {
        return _;
      }
    });
}

function metaContent(html: string, prop: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      'i',
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
      'i',
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeHtmlEntities(m[1]);
  }
  return null;
}

function classifyPinterestUrl(rawUrl: string): {
  kind: UrlKind;
  username?: string;
  boardSlug?: string;
} {
  try {
    const u = new URL(rawUrl);
    if (/pin\.it$/i.test(u.hostname) || u.hostname.includes('pin.it')) {
      return { kind: 'pin' };
    }
    const parts = u.pathname.split('/').filter(Boolean);
    if (!parts.length) return { kind: 'other' };

    const first = parts[0].toLowerCase();
    if (first === 'pin') return { kind: 'pin' };
    if (RESERVED_PATHS.has(first)) return { kind: 'other' };

    // /username/_saved, /username/_pins, etc. are still profile pages
    if (parts.length >= 2 && PROFILE_SUB_PATHS.has(parts[1].toLowerCase())) {
      return { kind: 'profile', username: parts[0] };
    }

    // /username/board-slug[/...]
    if (parts.length >= 2 && !RESERVED_PATHS.has(parts[1].toLowerCase())) {
      return { kind: 'board', username: parts[0], boardSlug: parts[1] };
    }

    // /username/
    if (parts.length === 1) {
      return { kind: 'profile', username: parts[0] };
    }

    return { kind: 'other' };
  } catch {
    return { kind: 'other' };
  }
}

function extractPinIdsFromHtml(html: string, limit = 120): string[] {
  const idsSet = new Set<string>();
  const pinUrls = [...html.matchAll(/\/pin\/(\d{6,})\//g)].map((m) => m[1]);
  pinUrls.forEach((id) => idsSet.add(id));

  const scripts = [...html.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const s of scripts) {
    try {
      const content = s[1];
      const matches = [...content.matchAll(/"id"\s*:\s*"(\d{10,})"/g)].map((m) => m[1]);
      matches.forEach((id) => idsSet.add(id));
    } catch {}
  }

  return Array.from(idsSet).slice(0, limit);
}

function extractBoardsFromReduxState(html: string): { name: string; url: string; pin_count?: number }[] {
  const boards: { name: string; url: string; pin_count?: number }[] = [];
  const scriptMatches = [...html.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const s of scriptMatches) {
    try {
      const obj = JSON.parse(s[1]);
      const reduxState = obj?.initialReduxState;
      if (reduxState?.boards) {
        const rawBoards = Object.values(reduxState.boards) as any[];
        for (const b of rawBoards) {
          if (b && b.name && b.url) {
            boards.push({
              name: String(b.name),
              url: b.url.startsWith('http') ? b.url : `https://www.pinterest.com${b.url}`,
              pin_count: typeof b.pin_count === 'number' ? b.pin_count : b.pinCount,
            });
          }
        }
      }
    } catch {}
  }
  return boards;
}

/**
 * Upgrade any avatar-sized Pinterest image URL to the highest resolution.
 * Handles all known size prefixes including RS (resize) and plain dimension variants.
 */
function upgradeAvatarUrl(url: string): string {
  // /originals/ is 403 from Akamai now; 1200x is the largest public size.
  return toPublicPinImageUrl(url);
}

/**
 * Check if a pinimg URL looks like a profile avatar (as opposed to a pin/board image).
 * Avatar URLs typically live under specific size-prefixed directories.
 */
function isPinimgAvatarUrl(url: string): boolean {
  return /i\.pinimg\.com\/(?:30x30_RS|50x50_RS|75x75_RS|140x140_RS|280x280_RS|600x600_RS|150x150|170x|280x280|originals)\//.test(url);
}

/**
 * Extract the user's profile avatar URL from the page HTML.
 * Strategy (in priority order):
 *   1. Parse initialReduxState.users for image_xlarge_url / image_large_url
 *   2. Scan <img> tags whose src matches pinimg.com avatar size patterns
 *   3. Look for avatar URLs in JSON-LD or inline script data
 */
function extractAvatarFromHtml(html: string, targetUsername?: string): string | null {
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
            return upgradeAvatarUrl(avatarUrl);
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
              return upgradeAvatarUrl(avatarUrl);
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
    return upgradeAvatarUrl(imgMatches[0][1]);
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
        return upgradeAvatarUrl(avatarInScript[1]);
      }
    } catch {}
  }

  return null;
}

function upgradePinImageUrl(url?: string | null): string | null {
  if (!url) return null;
  return toPublicPinImageUrl(url);
}

function extractVideoUrlsFromHtml(
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

function extractGifUrlsFromHtml(html: string): string[] {
  const matches = [
    ...html.matchAll(/(https?:\\?\/\\?[^"'\s<>]+\.gif(?:\?[^"'\s<>]*)?)/gi),
  ].map((m) => m[1].replace(/\\/g, ''));
  return matches.filter((u) => u.includes('pinimg.com') && isGifUrl(u));
}

function applyGifToMediaItems(
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

function pickBestImageFromImagesMap(images: any): string | null {
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

function pickThumbFromImagesMap(images: any): string | null {
  if (!images || typeof images !== 'object') return null;
  return (
    images['236x']?.url ||
    images['474x']?.url ||
    images['564x']?.url ||
    images['736x']?.url ||
    pickBestImageFromImagesMap(images)
  );
}

function pickBestVideoUrl(videos: any): string | null {
  if (!videos) return null;
  const list = videos.video_list || videos.videoList || videos;
  if (!list || typeof list !== 'object') return null;

  const entries = Object.entries(list) as [string, any][];
  const score = (url: string) => {
    if (/\/1080p\//i.test(url) || /1080w/i.test(url)) return 4;
    if (/\/720p\//i.test(url) || /720w/i.test(url)) return 3;
    if (/expMp4/i.test(url)) return 0;
    return 1;
  };
  const mp4s = entries
    .filter(([, v]) => v?.url && typeof v.url === 'string' && v.url.includes('.mp4'))
    .map(([key, v]) => ({
      key,
      url: v.url as string,
      height: Number(v.height || 0),
      width: Number(v.width || 0),
    }))
    .sort((a, b) => score(b.url) - score(a.url) || b.height - a.height || b.width - a.width);

  return mp4s[0]?.url ? toPlayablePinVideoUrl(mp4s[0].url) : null;
}

function videoQualitiesFromList(videos: any): { label: string; url: string; width?: number; height?: number }[] {
  if (!videos) return [];
  const list = videos.video_list || videos.videoList;
  if (!list || typeof list !== 'object') return [];
  const out: { label: string; url: string; width?: number; height?: number }[] = [];
  for (const [key, item] of Object.entries(list) as [string, any][]) {
    if (item?.url && String(item.url).includes('.mp4')) {
      const url = toPlayablePinVideoUrl(item.url);
      if (out.some((q) => q.url === url)) continue;
      out.push({
        label: key.replace(/^V_/, '').replace(/EXP/i, 'HD '),
        url,
        width: item.width,
        height: item.height,
      });
    }
  }
  return out;
}

/** Official PinResource API — includes full carousel_slots (HTML/pidget only return cover). */
async function fetchPinResource(pinId: string): Promise<any | null> {
  const fieldSets = ['unauth_react_main_pin', 'detailed'];
  for (const field_set_key of fieldSets) {
    try {
      const payload = {
        options: { field_set_key, id: String(pinId) },
        context: {},
      };
      const endpoint = `https://www.pinterest.com/resource/PinResource/get/?data=${encodeURIComponent(
        JSON.stringify(payload),
      )}&source_url=/pin/${pinId}/`;
      const res = await fetch(endpoint, {
        headers: {
          'User-Agent': BROWSER_UA,
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Pinterest-PWS-Handler': 'www/pin/[id].js',
          Referer: `https://www.pinterest.com/pin/${pinId}/`,
        },
      });
      if (!res.ok) continue;
      const json = await res.json();
      const data = json?.resource_response?.data;
      if (data && (data.id || data.images || data.carousel_data || data.story_pin_data)) {
        return data;
      }
    } catch (e) {
      console.warn(`PinResource ${field_set_key} error:`, e);
    }
  }
  return null;
}

function mediaItemsFromCarousel(carouselData: any): MediaItem[] {
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

function mediaItemsFromStoryPages(pages: any[]): MediaItem[] {
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

function buildResponseFromPinResource(data: any, pinId: string) {
  const title =
    decodeHtmlEntities(
      data.title ||
        data.grid_title ||
        data.closeup_unified_title ||
        data.seo_title ||
        data.rich_metadata?.title ||
        '',
    ).trim() || `Pinterest Pin`;

  const description = decodeHtmlEntities(
    data.description ||
      data.closeup_unified_description ||
      data.seo_description ||
      data.grid_description ||
      '',
  ).trim();

  const dominantColor = data.dominant_color || data.dominantColor || null;

  // Prefer full carousel, then multi-page story/idea pin, then cover media
  let mediaItems = mediaItemsFromCarousel(data.carousel_data || data.carouselData);
  if (mediaItems.length <= 1) {
    const storyPages =
      data.story_pin_data?.pages || data.storyPinData?.pages || null;
    const fromStory = mediaItemsFromStoryPages(Array.isArray(storyPages) ? storyPages : []);
    if (fromStory.length > mediaItems.length) {
      mediaItems = fromStory;
    }
  }

  let videoQualities = videoQualitiesFromList(data.videos);
  let videoUrl = pickBestVideoUrl(data.videos);
  let imageUrl =
    pickBestImageFromImagesMap(data.images) ||
    upgradePinImageUrl(data.image_medium_url) ||
    null;
  let thumbnailUrl =
    pickThumbFromImagesMap(data.images) || imageUrl;

  const gifUrl = resolvePinGifUrl(data, imageUrl);
  const isGif = pinLooksLikeGif(data, gifUrl || imageUrl) || !!gifUrl;
  if (gifUrl) imageUrl = gifUrl;

  // If multi-slide, use first slide as primary preview — but never replace
  // an animated GIF cover with a JPEG still of frame 1.
  if (mediaItems.length > 0) {
    const first = mediaItems[0];
    if (first.type === 'video') {
      videoUrl = first.url;
      if (!videoQualities.some((q) => q.url === first.url)) {
        videoQualities = [{ label: 'Carousel MP4', url: first.url }, ...videoQualities];
      }
    }
    if (first.thumbnail_url) thumbnailUrl = first.thumbnail_url;
    if (first.type === 'gif') {
      imageUrl = first.url;
    } else if (first.type === 'image' && !(isGif && imageUrl && isGifUrl(imageUrl))) {
      imageUrl = first.url;
    } else if (!imageUrl && first.thumbnail_url) {
      imageUrl = first.thumbnail_url;
    }
  }

  if (isGif && imageUrl && isGifUrl(imageUrl)) {
    mediaItems = applyGifToMediaItems(mediaItems, imageUrl, thumbnailUrl, title);
  }

  // Single cover-only pin: still expose one media item for consistent UI
  if (mediaItems.length === 0) {
    if (isGif && imageUrl) {
      mediaItems.push({
        index: 0,
        type: 'gif',
        url: imageUrl,
        thumbnail_url: thumbnailUrl || imageUrl,
        title,
      });
    } else if (videoUrl) {
      mediaItems.push({
        index: 0,
        type: 'video',
        url: videoUrl,
        thumbnail_url: thumbnailUrl || undefined,
        title,
      });
    } else if (imageUrl) {
      mediaItems.push({
        index: 0,
        type: 'image',
        url: imageUrl,
        thumbnail_url: thumbnailUrl || imageUrl,
        title,
      });
    }
  }

  if (!videoUrl && !imageUrl && mediaItems.length === 0) return null;

  const tagsSet = new Set<string>();
  if (Array.isArray(data.hashtags)) {
    data.hashtags.forEach((h: any) => {
      if (typeof h === 'string') tagsSet.add(h.replace(/^#/, '').toLowerCase());
    });
  }
  extractTagsFromText(title).forEach((t) => tagsSet.add(t));
  extractTagsFromText(description).forEach((t) => tagsSet.add(t));

  const colorPalette = generatePalette(dominantColor);
  const isCarousel = mediaItems.length > 1;

  return {
    platform: 'pinterest',
    pin_id: String(data.id || pinId),
    video_url: videoUrl,
    thumbnail_url: thumbnailUrl,
    image_url: imageUrl,
    title,
    description,
    qualities: videoQualities,
    tags: Array.from(tagsSet).slice(0, 8),
    colors: colorPalette,
    dominant_color: dominantColor || colorPalette[0],
    is_video: !!videoUrl,
    is_gif: isGif || mediaItems.some((m) => m.type === 'gif'),
    is_carousel: isCarousel,
    media_count: mediaItems.length,
    media_items: mediaItems,
  };
}

function mapPidgetPin(raw: any): CollectionPin | null {
  if (!raw?.id) return null;

  const images = raw.images || {};
  const thumb =
    images['236x']?.url ||
    images['237x']?.url ||
    images['474x']?.url ||
    images['564x']?.url ||
    null;
  const mid =
    images['564x']?.url ||
    images['736x']?.url ||
    images['474x']?.url ||
    thumb;
  const imageUrl = upgradePinImageUrl(mid) || mid || thumb;
  if (!imageUrl) return null;

  const videoUrl = pickBestVideoUrl(raw.videos);
  const isVideo = !!(raw.is_video || videoUrl);
  const candidates = [
    raw.rich_metadata?.title,
    raw.grid_title,
    raw.title,
    raw.description,
  ]
    .map((v) => (v == null ? '' : decodeHtmlEntities(String(v)).trim()))
    .filter(Boolean);

  return {
    pin_id: String(raw.id),
    url: `https://www.pinterest.com/pin/${raw.id}/`,
    title: candidates[0] || `Pin ${String(raw.id).slice(-6)}`,
    image_url: imageUrl,
    thumbnail_url: thumb || imageUrl,
    video_url: videoUrl,
    is_video: isVideo,
  };
}

async function fetchPidgetPins(pinIds: string[]): Promise<CollectionPin[]> {
  if (!pinIds.length) return [];

  const chunkSize = 20;
  const results: CollectionPin[] = [];

  for (let i = 0; i < pinIds.length; i += chunkSize) {
    const chunk = pinIds.slice(i, i + chunkSize);
    try {
      const endpoint = `https://widgets.pinterest.com/v3/pidgets/pins/info/?pin_ids=${chunk.join(',')}`;
      const res = await fetch(endpoint, {
        headers: {
          'User-Agent': BROWSER_UA,
          Accept: 'application/json',
          Referer: 'https://www.pinterest.com/',
        },
      });
      if (!res.ok) {
        console.warn(`Pidgets API ${res.status} for chunk starting ${chunk[0]}`);
        continue;
      }
      const json = await res.json();
      const rows = Array.isArray(json?.data) ? json.data : [];
      for (const row of rows) {
        const mapped = mapPidgetPin(row);
        if (mapped) results.push(mapped);
      }
    } catch (e) {
      console.warn('Pidgets batch error:', e);
    }
  }

  // Preserve original pin-id order where possible
  const byId = new Map(results.map((p) => [p.pin_id, p]));
  return pinIds.map((id) => byId.get(id)).filter((p): p is CollectionPin => !!p);
}

async function fetchOembedFallback(pinId: string): Promise<CollectionPin | null> {
  try {
    const oembedRes = await fetch(
      `https://www.pinterest.com/oembed.json?url=${encodeURIComponent(`https://www.pinterest.com/pin/${pinId}/`)}`,
    );
    if (!oembedRes.ok) return null;
    const data = await oembedRes.json();
    const thumb = data.thumbnail_url as string | undefined;
    if (!thumb) return null;
    const imageUrl = upgradePinImageUrl(thumb) || thumb;
    return {
      pin_id: pinId,
      url: `https://www.pinterest.com/pin/${pinId}/`,
      title: decodeHtmlEntities(data.title || `Pin ${pinId.slice(-6)}`),
      image_url: imageUrl,
      thumbnail_url: thumb,
      video_url: null,
      is_video: false,
    };
  } catch {
    return null;
  }
}

async function hydrateCollectionPins(pinIds: string[]): Promise<CollectionPin[]> {
  const fromPidgets = await fetchPidgetPins(pinIds);
  if (fromPidgets.length >= Math.min(pinIds.length, 3)) {
    return fromPidgets;
  }

  // Sparse pidget response — fill missing ids via oEmbed
  const have = new Set(fromPidgets.map((p) => p.pin_id));
  const missing = pinIds.filter((id) => !have.has(id)).slice(0, 12);
  const extras = (
    await Promise.all(missing.map((id) => fetchOembedFallback(id)))
  ).filter((p): p is CollectionPin => !!p);

  const merged = [...fromPidgets, ...extras];
  const byId = new Map(merged.map((p) => [p.pin_id, p]));
  return pinIds.map((id) => byId.get(id)).filter((p): p is CollectionPin => !!p);
}

/** Paginate Pinterest resource APIs to fetch pins beyond the initial HTML page. */
async function paginateResourcePins(
  resourceName: string,
  resourceOptions: Record<string, any>,
  existingIds: Set<string>,
  maxTotal: number,
  maxPages: number = 6,
): Promise<CollectionPin[]> {
  const collected: CollectionPin[] = [];
  let bookmark: string | null | undefined = undefined;

  for (let page = 0; page < maxPages; page++) {
    if (existingIds.size + collected.length >= maxTotal) break;

    const payload: any = {
      options: {
        ...resourceOptions,
        field_set_key: 'unauth_react_main_pin',
        page_size: 25,
      },
      context: {},
    };
    if (bookmark) {
      payload.options.bookmarks = [bookmark];
    }

    try {
      const sourceUrl = resourceOptions.username
        ? `/${resourceOptions.username}/`
        : resourceOptions.board_url || '/';
      const endpoint = `https://www.pinterest.com/resource/${resourceName}/get/?data=${encodeURIComponent(
        JSON.stringify(payload),
      )}&source_url=${encodeURIComponent(sourceUrl)}`;

      const res = await fetch(endpoint, {
        headers: {
          'User-Agent': BROWSER_UA,
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest',
          Referer: `https://www.pinterest.com${sourceUrl}`,
        },
      });

      if (!res.ok) {
        console.warn(`Pagination ${resourceName} page ${page}: HTTP ${res.status}`);
        break;
      }

      const json = await res.json();
      const data = json?.resource_response?.data;
      const newBookmark = json?.resource_response?.bookmark;

      if (!Array.isArray(data) || data.length === 0) break;

      for (const pin of data) {
        const pinId = String(pin?.id || '');
        if (pinId && !existingIds.has(pinId)) {
          existingIds.add(pinId);
          const mapped = mapPidgetPin(pin);
          if (mapped) collected.push(mapped);
        }
      }

      if (!newBookmark || newBookmark === '-end-') break;
      bookmark = newBookmark;

      // Respectful delay between pagination requests (avoid rate limits)
      await new Promise((r) => setTimeout(r, 350));
    } catch (e) {
      console.warn(`Pagination ${resourceName} page ${page} error:`, e);
      break;
    }
  }

  return collected;
}

function collectionTitleFromHtml(
  html: string,
  kind: 'board' | 'profile',
  username?: string,
  boardSlug?: string,
): string {
  const og = metaContent(html, 'og:title') || metaContent(html, 'twitter:title');
  if (og) {
    return og
      .replace(/\s*[|–-]\s*Pinterest\s*$/i, '')
      .replace(/\s+on Pinterest\s*$/i, '')
      .trim();
  }
  if (kind === 'board' && boardSlug) {
    const pretty = boardSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return username ? `${pretty} — @${username}` : pretty;
  }
  if (kind === 'profile' && username) return `@${username}`;
  return kind === 'board' ? 'Pinterest Board' : 'Pinterest Profile';
}

const BLOCKED_USER_AGENTS = [
  'pinterest',
  'pinterestbot',
  'markmonitor',
  'corsearch',
  'opsec',
  'brandsec',
  'removeyourmedia',
  'picscout',
];

/** Registered DMCA / Takedown Pin IDs (populatable upon request) */
const BLOCKED_PINS = new Set<string>([
  // Example: '123456789'
]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. DMCA / Bot User-Agent Protection
    const ua = (request.headers.get('user-agent') || '').toLowerCase();
    if (BLOCKED_USER_AGENTS.some((bot) => ua.includes(bot))) {
      return jsonResponse({ error: 'Access denied.' }, 403);
    }

    // 2. Origin & Referer Verification (Protects against external API scraping)
    const referer = request.headers.get('referer') || '';
    const origin = request.headers.get('origin') || '';

    const isAllowedOrigin =
      !origin ||
      origin.includes('pintdownload.app') ||
      origin.includes('vercel.app') ||
      origin.includes('workers.dev') ||
      origin.includes('pages.dev') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      referer.includes('pintdownload.app') ||
      referer.includes('vercel.app') ||
      referer.includes('workers.dev') ||
      referer.includes('pages.dev') ||
      referer.includes('localhost');

    if (!isAllowedOrigin) {
      return jsonResponse({ error: 'Direct API scraping is unauthorized.' }, 403);
    }

    const body = await request.json().catch(() => ({}));
    const { url, intent } = body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return jsonResponse({ error: 'Please enter a valid Pinterest link.' }, 400);
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    // 3. Pin Takedown / Blacklist Check
    const pinIdCheck = targetUrl.match(/\/pin\/(?:[\w-]+--)?(\d+)/);
    if (pinIdCheck?.[1] && BLOCKED_PINS.has(pinIdCheck[1])) {
      return jsonResponse({ error: 'This content has been removed upon author request.' }, 451);
    }

    const isPinterestUrl =
      /^https?:\/\/(www\.|in\.|uk\.|br\.|id\.|jp\.|de\.|fr\.|es\.|it\.|ca\.|au\.)?(pinterest\.[a-z.]+|pin\.it)\//i.test(
        targetUrl,
      );
    if (!isPinterestUrl) {
      return jsonResponse(
        {
          error:
            'Invalid link. Please enter a valid Pinterest link (e.g., https://pinterest.com/pin/... or https://pin.it/...)',
        },
        400,
      );
    }

    // Resolve pin.it shortlink or follow redirects
    if (targetUrl.includes('pin.it')) {
      try {
        const shortRes = await fetch(targetUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: { 'User-Agent': BROWSER_UA },
        });
        if (shortRes.url) targetUrl = shortRes.url;
      } catch (e) {
        console.warn('Shortlink resolution warning:', e);
      }
    }

    // Fetch Pinterest page HTML
    let html = '';
    try {
      const fetchResponse = await fetch(targetUrl, {
        redirect: 'follow',
        headers: {
          'User-Agent': BROWSER_UA,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
      });
      if (fetchResponse.ok) {
        html = await fetchResponse.text();
        if (fetchResponse.url) targetUrl = fetchResponse.url;
      }
    } catch (fetchErr: any) {
      console.error('Fetch error for Pinterest URL:', fetchErr);
    }

    const classified = classifyPinterestUrl(targetUrl);

    // ── Avatar-only intent (profile-picture downloader) ──────────────
    if (intent === 'avatar' && (classified.kind === 'profile' || classified.kind === 'board')) {
      // Strategy: extract the actual avatar (not pin collage) in priority order:
      //  1. Parse avatar from embedded HTML/Redux state (most reliable)
      //  2. Pinterest UserResource API
      //  3. og:image ONLY if it looks like an avatar URL (not a pin collage)

      let profileAvatarUrl: string | null = null;

      // ── 1. Extract avatar from HTML (Redux state + <img> tags) ──────
      profileAvatarUrl = extractAvatarFromHtml(html, classified.username);

      // ── 2. Pinterest UserResource API ──────────────────────────────
      if (!profileAvatarUrl && classified.username) {
        try {
          const userPayload = {
            options: { username: classified.username, field_set_key: 'unauth_react' },
            context: {},
          };
          const userEndpoint = `https://www.pinterest.com/resource/UserResource/get/?data=${encodeURIComponent(
            JSON.stringify(userPayload),
          )}&source_url=/${classified.username}/`;
          const userRes = await fetch(userEndpoint, {
            headers: {
              'User-Agent': BROWSER_UA,
              Accept: 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              Referer: `https://www.pinterest.com/${classified.username}/`,
            },
          });
          if (userRes.ok) {
            const userJson = await userRes.json();
            const userData = userJson?.resource_response?.data;
            if (userData) {
              const apiAvatar =
                userData.image_xlarge_url ||
                userData.image_large_url ||
                userData.image_medium_url ||
                null;
              if (apiAvatar) {
                profileAvatarUrl = upgradeAvatarUrl(apiAvatar);
              }
            }
          }
        } catch (e) {
          console.warn('UserResource avatar fetch warning:', e);
        }
      }

      // ── 3. og:image fallback — ONLY if it's actually an avatar ─────
      if (!profileAvatarUrl) {
        const ogImage =
          metaContent(html, 'og:image') ||
          metaContent(html, 'twitter:image') ||
          null;
        // Only use og:image if it looks like an avatar (contains avatar size prefix).
        // Pinterest og:image for profiles usually returns a pin collage which is NOT
        // an avatar — those use /736x/ or /564x/ or /474x/ prefixes and contain
        // different hash paths.
        if (ogImage && isPinimgAvatarUrl(ogImage)) {
          profileAvatarUrl = upgradeAvatarUrl(ogImage);
        }
      }

      const profileTitle = collectionTitleFromHtml(
        html,
        'profile',
        classified.username,
      );

      if (!profileAvatarUrl) {
        return jsonResponse(
          {
            error:
              'Could not find a profile picture for this Pinterest user. The profile may be private.',
          },
          400,
        );
      }

      return jsonResponse({
        platform: 'pinterest',
        is_avatar_only: true,
        is_profile: true,
        profile_avatar_url: profileAvatarUrl,
        username: classified.username || null,
        profile_title: profileTitle,
      });
    }

    // ── Single pin via PinResource (carousel + story slides) ─────────────
    // Prefer this over HTML: pidgets/og only return the cover image.
    if (classified.kind === 'pin' || targetUrl.includes('/pin/')) {
      const pinIdMatch = targetUrl.match(/\/pin\/(?:[\w-]+--)?(\d+)/);
      const pinId = pinIdMatch?.[1];
      if (pinId) {
        const resourceData = await fetchPinResource(pinId);
        if (resourceData) {
          const built = buildResponseFromPinResource(resourceData, pinId);
          if (built) {
            // If Pidgets returned no video, check HTML for HLS .m3u8 or expMp4 video streams
            if (!built.is_gif && html) {
              const htmlGifs = extractGifUrlsFromHtml(html);
              if (htmlGifs[0]) {
                built.image_url = htmlGifs[0];
                built.is_gif = true;
                built.media_items = applyGifToMediaItems(
                  Array.isArray(built.media_items) ? built.media_items : [],
                  htmlGifs[0],
                  built.thumbnail_url,
                  built.title,
                );
                built.media_count = built.media_items.length;
              }
            }
            // Don't treat unrelated page MP4s as the pin when we already have a GIF.
            if (!built.is_video && !built.is_gif && html) {
              const scannedVideos = extractVideoUrlsFromHtml(html);
              if (scannedVideos.length > 0) {
                built.video_url = scannedVideos[0].url;
                built.is_video = true;
                built.qualities = scannedVideos;
              }
            }
            return jsonResponse(built);
          }
        }
      }
    }

    // ── Board / Profile collection extraction ────────────────────────────
    if ((classified.kind === 'board' || classified.kind === 'profile') && html) {
      const pinIds = extractPinIdsFromHtml(html, classified.kind === 'profile' ? 200 : 250);
      let pins = pinIds.length > 0 ? await hydrateCollectionPins(pinIds) : [];

      // Paginate for more pins beyond the initial HTML page
      const existingIds = new Set(pins.map((p) => p.pin_id));
      const maxTotal = classified.kind === 'profile' ? 200 : 250;

      if (pins.length < maxTotal) {
        try {
          const resourceName =
            classified.kind === 'profile' ? 'UserPinsResource' : 'BoardFeedResource';
          const resourceOptions =
            classified.kind === 'profile'
              ? { username: classified.username }
              : { board_url: `/${classified.username}/${classified.boardSlug}/` };

          const paginatedPins = await paginateResourcePins(
            resourceName,
            resourceOptions,
            existingIds,
            maxTotal,
            8,
          );

          if (paginatedPins.length > 0) {
            pins = [...pins, ...paginatedPins];
          }
        } catch (e) {
          console.warn('Pagination failed, using HTML-only pins:', e);
        }
      }

      if (pins.length > 0) {
          const title = collectionTitleFromHtml(
            html,
            classified.kind,
            classified.username,
            classified.boardSlug,
          );

          if (classified.kind === 'board') {
            return jsonResponse({
              platform: 'pinterest',
              is_board: true,
              is_profile: false,
              board_title: title,
              board_url: targetUrl,
              username: classified.username || null,
              pins,
              pin_count: pins.length,
            });
          }

          // Extract the real avatar (not pin collage from og:image)
          let profileAvatarUrl = extractAvatarFromHtml(html, classified.username);
          if (!profileAvatarUrl) {
            const ogImage =
              metaContent(html, 'og:image') ||
              metaContent(html, 'twitter:image') ||
              null;
            if (ogImage && isPinimgAvatarUrl(ogImage)) {
              profileAvatarUrl = upgradeAvatarUrl(ogImage);
            }
          }

          const profileBoards = extractBoardsFromReduxState(html);

          return jsonResponse({
            platform: 'pinterest',
            is_board: false,
            is_profile: true,
            profile_title: title,
            profile_url: targetUrl,
            profile_avatar_url: profileAvatarUrl,
            username: classified.username || null,
            board_title: title,
            board_url: targetUrl,
            boards: profileBoards,
            pins,
            pin_count: pins.length,
          });
        }

      return jsonResponse(
        {
          error:
            classified.kind === 'profile'
              ? 'Could not find public pins on this Pinterest profile. The profile may be private or empty.'
              : 'Could not find public pins on this Pinterest board. The board may be private or empty.',
        },
        400,
      );
    }

    // ── Single pin extraction ────────────────────────────────────────────
    let videoUrl: string | null = null;
    let thumbnailUrl: string | null = null;
    let imageUrl: string | null = null;
    let title: string | null = null;
    let description: string | null = null;
    let dominantColor: string | null = null;
    let videoQualities: { label: string; url: string; width?: number; height?: number }[] = [];
    let tagsSet = new Set<string>();

    if (html) {
      // Strategy 1: Parse window.__PWS_RELAY_REGISTER_COMPLETED_REQUEST__
      const relayMatches = [
        ...html.matchAll(
          /window\.__PWS_RELAY_REGISTER_COMPLETED_REQUEST__\s*\(\s*"([^"]+)"\s*,\s*(\{[\s\S]*?\})\s*\)/g,
        ),
      ];
      for (const match of relayMatches) {
        try {
          const payload = JSON.parse(match[2]);
          const pinData =
            payload?.data?.v3GetPinQueryv2?.data ||
            payload?.data?.v3GetPinQuery?.data ||
            payload?.data?.pin;
          if (pinData) {
            if (!title) title = pinData.title || pinData.gridTitle || pinData.seoTitle || null;
            if (!description) description = pinData.description || pinData.gridDescription || null;
            if (!dominantColor)
              dominantColor = pinData.dominantColor || pinData.dominant_color || null;

            if (Array.isArray(pinData.pinJoin?.annotations)) {
              pinData.pinJoin.annotations.forEach((a: any) => {
                if (a?.annotationText) tagsSet.add(a.annotationText.toLowerCase());
              });
            }
            if (Array.isArray(pinData.hashtags)) {
              pinData.hashtags.forEach((h: any) => {
                if (typeof h === 'string') tagsSet.add(h.toLowerCase());
              });
            }

            if (pinData.videos?.videoUrls && Array.isArray(pinData.videos.videoUrls)) {
              const seenUrls = new Set<string>();
              for (const rawUrl of pinData.videos.videoUrls) {
                if (typeof rawUrl !== 'string') continue;
                const vUrl = toPlayablePinVideoUrl(rawUrl);
                if (seenUrls.has(vUrl)) continue;
                seenUrls.add(vUrl);
                let label = 'SD MP4';
                if (vUrl.includes('1080w') || vUrl.includes('/1080p/')) label = '1080p Full HD';
                else if (vUrl.includes('720w') || vUrl.includes('/720p/')) label = '720p HD';
                else if (vUrl.includes('540w') || vUrl.includes('/540p/')) label = '540p';
                else if (vUrl.includes('360w') || vUrl.includes('/360p/')) label = '360p';

                videoQualities.push({ label, url: vUrl });
              }
            }

            if (pinData.videos?.video_list && typeof pinData.videos.video_list === 'object') {
              const list = pinData.videos.video_list;
              for (const key of Object.keys(list)) {
                const item = list[key];
                if (item && item.url && String(item.url).includes('.mp4')) {
                  const url = toPlayablePinVideoUrl(item.url);
                  if (videoQualities.some((q) => q.url === url)) continue;
                  videoQualities.push({
                    label: key.replace('V_', '').replace('EXP', 'HD '),
                    url,
                    width: item.width,
                    height: item.height,
                  });
                }
              }
            }

            const gifCandidate =
              findGifUrlFromImages(pinData.images) ||
              (pinData.images_orig?.url && isGifUrl(pinData.images_orig.url) ? pinData.images_orig.url : null) ||
              (pinData.images_originals?.url && isGifUrl(pinData.images_originals.url) ? pinData.images_originals.url : null);

            if (gifCandidate) {
              imageUrl = gifCandidate;
              thumbnailUrl = pinData.images_236x?.url || gifCandidate;
            } else if (pinData.images_236x?.url) {
              thumbnailUrl = pinData.images_236x.url;
              imageUrl = upgradePinImageUrl(pinData.images_236x.url) || pinData.images_236x.url;
            } else if (pinData.images && typeof pinData.images === 'object') {
              imageUrl = pickBestImageFromImagesMap(pinData.images);
              thumbnailUrl = pickThumbFromImagesMap(pinData.images) || imageUrl;
            }
          }
        } catch (e) {
          console.warn('Relay store parse error:', e);
        }
      }

      // Strategy 2: Parse legacy __PWS_DATA__ script tag fallback
      if (!videoQualities.length && !imageUrl) {
        const pwsMatch = html.match(
          /<script id="__PWS_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
        );
        if (pwsMatch && pwsMatch[1]) {
          try {
            const json = JSON.parse(pwsMatch[1]);
            const pins = json?.props?.initialReduxState?.pins;

            if (pins && typeof pins === 'object') {
              const pinList = Object.values(pins);
              const pinData = pinList[0] as any;
              if (pinData) {
                if (!title)
                  title =
                    pinData.title ||
                    pinData.grid_title ||
                    pinData.seo_title ||
                    pinData.rich_metadata?.title ||
                    null;
                if (!description)
                  description =
                    pinData.description ||
                    pinData.seo_description ||
                    pinData.rich_metadata?.description ||
                    null;
                if (!dominantColor)
                  dominantColor = pinData.dominant_color || pinData.dominantColor || null;

                if (pinData.images && typeof pinData.images === 'object') {
                  imageUrl = pickBestImageFromImagesMap(pinData.images);
                  thumbnailUrl = pickThumbFromImagesMap(pinData.images) || imageUrl;
                }

                if (Array.isArray(pinData.pin_join?.annotations)) {
                  pinData.pin_join.annotations.forEach((a: any) => {
                    if (a?.annotation_text) tagsSet.add(a.annotation_text.toLowerCase());
                  });
                }
              }
            }
          } catch (e) {
            console.warn('Error parsing __PWS_DATA__ JSON:', e);
          }
        }
      }

      // Strategy 3: Scan HTML for HLS .m3u8 and progressive MP4 video streams
      const scannedVideos = extractVideoUrlsFromHtml(html);
      for (const sv of scannedVideos) {
        if (!videoQualities.some((q) => q.url === sv.url)) {
          videoQualities.push(sv);
        }
      }

      // Fallbacks for Metadata (handles content-before-property attribute order)
      if (!title) {
        title = metaContent(html, 'og:title') || metaContent(html, 'twitter:title');
      }

      if (!description) {
        description =
          metaContent(html, 'og:description') || metaContent(html, 'twitter:description');
      }

      if (videoQualities.length > 0) {
        const hdMatch =
          videoQualities.find(
            (q) =>
              q.label.includes('1080p') ||
              q.url.includes('/1080p/') ||
              q.label.includes('720p') ||
              q.url.includes('/720p/') ||
              q.url.includes('720w'),
          ) || videoQualities[0];
        videoUrl = toPlayablePinVideoUrl(hdMatch.url);
      } else {
        const ogVideo = metaContent(html, 'og:video') || metaContent(html, 'og:video:secure_url');
        videoUrl = ogVideo ? toPlayablePinVideoUrl(ogVideo) : null;
      }

      if (!videoUrl) {
        const mp4RegexMatch =
          html.match(/https:\/\/v1\.pinimg\.com\/videos\/[^\s"'\\]+\.mp4/g) ||
          html.match(/https:\/\/736x\.pinimg\.com\/videos\/[^\s"'\\]+\.mp4/g);
        if (mp4RegexMatch && mp4RegexMatch.length > 0) {
          videoUrl = toPlayablePinVideoUrl(mp4RegexMatch[0]);
        }
      }

      if (!thumbnailUrl) {
        thumbnailUrl =
          metaContent(html, 'og:image') ||
          metaContent(html, 'og:image:secure_url') ||
          metaContent(html, 'twitter:image') ||
          metaContent(html, 'twitter:image:src');
        if (thumbnailUrl && !imageUrl) {
          imageUrl = upgradePinImageUrl(thumbnailUrl) || thumbnailUrl;
        }
      }

      const htmlGifs = extractGifUrlsFromHtml(html);
      if (htmlGifs[0]) {
        imageUrl = htmlGifs[0];
      }
    }

    // Strategy 3: OEmbed API Fallback if media is still missing
    if (!videoUrl && !imageUrl) {
      try {
        const oembedRes = await fetch(
          `https://www.pinterest.com/oembed.json?url=${encodeURIComponent(targetUrl)}`,
        );
        if (oembedRes.ok) {
          const oembedJson = await oembedRes.json();
          if (oembedJson.thumbnail_url) {
            thumbnailUrl = oembedJson.thumbnail_url;
            imageUrl = upgradePinImageUrl(oembedJson.thumbnail_url) || oembedJson.thumbnail_url;
          }
          if (!title && oembedJson.title) {
            title = oembedJson.title;
          }
        }
      } catch (e) {
        console.warn('OEmbed API fallback warning:', e);
      }
    }

    // Strategy 4: Pidgets API by Pin ID (replaces dead widgets pincdn endpoint)
    if (!videoUrl && !imageUrl) {
      const pinIdMatch = targetUrl.match(/\/pin\/(\d+)/);
      if (pinIdMatch?.[1]) {
        try {
          const pins = await fetchPidgetPins([pinIdMatch[1]]);
          if (pins[0]) {
            imageUrl = pins[0].image_url;
            thumbnailUrl = pins[0].thumbnail_url;
            if (pins[0].video_url) videoUrl = pins[0].video_url;
            if (!title) title = pins[0].title;
          }
        } catch (e) {
          console.warn('Pidgets pin fallback warning:', e);
        }
      }
    }

    if (!videoUrl && !imageUrl) {
      return jsonResponse(
        {
          error:
            'Could not find downloadable media for this link. Please check if the Pin is public.',
        },
        400,
      );
    }

    const titleTags = extractTagsFromText(title);
    const descTags = extractTagsFromText(description);
    titleTags.forEach((t) => tagsSet.add(t));
    descTags.forEach((t) => tagsSet.add(t));

    const finalTags = Array.from(tagsSet).slice(0, 8);
    const colorPalette = generatePalette(dominantColor);

    const isGif =
      !!(imageUrl && isGifUrl(imageUrl)) ||
      /(?:^|\b)gif(?:s|\b)/i.test(title || '') ||
      /(?:^|\b)gif(?:s|\b)/i.test(description || '');
    const mediaItems: MediaItem[] = [];
    if (isGif && imageUrl) {
      mediaItems.push({
        index: 0,
        type: 'gif',
        url: imageUrl,
        thumbnail_url: thumbnailUrl || imageUrl,
        title: title || 'Pinterest Pin',
      });
    } else if (videoUrl) {
      mediaItems.push({
        index: 0,
        type: 'video',
        url: videoUrl,
        thumbnail_url: thumbnailUrl || undefined,
        title: title || 'Pinterest Pin',
      });
    } else if (imageUrl) {
      mediaItems.push({
        index: 0,
        type: 'image',
        url: imageUrl,
        thumbnail_url: thumbnailUrl || imageUrl,
        title: title || 'Pinterest Pin',
      });
    }

    return jsonResponse({
      platform: 'pinterest',
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      image_url: imageUrl,
      title: title || 'Pinterest Pin',
      description: description || '',
      qualities: videoQualities,
      tags: finalTags,
      colors: colorPalette,
      dominant_color: dominantColor || colorPalette[0],
      is_video: !!videoUrl,
      is_gif: isGif,
      is_carousel: false,
      media_count: mediaItems.length,
      media_items: mediaItems,
    });
  } catch (error: any) {
    console.error('Unhandled Pinterest Extraction error:', error);
    return jsonResponse(
      {
        error: 'Failed to process Pinterest link. Please ensure the link is a valid public Pin.',
      },
      400,
    );
  }
};
