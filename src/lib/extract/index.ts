/**
 * Pinterest extraction: one typed entry shared by /api/extract and the MCP
 * server. With `opts` undefined every step is the pre-refactor /api/extract
 * flow, and `body` is the exact object that route serialises.
 *
 * Unexpected exceptions propagate: callers map them (generic 400 on
 * /api/extract, `upstream_failed` on MCP).
 */
import { BLOCKED_PINS, BROWSER_UA, MAX_REDIRECTS } from './constants';
import {
  classifyPinterestUrl,
  isPinterestRedirectTarget,
  isPinterestUrl,
  isShortLink as isShortLinkUrl,
  normalizeTargetUrl,
  pinIdFromUrl,
} from './classify';
import { extractAvatar, extractCollection } from './collection';
import { extractPinFromHtml, extractPinViaResource, pinMetaFromResource } from './pin';
import type {
  ExpectedLinkType,
  ExtractErrorCode,
  ExtractFailure,
  ExtractOptions,
  ExtractOutcome,
  ExtractRequest,
  FetchLike,
  UrlKind,
} from './types';

export * from './types';
export { BLOCKED_PINS, BLOCKED_USER_AGENTS, BROWSER_UA, PINTEREST_DOMAINS } from './constants';
export {
  classifyPinterestUrl,
  isPinterestHostname,
  isPinterestRedirectTarget,
  isPinterestUrl,
  isShortLink,
  normalizeTargetUrl,
  pinIdFromUrl,
} from './classify';

/** Default fetch. Calls the global at call time: a detached reference throws "Illegal invocation" in workerd. */
const defaultFetch: FetchLike = (input, init) => fetch(input, init);

function fail(
  status: ExtractFailure['status'],
  code: ExtractErrorCode,
  error: string,
  actualKind?: UrlKind,
): ExtractFailure {
  return actualKind ? { ok: false, status, code, error, actualKind } : { ok: false, status, code, error };
}

const LEFT_PINTEREST_TEXT = 'This link leads away from Pinterest, so there is nothing to download.';
const REMOVED_TEXT =
  'This pin was removed or made private, so there is nothing to download. Check the link opens on Pinterest.';

/**
 * fetch() that follows redirects itself (at most MAX_REDIRECTS) and only to
 * Pinterest hosts. null when a hop or the final URL leaves Pinterest.
 * Network errors throw, as with a plain fetch.
 */
async function fetchOnPinterest(
  url: string,
  init: RequestInit,
  fetchImpl: FetchLike,
): Promise<{ response: Response; url: string } | null> {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetchImpl(current, { ...init, redirect: 'manual' });
    const location = response.status >= 300 && response.status < 400 ? response.headers.get('location') : null;
    if (!location) {
      const finalUrl = response.url || current;
      return isPinterestRedirectTarget(finalUrl) ? { response, url: finalUrl } : null;
    }
    try {
      await response.body?.cancel();
    } catch {
      // Body already consumed or closed.
    }
    let next: string;
    try {
      next = new URL(location, current).href;
    } catch {
      return null;
    }
    if (!isPinterestRedirectTarget(next)) return null;
    current = next;
  }
  return null;
}

const KIND_NOUN: Record<UrlKind, string> = {
  pin: 'a pin',
  board: 'a board',
  profile: 'a profile',
  other: 'not a pin, board or profile page',
};

/** True when `kind` (plus the /pin/ path test) satisfies `expect`. */
export function kindMatchesExpect(expect: ExpectedLinkType, kind: UrlKind, targetUrl: string): boolean {
  switch (expect) {
    case 'pin':
      return kind === 'pin' || targetUrl.includes('/pin/');
    case 'board':
      return kind === 'board';
    case 'profile':
      return kind === 'profile';
    case 'avatar':
      return kind === 'profile' || kind === 'board';
  }
}

export function wrongLinkTypeMessage(expect: ExpectedLinkType, actual: UrlKind): string {
  const wanted = expect === 'avatar' ? 'a profile or board' : KIND_NOUN[expect];
  return actual === 'other'
    ? `This link is ${KIND_NOUN.other}; expected ${wanted}.`
    : `This link is ${KIND_NOUN[actual]}, not ${wanted}.`;
}

