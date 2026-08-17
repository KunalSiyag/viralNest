/** Canonical URL helpers — apex host, no trailing slash except homepage `/` */

import { BRAND } from './brand';

const BASE = BRAND.url.replace(/\/+$/, '');

/**
 * Build an absolute site URL from a path.
 * Homepage → `https://pintdownload.app/`
 * Other paths → `https://pintdownload.app/path` (no trailing slash)
 */
export function absoluteUrl(path = '/'): string {
  if (!path || path === '/') return `${BASE}/`;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${clean.replace(/\/+$/, '')}`;
}

/**
 * Normalize any absolute or relative URL to the site canonical form.
 * Forces https + apex host, strips trailing slashes on non-root paths,
 * and drops hash/query so filtered URLs do not become extra index targets.
 */
export function normalizeCanonical(urlOrPath: string): string {
  try {
    const u = urlOrPath.startsWith('http')
      ? new URL(urlOrPath)
      : new URL(urlOrPath, `${BASE}/`);

    let pathname = u.pathname || '/';
    if (pathname !== '/' && pathname.endsWith('/')) {
      pathname = pathname.replace(/\/+$/, '');
    }
    if (pathname === '/') return `${BASE}/`;
    return `${BASE}${pathname}`;
  } catch {
    return absoluteUrl('/');
  }
}
