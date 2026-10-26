/**
 * Route map: the single source of truth for every localized URL
 * (docs/i18n/architecture.md §5.1, plan §6).
 *
 * Every canonical, hreflang cluster, sitemap entry, nav/footer link,
 * language-menu link and island route target is derived from here.
 * Plain TypeScript with no Astro imports (node tests and i18n:check import it).
 */
import { absoluteUrl } from '../lib/urls';
import { LOCALES, LOCALE_META, isLocale, type AnyLocale, type Locale } from './locales';

export const PAGE_IDS = [
  'home',
  'pinterest-pin-downloader',
  'pinterest-video-downloader',
  'pinterest-image-downloader',
  'pinterest-gif-downloader',
  'pinterest-board-downloader',
  'pinterest-profile-downloader',
  'pinterest-profile-picture-downloader',
  'pinterest-carousel-downloader',
  'pinterest-story-downloader',
  'pinterest-audio-downloader',
  'pinterest-4k-downloader',
  'pinterest-to-mp4',
  'pinterest-video-downloader-chrome',
  'pinterest-seo-title-generator',
  'how-to-download-pinterest-videos',
  'how-to-download-pinterest-video-in-gallery',
  'how-to-download-pinterest-video-on-laptop',
  'download-pinterest-videos-iphone-android',
] as const;
export type PageId = (typeof PAGE_IDS)[number];

export function isPageId(value: string): value is PageId {
  return (PAGE_IDS as readonly string[]).includes(value);
}

/** Same union as DownloaderForm's FormVariant (kept local: no .tsx import here). */
export type FormVariant = 'hub' | 'pin' | 'video' | 'image' | 'gif' | 'board' | 'profile' | 'profile-picture';
/** Ticket stock (BaseLayout `field`). */
export type Field = 'red' | 'tangerine' | 'canary' | 'lilac' | 'mint' | 'sky' | 'blush' | 'counter';
export type Template = 'home' | 'tool' | 'guide';

export interface PageDef {
  /** English path ('/' for home). */
  en: string;
  template: Template;
  /** DownloaderForm variant, same as the English page. */
  variant: FormVariant;
  /** Ticket stock, same as the English page. */
  field: Field;
}

/**
 * Pages whose localized twin covers a different query than English and so
 * needs another form: th "โหลดรูป Pinterest ให้ชัด" (blurry images) sits on the
 * 4K/HD slot, whose English page is about video. The hub form takes images
 * and videos without switching itself to the video tool.
 */
const VARIANT_OVERRIDES: Partial<Record<AnyLocale, Partial<Record<PageId, FormVariant>>>> = {
  th: { 'pinterest-4k-downloader': 'hub' },
};

/** DownloaderForm variant of a page in a locale (PAGES[pageId].variant unless overridden). */
export function variantFor(pageId: PageId, locale: AnyLocale): FormVariant {
  return VARIANT_OVERRIDES[locale]?.[pageId] ?? PAGES[pageId].variant;
}