export async function extractPinterest(req: ExtractRequest, opts: ExtractOptions = {}): Promise<ExtractOutcome> {
  const fetchImpl = opts.fetchImpl ?? defaultFetch;
  const { url, intent } = req;

  if (!url || typeof url !== 'string' || !url.trim()) {
    return fail(400, 'invalid_input', 'Please enter a valid Pinterest link.');
  }

  let targetUrl = normalizeTargetUrl(url);

  // Pin Takedown / Blacklist Check
  const pinIdCheck = targetUrl.match(/\/pin\/(?:[\w-]+--)?(\d+)/);
  if (pinIdCheck?.[1] && BLOCKED_PINS.has(pinIdCheck[1])) {
    return fail(451, 'blocked', 'This content has been removed upon author request.');
  }

  if (!isPinterestUrl(targetUrl)) {
    return fail(
      400,
      'not_pinterest',
      'Invalid link. Please enter a valid Pinterest link (e.g., https://pinterest.com/pin/... or https://pin.it/...)',
    );
  }

  // Resolve pin.it shortlink or follow redirects (Pinterest hosts only)
  const isShortLink = isShortLinkUrl(targetUrl);
  if (isShortLink) {
    try {
      const shortRes = await fetchOnPinterest(
        targetUrl,
        { method: 'GET', headers: { 'User-Agent': BROWSER_UA } },
        fetchImpl,
      );
      if (!shortRes) return fail(400, 'left_pinterest', LEFT_PINTEREST_TEXT);
      targetUrl = shortRes.url;
    } catch (e) {
      console.warn('Shortlink resolution warning:', e);
    }
  }

  // Fetch Pinterest page HTML
  let html = '';
  try {
    const page = await fetchOnPinterest(
      targetUrl,
      {
        headers: {
          'User-Agent': BROWSER_UA,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
      },
      fetchImpl,
    );
    if (!page) return fail(400, 'left_pinterest', LEFT_PINTEREST_TEXT);
    if (page.response.ok) {
      html = await page.response.text();
      targetUrl = page.url;
    }
  } catch (fetchErr: any) {
    console.error('Fetch error for Pinterest URL:', fetchErr);
  }

  const classified = classifyPinterestUrl(targetUrl);

  // A short link to a removed or private pin ends on the Pinterest homepage
  // (often with ?show_error=true). Its og:image is Pinterest's own share
  // card, so never fall through to the generic page scrape.
  const landedOnError = (() => {
    try {
      return new URL(targetUrl).searchParams.has('show_error');
    } catch {
      return false;
    }
  })();
  if (landedOnError || (isShortLink && classified.kind === 'other')) {
    return fail(404, 'removed_or_private', REMOVED_TEXT);
  }

  // MCP only: stop before any PinResource / pidget / pagination work.
  if (opts.expect && !kindMatchesExpect(opts.expect, classified.kind, targetUrl)) {
    return fail(400, 'wrong_link_type', wrongLinkTypeMessage(opts.expect, classified.kind), classified.kind);
  }

  const collectionMeta = () => ({
    resolvedUrl: targetUrl,
    username: classified.username ?? null,
    boardSlug: classified.boardSlug ?? null,
  });

  // ── Avatar-only intent (profile-picture downloader) ──────────────
  if (intent === 'avatar' && (classified.kind === 'profile' || classified.kind === 'board')) {
    const body = await extractAvatar(html, { ...classified, kind: classified.kind }, fetchImpl);
    if (!body) {
      return fail(
        400,
        'avatar_not_found',
        'Could not find a profile picture for this Pinterest user. The profile may be private.',
      );
    }
    return { ok: true, status: 200, kind: 'avatar', body, meta: collectionMeta() };
  }

  // ── Single pin via PinResource (carousel + story slides) ─────────────
  // Prefer this over HTML: pidgets/og only return the cover image.
  // PinResource answering "Pin not found" (MCP uses it to tell a missing pin from one without media).
  const pinLookup = { notFound: false };
  if (classified.kind === 'pin' || targetUrl.includes('/pin/')) {
    const pinId = pinIdFromUrl(targetUrl);
    if (pinId) {
      const fromResource = await extractPinViaResource(pinId, html, fetchImpl, pinLookup);
      if (fromResource) {
        const { creator, externalLink } = pinMetaFromResource(fromResource.data);
        return {
          ok: true,
          status: 200,
          kind: 'pin',
          body: fromResource.body,
          meta: { pinId: fromResource.body.pin_id ?? pinId, resolvedUrl: targetUrl, creator, externalLink },
        };
      }
    }
  }

  // ── Board / Profile collection extraction ────────────────────────────
  if ((classified.kind === 'board' || classified.kind === 'profile') && html) {
    const defaultCap = classified.kind === 'profile' ? 200 : 250;
    const cap = Math.min(defaultCap, opts.maxCollectionPins ?? defaultCap);
    const result = await extractCollection(
      html,
      targetUrl,
      { ...classified, kind: classified.kind },
      cap,
      fetchImpl,
      defaultCap,
    );
    if ('error' in result) return fail(400, 'collection_empty', result.error);
    return result.kind === 'board'
      ? { ok: true, status: 200, kind: 'board', body: result.body, meta: collectionMeta() }
      : { ok: true, status: 200, kind: 'profile', body: result.body, meta: collectionMeta() };
  }

  // ── Single pin extraction (HTML strategies 1–4) ──────────────────────
  const body = await extractPinFromHtml(html, targetUrl, fetchImpl);
  if (!body) {
    // MCP only, so the /api/extract body stays as it was.
    if (opts.expect && pinLookup.notFound) return fail(404, 'removed_or_private', REMOVED_TEXT);
    return fail(
      400,
      'no_media',
      'Could not find downloadable media for this link. Please check if the Pin is public.',
    );
  }
  return {
    ok: true,
    status: 200,
    kind: 'pin',
    body,
    meta: { pinId: targetUrl.match(/\/pin\/(\d+)/)?.[1] ?? null, resolvedUrl: targetUrl, creator: null, externalLink: null },
  };
}
