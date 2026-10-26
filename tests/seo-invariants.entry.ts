/**
 * Entry bundled by esbuild then executed with node --test.
 * Imports the real shipped source modules (not re-implemented stubs).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { absoluteUrl, normalizeCanonical } from '../src/lib/urls';
import { hostRedirectUrl, redirectStatusFor } from '../src/lib/host-redirect';
import { SERVER_INFO } from '../src/lib/mcp/info';
import { TOOLS } from '../src/lib/mcp/tools';
import { softwareAppSchema, SITEMAP_ROUTES, faqSchema, howToSchema } from '../src/lib/seo';
import {
  findGifUrlFromImages,
  gifCandidateUrls,
  isGifUrl,
  isMediaContentType,
  mediaFileExtension,
  pinLooksLikeGif,
  pinMediaCandidates,
  resolvePinGifUrl,
  toDownloadablePinUrl,
  toPlayablePinVideoUrl,
  toPublicPinImageUrl,
} from '../src/lib/pin-media';
import {
  isPostIndexable,
  INDEXABLE_BLOG_SLUGS,
  getIndexablePosts,
  getAllPosts,
} from '../src/data/blog';

describe('absoluteUrl / normalizeCanonical', () => {
  it('homepage ends with single trailing slash', () => {
    assert.equal(absoluteUrl('/'), 'https://pintdownload.app/');
    assert.equal(absoluteUrl(''), 'https://pintdownload.app/');
  });

  it('tool paths have no trailing slash', () => {
    assert.equal(
      absoluteUrl('/pinterest-video-downloader'),
      'https://pintdownload.app/pinterest-video-downloader',
    );
    assert.equal(
      absoluteUrl('/pinterest-video-downloader/'),
      'https://pintdownload.app/pinterest-video-downloader',
    );
  });

  it('normalizeCanonical strips trailing slash on non-root', () => {
    assert.equal(
      normalizeCanonical('https://pintdownload.app/about/'),
      'https://pintdownload.app/about',
    );
    assert.equal(
      normalizeCanonical('https://pintdownload.app/pinterest-board-downloader/'),
      'https://pintdownload.app/pinterest-board-downloader',
    );
    assert.equal(normalizeCanonical('https://pintdownload.app/'), 'https://pintdownload.app/');
  });

  it('normalizeCanonical accepts relative paths', () => {
    assert.equal(normalizeCanonical('/blog'), 'https://pintdownload.app/blog');
    assert.equal(normalizeCanonical('/blog/'), 'https://pintdownload.app/blog');
  });

  it('normalizeCanonical forces apex https and drops query/hash', () => {
    assert.equal(
      normalizeCanonical('https://www.pintdownload.app/about/'),
      'https://pintdownload.app/about',
    );
    assert.equal(
      normalizeCanonical('http://www.pintdownload.app/blog?cat=Guide#x'),
      'https://pintdownload.app/blog',
    );
  });
});

describe('hostRedirectUrl', () => {
  it('301s http, www, and trailing slash to https apex', () => {
    assert.equal(
      hostRedirectUrl('http://pintdownload.app/'),
      'https://pintdownload.app/',
    );
    assert.equal(
      hostRedirectUrl('https://www.pintdownload.app/pinterest-video-downloader'),
      'https://pintdownload.app/pinterest-video-downloader',
    );
    assert.equal(
      hostRedirectUrl('https://pintdownload.app/pinterest-video-downloader/'),
      'https://pintdownload.app/pinterest-video-downloader',
    );
    assert.equal(
      hostRedirectUrl('http://www.pintdownload.app/about/?ref=gsc'),
      'https://pintdownload.app/about?ref=gsc',
    );
  });

  it('leaves canonical https apex URLs and preview hosts alone', () => {
    assert.equal(hostRedirectUrl('https://pintdownload.app/'), null);
    assert.equal(
      hostRedirectUrl('https://pintdownload.app/pinterest-video-downloader'),
      null,
    );
    assert.equal(hostRedirectUrl('https://pintdownload.workers.dev/'), null);
  });
});

describe('wrangler assets routing', () => {
  it('runs the Worker first for /api/* so POST extract is not a static 405', () => {
    const wrangler = fs.readFileSync(path.join(process.cwd(), 'wrangler.jsonc'), 'utf8');
    assert.match(
      wrangler,
      /"run_worker_first"\s*:\s*\[[^\]]*"\/api\/\*"/s,
      'assets.run_worker_first must list /api/* or Cloudflare serves POST /api/extract as 405',
    );
  });
});

describe('softwareAppSchema', () => {
  it('never fabricates aggregateRating', () => {
    const schema = softwareAppSchema({
      name: 'Test Tool',
      description: 'desc',
      url: 'https://pintdownload.app/pinterest-video-downloader',
    });
    assert.equal(schema['@type'], 'SoftwareApplication');
    assert.equal('aggregateRating' in schema, false);
    assert.equal(schema.offers?.price, '0');
  });
});

describe('FAQ and HowTo schema builders', () => {
  it('faqSchema maps questions', () => {
    const s = faqSchema([{ q: 'Q1?', a: 'A1' }]);
    assert.equal(s['@type'], 'FAQPage');
    assert.equal(s.mainEntity.length, 1);
    assert.equal(s.mainEntity[0].name, 'Q1?');
  });

  it('howToSchema maps steps with positions', () => {
    const s = howToSchema({
      name: 'How',
      description: 'D',
      steps: [
        { name: 'One', text: 'First' },
        { name: 'Two', text: 'Second' },
      ],
    });
    assert.equal(s['@type'], 'HowTo');
    assert.equal(s.step[0].position, 1);
    assert.equal(s.step[1].position, 2);
  });
});

describe('blog indexation allowlist', () => {
  it('core guides are indexable; lifestyle fluff is not', () => {
    assert.equal(isPostIndexable('how-to-download-pinterest-videos-fast-and-easy'), true);
    assert.equal(isPostIndexable('how-to-download-pinterest-profile-picture'), true);
    assert.equal(isPostIndexable('make-money-on-pinterest-without-website'), true);
    assert.equal(isPostIndexable('pinterest-for-long-flights-and-layovers'), false);
    assert.equal(isPostIndexable('pinterest-fashion-style-trends-guide-2026'), false);
    assert.equal(INDEXABLE_BLOG_SLUGS.size > 10, true);
  });

  it('getIndexablePosts is a strict subset of getAllPosts', () => {
    const all = getAllPosts();
    const indexed = getIndexablePosts();
    assert.equal(indexed.length > 0, true);
    assert.equal(indexed.length < all.length, true);
    for (const p of indexed) {
      assert.equal(isPostIndexable(p), true);
    }
  });
});

describe('SITEMAP_ROUTES money coverage', () => {
  it('includes all core money paths and excludes rss/api', () => {
    const paths = new Set(SITEMAP_ROUTES.map((r) => r.path));
    for (const required of [
      '/',
      '/pinterest-video-downloader',
      '/pinterest-pin-downloader',
      '/pinterest-image-downloader',
      '/pinterest-board-downloader',
      '/pinterest-profile-downloader',
      '/pinterest-profile-picture-downloader',
      '/pinterest-gif-downloader',
      '/blog',
    ]) {
      assert.equal(paths.has(required), true, `missing ${required}`);
    }
    assert.equal(paths.has('/rss.xml'), false);
    assert.equal(paths.has('/api/download'), false);
    assert.equal(paths.has('/embed'), false);
  });
});

describe('pin media URL rewrites', () => {
  it('upgrades blocked originals/avatar sizes to 1200x', () => {
    assert.equal(
      toPublicPinImageUrl(
        'https://i.pinimg.com/originals/b1/71/d9/b171d958b797bb678f34c4193e5ffa28.jpg',
      ),
      'https://i.pinimg.com/1200x/b1/71/d9/b171d958b797bb678f34c4193e5ffa28.jpg',
    );
    assert.equal(
      toPublicPinImageUrl(
        'https://i.pinimg.com/280x280_RS/1c/b5/61/1cb561c8e7b9c709f78d110a4b5f0863.jpg',
      ),
      'https://i.pinimg.com/1200x/1c/b5/61/1cb561c8e7b9c709f78d110a4b5f0863.jpg',
    );
  });

  it('converts HLS m3u8 to progressive MP4 and leaves expMp4 as-is', () => {
    assert.equal(
      toPlayablePinVideoUrl(
        'https://v1.pinimg.com/videos/mc/expMp4/b9/12/4f/b9124faadbb0a7f52bd623ef670fd100_720w.mp4',
      ),
      'https://v1.pinimg.com/videos/mc/expMp4/b9/12/4f/b9124faadbb0a7f52bd623ef670fd100_720w.mp4',
    );
    assert.equal(
      toPlayablePinVideoUrl(
        'https://v1.pinimg.com/videos/iht/expMp4/13/00/77/1300779bf3e1236e58e7bf9bd21a007c_720w.mp4',
      ),
      'https://v1.pinimg.com/videos/iht/expMp4/13/00/77/1300779bf3e1236e58e7bf9bd21a007c_720w.mp4',
    );
    assert.equal(
      toPlayablePinVideoUrl(
        'https://v1.pinimg.com/videos/mc/hls/b9/12/4f/b9124faadbb0a7f52bd623ef670fd100.m3u8',
      ),
      'https://v1.pinimg.com/videos/mc/720p/b9/12/4f/b9124faadbb0a7f52bd623ef670fd100.mp4',
    );
    assert.equal(
      toPlayablePinVideoUrl(
        'https://v1.pinimg.com/videos/iht/hls/07/09/ae/0709ae1327a967b140ef396263afa0d3.m3u8',
      ),
      'https://v1.pinimg.com/videos/iht/expMp4/07/09/ae/0709ae1327a967b140ef396263afa0d3_720w.mp4',
    );
    assert.equal(
      toPlayablePinVideoUrl(
        'https://v1.pinimg.com/videos/iht/720p/07/09/ae/0709ae1327a967b140ef396263afa0d3.mp4',
      ),
      'https://v1.pinimg.com/videos/iht/expMp4/07/09/ae/0709ae1327a967b140ef396263afa0d3_720w.mp4',
    );
    assert.equal(
      toDownloadablePinUrl(
        'https://v1-c.pinimg.com/videos/iht/expMp4/13/00/77/1300779bf3e1236e58e7bf9bd21a007c_720w.mp4',
      ),
      'https://v1-c.pinimg.com/videos/iht/expMp4/13/00/77/1300779bf3e1236e58e7bf9bd21a007c_720w.mp4',
    );
  });

  it('lists public image/video candidates before blocked originals', () => {
    const image = pinMediaCandidates(
      'https://i.pinimg.com/originals/b1/71/d9/b171d958b797bb678f34c4193e5ffa28.jpg',
    );
    assert.equal(image[0], 'https://i.pinimg.com/1200x/b1/71/d9/b171d958b797bb678f34c4193e5ffa28.jpg');
    assert.equal(image.includes('https://i.pinimg.com/736x/b1/71/d9/b171d958b797bb678f34c4193e5ffa28.jpg'), true);

    const video = pinMediaCandidates(
      'https://v1.pinimg.com/videos/mc/expMp4/b9/12/4f/b9124faadbb0a7f52bd623ef670fd100_720w.mp4',
    );
    assert.equal(
      video[0],
      'https://v1.pinimg.com/videos/mc/expMp4/b9/12/4f/b9124faadbb0a7f52bd623ef670fd100_720w.mp4',
    );
    // Candidates must include both progressive and expMp4 variants (Pinterest rotates)
    assert.equal(
      video.includes(
        'https://v1.pinimg.com/videos/mc/720p/b9/12/4f/b9124faadbb0a7f52bd623ef670fd100.mp4',
      ),
      true,
    );
    // Alternate CDN host is a fallback — not paired with the first 403 in the probe batch
    const i720 = video.indexOf(
      'https://v1.pinimg.com/videos/mc/720p/b9/12/4f/b9124faadbb0a7f52bd623ef670fd100.mp4',
    );
    const iAltHost = video.indexOf(
      'https://v1-c.pinimg.com/videos/mc/expMp4/b9/12/4f/b9124faadbb0a7f52bd623ef670fd100_720w.mp4',
    );
    assert.equal(i720 >= 0 && iAltHost >= 0 && i720 < iAltHost, true);
    assert.equal(
      video.includes(
        'https://v1.pinimg.com/videos/mc/expMp4/b9/12/4f/b9124faadbb0a7f52bd623ef670fd100_720w.mp4',
      ),
      true,
    );

    const iht = pinMediaCandidates(
      'https://v1.pinimg.com/videos/iht/expMp4/13/00/77/1300779bf3e1236e58e7bf9bd21a007c_720w.mp4',
    );
    assert.equal(
      iht[0],
      'https://v1.pinimg.com/videos/iht/expMp4/13/00/77/1300779bf3e1236e58e7bf9bd21a007c_720w.mp4',
    );
    const iht720 = pinMediaCandidates(
      'https://v1.pinimg.com/videos/iht/720p/07/09/ae/0709ae1327a967b140ef396263afa0d3.mp4',
    );
    assert.equal(
      iht720[0],
      'https://v1.pinimg.com/videos/iht/expMp4/07/09/ae/0709ae1327a967b140ef396263afa0d3_720w.mp4',
    );
    assert.equal(
      iht.includes(
        'https://v1.pinimg.com/videos/iht/720p/13/00/77/1300779bf3e1236e58e7bf9bd21a007c.mp4',
      ),
      true,
    );
    assert.equal(
      iht.includes(
        'https://v1-c.pinimg.com/videos/iht/720p/13/00/77/1300779bf3e1236e58e7bf9bd21a007c.mp4',
      ),
      true,
    );
  });

  it('rejects HTML/XML as downloadable media types', () => {
    assert.equal(isMediaContentType('video/mp4'), true);
    assert.equal(isMediaContentType('image/jpeg'), true);
    assert.equal(isMediaContentType('image/gif'), true);
    assert.equal(isMediaContentType('text/html'), false);
    assert.equal(isMediaContentType('application/xml'), false);
    assert.equal(isMediaContentType('text/plain'), false);
  });

  it('does not flatten animated GIFs to 1200x JPEG', () => {
    const origGif =
      'https://i.pinimg.com/originals/36/52/d4/3652d4e5e12887d36c4908efecd0f425.gif';
    assert.equal(isGifUrl(origGif), true);
    assert.equal(toPublicPinImageUrl(origGif), origGif);
    assert.equal(toDownloadablePinUrl(origGif), origGif);
    assert.equal(mediaFileExtension(origGif), 'gif');

    const candidates = pinMediaCandidates(origGif);
    assert.equal(candidates[0], origGif);
    assert.equal(
      candidates.includes(
        'https://i.pinimg.com/1200x/36/52/d4/3652d4e5e12887d36c4908efecd0f425.gif',
      ),
      true,
    );
    assert.equal(
      candidates.includes(
        'https://i.pinimg.com/736x/36/52/d4/3652d4e5e12887d36c4908efecd0f425.gif',
      ),
      true,
    );
    // Must not rewrite the GIF to a still JPG size folder.
    assert.equal(
      candidates.some((u) => u.endsWith('.jpg')),
      false,
    );
  });

  it('guesses GIF originals from a static pin image URL', () => {
    const jpg =
      'https://i.pinimg.com/736x/36/52/d4/3652d4e5e12887d36c4908efecd0f425.jpg';
    const gifs = gifCandidateUrls(jpg);
    assert.equal(
      gifs[0],
      'https://i.pinimg.com/originals/36/52/d4/3652d4e5e12887d36c4908efecd0f425.gif',
    );
    assert.equal(mediaFileExtension(jpg, 'png'), 'jpg');
    assert.equal(mediaFileExtension('https://v1.pinimg.com/videos/mc/720p/ab.mp4'), 'mp4');
  });

  it('prefers orig.gif over sized JPEG stills in PinResource images', () => {
    const origGif =
      'https://i.pinimg.com/originals/76/0c/ea/760cea7ffe1046b20ce4c262589a0201.gif';
    const images = {
      '236x': {
        url: 'https://i.pinimg.com/236x/76/0c/ea/760cea7ffe1046b20ce4c262589a0201.jpg',
      },
      '736x': {
        url: 'https://i.pinimg.com/736x/76/0c/ea/760cea7ffe1046b20ce4c262589a0201.jpg',
      },
      orig: { width: 500, height: 700, url: origGif },
    };
    const embed = { src: origGif, height: 700, width: 500, type: 'gif' };

    assert.equal(findGifUrlFromImages(images), origGif);
    assert.equal(pinLooksLikeGif({ type: 'pin', embed }, images['736x'].url), true);
    assert.equal(resolvePinGifUrl({ type: 'pin', images, embed }, images['736x'].url), origGif);
    assert.equal(
      resolvePinGifUrl({ type: 'pin', images, embed }, toPublicPinImageUrl(images['736x'].url)),
      origGif,
    );
    assert.notEqual(resolvePinGifUrl({ type: 'pin', images, embed }), null);
    assert.equal(isGifUrl(resolvePinGifUrl({ type: 'pin', images, embed }) || ''), true);
  });

  it('uses embed.gif when images map has only JPEGs', () => {
    const origGif =
      'https://i.pinimg.com/originals/76/0c/ea/760cea7ffe1046b20ce4c262589a0201.gif';
    const jpg = 'https://i.pinimg.com/736x/76/0c/ea/760cea7ffe1046b20ce4c262589a0201.jpg';
    const resolved = resolvePinGifUrl(
      {
        type: 'pin',
        images: { orig: { url: jpg }, '736x': { url: jpg } },
        embed: { src: origGif, type: 'gif' },
      },
      jpg,
    );
    assert.equal(resolved, origGif);
  });
});

/** JSONC → JSON: drops line and block comments outside strings, then trailing commas. */
function parseJsonc(text: string): any {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      let j = i + 1;
      while (j < text.length && text[j] !== '"') j += text[j] === '\\' ? 2 : 1;
      out += text.slice(i, j + 1);
      i = j;
    } else if (c === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      out += '\n';
    } else if (c === '/' && text[i + 1] === '*') {
      i = text.indexOf('*/', i + 2) + 1;
    } else {
      out += c;
    }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'));
}

