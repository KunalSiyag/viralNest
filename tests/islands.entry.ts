/**
 * Island strings (plan §8 Phase 2, islands-strings): catalog contract, fmt and
 * plural helpers, /api/extract error codes, route targets, English SSR, and
 * bundle isolation (no locale catalog or slug in the islands' client code).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import * as esbuild from 'esbuild';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
// @ts-expect-error virtual module provided by tests/islands.test.mjs
import { CATALOG_MODULES } from 'virtual:island-catalogs';
import { EN_ISLAND } from '../src/i18n/island/en';
import type { IslandMessages, PluralForms } from '../src/i18n/island/types';
import { deepMerge, fmt, fmtParts, listSeparator, noticeSeparator, numberFormatter, plural, pluralCategory, regionalNumberLocale } from '../src/i18n/island/fmt';
import { pickIsland, registerIslandCatalog, sliceIsland as pickIslandOf, sliceSticky as pickSticky, reachableVariants } from '../src/i18n/island/pick';
import { API_ERROR_KIND, CLIENT_ERROR_KIND, apiErrorKey, errorKind, mp3ErrorCode } from '../src/i18n/island/errors';
import { MP3_ERROR_TEXT, Mp3Error } from '../src/lib/audio/to-mp3';
import { EN_ISLAND_PATHS, classifyPinterestInput, getSuitableToolForMedia, routeTo, type IslandPageId } from '../src/lib/pinterest-route';
import { ISLAND_PAGE_IDS, PAGES, PAGE_IDS, SLUGS, STICKY_PAGE_IDS, routesProp } from '../src/i18n/routes';
import { LOCALES, LOCALE_META } from '../src/i18n/locales';
import DownloaderForm from '../src/components/DownloaderForm';
import StickyPasteBar from '../src/components/StickyPasteBar';
import { SCENARIOS } from './fixtures/extract/scenarios';

const ROOT = process.cwd();
const golden: Record<string, { status: number; bodyText: string }> = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'tests/fixtures/extract/golden.json'), 'utf8'),
);
const CATALOGS: Record<string, IslandMessages> = Object.fromEntries(
  Object.entries(CATALOG_MODULES as Record<string, { ISLAND?: IslandMessages }>).map(([loc, mod]) => [loc, mod.ISLAND as IslandMessages]),
);
const VARIANTS = Object.keys(EN_ISLAND.variants) as (keyof IslandMessages['variants'])[];
/**
 * Budget for one serialized `messages` prop, in UTF-8 bytes of its JSON and in
 * brotli bytes (what travels). The plan's original "< 8 KB raw" could not hold
 * the island's strings (English alone is ≈12 KB); the gate was restated as
 * these two numbers (i18n-plan.md §8, architecture.md §10/§14). Thai, Cyrillic
 * and Arabic take 2–3 bytes a character, so characters are not counted.
 */
const PROP_BUDGET = 24 * 1024;
const PROP_BUDGET_BROTLI = 5.5 * 1024;

/** Every leaf of a catalog as [dotted.path, value]. */
function leaves(obj: unknown, prefix = ''): [string, unknown][] {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
  }
  return [[prefix, obj]];
}
const isPlural = (p: string) => /\.(zero|one|two|few|many|other)$/.test(p);
const pluralBase = (p: string) => p.replace(/\.(zero|one|two|few|many|other)$/, '');
const tokens = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('EN_ISLAND contract', () => {
  it('every leaf is a non-empty string', () => {
    for (const [p, v] of leaves(EN_ISLAND)) assert.ok(typeof v === 'string' && v.length > 0, p);
  });
  it('covers all 8 form variants with all 6 fields (per-variant CTA labels, F9)', () => {
    assert.deepEqual(VARIANTS.sort(), ['board', 'gif', 'hub', 'image', 'pin', 'profile', 'profile-picture', 'video']);
    for (const v of VARIANTS) {
      assert.deepEqual(Object.keys(EN_ISLAND.variants[v]).sort(), ['ariaLabel', 'expect', 'hint', 'placeholder', 'singleTab', 'submitLabel'], v);
    }
    // F9: board/profile tools never say "Download MP4" / "Download Video".
    assert.doesNotMatch(EN_ISLAND.variants.board.submitLabel, /MP4|Video/);
    assert.doesNotMatch(EN_ISLAND.variants.image.submitLabel, /MP4|Video/);
  });
  it('honesty: no 4K, no "original size", no unconditional 1080p', () => {
    for (const [p, v] of leaves(EN_ISLAND)) {
      const s = String(v);
      assert.doesNotMatch(s, /\b4k\b|uncompressed|original (size|resolution|quality)/i, p);
      if (/1080p/.test(s)) assert.match(s, /usually 720p, 1080p when/, p);
    }
  });
  it('lang matches LOCALE_META.en.htmlLang', () => assert.equal(EN_ISLAND.lang, LOCALE_META.en.htmlLang));
});

