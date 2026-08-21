/** Apex host + https + no trailing slash (except `/`). Used by the Worker entry. */

export const APEX_HOST = 'pintdownload.app';

/**
 * If the request is on pintdownload.app or www, return the canonical URL when
 * scheme, host, or trailing slash differs. Preserve query string (download form).
 * Returns null when already canonical or when the host is preview/dev.
 */
export function hostRedirectUrl(requestUrl: string): string | null {
  const url = new URL(requestUrl);
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (host !== APEX_HOST && host !== `www.${APEX_HOST}`) return null;

  let changed = false;

  if (url.protocol === 'http:') {
    url.protocol = 'https:';
    changed = true;
  }

  if (host === `www.${APEX_HOST}`) {
    url.hostname = APEX_HOST;
    changed = true;
  }

  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/\/+$/, '');
    changed = true;
  }

  return changed ? url.toString() : null;
}