const MCP_ENDPOINT = 'https://pintdownload.app/mcp';
const MCP_TOOL_NAMES = [
  'identify_pinterest_link',
  'get_pinterest_pin_media',
  'list_pinterest_board_pins',
  'list_pinterest_profile_pins',
  'get_pinterest_profile_picture',
];

describe('MCP routing guard', () => {
  const wrangler = parseJsonc(fs.readFileSync(path.join(process.cwd(), 'wrangler.jsonc'), 'utf8'));

  it('run_worker_first sends /mcp to the Worker (else POST /mcp 405s on asset serving)', () => {
    assert.ok(wrangler.assets.run_worker_first.includes('/mcp'));
    assert.ok(wrangler.assets.run_worker_first.includes('/api/*'));
  });

  it('ratelimits declares the three MCP limiters', () => {
    const names = (wrangler.ratelimits || []).map((r: any) => r.name).sort();
    assert.deepEqual(names, ['MCP_REQUEST_LIMITER', 'MCP_TOOL_LIMITER', 'MCP_UPSTREAM_LIMITER']);
    for (const r of wrangler.ratelimits) {
      assert.match(r.namespace_id, /^\d+$/);
      assert.ok([10, 60].includes(r.simple.period));
    }
  });

  it('redirectStatusFor: /mcp keeps POST with 308, everything else 301', () => {
    assert.equal(redirectStatusFor('/mcp'), 308);
    assert.equal(redirectStatusFor('/mcp/'), 308);
    assert.equal(redirectStatusFor('/about/'), 301);
    assert.equal(redirectStatusFor('/'), 301);
    assert.equal(redirectStatusFor('/mcp-guide'), 301);
    assert.equal(hostRedirectUrl('https://www.pintdownload.app/mcp'), 'https://pintdownload.app/mcp');
    assert.equal(hostRedirectUrl('https://pintdownload.app/mcp'), null);
  });

  it('tool registry matches the frozen names and order', () => {
    assert.deepEqual(TOOLS.map((t) => t.name), MCP_TOOL_NAMES);
  });
});

