/**
 * PageContent: the frozen shape of src/content/i18n/<locale>/<pageId>.json
 * (docs/i18n/architecture.md §6.2, plan §6 contentModel + NFC amendment).
 *
 * Imported by src/content.config.ts (build), tests/seo-invariants.entry.ts
 * and scripts/i18n-check (writers). Lengths are counted in code points after
 * NFC, the way scripts/seo_health_check.py counts them.
 *
 * Two string kinds:
 * - Plain: rendered as text. No mini-markup, no `<` or `>`.
 * - Inline: mini-markup allowed (see src/i18n/inline.ts): **bold**, `code`,
 *   [[pageId|text]] (in-locale link), [[en:/path|text]] (English page),
 *   [text](https://help.pinterest.com/…) (allowlisted external link).
 */
import { z } from 'astro/zod';
import { LOCALES } from './locales';
import { PAGE_IDS } from './routes';

/** Code points, as Python's len() and the SEO health check count them. */
export const cpLen = (s: string): number => Array.from(s).length;

const MARKUP = /\*\*|\[\[|\]\]|`|\]\(/;
const HTML = /[<>]/;
/** Glyphs Big Shoulders Display lacks (plan §6 fonts): never in display strings. */
const DISPLAY_BANNED = /[→ẞŸ ]/;

const Plain = z
  .string()
  .min(1)
  .refine((s) => !HTML.test(s), { message: 'no < or > (no raw HTML)' })
  .refine((s) => !MARKUP.test(s), { message: 'plain text field: no **, `, [[ ]] or [text](url) markup' });

const Inline = z
  .string()
  .min(1)
  .refine((s) => !HTML.test(s), { message: 'no < or > (no raw HTML); use the inline mini-markup' });

/** A string set in the headline face (Big Shoulders and the per-script faces). */
const Display = Plain.refine((s) => !DISPLAY_BANNED.test(s), {
  message: 'display text: no → (use ›), ẞ, Ÿ or U+202F (missing from the headline font)',
});

const maxCp = (n: number) => (s: string) => cpLen(s) <= n;
const rangeCp = (min: number, max: number) => (s: string) => cpLen(s) >= min && cpLen(s) <= max;

const DateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD');

const PageIdEnum = z.enum(PAGE_IDS);

