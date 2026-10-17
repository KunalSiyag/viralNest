/**
 * Everything BaseLayout needs for locales, behind ONE import.
 *
 * Astro orders a page's stylesheets by the sum of import positions along the
 * import path, and BaseLayout's own <style is:global> block counts as its
 * last import. Keeping BaseLayout at the same number of imports as before i18n
 * keeps English pages' CSS (and its cascade) in the same order.
 */
// @ts-ignore -- .astro modules are typed by `astro check`, not plain tsc
export { default as LanguageMenu } from '../LanguageMenu.astro';
export { getCollection } from 'astro:content';
export { LOCALE_META } from '../../i18n/locales';
export type { AnyLocale } from '../../i18n/locales';
export { STICKY_PAGE_IDS, alternatesFor, liveLocales, localeHome, localeOfPath, pathFor, routeForPath, routesProp } from '../../i18n/routes';
export type { PageId } from '../../i18n/routes';
export { EN_UI, fillUi } from '../../i18n/ui/en';
export type { UiStrings } from '../../i18n/ui/en';
export { breadcrumbSchema } from '../../i18n/jsonld';
export { fontAssetsFor } from '../../i18n/fonts';
export { stickyMessagesFor } from '../../i18n/island/catalogs';
