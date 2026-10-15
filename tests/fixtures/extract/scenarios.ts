/**
 * Synthetic Pinterest upstream fixtures for the /api/extract parity suite and
 * the MCP tests. No live network: each scenario routes fetch() by URL.
 *
 * Shapes mirror the live PinResource / pidgets / oEmbed / resource-feed
 * responses closely enough to walk every extraction branch.
 */

export type RouteResult = Response | Promise<Response> | null | undefined;
export type Route = (url: string, init?: RequestInit) => RouteResult;

export interface Scenario {
  name: string;
  /** Raw request body for POST /api/extract. */
  body: string;
  headers?: Record<string, string>;
  route: Route;
}

const BOARD_OWNER = 'maker_one';

/** Deterministic 32-hex media hash. */
export function hash(seed: number): string {
  return seed.toString(16).padStart(8, '0').repeat(4);
}

/** i.pinimg.com image URL for `size` and seed. */
export function img(size: string, seed: number, ext = 'jpg'): string {
  const h = hash(seed);
  return `https://i.pinimg.com/${size}/${h.slice(0, 2)}/${h.slice(2, 4)}/${h.slice(4, 6)}/${h}.${ext}`;
}

export function res(
  body: string | object,
  opts: { status?: number; url?: string; contentType?: string } = {},
): Response {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  const r = new Response(text, {
    status: opts.status ?? 200,
    headers: {
      'Content-Type': opts.contentType ?? (typeof body === 'string' ? 'text/html' : 'application/json'),
    },
  });
  if (opts.url) Object.defineProperty(r, 'url', { value: opts.url });
  return r;
}

export const notFound = () => res('Not found', { status: 404 });

/** Decoded `data` option object of a /resource/<Name>/get/ URL, or null. */
export function resourceOptions(url: string, name: string): any | null {
  const prefix = `https://www.pinterest.com/resource/${name}/get/`;
  if (!url.startsWith(prefix)) return null;
  try {
    return JSON.parse(new URL(url).searchParams.get('data') || '{}').options ?? {};
  } catch {
    return null;
  }
}

export function pidgetIds(url: string): string[] | null {
  if (!url.startsWith('https://widgets.pinterest.com/v3/pidgets/pins/info/')) return null;
  return (new URL(url).searchParams.get('pin_ids') || '').split(',').filter(Boolean);
}

export function oembedTarget(url: string): string | null {
  if (!url.startsWith('https://www.pinterest.com/oembed.json')) return null;
  return new URL(url).searchParams.get('url');
}

function htmlPage(inner: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">${inner}</head><body></body></html>`;
}

/** A pidget / resource-feed pin row. */
export function pidgetRow(id: string, seed: number, extra: Record<string, unknown> = {}) {
  return {
    id,
    images: {
      '236x': { url: img('236x', seed), width: 236, height: 354 },
      '564x': { url: img('564x', seed), width: 564, height: 846 },
    },
    grid_title: '',
    description: `Pin description ${seed}`,
    ...extra,
  };
}

const PIN = (id: string) => `https://www.pinterest.com/pin/${id}/`;

/** Route builder: page HTML for `pageUrl`, plus an optional PinResource payload. */
function pinRoutes(opts: {
  pageUrl: string;
  html?: string;
  pinResource?: Record<string, unknown> | null;
  extra?: Route;
}): Route {
  return (url, init) => {
    const extra = opts.extra?.(url, init);
    if (extra) return extra;
    if (url === opts.pageUrl) return res(opts.html ?? htmlPage(''), { url: opts.pageUrl });
    const pr = resourceOptions(url, 'PinResource');
    if (pr) {
      return opts.pinResource
        ? res({ resource_response: { status: 'success', data: opts.pinResource } })
        : notFound();
    }
    return notFound();
  };
}

// ── Pin data ───────────────────────────────────────────────────────────────