describe('locale island catalogs (src/i18n/island/<loc>.ts)', () => {
  it('only known locale codes', () => {
    for (const loc of Object.keys(CATALOGS)) assert.ok((LOCALES as readonly string[]).includes(loc), loc);
  });
  const enLeaves = new Map(leaves(EN_ISLAND));
  const enPlurals = new Set([...enLeaves.keys()].filter(isPlural).map(pluralBase));
  for (const [loc, cat] of Object.entries(CATALOGS)) {
    describe(loc, () => {
      it('exports ISLAND', () => assert.ok(cat && typeof cat === 'object'));
      it('lang is LOCALE_META htmlLang', () => assert.equal(cat.lang, LOCALE_META[loc as keyof typeof LOCALE_META].htmlLang));
      const locLeaves = new Map(leaves(cat));
      it('same key tree as English (plural maps may add categories)', () => {
        const missing = [...enLeaves.keys()].filter((k) => !locLeaves.has(k) && !(isPlural(k) && locLeaves.has(`${pluralBase(k)}.other`)));
        const extra = [...locLeaves.keys()].filter((k) => !enLeaves.has(k) && !(isPlural(k) && enPlurals.has(pluralBase(k))));
        assert.deepEqual(missing, [], 'missing keys');
        assert.deepEqual(extra, [], 'unknown keys');
      });
      it('same {tokens} as English, NFC, non-empty, no → (U+2192)', () => {
        for (const [k, v] of locLeaves) {
          assert.ok(typeof v === 'string' && v.trim().length > 0, `${k} empty`);
          const s = v as string;
          assert.equal(s, s.normalize('NFC'), `${k} not NFC`);
          assert.ok(!s.includes('→'), `${k} uses → (headline font lacks it; use ›)`);
          const en = enLeaves.get(k) ?? enLeaves.get(`${pluralBase(k)}.other`);
          if (k === 'lang') continue;
          // A plural form may drop {n} (e.g. "one board"), never add tokens.
          const want = tokens(String(en));
          const got = tokens(s);
          if (isPlural(k)) assert.ok(got.every((t) => want.includes(t)), `${k}: tokens ${got} not in ${want}`);
          else assert.deepEqual(got, want, `${k} tokens`);
        }
      });
      it('plural maps cover every Intl.PluralRules category of the locale', () => {
        const cats = new Intl.PluralRules(cat.lang).resolvedOptions().pluralCategories;
        for (const base of enPlurals) {
          for (const c of cats) assert.ok(locLeaves.has(`${base}.${c}`), `${base}.${c} missing for ${cat.lang}`);
        }
      });
      it('honesty: no 4K, no "original"-size claims in English words, no fake MP3 wording', () => {
        for (const [k, v] of locLeaves) assert.doesNotMatch(String(v), /\b4k\b|uncompressed/i, k);
      });
      it(`pickIsland output stays under ${PROP_BUDGET / 1024} KB (UTF-8) and ${PROP_BUDGET_BROTLI / 1024} KB brotli per variant`, () => {
        for (const v of VARIANTS) {
          const json = JSON.stringify(pickIslandOf(cat, v));
          assert.ok(Buffer.byteLength(json, 'utf8') < PROP_BUDGET, `${v}: ${Buffer.byteLength(json, 'utf8')} B`);
          assert.ok(zlib.brotliCompressSync(json).length < PROP_BUDGET_BROTLI, `${v}: brotli`);
        }
      });
    });
  }
});