export const PAGES: Record<PageId, PageDef> = {
  home: { en: '/', template: 'home', variant: 'hub', field: 'red' },
  'pinterest-pin-downloader': { en: '/pinterest-pin-downloader', template: 'tool', variant: 'pin', field: 'red' },
  'pinterest-video-downloader': { en: '/pinterest-video-downloader', template: 'tool', variant: 'video', field: 'tangerine' },
  'pinterest-image-downloader': { en: '/pinterest-image-downloader', template: 'tool', variant: 'image', field: 'canary' },
  'pinterest-gif-downloader': { en: '/pinterest-gif-downloader', template: 'tool', variant: 'gif', field: 'lilac' },
  'pinterest-board-downloader': { en: '/pinterest-board-downloader', template: 'tool', variant: 'board', field: 'mint' },
  'pinterest-profile-downloader': { en: '/pinterest-profile-downloader', template: 'tool', variant: 'profile', field: 'sky' },
  'pinterest-profile-picture-downloader': { en: '/pinterest-profile-picture-downloader', template: 'tool', variant: 'profile-picture', field: 'blush' },
  'pinterest-carousel-downloader': { en: '/pinterest-carousel-downloader', template: 'tool', variant: 'image', field: 'canary' },
  'pinterest-story-downloader': { en: '/pinterest-story-downloader', template: 'tool', variant: 'video', field: 'tangerine' },
  'pinterest-audio-downloader': { en: '/pinterest-audio-downloader', template: 'tool', variant: 'video', field: 'tangerine' },
  'pinterest-4k-downloader': { en: '/pinterest-4k-downloader', template: 'tool', variant: 'video', field: 'tangerine' },
  'pinterest-to-mp4': { en: '/pinterest-to-mp4', template: 'tool', variant: 'video', field: 'tangerine' },
  'pinterest-video-downloader-chrome': { en: '/pinterest-video-downloader-chrome', template: 'tool', variant: 'hub', field: 'red' },
  'pinterest-seo-title-generator': { en: '/pinterest-seo-title-generator', template: 'tool', variant: 'hub', field: 'red' },
  'how-to-download-pinterest-videos': { en: '/how-to-download-pinterest-videos', template: 'guide', variant: 'video', field: 'tangerine' },
  'how-to-download-pinterest-video-in-gallery': { en: '/how-to-download-pinterest-video-in-gallery', template: 'guide', variant: 'video', field: 'tangerine' },
  'how-to-download-pinterest-video-on-laptop': { en: '/how-to-download-pinterest-video-on-laptop', template: 'guide', variant: 'video', field: 'tangerine' },
  'download-pinterest-videos-iphone-android': { en: '/download-pinterest-videos-iphone-android', template: 'guide', variant: 'video', field: 'tangerine' },
};

/**
 * Route status vocabulary (fixed contract, plan §6 routeStatus).
 * `gated-audio` waited on Q1 (real MP3), `gated-4k` on Q2 (honest 4K pages).
 */
export type RouteStatus = 'live' | 'gated-audio' | 'gated-4k';
export type Gate = Exclude<RouteStatus, 'live'>;

/**
 * Gate switches. Both were opened by the user's decisions of 2026-10-15
 * (real MP3 shipped; English 4K page rewritten, 6 honest 4K pages published).
 * Setting one back to false unpublishes every page carrying that status.
 */
export const GATE_OPEN: Record<Gate, boolean> = {
  'gated-audio': true,
  'gated-4k': true,
};

export interface SlugEntry {
  /** Lowercase ASCII kebab-case; '' only for the locale home. */
  slug: string;
  status: RouteStatus;
}

/**
 * Locale slugs, pre-filled from docs/i18n/i18n-plan.json `matrix` (166 rows).
 * A missing key means the page does not exist in that locale (plan §5).
 * Slug changes: add the old path to `redirects` in astro.config.mjs.
 */
