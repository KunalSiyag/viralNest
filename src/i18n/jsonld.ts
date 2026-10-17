/**
 * Localized JSON-LD (plan §6 jsonLd, architecture.md §8).
 *
 * Every CreativeWork entity carries inLanguage = htmlLang. SoftwareApplication
 * never has aggregateRating (offers price 0). FAQPage only when the FAQ is
 * visible. BreadcrumbList is rooted at the locale home with homeLabel and uses
 * nav.label, not the title. No WebSite/SearchAction on localized pages.
 * Organization keeps the English @id (emitted by BaseLayout on every page).
 */
import { faqSchema, howToSchema, softwareAppSchema, webPageSchema } from '../lib/seo';
import { absoluteUrl } from '../lib/urls';
import { BRAND } from '../lib/brand';
import { LOCALE_META, type AnyLocale } from './locales';
import { localeHome } from './routes';
import { inlineToText } from './inline';
import type { PageContentData } from './schema';

export const ORGANIZATION_ID = `${absoluteUrl('/')}#organization`;

export function breadcrumbSchema(locale: AnyLocale, crumb: { name: string; url: string } | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: LOCALE_META[locale].homeLabel, item: absoluteUrl(localeHome(locale)) },
      ...(crumb ? [{ '@type': 'ListItem', position: 2, name: crumb.name, item: crumb.url }] : []),
    ],
  };
}

/** Page-level entities for a localized page (breadcrumb + Organization come from BaseLayout). */
export function localizedPageJsonLd(page: PageContentData, url: string, template: 'home' | 'tool' | 'guide') {
  const inLanguage = LOCALE_META[page.locale].htmlLang;
  const text = (s: string) => inlineToText(s);
  const out: Record<string, unknown>[] = [
    webPageSchema({ name: page.meta.title, description: page.meta.description, url, inLanguage }),
    softwareAppSchema({ name: page.schema.appName, description: page.meta.description, url, inLanguage }),
    {
      ...howToSchema({
        name: page.schema.howToName,
        description: page.schema.howToDescription,
        steps: page.steps.items.map((s) => ({ name: s.title, text: text(s.body) })),
      }),
      inLanguage,
    },
    {
      ...faqSchema(page.faq.items.map((f) => ({ q: f.q, a: text(f.a) }))),
      inLanguage,
    },
  ];
  if (template === 'guide') {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: page.hero.h1,
      description: page.meta.description,
      inLanguage,
      datePublished: page.datePublished,
      dateModified: page.dateModified,
      mainEntityOfPage: url,
      author: { '@id': ORGANIZATION_ID },
      publisher: { '@id': ORGANIZATION_ID, '@type': 'Organization', name: BRAND.name },
    });
  }
  return out;
}