describe('fmt / plural helpers', () => {
  it('fmt fills tokens and leaves unknown ones visible', () => {
    assert.equal(fmt('Packing {done} of {total} files…', { done: 3, total: '12' }), 'Packing 3 of 12 files…');
    assert.equal(fmt('Hi {name}', {}), 'Hi {name}');
  });
  it('fmtParts keeps node values in place', () => {
    const b = { tag: 'b' };
    assert.deepEqual(fmtParts('Saves as {file}', { file: b }), ['Saves as ', b]);
    assert.deepEqual(fmtParts('{name} has {n} files.', { name: b, n: '3' }), [b, ' has ', '3', ' files.']);
  });
  it('plural categories: ru one/few/many/other, ar zero…other, th/vi/id other', () => {
    assert.deepEqual([1, 3, 5, 21, 1.5].map((n) => pluralCategory(n, 'ru')), ['one', 'few', 'many', 'one', 'other']);
    assert.deepEqual([0, 1, 2, 3, 11, 100].map((n) => pluralCategory(n, 'ar')), ['zero', 'one', 'two', 'few', 'many', 'other']);
    for (const l of ['th', 'vi', 'id']) assert.equal(pluralCategory(1, l), 'other');
    const pins: PluralForms = { one: '{n} пин', few: '{n} пина', many: '{n} пинов', other: '{n} пина' };
    assert.equal(plural(pins, 2, { n: 2 }, 'ru'), '2 пина');
    assert.equal(plural(pins, 5, { n: 5 }, 'ru'), '5 пинов');
    assert.equal(plural({ other: '{n} pins' }, 1, { n: 1 }, 'en'), '1 pins', 'English keeps its output (other only)');
  });
  it('pt: zero takes the plural ("0 pins"), one stays singular', () => {
    const pins: PluralForms = { one: '{n} pin', many: '{n} pins', other: '{n} pins' };
    assert.equal(plural(pins, 0, { n: 0 }, 'pt-BR'), '0 pins');
    assert.equal(plural(pins, 1, { n: 1 }, 'pt-BR'), '1 pin');
    assert.equal(pluralCategory(0, 'fr'), 'one', 'only pt is overridden');
  });
  it('es numbers follow a Spanish browser locale (es-MX 3.3, es-ES 3,3); others keep the catalog lang', () => {
    assert.equal(regionalNumberLocale('es', 'es-MX'), 'es-MX');
    assert.equal(regionalNumberLocale('es', 'en-US'), 'es');
    assert.equal(regionalNumberLocale('de', 'de-AT'), 'de');
    const one = { minimumFractionDigits: 1, maximumFractionDigits: 1 };
    assert.equal(new Intl.NumberFormat(regionalNumberLocale('es', 'es-MX'), one).format(3.25), '3.3');
    assert.equal(new Intl.NumberFormat(regionalNumberLocale('es', 'es-ES'), one).format(3.25), '3,3');
  });
  it('list and notice separators: Arabic comma, Thai middle dot', () => {
    assert.equal(listSeparator('ar'), '، ');
    assert.equal(listSeparator('es'), ', ');
    assert.equal(noticeSeparator('th'), ' · ');
    assert.equal(noticeSeparator('de'), '. ');
  });
  it('numbers: Western digits everywhere (ar included); English uses the default locale', () => {
    assert.equal(numberFormatter('ar')(1234), '1,234');
    assert.equal(numberFormatter('de')(1234), '1.234');
    assert.equal(numberFormatter(undefined)(1234), new Intl.NumberFormat().format(1234));
  });
  it('deepMerge: partial over English, nothing lost', () => {
    const merged = deepMerge(EN_ISLAND, { ticket: { paste: 'Pegar' }, variants: { board: { submitLabel: 'Descargar ZIP' } } } as any);
    assert.equal(merged.ticket.paste, 'Pegar');
    assert.equal(merged.ticket.oneLink, EN_ISLAND.ticket.oneLink);
    assert.equal(merged.variants.board.submitLabel, 'Descargar ZIP');
    assert.equal(merged.variants.board.hint, EN_ISLAND.variants.board.hint);
    assert.equal(deepMerge(EN_ISLAND, undefined), EN_ISLAND);
  });
});