export const PageContent = z
  .object({
    /** Must match the file path: src/content/i18n/<locale>/<pageId>.json */
    pageId: PageIdEnum,
    locale: z.enum(LOCALES),
    meta: z.object({
      /** seo_health_check: 40–62 optimal (30–65 hard). Fixed by the plan matrix. */
      title: Plain.refine(rangeCp(40, 62), { message: 'title must be 40–62 code points' }),
      /** 120–158 optimal (110–160 hard). Fixed by the plan matrix. */
      description: Plain.refine(rangeCp(120, 158), { message: 'description must be 120–158 code points' }),
    }),
    /** QA only, never rendered (no meta keywords). */
    keywords: z.object({ primary: Plain, secondary: z.array(Plain) }),
    /** Used by other pages: header nav, footer, breadcrumbs, related-tool cards. */
    nav: z.object({
      /** Mobile nav, footer, breadcrumb, language-neutral link text. */
      label: Plain.refine(maxCp(28), { message: 'nav.label ≤ 28' }),
      /** Desktop header slot. */
      short: Plain.refine(maxCp(14), { message: 'nav.short ≤ 14' }),
      /** Optional fuller desktop label shown from 1280px, where the header has room ("Photo de profil"). */
      shortWide: Plain.refine(maxCp(18), { message: 'nav.shortWide ≤ 18' }).optional(),
      card: z.object({
        title: Plain.refine(maxCp(40), { message: 'nav.card.title ≤ 40' }),
        blurb: Plain.refine(maxCp(90), { message: 'nav.card.blurb ≤ 90' }),
        /** Rotated stock badge on related-tool cards (MP4, ZIP, GIF …). */
        badge: Display.refine(maxCp(8), { message: 'nav.card.badge ≤ 8' }),
      }),
    }),
    hero: z.object({
      h1: Display.refine(maxCp(60), { message: 'hero.h1 ≤ 60' }),
      lede: Inline.refine(maxCp(220), { message: 'hero.lede ≤ 220' }),
    }),
    /** 1–3 paragraphs under the ticket. */
    intro: z.array(Inline).min(1).max(3),
    /** Three short feature cards (tools; optional on guides). */
    features: z
      .array(
        z.object({
          h: Plain.refine(maxCp(40), { message: 'features[].h ≤ 40' }),
          p: Inline.refine(maxCp(200), { message: 'features[].p ≤ 200' }),
        }),
      )
      .length(3)
      .optional(),
    /** Tools: "which tool", local app wording, honest-quality note. Guides: the article body. */
    sections: z
      .array(
        z.object({
          h2: Display.refine(maxCp(80), { message: 'sections[].h2 ≤ 80' }),
          paragraphs: z.array(Inline).min(1),
          list: z.array(Inline).optional(),
        }),
      )
      .min(1)
      .max(6),
    steps: z.object({
      title: Display,
      intro: Inline,
      exampleLabel: Plain,
      /** Optional example link shown next to the steps (defaults by form variant). */
      exampleUrl: Plain.optional(),
      items: z
        .array(z.object({ title: Plain.refine(maxCp(60), { message: 'steps.items[].title ≤ 60' }), body: Inline }))
        .min(3)
        .max(6),
    }),
    faq: z.object({
      title: Display,
      items: z.array(z.object({ q: Plain, a: Inline })).min(4).max(9),
    }),
    related: z.object({ title: Display }),
    schema: z.object({ appName: Plain, howToName: Plain, howToDescription: Plain }),
    datePublished: DateStr,
    dateModified: DateStr,
    /** Provenance, never rendered. */
    review: z.object({ writer: Plain, nativeReviewer: Plain.optional() }),

    /* ---- home only (required there, rejected elsewhere) ---- */
    /** Three short facts beside the H1 (Pin / Board / Profile on English). */
    aside: z.array(z.object({ dt: Display, dd: Plain.refine(maxCp(60), { message: 'aside[].dd ≤ 60' }) })).length(3).optional(),
    /** Links to localized guide pages. */
    guides: z
      .object({
        title: Display,
        intro: Inline,
        items: z
          .array(
            z.object({
              page: PageIdEnum,
              tag: Plain.refine(maxCp(14), { message: 'guides.items[].tag ≤ 14' }),
              title: Plain.refine(maxCp(60), { message: 'guides.items[].title ≤ 60' }),
              blurb: Plain.refine(maxCp(110), { message: 'guides.items[].blurb ≤ 110' }),
            }),
          )
          .min(2)
          .max(6),
      })
      .optional(),
    /** Credit-creators band. */
    credit: z.object({ h2: Display, body: Inline }).optional(),
  })
  .strict()
  .superRefine((page, ctx) => {
    // Every string NFC (vi research: decomposed marks break the length rule).
    const walk = (v: unknown, path: (string | number)[]) => {
      if (typeof v === 'string') {
        if (v !== v.normalize('NFC')) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path, message: 'string is not NFC-normalized' });
        }
        if (/\s{2,}|^\s|\s$/.test(v.replace(/ /g, 'x'))) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path, message: 'leading, trailing or double whitespace' });
        }
        if (/\.\.\./.test(v)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path, message: 'use … (U+2026), not ...' });
        }
      } else if (Array.isArray(v)) {
        v.forEach((x, i) => walk(x, [...path, i]));
      } else if (v && typeof v === 'object') {
        for (const [k, x] of Object.entries(v)) walk(x, [...path, k]);
      }
    };
    walk(page, []);

    const isHome = page.pageId === 'home';
    for (const key of ['aside', 'guides', 'credit'] as const) {
      if (isHome && !page[key]) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `home requires ${key}` });
      }
      if (!isHome && page[key]) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `${key} is home-only` });
      }
    }
    if (page.dateModified < page.datePublished) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dateModified'], message: 'dateModified is before datePublished' });
    }
  });

export type PageContentData = z.infer<typeof PageContent>;
