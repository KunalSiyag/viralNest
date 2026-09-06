/**
 * Entry bundled by esbuild then executed with node --test.
 * Imports the real shipped source modules (not re-implemented stubs).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { absoluteUrl, normalizeCanonical } from '../src/lib/urls';
import { hostRedirectUrl } from '../src/lib/host-redirect';
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
