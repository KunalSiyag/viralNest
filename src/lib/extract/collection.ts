/** Board / profile collection and profile-picture extraction (moved from /api/extract). */
import { metaContent } from './text';
import { extractAvatarFromHtml, isPinimgAvatarUrl, upgradeAvatarUrl } from './media';
import { fetchUserResourceAvatar, hydrateCollectionPins, paginateResourcePins } from './upstream';
import type { AvatarBody, BoardBody, FetchLike, ProfileBody } from './types';

type Classified = { kind: 'board' | 'profile'; username?: string; boardSlug?: string };

export function extractPinIdsFromHtml(html: string, limit = 120): string[] {
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

export function extractBoardsFromReduxState(html: string): { name: string; url: string; pin_count?: number }[] {
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

export function collectionTitleFromHtml(
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

/**
 * Board / profile pins: HTML ids → pidgets (oEmbed fill) → resource-feed
 * pagination. `idLimit` caps the ids scanned from the page HTML and `cap`
 * stops pagination (both 250 board / 200 profile on /api/extract).
 *
 * The HTML id scan also picks up non-pin ids (board, user) from the page
 * JSON, so a small `cap` must not shrink `idLimit`: MCP paging passes a
 * small `cap` and keeps the full scan.
 */
export async function extractCollection(
  html: string,
  targetUrl: string,
  classified: Classified,
  cap: number,
  fetchImpl: FetchLike,
  idLimit: number = cap,
): Promise<
  { kind: 'board'; body: BoardBody } | { kind: 'profile'; body: ProfileBody } | { error: string }
> {
  const pinIds = extractPinIdsFromHtml(html, idLimit);
  let pins = pinIds.length > 0 ? await hydrateCollectionPins(pinIds, fetchImpl) : [];

  // Paginate for more pins beyond the initial HTML page
  const existingIds = new Set(pins.map((p) => p.pin_id));
  const maxTotal = cap;

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
        fetchImpl,
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
      const body: BoardBody = {
        platform: 'pinterest',
        is_board: true,
        is_profile: false,
        board_title: title,
        board_url: targetUrl,
        username: classified.username || null,
        pins,
        pin_count: pins.length,
      };
      return { kind: 'board', body };
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

    const body: ProfileBody = {
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
    };
    return { kind: 'profile', body };
  }

  return {
    error:
      classified.kind === 'profile'
        ? 'Could not find public pins on this Pinterest profile. The profile may be private or empty.'
        : 'Could not find public pins on this Pinterest board. The board may be private or empty.',
  };
}

/**
 * Avatar-only intent (profile-picture downloader). Null when no avatar is found.
 */
export async function extractAvatar(
  html: string,
  classified: Classified,
  fetchImpl: FetchLike,
): Promise<AvatarBody | null> {
  // Strategy: extract the actual avatar (not pin collage) in priority order:
  //  1. Parse avatar from embedded HTML/Redux state (most reliable)
  //  2. Pinterest UserResource API
  //  3. og:image ONLY if it looks like an avatar URL (not a pin collage)

  let profileAvatarUrl: string | null = null;

  // ── 1. Extract avatar from HTML (Redux state + <img> tags) ──────
  profileAvatarUrl = extractAvatarFromHtml(html, classified.username);

  // ── 2. Pinterest UserResource API ──────────────────────────────
  if (!profileAvatarUrl && classified.username) {
    profileAvatarUrl = await fetchUserResourceAvatar(classified.username, fetchImpl);
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
    return null;
  }

  const body: AvatarBody = {
    platform: 'pinterest',
    is_avatar_only: true,
    is_profile: true,
    profile_avatar_url: profileAvatarUrl,
    username: classified.username || null,
    profile_title: profileTitle,
  };
  return body;
}