describe('pickIsland', () => {
  it('drops the sticky bar and keeps only reachable variants', () => {
    const hub = pickIslandOf(EN_ISLAND, 'hub');
    assert.ok(!('sticky' in hub));
    assert.deepEqual(Object.keys(hub.variants).sort(), ['board', 'gif', 'hub', 'profile']);
    assert.deepEqual(reachableVariants('video').sort(), ['board', 'gif', 'image', 'profile', 'video']);
    assert.deepEqual(pickSticky(EN_ISLAND), { lang: 'en', sticky: EN_ISLAND.sticky });
  });
  it("pickIsland(locale, target): plan signature; English and unwritten locales give undefined", () => {
    assert.equal(pickIsland('en', 'hub'), undefined);
    assert.equal(pickIsland('zz', 'board'), undefined);
    registerIslandCatalog('zz', EN_ISLAND);
    assert.deepEqual(pickIsland('zz', 'board'), pickIslandOf(EN_ISLAND, 'board'));
    assert.deepEqual(pickIsland('zz', 'sticky'), pickSticky(EN_ISLAND));
    assert.deepEqual(pickIsland(EN_ISLAND, 'gif'), pickIslandOf(EN_ISLAND, 'gif'));
  });
  it('the English slice stays under the prop guard (measured ≈12.4 KB JSON, ≈4.2 KB brotli as an island attribute)', () => {
    for (const v of VARIANTS) {
      const size = JSON.stringify(pickIslandOf(EN_ISLAND, v)).length;
      assert.ok(size < 13 * 1024, `${v}: ${size}`);
    }
  });
});

describe('/api/extract error codes', () => {
  const failures = SCENARIOS.filter((s) => golden[s.name].status >= 400);
  it('every failure body carries a code after the unchanged error (additive)', () => {
    assert.ok(failures.length >= 13);
    for (const s of failures) {
      const body = JSON.parse(golden[s.name].bodyText);
      assert.deepEqual(Object.keys(body), ['error', 'code'], s.name);
      assert.equal(typeof body.code, 'string', s.name);
    }
  });
  it('English catalog text and recovery kind equal what the server text gave (English behaviour unchanged)', () => {
    for (const s of failures) {
      const body = JSON.parse(golden[s.name].bodyText);
      let reqUrl = '';
      try {
        reqUrl = JSON.parse(s.body).url || '';
      } catch {
        /* empty body scenario */
      }
      const key = apiErrorKey(body.code, classifyPinterestInput(String(reqUrl))?.type);
      assert.ok(key, `${s.name}: no catalog key for ${body.code}`);
      assert.equal(EN_ISLAND.api[key!], body.error, `${s.name}: EN_ISLAND.api.${key}`);
      assert.equal(API_ERROR_KIND[key!], errorKind(body.error), `${s.name}: kind`);
    }
  });
  it('every extractor code the route can emit has a catalog key', () => {
    for (const code of ['invalid_input', 'blocked', 'not_pinterest', 'left_pinterest', 'removed_or_private', 'avatar_not_found', 'collection_empty', 'no_media', 'access_denied', 'origin_denied', 'server_error']) {
      assert.ok(apiErrorKey(code, 'board'), code);
    }
    assert.equal(apiErrorKey('collection_empty', 'profile'), 'collection_empty_profile');
    assert.equal(apiErrorKey('nope'), null);
    assert.equal(apiErrorKey(undefined), null);
  });
  it('the profile wording of collection_empty matches the extractor', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/lib/extract/collection.ts'), 'utf8');
    assert.ok(src.includes(EN_ISLAND.api.collection_empty_profile));
    assert.ok(src.includes(EN_ISLAND.api.collection_empty_board));
  });
  it("the form's own messages keep the kinds errorKind gave the English text", () => {
    for (const [k, kind] of Object.entries(CLIENT_ERROR_KIND)) {
      assert.equal(errorKind((EN_ISLAND.errors as any)[k]), kind, k);
    }
    assert.equal(errorKind(fmt(EN_ISLAND.errors.zipPartial.other, { ok: 1, total: 2, failed: 1 })), 'other');
  });
  it('MP3 texts equal lib/audio and are recognised by code', () => {
    assert.deepEqual(EN_ISLAND.mp3, MP3_ERROR_TEXT);
    assert.equal(mp3ErrorCode(new Mp3Error('unsupported', 'x')), 'unsupported');
    assert.equal(mp3ErrorCode(new Error('x')), null);
    for (const t of Object.values(MP3_ERROR_TEXT)) assert.equal(errorKind(t), 'other');
  });
});

