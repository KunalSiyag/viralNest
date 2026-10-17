/**
 * Locale island catalogs, found by file name (src/i18n/island/<loc>.ts, each
 * exporting `ISLAND`) and registered for pickIsland(). Server-only: import it
 * from Astro code, never from a component. English returns undefined so
 * English islands keep their built-in defaults and English HTML does not change.
 *
 * Pass the results only on localized pages (spread them conditionally), so an
 * English island's serialized props stay exactly `{ variant, layout }`.
 */
import type { AnyLocale } from '../locales';
import type { FormVariant } from '../routes';
import type { IslandMessages, IslandProps, StickyProps } from './types';
import { pickIsland, registerIslandCatalog, registeredCatalog } from './pick';

const modules = import.meta.glob<{ ISLAND?: IslandMessages }>('./[a-z][a-z].ts', { eager: true });
for (const [file, mod] of Object.entries(modules)) {
  const locale = file.slice(2, 4);
  if (locale !== 'en' && mod.ISLAND) registerIslandCatalog(locale, mod.ISLAND);
}

/** The locale's catalog, or null when English or not written yet. */
export function islandCatalog(locale: AnyLocale): IslandMessages | null {
  return registeredCatalog(locale) ?? null;
}

/** DownloaderForm `messages` for a page; undefined on English pages. */
export function islandMessagesFor(locale: AnyLocale, variant: FormVariant): IslandProps | undefined {
  return pickIsland(locale, variant);
}

/** StickyPasteBar `messages`; undefined on English pages. */
export function stickyMessagesFor(locale: AnyLocale): StickyProps | undefined {
  return pickIsland(locale, 'sticky');
}
