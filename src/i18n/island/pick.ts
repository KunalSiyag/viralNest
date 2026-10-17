/**
 * Server-side helpers that cut a locale catalog down to what one island needs.
 * Called from Astro templates only (never from a component, so no catalog
 * reaches a client bundle).
 *
 *   pickIsland('es', 'board')   → DownloaderForm `messages` (plan §6 signature)
 *   pickIsland('es', 'sticky')  → StickyPasteBar `messages`
 *   pickIsland('en', …)         → undefined: English islands use EN_ISLAND
 *
 * Locale catalogs reach the registry through catalogs.ts, which globs
 * src/i18n/island/<loc>.ts and registers each one when it is imported.
 */
import type { FormVariant } from '../routes';
import type { IslandMessages, IslandProps, StickyProps, VariantMessages } from './types';

const REGISTRY = new Map<string, IslandMessages>();

/** catalogs.ts calls this for every src/i18n/island/<loc>.ts. */
export function registerIslandCatalog(locale: string, catalog: IslandMessages): void {
  REGISTRY.set(locale, catalog);
}

/** A registered locale catalog, or undefined (English, or not written yet). */
export function registeredCatalog(locale: string): IslandMessages | undefined {
  return locale === 'en' ? undefined : REGISTRY.get(locale);
}

/**
 * Variants a DownloaderForm that starts on `variant` can switch itself to
 * (DownloaderForm route notices): board/profile links pasted anywhere, GIF
 * results anywhere, video and carousel results on every page but the hub.
 */
export function reachableVariants(variant: FormVariant): FormVariant[] {
  const out = new Set<FormVariant>([variant, 'board', 'profile', 'gif']);
  if (variant !== 'hub') {
    out.add('video');
    out.add('image');
  }
  return [...out];
}

/**
 * DownloaderForm `messages`: the catalog without the sticky bar and with only
 * the variants this page can reach (keeps the serialized prop small).
 */
export function sliceIsland(catalog: IslandMessages, variant: FormVariant): IslandProps {
  const { variants, sticky: _sticky, ...rest } = catalog;
  const picked: Partial<Record<FormVariant, VariantMessages>> = {};
  for (const v of reachableVariants(variant)) picked[v] = variants[v];
  return { ...rest, variants: picked };
}

/** StickyPasteBar `messages`. */
export function sliceSticky(catalog: IslandMessages): StickyProps {
  return { lang: catalog.lang, sticky: catalog.sticky };
}

/**
 * Island `messages` for a locale (or a catalog object) and a target: a form
 * variant, or 'sticky' for the paste bar. Undefined for English and for a
 * locale whose catalog is not written yet (the island then stays English).
 */
export function pickIsland(source: string | IslandMessages, target: 'sticky'): StickyProps | undefined;
export function pickIsland(source: string | IslandMessages, target: FormVariant): IslandProps | undefined;
export function pickIsland(source: string | IslandMessages, target: FormVariant | 'sticky'): IslandProps | StickyProps | undefined;
export function pickIsland(source: string | IslandMessages, target: FormVariant | 'sticky'): IslandProps | StickyProps | undefined {
  const catalog = typeof source === 'string' ? registeredCatalog(source) : source;
  if (!catalog) return undefined;
  return target === 'sticky' ? sliceSticky(catalog) : sliceIsland(catalog, target);
}