describe('island route targets', () => {
  it('EN_ISLAND_PATHS match PAGES[pageId].en (and are real PageIds)', () => {
    for (const [id, p] of Object.entries(EN_ISLAND_PATHS)) {
      assert.ok((PAGE_IDS as readonly string[]).includes(id), id);
      assert.equal(PAGES[id as keyof typeof PAGES].en, p, id);
    }
  });
  it('island routes props carry only the pages the island links to', () => {
    for (const loc of LOCALES) {
      const island = routesProp(loc, ISLAND_PAGE_IDS);
      for (const k of Object.keys(island)) assert.ok(k === 'home' || ISLAND_PAGE_IDS.includes(k as any), `${loc} ${k}`);
      for (const k of Object.keys(EN_ISLAND_PATHS)) if (k !== 'home') assert.ok(ISLAND_PAGE_IDS.includes(k as any), k);
      const sticky = routesProp(loc, STICKY_PAGE_IDS);
      assert.ok(Object.keys(sticky).every((k) => k === 'home' || STICKY_PAGE_IDS.includes(k as any)), loc);
    }
  });
  it('route notices and the sticky bar resolve in the current locale, falling back to its home', () => {
    const es = routesProp('es');
    assert.equal(routeTo(EN_ISLAND_PATHS, 'pinterest-board-downloader'), '/pinterest-board-downloader');
    assert.equal(routeTo(es, 'pinterest-board-downloader'), es['pinterest-board-downloader'] ?? es.home);
    assert.ok(routeTo(es, 'pinterest-board-downloader').startsWith('/es'));
    const bare = { home: '/fr' };
    assert.equal(routeTo(bare, 'pinterest-carousel-downloader'), '/fr');
    assert.equal(routeTo({ home: '/fr', 'pinterest-image-downloader': '/fr/img' }, 'pinterest-carousel-downloader'), '/fr/img');
  });
  it('classifier and media router name the page by id', () => {
    assert.equal(classifyPinterestInput('https://www.pinterest.com/maker_one/cozy-rooms/')?.pageId, 'pinterest-board-downloader');
    assert.equal(classifyPinterestInput('https://www.pinterest.com/maker_one/')?.pageId, 'pinterest-profile-downloader');
    const cases: [object, IslandPageId][] = [
      [{ is_board: true }, 'pinterest-board-downloader'],
      [{ is_profile: true, is_avatar_only: true }, 'pinterest-profile-picture-downloader'],
      [{ is_profile: true }, 'pinterest-profile-downloader'],
      [{ is_carousel: true }, 'pinterest-carousel-downloader'],
      [{ is_gif: true }, 'pinterest-gif-downloader'],
      [{ is_video: true }, 'pinterest-video-downloader'],
      [{}, 'pinterest-image-downloader'],
    ];
    for (const [r, id] of cases) {
      const t = getSuitableToolForMedia(r);
      assert.equal(t.pageId, id);
      assert.equal(t.path, EN_ISLAND_PATHS[id]);
    }
  });
});

