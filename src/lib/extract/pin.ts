/** Single-pin extraction: PinResource first, then HTML strategies 1–4 (moved from /api/extract). */
import {
  findGifUrlFromImages,
  isGifUrl,
  pinLooksLikeGif,
  resolvePinGifUrl,
  toPlayablePinVideoUrl,
} from '../pin-media';
import { decodeHtmlEntities, extractTagsFromText, generatePalette, metaContent } from './text';
import {
  applyGifToMediaItems,
  extractGifUrlsFromHtml,
  extractVideoUrlsFromHtml,
  isPinterestSiteAsset,
  mediaItemsFromCarousel,
  mediaItemsFromStoryPages,
  pickBestImageFromImagesMap,
  pickBestVideoUrl,
  pickThumbFromImagesMap,
  upgradePinImageUrl,
  videoQualitiesFromList,
} from './media';
import { fetchPidgetPins, fetchPinResource, type PinLookupStatus } from './upstream';
import type { FetchLike, MediaItem, PinBody, PinCreator } from './types';

export function buildResponseFromPinResource(data: any, pinId: string) {
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

const CREATOR_USERNAME = /^[A-Za-z0-9_]{1,30}$/;

/**
 * Creator + outbound link from a PinResource payload (MCP attribution).
 * Field names confirmed against a live `unauth_react_main_pin` response
 * (2026-10-14): native_creator / closeup_attribution / pinner each carry
 * { username, full_name }. Missing fields yield null; nothing is guessed.
 */
export function pinMetaFromResource(data: any): { creator: PinCreator | null; externalLink: string | null } {
  let creator: PinCreator | null = null;
  for (const candidate of [data?.native_creator, data?.closeup_attribution, data?.pinner]) {
    const username = candidate?.username;
    if (typeof username === 'string' && CREATOR_USERNAME.test(username)) {
      const fullName = candidate?.full_name;
      creator = {
        username,
        displayName: typeof fullName === 'string' && fullName.trim() ? fullName : null,
      };
      break;
    }
  }
  const link = data?.link;
  const externalLink = typeof link === 'string' && /^https?:\/\//i.test(link) ? link : null;
  return { creator, externalLink };
}

/**
 * PinResource path (carousel + story slides), with the HTML GIF/video
 * enrichment /api/extract applies. Returns null when PinResource has nothing.
 */
export async function extractPinViaResource(
  pinId: string,
  html: string,
  fetchImpl: FetchLike,
  lookup?: PinLookupStatus,
): Promise<{ body: PinBody; data: any } | null> {
  const resourceData = await fetchPinResource(pinId, fetchImpl, lookup);
  if (resourceData) {
    const built = buildResponseFromPinResource(resourceData, pinId);
    if (built) {
      // If Pidgets returned no video, check HTML for HLS .m3u8 or expMp4 video streams
      // A video pin is never a GIF: skip the HTML GIF scan entirely.
      if (!built.is_gif && !built.is_video && html) {
        const htmlGifs = extractGifUrlsFromHtml(html, [
          built.image_url,
          built.thumbnail_url,
        ]);
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
      return { body: built as PinBody, data: resourceData };
    }
  }
  return null;
}

/** HTML strategies 1–4 (relay store, __PWS_DATA__, page scan, oEmbed, pidgets). Null = no media. */
export async function extractPinFromHtml(
  html: string,
  targetUrl: string,
  fetchImpl: FetchLike,
): Promise<PinBody | null> {
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

    if (isPinterestSiteAsset(thumbnailUrl)) thumbnailUrl = null;
    if (isPinterestSiteAsset(imageUrl)) imageUrl = null;

    if (!videoUrl) {
      const htmlGifs = extractGifUrlsFromHtml(html, [imageUrl, thumbnailUrl]);
      if (htmlGifs[0]) {
        imageUrl = htmlGifs[0];
      }
    }
  }

  // Strategy 3: OEmbed API Fallback if media is still missing
  if (!videoUrl && !imageUrl) {
    try {
      const oembedRes = await fetchImpl(
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
        const pins = await fetchPidgetPins([pinIdMatch[1]], fetchImpl);
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
    return null;
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

  const body: PinBody = {
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
  };
  return body;
}