export const IMAGE_PIN_ID = '100000000000000001';
export const IMAGE_PIN_URL = PIN(IMAGE_PIN_ID);
export const IMAGE_PIN_DATA = {
  id: IMAGE_PIN_ID,
  title: 'Brass candle holder &amp; pine',
  description: 'Warm #christmas table styling with brass candles and pine garland',
  dominant_color: '#a1b2c3',
  hashtags: ['#decor', '#christmas'],
  link: 'https://example.com/shop/candles',
  native_creator: { username: 'maker_one', full_name: 'Maker One Studio' },
  closeup_attribution: { username: 'maker_one', full_name: 'Maker One Studio' },
  pinner: { username: 'pinterest', full_name: 'Pinterest' },
  images: {
    '236x': { url: img('236x', 11), width: 236, height: 354 },
    '736x': { url: img('736x', 11), width: 736, height: 1104 },
    orig: { url: img('originals', 11), width: 1200, height: 1800 },
  },
};

const VIDEO_PIN_ID = '100000000000000002';
const VIDEO_HASH = hash(22);
const VIDEO_PIN_DATA = {
  id: VIDEO_PIN_ID,
  title: 'Morning coffee pour',
  description: '',
  dominant_color: '#332211',
  pinner: { username: 'barista_99', full_name: 'Barista' },
  images: {
    '236x': { url: img('236x', 22) },
    '736x': { url: img('736x', 22) },
  },
  videos: {
    video_list: {
      V_HLSV3_MOBILE: {
        url: `https://v1.pinimg.com/videos/iht/hls/${VIDEO_HASH.slice(0, 2)}/${VIDEO_HASH.slice(2, 4)}/${VIDEO_HASH.slice(4, 6)}/${VIDEO_HASH}_v2.m3u8`,
        width: 720,
        height: 1280,
      },
      V_EXP7: {
        url: `https://v1.pinimg.com/videos/iht/expMp4/${VIDEO_HASH.slice(0, 2)}/${VIDEO_HASH.slice(2, 4)}/${VIDEO_HASH.slice(4, 6)}/${VIDEO_HASH}_720w.mp4`,
        width: 720,
        height: 1280,
      },
    },
  },
};

const CAROUSEL_PIN_ID = '100000000000000003';
const CAROUSEL_VIDEO_HASH = hash(33);
export const CAROUSEL_PIN_DATA = {
  id: CAROUSEL_PIN_ID,
  title: 'Three room ideas',
  description: 'Swipe for all three #interiors',
  dominant_color: '#ddeeff',
  native_creator: { username: 'room_ideas', full_name: 'Room Ideas' },
  images: { '236x': { url: img('236x', 31) }, '736x': { url: img('736x', 31) } },
  carousel_data: {
    carousel_slots: [
      { images: { '236x': { url: img('236x', 31) }, '736x': { url: img('736x', 31) } }, title: 'Living room' },
      {
        images: { '236x': { url: img('236x', 32) } },
        videos: {
          video_list: {
            V_720P: {
              url: `https://v1.pinimg.com/videos/mc/720p/${CAROUSEL_VIDEO_HASH.slice(0, 2)}/${CAROUSEL_VIDEO_HASH.slice(2, 4)}/${CAROUSEL_VIDEO_HASH.slice(4, 6)}/${CAROUSEL_VIDEO_HASH}.mp4`,
              width: 720,
              height: 1280,
            },
          },
        },
      },
      { images: { '236x': { url: img('236x', 34) }, '564x': { url: img('564x', 34) } }, details: 'Bedroom' },
    ],
  },
};

const STORY_PIN_ID = '100000000000000004';
const STORY_PIN_DATA = {
  id: STORY_PIN_ID,
  title: '',
  grid_title: 'Idea pin: bread in four steps',
  description: '',
  images: { '236x': { url: img('236x', 41) } },
  story_pin_data: {
    pages: [
      { image: { images: { '236x': { url: img('236x', 41) }, '736x': { url: img('736x', 41) } } } },
      {
        blocks: [
          {
            block_type: 3,
            video: {
              video_list: {
                V_EXP4: { url: 'https://v1.pinimg.com/videos/iht/expMp4/aa/bb/cc/storyvideo42_720w.mp4', width: 720, height: 1280 },
              },
            },
          },
        ],
      },
      { blocks: [{ block_type: 2, image: { images: { '564x': { url: img('564x', 43) } } } }] },
    ],
  },
};

