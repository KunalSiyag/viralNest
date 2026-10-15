/** Pinterest URL classification (server side). */
import {
  PINTEREST_DOMAINS,
  PINTEREST_LINK_SUBDOMAIN_RE,
  PINTEREST_SHORT_HOST,
  PROFILE_SUB_PATHS,
  RESERVED_PATHS,
} from './constants';
import type { UrlKind } from './types';

export function classifyPinterestUrl(rawUrl: string): {
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

/** http(s) URL without credentials or a non-default port, else null. */
function parseWebUrl(value: string): URL | null {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    if (u.username || u.password || u.port) return null;
    return u;
  } catch {
    return null;
  }
}

/**
 * True for pin.it and the Pinterest domains in PINTEREST_DOMAINS. Links people
 * paste may carry www. or a two-letter country prefix; `anySubdomain` also
 * accepts deeper Pinterest-owned hosts (api.pinterest.com) seen on redirects.
 */
export function isPinterestHostname(hostname: string, anySubdomain = false): boolean {
  const host = hostname.toLowerCase();
  if (host === PINTEREST_SHORT_HOST || PINTEREST_DOMAINS.has(host)) return true;
  for (const domain of PINTEREST_DOMAINS) {
    if (!host.endsWith(`.${domain}`)) continue;
    const sub = host.slice(0, -(domain.length + 1));
    return anySubdomain ? /^[a-z0-9-]+(?:\.[a-z0-9-]+)*$/.test(sub) : PINTEREST_LINK_SUBDOMAIN_RE.test(sub);
  }
  return false;
}

/** True when the (already https-prefixed) URL is a link on a Pinterest host /api/extract accepts. */
export function isPinterestUrl(targetUrl: string): boolean {
  const u = parseWebUrl(targetUrl);
  return Boolean(u && isPinterestHostname(u.hostname));
}

/** True when a redirect may go to this URL: any Pinterest-owned host, no credentials or port. */
export function isPinterestRedirectTarget(targetUrl: string): boolean {
  const u = parseWebUrl(targetUrl);
  return Boolean(u && isPinterestHostname(u.hostname, true));
}

/** True for a pin.it short link. */
export function isShortLink(targetUrl: string): boolean {
  return parseWebUrl(targetUrl)?.hostname.toLowerCase() === PINTEREST_SHORT_HOST;
}

/** Pin id from a /pin/<id>/ or /pin/<slug>--<id>/ path, or null. */
export function pinIdFromUrl(targetUrl: string): string | null {
  const m = targetUrl.match(/\/pin\/(?:[\w-]+--)?(\d+)/);
  return m?.[1] ?? null;
}

/** Trim and prefix https:// when the scheme is missing (same as /api/extract). */
export function normalizeTargetUrl(url: string): string {
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }
  return targetUrl;
}
