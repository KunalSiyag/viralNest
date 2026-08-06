/**
 * Entry bundled by esbuild then executed with node --test.
 * Imports the real shipped source modules (not re-implemented stubs).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { absoluteUrl, normalizeCanonical } from '../src/lib/urls';
import { softwareAppSchema, SITEMAP_ROUTES, faqSchema, howToSchema } from '../src/lib/seo';
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
    assert.equal(isPostIndexable('pinterest-for-long-flights-and-layovers'), false);
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
      '/blog',
    ]) {
      assert.equal(paths.has(required), true, `missing ${required}`);
    }
    assert.equal(paths.has('/rss.xml'), false);
    assert.equal(paths.has('/api/download'), false);
    assert.equal(paths.has('/embed'), false);
  });
});
