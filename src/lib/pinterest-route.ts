/**
 * Pinterest URL classification and smart routing helpers.
 * Automatically identifies link types (board, profile, pin) and maps
 * extracted media content to the most suitable tool page and downloader view.
 */

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

export interface RouteTarget {
  type: PinterestLinkType;
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
    if (!host.includes('pinterest.') && !host.includes('pin.it')) {
      return null;
    }

    if (host.includes('pin.it')) {
      return {
        type: 'pin',
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
        path: '/pinterest-profile-downloader',
        name: 'Pinterest Profile',
        badge: '👤 User Profile',
      };
    }

    // Board: /username/board-slug/
    if (parts.length >= 2 && !RESERVED_PATHS.has(parts[1].toLowerCase())) {
      return {
        type: 'board',
        path: '/pinterest-board-downloader',
        name: 'Pinterest Board',
        badge: '📋 Board Collection',
      };
    }

    // Single segment (/username/) -> Profile
    if (parts.length === 1) {
      return {
        type: 'profile',
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
 * Determines the best tool path once media has been extracted.
 */
export function getSuitableToolForMedia(result: {
  is_gif?: boolean;
  is_video?: boolean;
  is_carousel?: boolean;
  is_board?: boolean;
  is_profile?: boolean;
  is_avatar_only?: boolean;
}): { path: string; label: string; badge: string } {
  if (result.is_board) {
    return {
      path: '/pinterest-board-downloader',
      label: 'Board Downloader',
      badge: '📋 Board Collection Detected',
    };
  }
  if (result.is_avatar_only) {
    return {
      path: '/pinterest-profile-picture-downloader',
      label: 'Profile Picture Downloader',
      badge: '👤 Profile Avatar Detected',
    };
  }
  if (result.is_profile) {
    return {
      path: '/pinterest-profile-downloader',
      label: 'Profile Downloader',
      badge: '👤 User Profile Detected',
    };
  }
  if (result.is_carousel) {
    return {
      path: '/pinterest-carousel-downloader',
      label: 'Carousel Downloader',
      badge: '📚 Multi-Slide Carousel Detected',
    };
  }
  if (result.is_gif) {
    return {
      path: '/pinterest-gif-downloader',
      label: 'GIF Downloader',
      badge: '✨ Animated GIF Detected',
    };
  }
  if (result.is_video) {
    return {
      path: '/pinterest-video-downloader',
      label: 'Video Downloader',
      badge: '🎬 HD Video Pin Detected',
    };
  }
  return {
    path: '/pinterest-image-downloader',
    label: 'HD Image Downloader',
    badge: '📸 High-Res Photo Detected',
  };
}