const GIF_PIN_ID = '100000000000000005';
const GIF_PIN_DATA = {
  id: GIF_PIN_ID,
  title: 'Dancing cat gif',
  description: 'Loop',
  images: {
    '236x': { url: img('236x', 51) },
    '736x': { url: img('736x', 51) },
    orig: { url: img('originals', 51, 'gif') },
  },
};

const HTML_GIF_PIN_ID = '100000000000000006';
const HTML_GIF_PIN_DATA = {
  id: HTML_GIF_PIN_ID,
  title: 'Sparkle loop',
  description: '',
  images: { '236x': { url: img('236x', 61) }, '736x': { url: img('736x', 61) } },
};

const RELAY_PIN_ID = '100000000000000007';
const PWS_PIN_ID = '100000000000000008';
const OG_PIN_ID = '100000000000000009';
const OEMBED_PIN_ID = '100000000000000010';
const PIDGET_PIN_ID = '100000000000000011';
const NOMEDIA_PIN_ID = '100000000000000012';
const THROW_PIN_ID = '100000000000000013';
const ALLTHROW_PIN_ID = '100000000000000014';

// ── Collections ────────────────────────────────────────────────────────────

export const BOARD_URL = `https://www.pinterest.com/${BOARD_OWNER}/cozy-rooms/`;
export const BOARD_HTML_IDS = ['2000000000000001', '2000000000000002', '2000000000000003'];
export const BOARD_PAGE_IDS = ['2000000000000004', '2000000000000005'];

function boardHtml(ids: string[], title = 'Cozy Rooms | Pinterest'): string {
  return htmlPage(
    `<meta property="og:title" content="${title}">` +
      ids.map((id) => `<a href="/pin/${id}/">pin</a>`).join(''),
  );
}

/** Board fixture with `total` ids in HTML (all returned by pidgets) and optional feed page. */
export function boardRoutes(opts: {
  boardUrl?: string;
  htmlIds: string[];
  pageIds?: string[];
  pidgetTitle?: (id: string) => string;
  extra?: Route;
}): Route {
  const boardUrl = opts.boardUrl ?? BOARD_URL;
  return (url, init) => {
    const extra = opts.extra?.(url, init);
    if (extra) return extra;
    if (url === boardUrl) return res(boardHtml(opts.htmlIds), { url: boardUrl });
    const ids = pidgetIds(url);
    if (ids) {
      return res({
        status: 'success',
        data: ids
          .filter((id) => opts.htmlIds.includes(id))
          .map((id, i) =>
            pidgetRow(id, 100 + Number(id.slice(-3)), {
              grid_title: opts.pidgetTitle ? opts.pidgetTitle(id) : `Room ${id.slice(-2)}`,
              ...(i === 1
                ? {
                    is_video: true,
                    videos: {
                      video_list: {
                        V_720P: { url: `https://v1.pinimg.com/videos/mc/720p/aa/bb/cc/boardvid${id.slice(-3)}.mp4`, width: 720, height: 1280 },
                      },
                    },
                  }
                : {}),
            }),
          ),
      });
    }
    const feed = resourceOptions(url, 'BoardFeedResource');
    if (feed) {
      return res({
        resource_response: {
          data: (opts.pageIds ?? []).map((id) => pidgetRow(id, 300 + Number(id.slice(-3)), { title: `Feed pin ${id.slice(-2)}` })),
          bookmark: '-end-',
        },
      });
    }
    return notFound();
  };
}

export const PROFILE_URL = `https://www.pinterest.com/${BOARD_OWNER}/`;
const PROFILE_IDS = ['3000000000000001', '3000000000000002'];

export function profileHtml(withAvatar = true): string {
  const redux = {
    initialReduxState: {
      users: withAvatar
        ? {
            u1: {
              username: BOARD_OWNER,
              full_name: 'Maker One Studio',
              image_xlarge_url: img('280x280_RS', 71),
              image_medium_url: img('75x75_RS', 71),
            },
          }
        : {},
      boards: {
        b1: { name: 'Cozy Rooms', url: `/${BOARD_OWNER}/cozy-rooms/`, pin_count: 42 },
        b2: { name: 'Kitchen &amp; dining', url: `https://www.pinterest.com/${BOARD_OWNER}/kitchen/`, pinCount: 7 },
      },
    },
  };
  return htmlPage(
    `<meta property="og:title" content="Maker One Studio (${BOARD_OWNER}) - Profile | Pinterest">` +
      `<script id="__PWS_INITIAL_PROPS__" type="application/json">${JSON.stringify(redux)}</script>` +
      PROFILE_IDS.map((id) => `<a href="/pin/${id}/">pin</a>`).join(''),
  );
}

