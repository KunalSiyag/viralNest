/**
 * Locale registry for the localized pages (docs/i18n/i18n-plan.md §1).
 *
 * Plain TypeScript with no Astro imports, so the esbuild-bundled node tests and
 * `npm run i18n:check` can import it. English stays at the site root.
 */

/** Order is the hreflang / language-menu order (plan §1). */
export const LOCALES = ['es', 'pt', 'fr', 'de', 'it', 'nl', 'id', 'tr', 'vi', 'ru', 'th', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export type AnyLocale = 'en' | Locale;

export type Script = 'latin' | 'latin-ext' | 'vietnamese' | 'cyrillic' | 'thai' | 'arabic';
export type Release = 'A' | 'B' | 'C';

export interface LocaleMeta {
  /** Language-only hreflang code. */
  hreflang: string;
  /** `<html lang>`; may be more specific than hreflang (pt-BR). */
  htmlLang: string;
  ogLocale: string;
  dir: 'ltr' | 'rtl';
  /** Shown in the language menu, rendered with lang={htmlLang}. */
  endonym: string;
  script: Script;
  /** Breadcrumb root and JSON-LD BreadcrumbList root name. */
  homeLabel: string;
  release: Release | null;
  /**
   * Release flag. Only live locales are routed, listed in hreflang clusters,
   * the sitemap and the language menu. Flip per release once QA is green
   * (plan §8 Phase 5). For local preview builds use PD_I18N_PREVIEW (routes.ts).
   */
  live: boolean;
  /** Ad slots allowed on this locale's pages (de: no ads until an Impressum exists). */
  ads: boolean;
}

export const LOCALE_META: Record<AnyLocale, LocaleMeta> = {
  en: { hreflang: 'en', htmlLang: 'en', ogLocale: 'en_US', dir: 'ltr', endonym: 'English', script: 'latin', homeLabel: 'Home', release: null, live: true, ads: true },
  es: { hreflang: 'es', htmlLang: 'es', ogLocale: 'es_LA', dir: 'ltr', endonym: 'Español', script: 'latin', homeLabel: 'Inicio', release: 'A', live: true, ads: true },
  pt: { hreflang: 'pt', htmlLang: 'pt-BR', ogLocale: 'pt_BR', dir: 'ltr', endonym: 'Português', script: 'latin', homeLabel: 'Início', release: 'A', live: true, ads: true },
  fr: { hreflang: 'fr', htmlLang: 'fr', ogLocale: 'fr_FR', dir: 'ltr', endonym: 'Français', script: 'latin', homeLabel: 'Accueil', release: 'A', live: true, ads: true },
  // User decision 4 (2026-10-15): /de launches with no ad slots; Impressum before ads.
  de: { hreflang: 'de', htmlLang: 'de', ogLocale: 'de_DE', dir: 'ltr', endonym: 'Deutsch', script: 'latin', homeLabel: 'Startseite', release: 'A', live: true, ads: false },
  it: { hreflang: 'it', htmlLang: 'it', ogLocale: 'it_IT', dir: 'ltr', endonym: 'Italiano', script: 'latin', homeLabel: 'Home', release: 'A', live: true, ads: true },
  nl: { hreflang: 'nl', htmlLang: 'nl', ogLocale: 'nl_NL', dir: 'ltr', endonym: 'Nederlands', script: 'latin', homeLabel: 'Home', release: 'A', live: true, ads: true },
  id: { hreflang: 'id', htmlLang: 'id', ogLocale: 'id_ID', dir: 'ltr', endonym: 'Bahasa Indonesia', script: 'latin', homeLabel: 'Beranda', release: 'A', live: true, ads: true },
  tr: { hreflang: 'tr', htmlLang: 'tr', ogLocale: 'tr_TR', dir: 'ltr', endonym: 'Türkçe', script: 'latin-ext', homeLabel: 'Ana Sayfa', release: 'A', live: true, ads: true },
  vi: { hreflang: 'vi', htmlLang: 'vi', ogLocale: 'vi_VN', dir: 'ltr', endonym: 'Tiếng Việt', script: 'vietnamese', homeLabel: 'Trang chủ', release: 'A', live: true, ads: true },
  ru: { hreflang: 'ru', htmlLang: 'ru', ogLocale: 'ru_RU', dir: 'ltr', endonym: 'Русский', script: 'cyrillic', homeLabel: 'Главная', release: 'B', live: true, ads: true },
  th: { hreflang: 'th', htmlLang: 'th', ogLocale: 'th_TH', dir: 'ltr', endonym: 'ไทย', script: 'thai', homeLabel: 'หน้าแรก', release: 'B', live: true, ads: true },
  ar: { hreflang: 'ar', htmlLang: 'ar', ogLocale: 'ar_AR', dir: 'rtl', endonym: 'العربية', script: 'arabic', homeLabel: 'الرئيسية', release: 'C', live: true, ads: true },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