export const SLUGS: Record<Locale, Partial<Record<PageId, SlugEntry>>> = {
  es: {
    'home': { slug: '', status: 'live' },
    'pinterest-pin-downloader': { slug: 'descargar-pin-pinterest', status: 'live' },
    'pinterest-video-downloader': { slug: 'descargar-videos-pinterest', status: 'live' },
    'pinterest-image-downloader': { slug: 'descargar-imagenes-pinterest', status: 'live' },
    'pinterest-gif-downloader': { slug: 'descargar-gif-pinterest', status: 'live' },
    'pinterest-board-downloader': { slug: 'descargar-tableros-pinterest', status: 'live' },
    'pinterest-profile-downloader': { slug: 'descargar-perfil-pinterest', status: 'live' },
    'pinterest-profile-picture-downloader': { slug: 'descargar-foto-perfil-pinterest', status: 'live' },
    'pinterest-carousel-downloader': { slug: 'descargar-carrusel-pinterest', status: 'live' },
    'pinterest-audio-downloader': { slug: 'pinterest-a-mp3', status: 'gated-audio' },
    'pinterest-to-mp4': { slug: 'pinterest-a-mp4', status: 'live' },
    'pinterest-video-downloader-chrome': { slug: 'descargar-videos-pinterest-chrome', status: 'live' },
    'how-to-download-pinterest-videos': { slug: 'como-descargar-videos-pinterest', status: 'live' },
    'how-to-download-pinterest-video-in-gallery': { slug: 'guardar-videos-pinterest-galeria', status: 'live' },
    'how-to-download-pinterest-video-on-laptop': { slug: 'descargar-videos-pinterest-pc', status: 'live' },
    'download-pinterest-videos-iphone-android': { slug: 'descargar-videos-pinterest-celular', status: 'live' },
  },
  pt: {
    'home': { slug: '', status: 'live' },
    'pinterest-pin-downloader': { slug: 'baixar-pin-pinterest', status: 'live' },
    'pinterest-video-downloader': { slug: 'baixar-video-pinterest', status: 'live' },
    'pinterest-image-downloader': { slug: 'baixar-imagem-pinterest', status: 'live' },
    'pinterest-gif-downloader': { slug: 'baixar-gif-pinterest', status: 'live' },
    'pinterest-board-downloader': { slug: 'baixar-pasta-pinterest', status: 'live' },
    'pinterest-profile-downloader': { slug: 'baixar-perfil-pinterest', status: 'live' },
    'pinterest-profile-picture-downloader': { slug: 'baixar-foto-de-perfil-pinterest', status: 'live' },
    'pinterest-carousel-downloader': { slug: 'baixar-carrossel-pinterest', status: 'live' },
    'pinterest-audio-downloader': { slug: 'baixar-som-pinterest', status: 'gated-audio' },
    'pinterest-4k-downloader': { slug: 'baixar-video-pinterest-full-hd', status: 'gated-4k' },
    'pinterest-to-mp4': { slug: 'pinterest-para-mp4', status: 'live' },
    'pinterest-video-downloader-chrome': { slug: 'baixar-video-pinterest-chrome', status: 'live' },
    'how-to-download-pinterest-videos': { slug: 'como-baixar-video-do-pinterest', status: 'live' },
    'how-to-download-pinterest-video-in-gallery': { slug: 'como-salvar-video-do-pinterest-na-galeria', status: 'live' },
    'how-to-download-pinterest-video-on-laptop': { slug: 'como-baixar-video-do-pinterest-no-pc', status: 'live' },
    'download-pinterest-videos-iphone-android': { slug: 'baixar-video-pinterest-iphone-android', status: 'live' },
  },
  fr: {
    'home': { slug: '', status: 'live' },
    'pinterest-pin-downloader': { slug: 'telecharger-epingle-pinterest', status: 'live' },
    'pinterest-video-downloader': { slug: 'telecharger-video-pinterest', status: 'live' },
    'pinterest-image-downloader': { slug: 'telecharger-photo-pinterest', status: 'live' },
    'pinterest-gif-downloader': { slug: 'telecharger-gif-pinterest', status: 'live' },
    'pinterest-board-downloader': { slug: 'telecharger-tableau-pinterest', status: 'live' },
    'pinterest-profile-picture-downloader': { slug: 'telecharger-photo-de-profil-pinterest', status: 'live' },
    'pinterest-audio-downloader': { slug: 'telecharger-mp3-pinterest', status: 'gated-audio' },
    'pinterest-4k-downloader': { slug: 'telecharger-pinterest-4k', status: 'gated-4k' },
    'pinterest-to-mp4': { slug: 'convertisseur-pinterest-mp4', status: 'live' },
    'pinterest-video-downloader-chrome': { slug: 'telecharger-video-pinterest-chrome', status: 'live' },
    'how-to-download-pinterest-videos': { slug: 'comment-telecharger-une-video-pinterest', status: 'live' },
    'how-to-download-pinterest-video-in-gallery': { slug: 'enregistrer-video-pinterest-galerie', status: 'live' },
    'how-to-download-pinterest-video-on-laptop': { slug: 'telecharger-video-pinterest-pc', status: 'live' },
    'download-pinterest-videos-iphone-android': { slug: 'telecharger-video-pinterest-iphone', status: 'live' },
  },
  de: {
    'home': { slug: '', status: 'live' },
    'pinterest-pin-downloader': { slug: 'pinterest-pin-herunterladen', status: 'live' },
    'pinterest-video-downloader': { slug: 'pinterest-video-herunterladen', status: 'live' },
    'pinterest-image-downloader': { slug: 'pinterest-bilder-herunterladen', status: 'live' },
    'pinterest-gif-downloader': { slug: 'pinterest-gif-herunterladen', status: 'live' },
    'pinterest-board-downloader': { slug: 'pinterest-pinnwand-herunterladen', status: 'live' },
    'pinterest-profile-downloader': { slug: 'pinterest-profil-herunterladen', status: 'live' },
    'pinterest-profile-picture-downloader': { slug: 'pinterest-profilbild-herunterladen', status: 'live' },
    'pinterest-carousel-downloader': { slug: 'pinterest-karussell-herunterladen', status: 'live' },
    'pinterest-audio-downloader': { slug: 'pinterest-audio-herunterladen', status: 'gated-audio' },
    'pinterest-to-mp4': { slug: 'pinterest-in-mp4-umwandeln', status: 'live' },
    'pinterest-video-downloader-chrome': { slug: 'pinterest-video-downloader-chrome', status: 'live' },
    'how-to-download-pinterest-videos': { slug: 'pinterest-videos-speichern', status: 'live' },
    'how-to-download-pinterest-video-in-gallery': { slug: 'pinterest-video-in-galerie-speichern', status: 'live' },
    'how-to-download-pinterest-video-on-laptop': { slug: 'pinterest-video-herunterladen-pc', status: 'live' },
    'download-pinterest-videos-iphone-android': { slug: 'pinterest-video-herunterladen-iphone-android', status: 'live' },
  },
  it: {
    'home': { slug: '', status: 'live' },
    'pinterest-pin-downloader': { slug: 'scaricare-pin-da-pinterest', status: 'live' },
    'pinterest-video-downloader': { slug: 'scaricare-video-da-pinterest', status: 'live' },
    'pinterest-image-downloader': { slug: 'scaricare-immagini-da-pinterest', status: 'live' },
    'pinterest-gif-downloader': { slug: 'scaricare-gif-da-pinterest', status: 'live' },
    'pinterest-board-downloader': { slug: 'scaricare-bacheca-pinterest', status: 'live' },
    'pinterest-audio-downloader': { slug: 'scaricare-audio-da-pinterest', status: 'gated-audio' },
    'pinterest-to-mp4': { slug: 'convertitore-pinterest-mp4', status: 'live' },
    'how-to-download-pinterest-videos': { slug: 'come-scaricare-video-da-pinterest', status: 'live' },
    'how-to-download-pinterest-video-in-gallery': { slug: 'come-salvare-video-pinterest-in-galleria', status: 'live' },
    'how-to-download-pinterest-video-on-laptop': { slug: 'come-scaricare-video-da-pinterest-su-pc', status: 'live' },
    'download-pinterest-videos-iphone-android': { slug: 'scaricare-video-pinterest-iphone-android', status: 'live' },
  },
  nl: {
    'home': { slug: '', status: 'live' },
    'pinterest-pin-downloader': { slug: 'pinterest-pin-downloaden', status: 'live' },
    'pinterest-video-downloader': { slug: 'pinterest-video-downloaden', status: 'live' },
    'pinterest-image-downloader': { slug: 'pinterest-foto-downloaden', status: 'live' },
    'pinterest-gif-downloader': { slug: 'pinterest-gif-downloaden', status: 'live' },
    'pinterest-board-downloader': { slug: 'pinterest-bord-downloaden', status: 'live' },
    'how-to-download-pinterest-videos': { slug: 'hoe-pinterest-video-downloaden', status: 'live' },
    'how-to-download-pinterest-video-in-gallery': { slug: 'pinterest-video-opslaan', status: 'live' },
  },
  id: {
    'home': { slug: '', status: 'live' },
    'pinterest-pin-downloader': { slug: 'download-pin-pinterest', status: 'live' },
    'pinterest-video-downloader': { slug: 'download-video-pinterest', status: 'live' },
    'pinterest-image-downloader': { slug: 'download-foto-pinterest', status: 'live' },
    'pinterest-gif-downloader': { slug: 'download-gif-pinterest', status: 'live' },
    'pinterest-board-downloader': { slug: 'download-board-pinterest', status: 'live' },
    'pinterest-profile-picture-downloader': { slug: 'download-foto-profil-pinterest', status: 'live' },
    'pinterest-audio-downloader': { slug: 'download-mp3-pinterest', status: 'gated-audio' },
    'pinterest-to-mp4': { slug: 'pinterest-ke-mp4', status: 'live' },
    'pinterest-video-downloader-chrome': { slug: 'download-video-pinterest-di-chrome', status: 'live' },
    'how-to-download-pinterest-videos': { slug: 'cara-download-video-pinterest', status: 'live' },
    'how-to-download-pinterest-video-in-gallery': { slug: 'cara-menyimpan-video-pinterest-ke-galeri', status: 'live' },
    'how-to-download-pinterest-video-on-laptop': { slug: 'cara-download-video-pinterest-di-laptop', status: 'live' },
    'download-pinterest-videos-iphone-android': { slug: 'cara-download-video-pinterest-di-hp', status: 'live' },
  },
  tr: {
    'home': { slug: '', status: 'live' },
    'pinterest-pin-downloader': { slug: 'pinterest-pin-indir', status: 'live' },
    'pinterest-video-downloader': { slug: 'pinterest-video-indir', status: 'live' },
    'pinterest-image-downloader': { slug: 'pinterest-fotograf-indir', status: 'live' },
    'pinterest-gif-downloader': { slug: 'pinterest-gif-indir', status: 'live' },
    'pinterest-board-downloader': { slug: 'pinterest-pano-indir', status: 'live' },
    'pinterest-profile-downloader': { slug: 'pinterest-profil-indir', status: 'live' },
    'pinterest-profile-picture-downloader': { slug: 'pinterest-profil-fotografi-indir', status: 'live' },
    'pinterest-audio-downloader': { slug: 'pinterest-mp3-donusturucu', status: 'gated-audio' },
    'pinterest-4k-downloader': { slug: 'pinterest-4k-video-indir', status: 'gated-4k' },
    'pinterest-to-mp4': { slug: 'pinterest-mp4-donusturucu', status: 'live' },
    'how-to-download-pinterest-videos': { slug: 'pinterestten-video-nasil-indirilir', status: 'live' },
    'how-to-download-pinterest-video-in-gallery': { slug: 'pinterest-video-galeriye-kaydetme', status: 'live' },
    'how-to-download-pinterest-video-on-laptop': { slug: 'pinterest-video-indir-pc', status: 'live' },
    'download-pinterest-videos-iphone-android': { slug: 'pinterest-video-indir-iphone-android', status: 'live' },
  },
  vi: {
    'home': { slug: '', status: 'live' },
    'pinterest-pin-downloader': { slug: 'tai-ghim-pinterest', status: 'live' },
    'pinterest-video-downloader': { slug: 'tai-video-pinterest', status: 'live' },
    'pinterest-image-downloader': { slug: 'tai-anh-pinterest', status: 'live' },
    'pinterest-gif-downloader': { slug: 'tai-gif-pinterest', status: 'live' },
    'pinterest-board-downloader': { slug: 'tai-bang-pinterest', status: 'live' },
    'pinterest-profile-downloader': { slug: 'tai-ho-so-pinterest', status: 'live' },
    'pinterest-profile-picture-downloader': { slug: 'tai-avatar-pinterest', status: 'live' },
    'pinterest-audio-downloader': { slug: 'tai-nhac-pinterest', status: 'gated-audio' },
    'pinterest-4k-downloader': { slug: 'tai-video-pinterest-4k', status: 'gated-4k' },
    'pinterest-to-mp4': { slug: 'chuyen-video-pinterest-sang-mp4', status: 'live' },
    'pinterest-video-downloader-chrome': { slug: 'tai-video-pinterest-tren-chrome', status: 'live' },
    'how-to-download-pinterest-videos': { slug: 'cach-tai-video-pinterest', status: 'live' },
    'how-to-download-pinterest-video-in-gallery': { slug: 'luu-video-pinterest-vao-thu-vien-anh', status: 'live' },
    'how-to-download-pinterest-video-on-laptop': { slug: 'tai-video-pinterest-ve-may-tinh', status: 'live' },
    'download-pinterest-videos-iphone-android': { slug: 'tai-video-pinterest-ve-dien-thoai', status: 'live' },
  },
  ru: {
    'home': { slug: '', status: 'live' },
    'pinterest-pin-downloader': { slug: 'skachat-pin-s-pinterest', status: 'live' },
    'pinterest-video-downloader': { slug: 'skachat-video-s-pinterest', status: 'live' },
    'pinterest-image-downloader': { slug: 'skachat-foto-s-pinterest', status: 'live' },
    'pinterest-gif-downloader': { slug: 'skachat-gif-s-pinterest', status: 'live' },
    'pinterest-board-downloader': { slug: 'skachat-dosku-pinterest', status: 'live' },
    'pinterest-profile-picture-downloader': { slug: 'skachat-avatarku-s-pinterest', status: 'live' },
    'how-to-download-pinterest-videos': { slug: 'kak-skachat-video-s-pinterest', status: 'live' },
    'how-to-download-pinterest-video-in-gallery': { slug: 'kak-sohranit-video-s-pinterest-v-galereyu', status: 'live' },
    'how-to-download-pinterest-video-on-laptop': { slug: 'kak-skachat-video-s-pinterest-na-kompyuter', status: 'live' },
    'download-pinterest-videos-iphone-android': { slug: 'skachat-video-s-pinterest-na-iphone-i-android', status: 'live' },
  },
  th: {
    'home': { slug: '', status: 'live' },
    'pinterest-pin-downloader': { slug: 'pinterest-pin-downloader', status: 'live' },
    'pinterest-video-downloader': { slug: 'pinterest-video-downloader', status: 'live' },
    'pinterest-image-downloader': { slug: 'pinterest-image-downloader', status: 'live' },
    'pinterest-gif-downloader': { slug: 'pinterest-gif-downloader', status: 'live' },
    'pinterest-board-downloader': { slug: 'pinterest-board-downloader', status: 'live' },
    'pinterest-profile-picture-downloader': { slug: 'pinterest-profile-picture-downloader', status: 'live' },
    'pinterest-audio-downloader': { slug: 'pinterest-audio-downloader', status: 'gated-audio' },
    'pinterest-4k-downloader': { slug: 'pinterest-hd-downloader', status: 'gated-4k' },
    'pinterest-video-downloader-chrome': { slug: 'pinterest-video-downloader-chrome', status: 'live' },
    'how-to-download-pinterest-videos': { slug: 'how-to-download-pinterest-videos', status: 'live' },
    'how-to-download-pinterest-video-on-laptop': { slug: 'how-to-download-pinterest-video-on-laptop', status: 'live' },
    'download-pinterest-videos-iphone-android': { slug: 'download-pinterest-videos-iphone-android', status: 'live' },
  },
  ar: {
    'home': { slug: '', status: 'live' },
    'pinterest-pin-downloader': { slug: 'pinterest-pin-downloader', status: 'live' },
    'pinterest-video-downloader': { slug: 'pinterest-video-downloader', status: 'live' },
    'pinterest-image-downloader': { slug: 'pinterest-image-downloader', status: 'live' },
    'pinterest-gif-downloader': { slug: 'pinterest-gif-downloader', status: 'live' },
    'pinterest-board-downloader': { slug: 'pinterest-board-downloader', status: 'live' },
    'pinterest-profile-picture-downloader': { slug: 'pinterest-profile-picture-downloader', status: 'live' },
    'pinterest-4k-downloader': { slug: 'pinterest-4k-downloader', status: 'gated-4k' },
    'pinterest-to-mp4': { slug: 'pinterest-to-mp4', status: 'live' },
    'how-to-download-pinterest-videos': { slug: 'how-to-download-pinterest-videos', status: 'live' },
    'how-to-download-pinterest-video-in-gallery': { slug: 'how-to-download-pinterest-video-in-gallery', status: 'live' },
    'how-to-download-pinterest-video-on-laptop': { slug: 'how-to-download-pinterest-video-on-laptop', status: 'live' },
    'download-pinterest-videos-iphone-android': { slug: 'download-pinterest-videos-iphone-android', status: 'live' },
  },
};

