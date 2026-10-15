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

/**
 * Status for a canonical-host redirect. `/mcp` (and `/mcp/`) gets 308 so MCP
 * clients keep the POST method and body across www/http/slash redirects; a
 * 301 lets clients turn POST into GET. Everything else keeps 301.
 */
export function redirectStatusFor(pathname: string): 301 | 308 {
  return pathname.replace(/\/+$/, '') === '/mcp' ? 308 : 301;
}