describe('MCP docs drift guard', () => {
  const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

  for (const file of ['public/llms.txt', 'public/llms-full.txt', 'src/pages/pinterest-mcp-server.astro']) {
    it(`${file} names the endpoint and all 5 tools`, () => {
      const text = read(file);
      assert.ok(text.includes(MCP_ENDPOINT), `${file} missing ${MCP_ENDPOINT}`);
      for (const name of MCP_TOOL_NAMES) assert.ok(text.includes(name), `${file} missing ${name}`);
    });
  }

  it('sitemap lists the docs page and never /mcp', () => {
    const paths = SITEMAP_ROUTES.map((r) => r.path);
    assert.ok(paths.includes('/pinterest-mcp-server'));
    assert.ok(!paths.includes('/mcp'));
  });

  it('robots.txt disallows /mcp', () => {
    assert.match(read('public/robots.txt'), /^Disallow: \/mcp$/m);
  });

  it('server.json matches the endpoint and server version', () => {
    const server = JSON.parse(read('server.json'));
    assert.equal(server.remotes[0].url, MCP_ENDPOINT);
    assert.equal(server.remotes[0].type, 'streamable-http');
    assert.equal(server.version, SERVER_INFO.version);
    assert.ok(server.description.length <= 100, `description is ${server.description.length} chars`);
  });
});