/* ------------------------------------------------------------------ */
/* Release / preview switches                                          */
/* ------------------------------------------------------------------ */

interface BuildFlags {
  /** Locales treated as live in a preview build (PD_I18N_PREVIEW=es,pt or all). */
  preview: Set<Locale>;
  /** `<locale>/<pageId>` keys that have a content JSON (set by astro.config.mjs). */
  content: Set<string> | null;
}

function readEnv(name: string): string | undefined {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return env?.[name];
}

let flagsCache: { key: string; flags: BuildFlags } | null = null;

/**
 * PD_I18N_PREVIEW lets a local build route locales that are not released yet,
 * page by page as their content files land. Production builds leave it unset:
 * then only LOCALE_META[locale].live decides, and a live page without content
 * fails the build.
 */
function buildFlags(): BuildFlags {
  const previewRaw = (readEnv('PD_I18N_PREVIEW') || '').trim();
  const contentRaw = readEnv('PD_I18N_CONTENT_INDEX');
  const key = `${previewRaw}|${contentRaw ?? ''}`;
  if (flagsCache && flagsCache.key === key) return flagsCache.flags;
  const preview = new Set<Locale>(
    previewRaw === 'all'
      ? LOCALES
      : previewRaw.split(',').map((s) => s.trim()).filter(isLocale),
  );
  const content = contentRaw === undefined ? null : new Set(contentRaw.split(',').filter(Boolean));
  const flags = { preview, content };
  flagsCache = { key, flags };
  return flags;
}

