/** Pinterest upstream calls (moved verbatim from src/pages/api/extract.ts; fetch is injectable). */
import { BROWSER_UA } from './constants';
import { decodeHtmlEntities } from './text';
import { avatarSizeCandidates, pickBestVideoUrl, upgradePinImageUrl } from './media';
import type { CollectionPin, FetchLike } from './types';

/** Set by fetchPinResource when Pinterest answers that the pin does not exist. */
export interface PinLookupStatus {
  notFound: boolean;
}

/** PinResource error body for a missing pin: {resource_response:{error:{http_status:404, code:50, api_error_code:50}}}. */
function isPinNotFound(json: any): boolean {
  const response = json?.resource_response;
  const error = response?.error;
  if (!error || response?.data) return false;
  return error.api_error_code === 50 || error.code === 50 || error.http_status === 404;
}

/** Official PinResource API — includes full carousel_slots (HTML/pidget only return cover). */
export async function fetchPinResource(
  pinId: string,
  fetchImpl: FetchLike,
  lookup?: PinLookupStatus,
): Promise<any | null> {
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
      const res = await fetchImpl(endpoint, {
        headers: {
          'User-Agent': BROWSER_UA,
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Pinterest-PWS-Handler': 'www/pin/[id].js',
          Referer: `https://www.pinterest.com/pin/${pinId}/`,
        },
      });
      if (!res.ok) {
        if (lookup && res.status === 404 && isPinNotFound(await res.json().catch(() => null))) lookup.notFound = true;
        continue;
      }
      const json = await res.json();
      if (lookup && isPinNotFound(json)) lookup.notFound = true;
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

/**
 * Title for a pin Pinterest gives no text for. Numeric ids keep the historic
 * "Pin 431342" (parity goldens); the opaque ids Pinterest's board feed now
 * returns (e1_…) get a bare "Pin". The islands and MCP treat both as "no
 * title" and print their own fallback.
 */
export function placeholderPinTitle(id: string): string {
  return /^\d+$/.test(id) ? `Pin ${id.slice(-6)}` : 'Pin';
}

export function mapPidgetPin(raw: any): CollectionPin | null {
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
    title: candidates[0] || placeholderPinTitle(String(raw.id)),
    image_url: imageUrl,
    thumbnail_url: thumb || imageUrl,
    video_url: videoUrl,
    is_video: isVideo,
  };
}

export async function fetchPidgetPins(pinIds: string[], fetchImpl: FetchLike): Promise<CollectionPin[]> {
  if (!pinIds.length) return [];

  const chunkSize = 20;
  const results: CollectionPin[] = [];

  for (let i = 0; i < pinIds.length; i += chunkSize) {
    const chunk = pinIds.slice(i, i + chunkSize);
    try {
      const endpoint = `https://widgets.pinterest.com/v3/pidgets/pins/info/?pin_ids=${chunk.join(',')}`;
      const res = await fetchImpl(endpoint, {
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

export async function fetchOembedFallback(pinId: string, fetchImpl: FetchLike): Promise<CollectionPin | null> {
  try {
    const oembedRes = await fetchImpl(
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
      title: decodeHtmlEntities(data.title || placeholderPinTitle(pinId)),
      image_url: imageUrl,
      thumbnail_url: thumb,
      video_url: null,
      is_video: false,
    };
  } catch {
    return null;
  }
}

export async function hydrateCollectionPins(pinIds: string[], fetchImpl: FetchLike): Promise<CollectionPin[]> {
  const fromPidgets = await fetchPidgetPins(pinIds, fetchImpl);
  if (fromPidgets.length >= Math.min(pinIds.length, 3)) {
    return fromPidgets;
  }

  // Sparse pidget response — fill missing ids via oEmbed
  const have = new Set(fromPidgets.map((p) => p.pin_id));
  const missing = pinIds.filter((id) => !have.has(id)).slice(0, 12);
  const extras = (
    await Promise.all(missing.map((id) => fetchOembedFallback(id, fetchImpl)))
  ).filter((p): p is CollectionPin => !!p);

  const merged = [...fromPidgets, ...extras];
  const byId = new Map(merged.map((p) => [p.pin_id, p]));
  return pinIds.map((id) => byId.get(id)).filter((p): p is CollectionPin => !!p);
}

/** Paginate Pinterest resource APIs to fetch pins beyond the initial HTML page. */
export async function paginateResourcePins(
  resourceName: string,
  resourceOptions: Record<string, any>,
  existingIds: Set<string>,
  maxTotal: number,
  maxPages: number = 6,
  fetchImpl: FetchLike,
): Promise<CollectionPin[]> {
  const collected: CollectionPin[] = [];
  let bookmark: string | null | undefined = undefined;

  for (let page = 0; page < maxPages; page++) {
    if (existingIds.size + collected.length >= maxTotal) break;

    const payload: any = {
      options: {
        field_set_key: 'unauth_react_main_pin',
        page_size: 25,
        ...resourceOptions,
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

      const res = await fetchImpl(endpoint, {
        headers: {
          'User-Agent': BROWSER_UA,
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest',
          // BoardFeedResource answers 403 "Invalid Resource Request" without
          // the board page's handler and source URL (live, 2026-10).
          ...(resourceOptions.username
            ? {}
            : { 'X-Pinterest-PWS-Handler': 'www/[username]/[slug].js', 'X-Pinterest-Source-Url': sourceUrl }),
          Referer: `https://www.pinterest.com${sourceUrl}`,
        },
      });

      if (!res.ok) {
        console.warn(`Pagination ${resourceName} page ${page}: HTTP ${res.status}`);
        break;
      }

      const json = await res.json();
      const data = json?.resource_response?.data;
      // Older feeds put the next-page cursor on resource_response, the board
      // feed (react_grid_pin) on resource.options.bookmarks.
      const newBookmark = json?.resource_response?.bookmark ?? json?.resource?.options?.bookmarks?.[0];

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

/**
 * The largest size of an avatar that Pinterest actually serves: probes
 * avatarSizeCandidates() in parallel (HEAD) and keeps the first that answers
 * 200, else the URL Pinterest returned (never a size that 403s).
 */
export async function resolveAvatarUrl(url: string | null, fetchImpl: FetchLike): Promise<string | null> {
  if (!url) return null;
  const candidates = avatarSizeCandidates(url);
  if (candidates.length < 2) return url;
  const ok = await Promise.all(
    candidates.map(async (candidate) => {
      try {
        const r = await fetchImpl(candidate, {
          method: 'HEAD',
          headers: { 'User-Agent': BROWSER_UA, Referer: 'https://www.pinterest.com/' },
        });
        return r.ok;
      } catch {
        return false;
      }
    }),
  );
  const i = ok.indexOf(true);
  return i === -1 ? url : candidates[i];
}

/** Pinterest UserResource avatar as Pinterest gives it (step 2 of the avatar branch). */
export async function fetchUserResourceAvatar(username: string, fetchImpl: FetchLike): Promise<string | null> {
  let profileAvatarUrl: string | null = null;
  try {
    const userPayload = {
      options: { username, field_set_key: 'unauth_react' },
      context: {},
    };
    const userEndpoint = `https://www.pinterest.com/resource/UserResource/get/?data=${encodeURIComponent(
      JSON.stringify(userPayload),
    )}&source_url=/${username}/`;
    const userRes = await fetchImpl(userEndpoint, {
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: `https://www.pinterest.com/${username}/`,
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
          profileAvatarUrl = apiAvatar;
        }
      }
    }
  } catch (e) {
    console.warn('UserResource avatar fetch warning:', e);
  }
  return profileAvatarUrl;
}