/** A pseudo-locale: every catalog string wrapped in ⟦…⟧ (tokens kept), to find English left in the islands. */
function pseudo<T>(v: T): T {
  if (typeof v === 'string') return `⟦${v}⟧` as T;
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === 'lang' ? x : pseudo(x)])) as T;
  return v;
}
/** Visible text and translatable attributes of SSR markup, minus pseudo-wrapped spans. */
function englishLeft(html: string): string[] {
  const chunks = [
    ...html.replace(/<[^>]+>/g, '\n').split('\n'),
    ...[...html.matchAll(/\s(?:placeholder|aria-label|title|alt)="([^"]*)"/g)].map((m) => m[1]),
  ];
  const allowed = /^(MP4|MP3|GIF|JPG|ZIP|Pinterest|Instagram Reels|TikTok|YT Shorts|kbps|https?:|pin\.it)$/;
  return chunks
    .map((c) => c.replace(/⟦[\s\S]*?⟧/g, ' ').replace(/&[a-z]+;|&#\d+;/g, ' ').trim())
    .flatMap((c) => c.match(/[A-Za-z][A-Za-z']+/g) || [])
    .filter((w) => !allowed.test(w));
}

describe('islands render English unchanged and take messages', () => {
  it('English SSR: no props → the same strings as before (spot check)', () => {
    const html = renderToStaticMarkup(createElement(DownloaderForm, { variant: 'board' }));
    for (const s of ['Admit one · public link', 'Board URL', 'Extract Board Pins', 'Takes a board link', 'Pick the tool for your link', 'Board ZIP']) {
      assert.ok(html.includes(s.replace(/&/g, '&amp;')), s);
    }
    assert.ok(html.includes('href="/pinterest-board-downloader"'));
    assert.ok(!/ dir="/.test(html), 'English HTML gains no dir attributes');
  });
  for (const variant of VARIANTS) {
    for (const layout of ['default', 'hero'] as const) {
      it(`pseudo-locale SSR leaves no English (${variant}/${layout})`, () => {
        const messages = pickIslandOf(pseudo(EN_ISLAND), variant);
        const html = renderToStaticMarkup(
          createElement(DownloaderForm, { variant, layout, messages, routes: { home: '/xx', 'pinterest-board-downloader': '/xx/board' } }),
        );
        assert.deepEqual(englishLeft(html), [], html.slice(0, 400));
        assert.ok(html.includes('dir="ltr"'), 'URL input is LTR on localized pages');
        // Only pages that exist in the locale get a tool chip.
        assert.ok(html.includes('href="/xx/board"'));
        assert.ok(!html.includes('href="/pinterest-'), 'no English tool links');
      });
    }
  }
  it('StickyPasteBar renders nothing until scrolled (SSR), with or without messages', () => {
    assert.equal(renderToStaticMarkup(createElement(StickyPasteBar)), '');
    assert.equal(renderToStaticMarkup(createElement(StickyPasteBar as any, { messages: pickSticky(pseudo(EN_ISLAND)), routes: { home: '/xx' } })), '');
  });
});

describe('bundle isolation: islands ship no locale catalog and no locale slug', () => {
  const entries = ['DownloaderForm', 'StickyPasteBar', 'AudioTrimmer', 'ImageCropperModal'].map((n) => path.join(ROOT, `src/components/${n}.tsx`));
  it('client bundle of the four islands imports only en.ts from src/i18n', async () => {
    const out = await esbuild.build({
      entryPoints: entries,
      bundle: true,
      write: false,
      outdir: path.join(ROOT, '.islands-bundle-probe'),
      platform: 'browser',
      format: 'esm',
      metafile: true,
      jsx: 'automatic',
      loader: { '.css': 'empty' },
      packages: 'external',
      logLevel: 'silent',
    });
    const inputs = Object.keys(out.metafile!.inputs).map((p) => p.replace(/\\/g, '/'));
    const i18nInputs = inputs.filter((p) => p.includes('src/i18n/'));
    // pick.ts rides along with en.ts (re-export for server templates; no strings, no catalog imports).
    assert.deepEqual(i18nInputs.sort(), ['src/i18n/island/en.ts', 'src/i18n/island/errors.ts', 'src/i18n/island/fmt.ts', 'src/i18n/island/pick.ts']);
    assert.ok(!i18nInputs.some((p) => /catalogs\.ts$|\/[a-z]{2}\.ts$/.test(p) && !p.endsWith('/en.ts')), 'no catalog module');
    const js = out.outputFiles.map((f) => f.text).join('\n');
    const englishSlugs = new Set(Object.values(PAGES).map((p) => p.en.slice(1)));
    const slugs = Object.values(SLUGS)
      .flatMap((m) => Object.values(m).map((e) => e!.slug))
      .filter((s) => s && !englishSlugs.has(s));
    for (const s of slugs) assert.ok(!js.includes(s), `locale slug in island bundle: ${s}`);
    for (const [loc, cat] of Object.entries(CATALOGS)) {
      for (const [k, v] of leaves(cat)) {
        const s = String(v);
        if (s.length >= 12 && !leaves(EN_ISLAND).some(([, e]) => e === s)) assert.ok(!js.includes(s), `${loc} ${k} in island bundle`);
      }
    }
  });
  it('built dist/_astro/*.js (when present) carries no locale catalog string', () => {
    const dir = path.join(ROOT, 'dist/_astro');
    if (!fs.existsSync(dir)) return;
    const js = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.js'))
      .map((f) => fs.readFileSync(path.join(dir, f), 'utf8'))
      .join('\n');
    const enStrings = new Set(leaves(EN_ISLAND).map(([, v]) => String(v)));
    for (const [loc, cat] of Object.entries(CATALOGS)) {
      for (const [k, v] of leaves(cat)) {
        const s = String(v);
        if (s.length >= 12 && !enStrings.has(s)) assert.ok(!js.includes(JSON.stringify(s).slice(1, -1)), `${loc} ${k} found in dist/_astro`);
      }
    }
  });
});