/** True when this build routes the locale (released, or listed in PD_I18N_PREVIEW). */
export function isLocaleLive(locale: AnyLocale): boolean {
  if (locale === 'en') return true;
  return LOCALE_META[locale].live || buildFlags().preview.has(locale);
}

/** Locales routed by this build, in hreflang order (English excluded). */
export function liveLocales(): Locale[] {
  return LOCALES.filter((l) => isLocaleLive(l));
}

export function routeStatus(pageId: PageId, locale: Locale): RouteStatus | null {
  return SLUGS[locale][pageId]?.status ?? null;
}

export function isGateOpen(status: RouteStatus): boolean {
  return status === 'live' || GATE_OPEN[status];
}

/**
 * Whether (pageId, locale) is routed by this build: the locale is live, the
 * page exists in SLUGS and its gate is open. In a preview build a page also
 * needs its content file (unreleased locales are written page by page).
 */
export function isLive(pageId: PageId, locale: AnyLocale): boolean {
  if (locale === 'en') return true;
  const entry = SLUGS[locale][pageId];
  if (!entry || !isGateOpen(entry.status) || !isLocaleLive(locale)) return false;
  const { preview, content } = buildFlags();
  if (!LOCALE_META[locale].live && preview.has(locale) && content) {
    return content.has(`${locale}/${pageId}`);
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Paths                                                               */
/* ------------------------------------------------------------------ */

/** '/' or '/es' (no trailing slash). */
export function localeHome(locale: AnyLocale): string {
  return locale === 'en' ? '/' : `/${locale}`;
}

/** Path of a page in a locale regardless of release state (null if not in SLUGS). */
export function rawPathFor(pageId: PageId, locale: AnyLocale): string | null {
  if (locale === 'en') return PAGES[pageId].en;
  const entry = SLUGS[locale][pageId];
  if (!entry) return null;
  return entry.slug ? `/${locale}/${entry.slug}` : `/${locale}`;
}

/** '/es/descargar-…', '/es', '/pinterest-…', or null when not live in this build. */
export function pathFor(pageId: PageId, locale: AnyLocale): string | null {
  return isLive(pageId, locale) ? rawPathFor(pageId, locale) : null;
}

/**
 * Target of an in-content [[pageId|…]] link. Same as pathFor, except in a
 * preview build, where a page that exists in SLUGS behind an open gate but has
 * no content file yet still resolves (it ships with the locale's release).
 */
export function linkPathFor(pageId: PageId, locale: AnyLocale): string | null {
  const live = pathFor(pageId, locale);
  if (live || locale === 'en') return live;
  const entry = SLUGS[locale][pageId];
  if (entry && isGateOpen(entry.status) && !LOCALE_META[locale].live && buildFlags().preview.has(locale)) {
    return rawPathFor(pageId, locale);
  }
  return null;
}

function stripSlash(pathname: string): string {
  const p = pathname.split(/[?#]/)[0] || '/';
  return p === '/' ? '/' : p.replace(/\/+$/, '') || '/';
}

/** Reverse lookup of a live page, slash-insensitive. */
export function routeForPath(pathname: string): { pageId: PageId; locale: AnyLocale } | null {
  const p = stripSlash(pathname);
  for (const pageId of PAGE_IDS) {
    if (PAGES[pageId].en === p) return { pageId, locale: 'en' };
  }
  const seg = p.split('/')[1] || '';
  if (!isLocale(seg)) return null;
  for (const pageId of PAGE_IDS) {
    if (rawPathFor(pageId, seg) === p && isLive(pageId, seg)) return { pageId, locale: seg };
  }
  return null;
}

/** Locale of any site path: '/es/…' → 'es' when es is routed, else 'en'. */
export function localeOfPath(pathname: string): AnyLocale {
  const seg = stripSlash(pathname).split('/')[1] || '';
  return isLocale(seg) && isLocaleLive(seg) ? seg : 'en';
}

export interface Alternate {
  hreflang: string;
  href: string;
  locale: AnyLocale | 'x-default';
}

/**
 * The hreflang cluster of a page: en, every live locale, x-default (English).
 * One generator for HTML <link>s, sitemap xhtml:link and .i18n-routes.json, so
 * every member of a cluster lists the identical set (Google's three rules:
 * self-reference, reciprocity, absolute URLs).
 */
export function alternatesFor(pageId: PageId): Alternate[] {
  const en = absoluteUrl(PAGES[pageId].en);
  const out: Alternate[] = [{ hreflang: LOCALE_META.en.hreflang, href: en, locale: 'en' }];
  for (const locale of LOCALES) {
    const path = pathFor(pageId, locale);
    if (path) out.push({ hreflang: LOCALE_META[locale].hreflang, href: absoluteUrl(path), locale });
  }
  out.push({ hreflang: 'x-default', href: en, locale: 'x-default' });
  return out;
}

/** English always; other locales only when LOCALE_META.indexable. */
export function isLocaleIndexable(locale: AnyLocale): boolean {
  return locale === 'en' || LOCALE_META[locale].indexable;
}

/**
 * The cluster search engines see (HTML <link>s, sitemap, route map): the
 * alternatesFor set minus noindex locales. alternatesFor stays the full set
 * for the language menu, which still links every live locale.
 */
export function indexableAlternatesFor(pageId: PageId): Alternate[] {
  return alternatesFor(pageId).filter((a) => a.locale === 'x-default' || isLocaleIndexable(a.locale));
}

/** Live pages of a locale, in PAGE_IDS order. */
export function localePagesOf(locale: AnyLocale): PageId[] {
  if (locale === 'en') return PAGE_IDS.slice();
  return PAGE_IDS.filter((id) => isLive(id, locale));
}

/** Island `routes` prop (contract): live paths of one locale, plus its home. */
export type RoutesProp = Partial<Record<PageId, string>> & { home: string };

export function routesProp(locale: AnyLocale, only?: readonly PageId[]): RoutesProp {
  const out: RoutesProp = { home: localeHome(locale) };
  for (const id of localePagesOf(locale)) {
    if (only && !only.includes(id)) continue;
    const path = pathFor(id, locale);
    if (path) out[id] = path;
  }
  return out;
}

/** Every routed localized page except the locale homes: feeds [locale]/[slug].astro. */
export function localizedRoutes(): { locale: Locale; pageId: PageId; slug: string; path: string }[] {
  const out: { locale: Locale; pageId: PageId; slug: string; path: string }[] = [];
  for (const locale of LOCALES) {
    for (const pageId of PAGE_IDS) {
      if (pageId === 'home') continue;
      const entry = SLUGS[locale][pageId];
      if (!entry || !isLive(pageId, locale)) continue;
      out.push({ locale, pageId, slug: entry.slug, path: rawPathFor(pageId, locale)! });
    }
  }
  return out;
}

/** Reserved first segments: never a slug, never a locale code. */
export const RESERVED_SLUGS = ['404', '500', 'api', 'mcp', 'blog', 'fonts', 'images', '_astro', '_image', '_server-islands', 'embed', 'rss.xml', 'sitemap.xml'] as const;
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Pages the DownloaderForm links to (route notices, chips, guide link): the
 * keys of pinterest-route.ts IslandPageId. routesProp(locale, ISLAND_PAGE_IDS)
 * keeps the serialized island prop to what the island can use.
 */
export const ISLAND_PAGE_IDS: readonly PageId[] = [
  'pinterest-pin-downloader',
  'pinterest-video-downloader',
  'pinterest-image-downloader',
  'pinterest-gif-downloader',
  'pinterest-board-downloader',
  'pinterest-profile-downloader',
  'pinterest-profile-picture-downloader',
  'pinterest-carousel-downloader',
  'how-to-download-pinterest-videos',
];

/** The only tools the sticky paste bar sends links to (besides the locale home). */
export const STICKY_PAGE_IDS: readonly PageId[] = ['pinterest-board-downloader', 'pinterest-profile-downloader'];