/* ======================================================================
 * i18n: route map, hreflang clusters, content, catalogs (plan §6 tests)
 * ==================================================================== */
import { LOCALES, LOCALE_META, type Locale } from '../src/i18n/locales';
import {
  GATE_OPEN,
  PAGES,
  PAGE_IDS,
  RESERVED_SLUGS,
  SLUGS,
  SLUG_PATTERN,
  alternatesFor,
  indexableAlternatesFor,
  isLive,
  isLocaleIndexable,
  liveLocales,
  localeHome,
  localizedRoutes,
  pathFor,
  rawPathFor,
  routeForPath,
  routesProp,
  type PageId,
} from '../src/i18n/routes';
import { PageContent } from '../src/i18n/schema';
import { InlineMarkupError, inlineToText, renderInline } from '../src/i18n/inline';
import { checkCatalog, checkLocale, checkPageFile, englishPaths, type Finding } from '../src/i18n/content-rules';
import { localizedSitemapEntries, sitemapAlternatesFor } from '../src/lib/seo';
import { EN_UI } from '../src/i18n/ui/en';

const ROOT = process.cwd();
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/i18n/i18n-plan.json'), 'utf8'));

/** Run fn with every locale routed (PD_I18N_PREVIEW=all, all content assumed present). */
function withPreviewAll<T>(fn: () => T): T {
  const prev = process.env.PD_I18N_PREVIEW;
  const prevIdx = process.env.PD_I18N_CONTENT_INDEX;
  process.env.PD_I18N_PREVIEW = 'all';
  delete process.env.PD_I18N_CONTENT_INDEX;
  try {
    return fn();
  } finally {
    if (prev === undefined) delete process.env.PD_I18N_PREVIEW;
    else process.env.PD_I18N_PREVIEW = prev;
    if (prevIdx !== undefined) process.env.PD_I18N_CONTENT_INDEX = prevIdx;
  }
}

