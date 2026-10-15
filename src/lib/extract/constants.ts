/** Shared constants for Pinterest extraction (moved verbatim from src/pages/api/extract.ts). */

export const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export const RESERVED_PATHS = new Set([
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
export const PROFILE_SUB_PATHS = new Set([
  '_saved',
  '_pins',
  '_created',
  '_activity',
  '_followers',
  '_following',
  '_tried',
]);

export const BLOCKED_USER_AGENTS = [
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
export const BLOCKED_PINS = new Set<string>([
  // Example: '123456789'
]);

/**
 * Registrable Pinterest domains: pinterest.com and the country domains
 * Pinterest serves itself. Exact matches only, so lookalikes such as
 * pinterest.evil.com or pinterest.com.evil.net are never fetched.
 */
export const PINTEREST_DOMAINS: ReadonlySet<string> = new Set([
  'pinterest.com',
  'pinterest.at',
  'pinterest.ca',
  'pinterest.ch',
  'pinterest.cl',
  'pinterest.co.in',
  'pinterest.co.kr',
  'pinterest.co.nz',
  'pinterest.co.uk',
  'pinterest.com.au',
  'pinterest.com.mx',
  'pinterest.de',
  'pinterest.dk',
  'pinterest.es',
  'pinterest.fr',
  'pinterest.id',
  'pinterest.ie',
  'pinterest.in',
  'pinterest.it',
  'pinterest.jp',
  'pinterest.nl',
  'pinterest.nz',
  'pinterest.ph',
  'pinterest.pt',
  'pinterest.ru',
  'pinterest.se',
]);

/** Pinterest's short-link host. */
export const PINTEREST_SHORT_HOST = 'pin.it';

/** Subdomains accepted in a link someone pastes: www. or a two-letter country prefix (in., uk., br., …). */
export const PINTEREST_LINK_SUBDOMAIN_RE = /^(?:www|[a-z]{2})$/;

/** Redirect hops followed while resolving a link (each must stay on a Pinterest host). */
export const MAX_REDIRECTS = 5;