export function profileRoutes(opts: { withAvatar?: boolean; extra?: Route } = {}): Route {
  return (url, init) => {
    const extra = opts.extra?.(url, init);
    if (extra) return extra;
    if (url === PROFILE_URL) return res(profileHtml(opts.withAvatar ?? true), { url: PROFILE_URL });
    const ids = pidgetIds(url);
    if (ids) {
      return res({ data: ids.filter((id) => PROFILE_IDS.includes(id)).map((id) => pidgetRow(id, 500 + Number(id.slice(-2)))) });
    }
    const feed = resourceOptions(url, 'UserPinsResource');
    if (feed) return res({ resource_response: { data: [], bookmark: '-end-' } });
    return notFound();
  };
}

// ── Scenarios (section 12.1 of docs/mcp-design.md) ─────────────────────────

const body = (o: unknown) => JSON.stringify(o);

export const SCENARIOS: Scenario[] = [
  {
    name: '01_blocked_user_agent',
    body: body({ url: IMAGE_PIN_URL }),
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; Pinterestbot/1.0; +http://www.pinterest.com/bot.html)' },
    route: () => notFound(),
  },
  {
    name: '02_foreign_origin',
    body: body({ url: IMAGE_PIN_URL }),
    headers: { origin: 'https://evil.example' },
    route: () => notFound(),
  },
  { name: '03_missing_url', body: body({}), route: () => notFound() },
  {
    name: '04_non_pinterest',
    body: body({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }),
    route: () => notFound(),
  },
  {
    name: '05_pinit_show_error',
    body: body({ url: 'https://pin.it/AbCd123' }),
    route: (url) => {
      const landed = 'https://www.pinterest.com/?show_error=true';
      if (url === 'https://pin.it/AbCd123') return res(htmlPage(''), { url: landed });
      if (url === landed) return res(htmlPage('<meta property="og:image" content="https://s.pinimg.com/images/share.png">'), { url: landed });
      return notFound();
    },
  },
  {
    name: '06_pinit_homepage',
    body: body({ url: 'pin.it/Home123' }),
    route: (url) => {
      const landed = 'https://www.pinterest.com/';
      if (url === 'https://pin.it/Home123') return res(htmlPage(''), { url: landed });
      if (url === landed) return res(htmlPage(''), { url: landed });
      return notFound();
    },
  },
  {
    name: '07_pinresource_image',
    body: body({ url: IMAGE_PIN_URL }),
    route: pinRoutes({ pageUrl: IMAGE_PIN_URL, pinResource: IMAGE_PIN_DATA }),
  },
  {
    name: '08_pinresource_video',
    body: body({ url: PIN(VIDEO_PIN_ID) }),
    route: pinRoutes({ pageUrl: PIN(VIDEO_PIN_ID), pinResource: VIDEO_PIN_DATA }),
  },
  {
    name: '09_carousel',
    body: body({ url: PIN(CAROUSEL_PIN_ID) }),
    route: pinRoutes({ pageUrl: PIN(CAROUSEL_PIN_ID), pinResource: CAROUSEL_PIN_DATA }),
  },
  {
    name: '10_story_pin_pages',
    body: body({ url: PIN(STORY_PIN_ID) }),
    route: pinRoutes({ pageUrl: PIN(STORY_PIN_ID), pinResource: STORY_PIN_DATA }),
  },
  {
    name: '11_gif_orig',
    body: body({ url: PIN(GIF_PIN_ID) }),
    route: pinRoutes({ pageUrl: PIN(GIF_PIN_ID), pinResource: GIF_PIN_DATA }),
  },
  {
    name: '12_gif_html_own_hash',
    body: body({ url: PIN(HTML_GIF_PIN_ID) }),
    route: pinRoutes({
      pageUrl: PIN(HTML_GIF_PIN_ID),
      pinResource: HTML_GIF_PIN_DATA,
      // A related pin's GIF first, then this pin's own GIF (escaped, as in JSON).
      html: htmlPage(
        `<script>var a="${img('originals', 99, 'gif').replace(/\//g, '\\/')}";` +
          `var b="${img('originals', 61, 'gif').replace(/\//g, '\\/')}";` +
          `var c="https://pinimg-com-eip-akadns-net.pinimg.com/_/_/r21.gif";</script>`,
      ),
    }),
  },
  {
    name: '13_relay_video_fallback',
    body: body({ url: PIN(RELAY_PIN_ID) }),
    route: pinRoutes({
      pageUrl: PIN(RELAY_PIN_ID),
      pinResource: null,
      html: htmlPage(
        `<script>window.__PWS_RELAY_REGISTER_COMPLETED_REQUEST__("q1", ${JSON.stringify({
          data: {
            v3GetPinQueryv2: {
              data: {
                title: 'Relay pin title',
                description: 'Relay description #reels',
                dominantColor: '#123456',
                hashtags: ['Reels'],
                pinJoin: { annotations: [{ annotationText: 'Latte Art' }] },
                videos: {
                  videoUrls: [
                    'https://v1.pinimg.com/videos/mc/hls/aa/bb/cc/relayvideo.m3u8',
                    'https://v1.pinimg.com/videos/mc/720p/aa/bb/cc/relayvideo.mp4',
                  ],
                },
                images_236x: { url: img('236x', 77) },
              },
            },
          },
        })})</script>`,
      ),
    }),
  },
  {
    name: '14_pws_data_fallback',
    body: body({ url: PIN(PWS_PIN_ID) }),
    route: pinRoutes({
      pageUrl: PIN(PWS_PIN_ID),
      pinResource: null,
      html: htmlPage(
        `<script id="__PWS_DATA__" type="application/json">${JSON.stringify({
          props: {
            initialReduxState: {
              pins: {
                [PWS_PIN_ID]: {
                  grid_title: 'PWS grid title',
                  seo_description: 'From the legacy store',
                  dominant_color: '#abcdef',
                  images: { '236x': { url: img('236x', 81) }, '564x': { url: img('564x', 81) } },
                  pin_join: { annotations: [{ annotation_text: 'Garden' }] },
                },
              },
            },
          },
        })}</script>`,
      ),
    }),
  },
  {
    name: '15_og_meta_only',
    body: body({ url: PIN(OG_PIN_ID) }),
    route: pinRoutes({
      pageUrl: PIN(OG_PIN_ID),
      pinResource: null,
      html: htmlPage(
        `<meta content="${img('736x', 91)}" property="og:image">` +
          `<meta content="Sunset over &quot;the bay&quot;" property="og:title">` +
          `<meta name="description" content="x"><meta content="Golden hour photo" name="og:description">`,
      ),
    }),
  },
  {
    name: '16_oembed_fallback',
    body: body({ url: PIN(OEMBED_PIN_ID) }),
    route: pinRoutes({
      pageUrl: PIN(OEMBED_PIN_ID),
      pinResource: null,
      extra: (url) =>
        oembedTarget(url) === PIN(OEMBED_PIN_ID)
          ? res({ title: 'oEmbed title', thumbnail_url: img('236x', 101) })
          : null,
    }),
  },
  {
    name: '17_pidget_fallback',
    body: body({ url: PIN(PIDGET_PIN_ID) }),
    route: pinRoutes({
      pageUrl: PIN(PIDGET_PIN_ID),
      pinResource: null,
      extra: (url) => {
        const ids = pidgetIds(url);
        return ids ? res({ data: [pidgetRow(PIDGET_PIN_ID, 111, { grid_title: 'Pidget title' })] }) : null;
      },
    }),
  },
  {
    name: '18_no_media',
    body: body({ url: PIN(NOMEDIA_PIN_ID) }),
    route: pinRoutes({ pageUrl: PIN(NOMEDIA_PIN_ID), pinResource: null }),
  },
  {
    name: '19_board',
    body: body({ url: BOARD_URL }),
    route: boardRoutes({ htmlIds: BOARD_HTML_IDS, pageIds: BOARD_PAGE_IDS }),
  },
  {
    name: '20_board_sparse_pidgets_oembed',
    body: body({ url: 'https://www.pinterest.com/maker_one/sparse-board/' }),
    route: (url) => {
      const boardUrl = 'https://www.pinterest.com/maker_one/sparse-board/';
      const ids = ['2100000000000001', '2100000000000002', '2100000000000003', '2100000000000004'];
      if (url === boardUrl) return res(boardHtml(ids, 'Sparse board on Pinterest'), { url: boardUrl });
      if (pidgetIds(url)) return res({ data: [pidgetRow(ids[0], 211)] });
      const target = oembedTarget(url);
      if (target === PIN(ids[1])) return res({ title: 'Filled &amp; found', thumbnail_url: img('236x', 212) });
      if (target === PIN(ids[2])) return res({ thumbnail_url: img('236x', 213) });
      if (resourceOptions(url, 'BoardFeedResource')) return res({ resource_response: { data: [], bookmark: null } });
      return notFound();
    },
  },
  { name: '21_profile', body: body({ url: PROFILE_URL }), route: profileRoutes() },
  {
    name: '22_avatar_redux',
    body: body({ url: PROFILE_URL, intent: 'avatar' }),
    route: profileRoutes(),
  },
  {
    name: '23_avatar_userresource',
    body: body({ url: PROFILE_URL, intent: 'avatar' }),
    route: profileRoutes({
      withAvatar: false,
      extra: (url) =>
        resourceOptions(url, 'UserResource')
          ? res({ resource_response: { data: { username: BOARD_OWNER, image_large_url: img('140x140_RS', 231) } } })
          : null,
    }),
  },
  {
    name: '24_avatar_not_found',
    body: body({ url: 'https://www.pinterest.com/ghost_user/', intent: 'avatar' }),
    route: (url) =>
      url === 'https://www.pinterest.com/ghost_user/'
        ? res(htmlPage(`<meta property="og:image" content="${img('736x', 241)}">`), { url })
        : notFound(),
  },
  {
    name: '25_empty_board',
    body: body({ url: 'https://www.pinterest.com/maker_one/empty-board/' }),
    route: (url) => {
      if (url === 'https://www.pinterest.com/maker_one/empty-board/') return res(htmlPage('<title>Empty</title>'), { url });
      if (resourceOptions(url, 'BoardFeedResource')) return res({ resource_response: { data: [] } });
      return notFound();
    },
  },
  {
    name: '26_unguarded_throw_generic_400',
    body: body({ url: PIN(THROW_PIN_ID) }),
    // A numeric title reaches decodeHtmlEntities() outside any try block.
    route: pinRoutes({
      pageUrl: PIN(THROW_PIN_ID),
      pinResource: { id: THROW_PIN_ID, title: 12345, images: { '236x': { url: img('236x', 261) } } },
    }),
  },
  {
    name: '27_every_fetch_throws',
    body: body({ url: PIN(ALLTHROW_PIN_ID) }),
    route: () => {
      throw new TypeError('fetch failed');
    },
  },
  {
    name: '28_avatar_from_board_og_image',
    body: body({ url: 'https://www.pinterest.com/maker_one/cozy-rooms/', intent: 'avatar' }),
    route: (url) =>
      url === BOARD_URL
        ? res(htmlPage(`<meta property="og:image" content="${img('280x280_RS', 281)}">`), { url })
        : notFound(),
  },
  {
    name: '29_empty_body',
    body: '',
    route: () => notFound(),
  },
];

export interface FetchStub {
  fetch: (input: any, init?: RequestInit) => Promise<Response>;
  calls: string[];
}

/** fetch() replacement that routes through `route`; unmatched URLs get 404. */
export function makeFetch(route: Route): FetchStub {
  const calls: string[] = [];
  const fetch = async (input: any, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    calls.push(url);
    const r = await route(url, init);
    return r ?? notFound();
  };
  return { fetch, calls };
}