/** Every locale indexable for the duration of fn (LOCALE_META.indexable). */
function withIndexableAll<T>(fn: () => T): T {
  const saved = LOCALES.map((l) => [l, LOCALE_META[l].indexable] as const);
  for (const l of LOCALES) LOCALE_META[l].indexable = true;
  try {
    return fn();
  } finally {
    for (const [l, v] of saved) LOCALE_META[l].indexable = v;
  }
}

const errorsOnly = (fs_: Finding[]) => fs_.filter((f) => f.level === 'error').map((f) => `${f.file} ${f.path ?? ''} ${f.message}`);

describe('i18n route map', () => {
  it('LOCALE_META matches the plan locales[]', () => {
    assert.deepEqual([...LOCALES], plan.locales.map((l: any) => l.code));
    for (const l of plan.locales) {
      const m = LOCALE_META[l.code as Locale];
      for (const k of ['hreflang', 'htmlLang', 'ogLocale', 'dir', 'endonym', 'homeLabel', 'script', 'release']) {
        assert.equal((m as any)[k], l[k], `${l.code}.${k}`);
      }
    }
    assert.equal(LOCALE_META.en.hreflang, 'en');
    assert.equal(LOCALE_META.en.ogLocale, 'en_US');
    assert.equal(LOCALE_META.de.ads, false, 'user decision: /de has no ad slots');
  });

  it('SLUGS equal the plan matrix (slug + status), 166 rows', () => {
    const status: Record<string, string> = { ship: 'live', 'gated-audio': 'gated-audio', 'gated-4k': 'gated-4k' };
    let n = 0;
    for (const row of plan.matrix) {
      const e = SLUGS[row.locale as Locale][row.pageId as PageId];
      assert.ok(e, `${row.locale}/${row.pageId} missing`);
      assert.equal(e!.slug, row.slug, `${row.locale}/${row.pageId} slug`);
      assert.equal(e!.status, status[row.status], `${row.locale}/${row.pageId} status`);
      n++;
    }
    const total = LOCALES.reduce((acc, l) => acc + Object.keys(SLUGS[l]).length, 0);
    assert.equal(total, n);
    assert.equal(n, 166);
  });

  it('PAGES mirrors the English page files (variant, stock)', () => {
    for (const id of PAGE_IDS) {
      const file = id === 'home' ? 'index' : id;
      const src = fs.readFileSync(path.join(ROOT, `src/pages/${file}.astro`), 'utf8');
      const field = src.match(/<BaseLayout[^>]*field="([a-z]+)"/s)?.[1] ?? 'red'; // BaseLayout default
      assert.equal(PAGES[id].field, field, `${id} field`);
      const variant = src.match(/variant="([a-z-]+)"/)?.[1];
      if (variant) assert.equal(PAGES[id].variant, variant, `${id} variant`);
      assert.equal(PAGES[id].en, id === 'home' ? '/' : `/${id}`);
    }
  });

  it('slugs: lowercase ASCII kebab-case, unique per locale, not reserved, home only empty', () => {
    for (const l of LOCALES) {
      const seen = new Set<string>();
      for (const [id, e] of Object.entries(SLUGS[l])) {
        if (id === 'home') {
          assert.equal(e!.slug, '');
          continue;
        }
        assert.match(e!.slug, SLUG_PATTERN, `${l}/${id}`);
        assert.ok(!(RESERVED_SLUGS as readonly string[]).includes(e!.slug), `${l}/${id} reserved`);
        assert.ok(!seen.has(e!.slug), `${l} duplicate slug ${e!.slug}`);
        seen.add(e!.slug);
      }
      assert.ok(SLUGS[l].home, `${l} has a home`);
    }
  });

  it('no locale prefix or localized path collides with English routes, redirects or public/ files', () => {
    const config = fs.readFileSync(path.join(ROOT, 'astro.config.mjs'), 'utf8');
    const redirects = new Set(Array.from(config.matchAll(/^\s*'(\/[^']+)':\s*$|^\s*'(\/[^']+)':\s*'/gm), (m) => m[1] || m[2]));
    assert.ok(redirects.size >= 10, 'parsed astro.config.mjs redirects');
    const top = new Set<string>([
      ...fs.readdirSync(path.join(ROOT, 'src/pages')).map((f) => f.replace(/\.(astro|ts)$/, '')),
      ...fs.readdirSync(path.join(ROOT, 'public')),
    ]);
    for (const l of LOCALES) assert.ok(!top.has(l), `locale /${l} collides with src/pages or public/`);
    const english = new Set(Object.values(PAGES).map((p) => p.en));
    for (const l of LOCALES) {
      for (const id of PAGE_IDS) {
        const p = rawPathFor(id, l);
        if (!p) continue;
        assert.ok(!english.has(p) && !redirects.has(p), `${p} collides`);
        assert.ok(!p.endsWith('/'), `${p} trailing slash`);
      }
    }
  });

  it('pathFor / routeForPath round-trip, slash-insensitive; homes are /<locale>', () => {
    withPreviewAll(() => {
      for (const l of LOCALES) {
        assert.equal(pathFor('home', l), localeHome(l));
        for (const id of PAGE_IDS) {
          const p = pathFor(id, l);
          if (!p) continue;
          assert.deepEqual(routeForPath(p), { pageId: id, locale: l });
          assert.deepEqual(routeForPath(`${p}/`), { pageId: id, locale: l });
        }
      }
      assert.deepEqual(routeForPath('/'), { pageId: 'home', locale: 'en' });
      assert.deepEqual(routeForPath('/pinterest-video-downloader/'), { pageId: 'pinterest-video-downloader', locale: 'en' });
      assert.equal(routeForPath('/es/no-existe'), null);
      assert.equal(routeForPath('/blog/x'), null);
      assert.equal(localizedRoutes().some((r) => r.pageId === 'home'), false);
    });
  });

  it('release mode routes only LOCALE_META.live locales', () => {
    for (const l of LOCALES) {
      assert.equal(liveLocales().includes(l), LOCALE_META[l].live);
      if (!LOCALE_META[l].live) assert.equal(pathFor('pinterest-video-downloader', l), null);
    }
  });
});

describe('i18n hreflang clusters', () => {
  it('every member lists the identical set: self, en, x-default = English, absolute apex URLs', () => {
    withPreviewAll(() => {
      for (const id of PAGE_IDS) {
        const set = alternatesFor(id);
        const en = `https://pintdownload.app${PAGES[id].en === '/' ? '/' : PAGES[id].en}`;
        assert.equal(set[0].hreflang, 'en');
        assert.equal(set[0].href, en);
        assert.equal(set.at(-1)!.hreflang, 'x-default');
        assert.equal(set.at(-1)!.href, en);
        const codes = set.map((a) => a.hreflang);
        assert.equal(new Set(codes).size, codes.length, `${id} duplicate hreflang`);
        for (const a of set) {
          assert.match(a.href, /^https:\/\/pintdownload\.app\//);
          if (a.locale !== 'x-default') assert.equal(a.hreflang, LOCALE_META[a.locale].hreflang);
          if (a.locale !== 'x-default' && a.locale !== 'en') {
            const back = routeForPath(new URL(a.href).pathname)!;
            assert.equal(back.pageId, id);
            assert.deepEqual(alternatesFor(back.pageId), set, 'reciprocal identical set');
          }
        }
      }
    });
  });

  it('closed gates and skipped pages are absent from every cluster', () => {
    withPreviewAll(() => {
      const saved = { ...GATE_OPEN };
      try {
        GATE_OPEN['gated-audio'] = false;
        GATE_OPEN['gated-4k'] = false;
        for (const id of ['pinterest-audio-downloader', 'pinterest-4k-downloader'] as PageId[]) {
          assert.deepEqual(alternatesFor(id).map((a) => a.hreflang), ['en', 'x-default']);
          assert.equal(localizedRoutes().some((r) => r.pageId === id), false);
        }
        // Story and SEO-title pages are skipped in every locale.
        GATE_OPEN['gated-audio'] = true;
        GATE_OPEN['gated-4k'] = true;
        assert.deepEqual(alternatesFor('pinterest-story-downloader').map((a) => a.hreflang), ['en', 'x-default']);
        assert.equal(alternatesFor('pinterest-4k-downloader').length, 2 + 6, 'six honest 4K pages');
        assert.equal(alternatesFor('pinterest-audio-downloader').length, 2 + 9, 'nine audio pages');
      } finally {
        Object.assign(GATE_OPEN, saved);
      }
    });
  });

  it('sitemap entries carry the same clusters as the HTML', () => {
    withPreviewAll(() =>
      withIndexableAll(() => {
        const entries = localizedSitemapEntries({ 'es/home': '2026-10-15' });
        assert.equal(entries.length, 166);
        for (const e of entries) {
          const r = routeForPath(new URL(e.loc).pathname)!;
          assert.deepEqual(e.alternates, alternatesFor(r.pageId));
        }
        assert.equal(entries.find((e) => e.loc === 'https://pintdownload.app/es')!.lastmod, '2026-10-15');
        assert.deepEqual(sitemapAlternatesFor('/pinterest-video-downloader'), alternatesFor('pinterest-video-downloader'));
        assert.equal(sitemapAlternatesFor('/blog'), undefined);
      }),
    );
  });

  it('noindex locales stay routed but leave the sitemap and the search cluster', () => {
    withPreviewAll(() => {
      const saved = LOCALE_META.es.indexable;
      try {
        LOCALE_META.es.indexable = false;
        assert.equal(isLocaleIndexable('es'), false);
        assert.equal(isLocaleIndexable('en'), true);
        assert.equal(pathFor('pinterest-video-downloader', 'es'), '/es/descargar-videos-pinterest');
        assert.ok(alternatesFor('pinterest-video-downloader').some((a) => a.locale === 'es'), 'language menu keeps es');
        assert.equal(indexableAlternatesFor('pinterest-video-downloader').some((a) => a.locale === 'es'), false);
        assert.equal(localizedSitemapEntries().some((e) => e.loc.startsWith('https://pintdownload.app/es')), false);
      } finally {
        LOCALE_META.es.indexable = saved;
      }
    });
  });

  it('routes prop: live paths of one locale plus its home', () => {
    withPreviewAll(() => {
      const r = routesProp('es');
      assert.equal(r.home, '/es');
      assert.equal(r['pinterest-board-downloader'], '/es/descargar-tableros-pinterest');
      assert.equal('pinterest-story-downloader' in r, false);
      assert.deepEqual(routesProp('en').home, '/');
    });
  });
});

describe('i18n worker routing and redirects', () => {
  it('run_worker_first covers the deepest localized path (trailing-slash 301, not Cloudflare 307)', () => {
    const wrangler = parseJsonc(fs.readFileSync(path.join(ROOT, 'wrangler.jsonc'), 'utf8'));
    const depth = withPreviewAll(() =>
      Math.max(...LOCALES.flatMap((l) => PAGE_IDS.map((id) => rawPathFor(id, l)?.split('/').length ?? 0))) - 1,
    );
    assert.equal(depth, 2);
    const pattern = `/${Array(depth).fill('*').join('/')}/`;
    assert.ok(wrangler.assets.run_worker_first.includes(pattern), `run_worker_first needs ${pattern}`);
    assert.equal(wrangler.assets.not_found_handling, '404-page');
  });

  it('hostRedirectUrl strips trailing slashes on localized URLs', () => {
    assert.equal(hostRedirectUrl('https://pintdownload.app/es/'), 'https://pintdownload.app/es');
    assert.equal(hostRedirectUrl('https://pintdownload.app/ar/x/'), 'https://pintdownload.app/ar/x');
    assert.equal(hostRedirectUrl('https://www.pintdownload.app/de'), 'https://pintdownload.app/de');
    assert.equal(hostRedirectUrl('https://pintdownload.app/es/descargar-videos-pinterest'), null);
  });

  it('no locale redirect logic: worker and middleware never read Accept-Language, CF-IPCountry or a language cookie', () => {
    for (const f of ['src/worker.ts', 'src/middleware.ts', 'src/lib/host-redirect.ts']) {
      const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
      assert.doesNotMatch(src, /accept-language|cf-ipcountry|preferred_lang/i, f);
    }
  });
});

describe('i18n inline markup', () => {
  it('escapes everything and renders the mini-markup', () => {
    withPreviewAll(() => {
      const html = renderInline('a <b> & **c** `pin.it` [[pinterest-board-downloader|tablero]] [[en:/blog|blog]] [x](https://help.pinterest.com/es/)', 'es');
      assert.equal(
        html,
        'a &lt;b&gt; &amp; <strong>c</strong> <code dir="ltr" translate="no">pin.it</code> <a href="/es/descargar-tableros-pinterest">tablero</a> <a href="/blog" hreflang="en">blog</a> <a href="https://help.pinterest.com/es/" rel="noopener" target="_blank">x</a>',
      );
      assert.equal(inlineToText('**a** `b` [[home|c]]'), 'a b c');
      assert.throws(() => renderInline('[[pinterest-carousel-downloader|x]]', 'fr'), InlineMarkupError, 'skipped page');
      assert.throws(() => renderInline('[x](https://evil.example/)', 'es'), InlineMarkupError);
      assert.throws(() => renderInline('**unclosed', 'es'), InlineMarkupError);
    });
  });
});

describe('i18n content files', () => {
  const contentRoot = path.join(ROOT, 'src/content/i18n');
  const dirs = fs.existsSync(contentRoot) ? fs.readdirSync(contentRoot) : [];
  const enPaths = englishPaths(getAllPosts().map((p) => p.slug));

  it('every file passes the schema, the plan matrix, links, honesty and glossary rules', () => {
    const errors: string[] = [];
    for (const dir of dirs) {
      if (!(LOCALES as readonly string[]).includes(dir)) {
        errors.push(`${dir}: not a locale folder`);
        continue;
      }
      const pages = new Map();
      for (const name of fs.readdirSync(path.join(contentRoot, dir))) {
        const file = `src/content/i18n/${dir}/${name}`;
        const data = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
        const { findings, page } = checkPageFile({ file, data, dirLocale: dir, filePageId: name.replace(/\.json$/, '') }, plan.matrix, enPaths);
        errors.push(...errorsOnly(findings));
        if (page) pages.set(page.pageId, { file, page });
      }
      errors.push(...errorsOnly(checkLocale(dir as Locale, pages, false)));
    }
    assert.deepEqual(errors, []);
  });

  it('released locales have content for every live page (content ↔ SLUGS parity)', () => {
    for (const l of LOCALES.filter((x) => LOCALE_META[x].live)) {
      for (const id of PAGE_IDS) {
        if (!isLive(id, l)) continue;
        assert.ok(fs.existsSync(path.join(contentRoot, l, `${id}.json`)), `${l}/${id}.json missing for a released locale`);
      }
    }
  });

  it('the schema enforces lengths, NFC and no raw HTML', () => {
    const file = path.join(contentRoot, 'es/home.json');
    if (!fs.existsSync(file)) return;
    const base = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.equal(PageContent.safeParse(base).success, true);
    const bad = (mut: (d: any) => void) => {
      const d = structuredClone(base);
      mut(d);
      return PageContent.safeParse(d).success;
    };
    assert.equal(bad((d) => (d.meta.title = 'x'.repeat(63))), false);
    assert.equal(bad((d) => (d.meta.description = 'x'.repeat(119))), false);
    assert.equal(bad((d) => (d.hero.h1 = 'Café decomposed')), false, 'NFC');
    assert.equal(bad((d) => (d.intro[0] = 'raw <b>html</b>')), false);
    assert.equal(bad((d) => (d.hero.h1 = 'Arrow → here')), false, 'display glyph');
    assert.equal(bad((d) => delete d.aside), false, 'home requires aside');
  });
});

describe('i18n catalogs', () => {
  // esbuild glob imports: every src/i18n/ui/<xx>.ts and src/i18n/island/<xx>.ts is bundled.
  const uiCatalog = (code: string): any => {
    try {
      const m = require(`../src/i18n/ui/${code}.ts`);
      return m.UI ?? m.EN_UI;
    } catch {
      return null;
    }
  };
  const islandCatalog = (code: string): any => {
    try {
      const m = require(`../src/i18n/island/${code}.ts`);
      return m.ISLAND ?? m.EN_ISLAND;
    } catch {
      return null;
    }
  };

  it('ui/<locale>.ts and island/<locale>.ts have the English key tree, tokens and plural categories', () => {
    const errors: string[] = [];
    const enIsland = islandCatalog('en');
    for (const l of LOCALES) {
      const ui = uiCatalog(l);
      if (ui) errors.push(...errorsOnly(checkCatalog(`src/i18n/ui/${l}.ts`, l, EN_UI, ui)));
      const isl = islandCatalog(l);
      if (isl && enIsland) errors.push(...errorsOnly(checkCatalog(`src/i18n/island/${l}.ts`, l, enIsland, isl)));
      if (LOCALE_META[l].live) assert.ok(ui && isl, `${l} is released without its catalogs`);
    }
    assert.deepEqual(errors, []);
  });
});

describe('i18n llms.txt Languages section', () => {
  it('lists English plus exactly the released locales, with endonyms and home URLs', () => {
    const text = fs.readFileSync(path.join(ROOT, 'public/llms.txt'), 'utf8');
    const section = text.split('## Languages')[1]?.split('\n## ')[0] ?? '';
    const listed = Array.from(section.matchAll(/^- (.+) \(([a-z]{2})\): (https:\/\/pintdownload\.app\/[a-z]{0,2})$/gm), (m) => ({
      endonym: m[1],
      code: m[2],
      url: m[3],
    }));
    const want = ['en', ...LOCALES.filter((l) => LOCALE_META[l].live)];
    assert.deepEqual(listed.map((l) => l.code), want, 'update public/llms.txt when a locale is released');
    for (const l of listed) {
      const code = l.code as 'en' | Locale;
      assert.equal(l.endonym, LOCALE_META[code].endonym);
      assert.equal(l.url, `https://pintdownload.app${localeHome(code)}`);
    }
  });
});
