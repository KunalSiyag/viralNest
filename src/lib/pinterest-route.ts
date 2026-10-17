/**
 * Pinterest URL classification and smart routing helpers.
 * Automatically identifies link types (board, profile, pin) and maps
 * extracted media content to the most suitable tool page and downloader view.
 */

import { isPinterestHostname, isPinterestUrl, normalizeTargetUrl } from './extract/classify';

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

const PROFILE_SUB_PATHS = new Set([
  '_saved',
  '_pins',
  '_created',
  '_activity',
  '_followers',
  '_following',
  '_tried',
]);

export type PinterestLinkType = 'pin' | 'board' | 'profile' | 'unknown';

/**
 * Pages the islands link to (route notices, tool chips, guide link, sticky bar).
 * A subset of src/i18n/routes.ts PageId; kept here as plain data so the client
 * bundle never imports the route map (which carries every locale's slugs).
 */
export type IslandPageId =
  | 'home'
  | 'pinterest-pin-downloader'
  | 'pinterest-video-downloader'
  | 'pinterest-image-downloader'
  | 'pinterest-gif-downloader'
  | 'pinterest-board-downloader'
  | 'pinterest-profile-downloader'
  | 'pinterest-profile-picture-downloader'
  | 'pinterest-carousel-downloader'
  | 'how-to-download-pinterest-videos';

/** English paths of those pages (tests check them against PAGES[pageId].en). */
export const EN_ISLAND_PATHS: Record<IslandPageId, string> = {
  home: '/',
  'pinterest-pin-downloader': '/pinterest-pin-downloader',
  'pinterest-video-downloader': '/pinterest-video-downloader',
  'pinterest-image-downloader': '/pinterest-image-downloader',
  'pinterest-gif-downloader': '/pinterest-gif-downloader',
  'pinterest-board-downloader': '/pinterest-board-downloader',
  'pinterest-profile-downloader': '/pinterest-profile-downloader',
  'pinterest-profile-picture-downloader': '/pinterest-profile-picture-downloader',
  'pinterest-carousel-downloader': '/pinterest-carousel-downloader',
  'how-to-download-pinterest-videos': '/how-to-download-pinterest-videos',
};

/**
 * The `routes` island prop: the current locale's {pageId → path}, live pages
 * only (src/i18n/routes.ts routesProp() is assignable to it). English islands
 * default to EN_ISLAND_PATHS.
 */
export type IslandRoutes = Partial<Record<IslandPageId, string>> & { home: string };

/** Where a missing page sends people before falling back to the locale home. */
const ROUTE_FALLBACK: Partial<Record<IslandPageId, IslandPageId>> = {
  'pinterest-carousel-downloader': 'pinterest-image-downloader',
};

/**
 * Path of `pageId` in the current locale, else its fallback, else the locale
 * home (whose hub form takes every link type), so a visitor keeps their language.
 */
export function routeTo(routes: IslandRoutes, pageId: IslandPageId): string {
  for (let id: IslandPageId | undefined = pageId; id; id = ROUTE_FALLBACK[id]) {
    const path = routes[id];
    if (path) return path;
  }
  return routes.home;
}

export interface RouteTarget {
  type: PinterestLinkType;
  /** Page for this link type (resolve with routeTo for the current locale). */
  pageId: IslandPageId;
  /** English path of that page (kept for compatibility). */
  path: string;
  name: string;
  badge: string;
}

/**
 * Classifies a raw Pinterest URL from user paste or input before extraction.
 */
