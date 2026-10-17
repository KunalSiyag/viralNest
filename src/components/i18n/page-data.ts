/**
 * Shared data for the localized templates (HomePage, ToolPage, GuidePage).
 * Server-only: reads the i18nPages collection and the per-locale UI catalogs.
 */
import { getCollection, getEntry } from 'astro:content';
import { LOCALE_META, type Locale } from '../../i18n/locales';
import { ISLAND_PAGE_IDS, PAGES, pathFor, routesProp, variantFor, type FormVariant, type PageId } from '../../i18n/routes';
import type { PageContentData } from '../../i18n/schema';
import { EN_UI, type UiStrings } from '../../i18n/ui/en';
import { INK_STOCK, STOCKS, type StockKey } from '../../lib/stocks';
import { absoluteUrl } from '../../lib/urls';
import { localizedPageJsonLd } from '../../i18n/jsonld';
import { islandMessagesFor } from '../../i18n/island/catalogs';

const uiModules = import.meta.glob<{ UI?: UiStrings; default?: UiStrings }>('../../i18n/ui/*.ts', { eager: true });

/** Chrome strings of a locale; English until the writer adds src/i18n/ui/<locale>.ts. */
export function uiFor(locale: Locale): UiStrings {
  const mod = uiModules[`../../i18n/ui/${locale}.ts`];
  return mod?.UI ?? mod?.default ?? EN_UI;
}

export async function loadPage(locale: Locale, pageId: PageId): Promise<PageContentData> {
  const entry = await getEntry('i18nPages', `${locale}/${pageId}`);
  if (!entry) {
    throw new Error(
      `Missing content src/content/i18n/${locale}/${pageId}.json for live route ${pathFor(pageId, locale)}`,
    );
  }
  if (entry.data.locale !== locale || entry.data.pageId !== pageId) {
    throw new Error(`src/content/i18n/${locale}/${pageId}.json declares ${entry.data.locale}/${entry.data.pageId}`);
  }
  return entry.data;
}

/** Live pages of a locale with their content (nav labels, cards). */
export async function livePagesOf(locale: Locale): Promise<Map<PageId, PageContentData>> {
  const entries = await getCollection('i18nPages', (e) => e.data.locale === locale);
  return new Map(entries.filter((e) => pathFor(e.data.pageId, locale)).map((e) => [e.data.pageId, e.data]));
}

const STOCK_BY_PAGE: Partial<Record<PageId, StockKey>> = {
  'pinterest-pin-downloader': 'pin',
  'pinterest-video-downloader': 'video',
  'pinterest-to-mp4': 'video',
  'pinterest-image-downloader': 'image',
  'pinterest-carousel-downloader': 'image',
  'pinterest-gif-downloader': 'gif',
  'pinterest-board-downloader': 'board',
  'pinterest-profile-downloader': 'profile',
  'pinterest-profile-picture-downloader': 'avatar',
};

export function stockOf(pageId: PageId): { color: string; onColor: string } {
  const key = STOCK_BY_PAGE[pageId];
  return key ? STOCKS[key] : INK_STOCK;
}

/** Same order as the English RelatedTools list, then the pages English does not list there. */
const RELATED_ORDER: PageId[] = [
  'pinterest-pin-downloader',
  'pinterest-video-downloader',
  'pinterest-image-downloader',
  'pinterest-board-downloader',
  'pinterest-profile-downloader',
  'pinterest-gif-downloader',
  'download-pinterest-videos-iphone-android',
  'pinterest-carousel-downloader',
  'pinterest-video-downloader-chrome',
  'how-to-download-pinterest-video-in-gallery',
  'how-to-download-pinterest-video-on-laptop',
  'pinterest-profile-picture-downloader',
  'pinterest-to-mp4',
  'pinterest-audio-downloader',
  'pinterest-4k-downloader',
  'how-to-download-pinterest-videos',
];

export function relatedTools(locale: Locale, current: PageId, pages: Map<PageId, PageContentData>) {
  return RELATED_ORDER.filter((id) => id !== current && pages.has(id)).map((id) => {
    const card = pages.get(id)!.nav.card;
    return { href: pathFor(id, locale)!, title: card.title, blurb: card.blurb, badge: card.badge, ...stockOf(id) };
  });
}

/** Example link shown beside the steps when the content does not set one. */
export function exampleUrlFor(variant: FormVariant): string {
  switch (variant) {
    // Same real public examples as the English pages.
    case 'board':
      return 'https://www.pinterest.com/pinterest/pinterest-presents/';
    case 'profile':
    case 'profile-picture':
      return 'https://www.pinterest.com/pinterest/';
    case 'hub':
    case 'pin':
      return 'https://www.pinterest.com/pin/112027111109431342/';
    case 'image':
      return 'https://www.pinterest.com/pin/…';
    default:
      return 'https://pin.it/…';
  }
}

/** Everything a localized template needs, computed once. */
export async function pageContext(locale: Locale, pageId: PageId) {
  const page = await loadPage(locale, pageId);
  const pages = await livePagesOf(locale);
  const ui = uiFor(locale);
  const def = PAGES[pageId];
  const variant = variantFor(pageId, locale);
  const path = pathFor(pageId, locale)!;
  const url = absoluteUrl(path);
  return {
    page,
    pages,
    ui,
    def,
    variant,
    path,
    url,
    meta: LOCALE_META[locale],
    routes: routesProp(locale, ISLAND_PAGE_IDS),
    messages: islandMessagesFor(locale, variant),
    jsonLd: localizedPageJsonLd(page, url, def.template),
    related: relatedTools(locale, pageId, pages),
    compareLinks: {
      pin: pathFor('pinterest-pin-downloader', locale),
      board: pathFor('pinterest-board-downloader', locale),
      profile: pathFor('pinterest-profile-downloader', locale),
    },
  };
}

/**
 * Link, code and emphasis styling for rendered mini-markup inside a localized
 * article (the English pages hand-write the same classes on each element).
 */
export const PROSE_CLASSES = [
  '[&_a]:font-semibold [&_a]:text-rose-700 dark:[&_a]:text-rose-400',
  '[&_a]:underline [&_a]:decoration-2 [&_a]:underline-offset-2 hover:[&_a]:decoration-[3px]',
  '[&_code]:text-[0.875em] [&_code]:bg-slate-100 dark:[&_code]:bg-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded',
  '[&_strong]:text-slate-900 dark:[&_strong]:text-white',
].join(' ');
