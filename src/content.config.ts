/**
 * Content collections. `i18nPages`: one JSON per (locale, pageId) in
 * src/content/i18n/<locale>/<pageId>.json, validated at build by the shared
 * PageContent schema (src/i18n/schema.ts). Entry ids are `<locale>/<pageId>`.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { PageContent } from './i18n/schema';

const i18nPages = defineCollection({
  loader: glob({ pattern: '*/*.json', base: './src/content/i18n' }),
  schema: PageContent,
});

export const collections = { i18nPages };