export function classifyPinterestInput(rawUrl: string): RouteTarget | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const cleaned = rawUrl.trim();

  // Find URL if pasted with surrounding text
  const match = cleaned.match(/https?:\/\/[^\s"'<>]*(?:pinterest\.[^\s/"']*|pin\.it)[^\s"'<>]*/i);
  const target = match ? match[0] : (cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);

  try {
    const u = new URL(target);
    const host = u.hostname.toLowerCase();
    // Same host rule as /api/extract: pinterest.com, Pinterest's country
    // domains, www. or any two-letter country prefix (tr., nl., …), and pin.it.
    if (!isPinterestHostname(host)) {
      return null;
    }

    if (host === 'pin.it') {
      return {
        type: 'pin',
        pageId: 'pinterest-video-downloader',
        path: '/pinterest-video-downloader',
        name: 'Pinterest Pin',
        badge: '📌 Pin Link',
      };
    }

    const parts = u.pathname.split('/').filter(Boolean);
    if (!parts.length) return null;

    const first = parts[0].toLowerCase();
    if (first === 'pin') {
      return {
        type: 'pin',
        pageId: 'pinterest-video-downloader',
        path: '/pinterest-video-downloader',
        name: 'Pinterest Pin',
        badge: '📌 Pin Link',
      };
    }

    if (RESERVED_PATHS.has(first)) return null;

    // Profile sub-paths (/username/_saved, /username/_created)
    if (parts.length >= 2 && PROFILE_SUB_PATHS.has(parts[1].toLowerCase())) {
      return {
        type: 'profile',
        pageId: 'pinterest-profile-downloader',
        path: '/pinterest-profile-downloader',
        name: 'Pinterest Profile',
        badge: '👤 User Profile',
      };
    }

    // Board: /username/board-slug/
    if (parts.length >= 2 && !RESERVED_PATHS.has(parts[1].toLowerCase())) {
      return {
        type: 'board',
        pageId: 'pinterest-board-downloader',
        path: '/pinterest-board-downloader',
        name: 'Pinterest Board',
        badge: '📋 Board Collection',
      };
    }

    // Single segment (/username/) -> Profile
    if (parts.length === 1) {
      return {
        type: 'profile',
        pageId: 'pinterest-profile-downloader',
        path: '/pinterest-profile-downloader',
        name: 'Pinterest Profile',
        badge: '👤 User Profile',
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * True when /api/extract would accept this link's host (batch mode uses this to
 * pick links out of pasted text). Scheme optional, like the single-link box.
 */
export function isPinterestLink(text: string): boolean {
  return !!text && isPinterestUrl(normalizeTargetUrl(text));
}

/**
 * Determines the best tool path once media has been extracted.
 */
export function getSuitableToolForMedia(result: {
  is_gif?: boolean;
  is_video?: boolean;
  is_carousel?: boolean;
  is_board?: boolean;
  is_profile?: boolean;
  is_avatar_only?: boolean;
}): { pageId: IslandPageId; path: string; label: string; badge: string } {
  if (result.is_board) {
    return {
      pageId: 'pinterest-board-downloader',
      path: '/pinterest-board-downloader',
      label: 'Board Downloader',
      badge: '📋 Board Collection Detected',
    };
  }
  if (result.is_avatar_only) {
    return {
      pageId: 'pinterest-profile-picture-downloader',
      path: '/pinterest-profile-picture-downloader',
      label: 'Profile Picture Downloader',
      badge: '👤 Profile Avatar Detected',
    };
  }
  if (result.is_profile) {
    return {
      pageId: 'pinterest-profile-downloader',
      path: '/pinterest-profile-downloader',
      label: 'Profile Downloader',
      badge: '👤 User Profile Detected',
    };
  }
  if (result.is_carousel) {
    return {
      pageId: 'pinterest-carousel-downloader',
      path: '/pinterest-carousel-downloader',
      label: 'Carousel Downloader',
      badge: '📚 Multi-Slide Carousel Detected',
    };
  }
  if (result.is_gif) {
    return {
      pageId: 'pinterest-gif-downloader',
      path: '/pinterest-gif-downloader',
      label: 'GIF Downloader',
      badge: '✨ Animated GIF Detected',
    };
  }
  if (result.is_video) {
    return {
      pageId: 'pinterest-video-downloader',
      path: '/pinterest-video-downloader',
      label: 'Video Downloader',
      badge: '🎬 HD Video Pin Detected',
    };
  }
  return {
    pageId: 'pinterest-image-downloader',
    path: '/pinterest-image-downloader',
    label: 'HD Image Downloader',
    badge: '📸 High-Res Photo Detected',
  };
}
