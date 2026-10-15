# PintDownload i18n architecture: indexable localized pages

Status: design for a later build workflow. Written 2026-10-15 against the repo at
`viralnest/` (Astro 5.18.2, `@astrojs/cloudflare` 12, Tailwind 3.4, React 19 islands,
Cloudflare Worker + static assets). Read-only survey; nothing in the repo was changed.

Inputs used: the repo files named in each section, the per-locale keyword research already in
this folder (`es de fr id it nl pt ru` `.json`/`.md`; `tr vi th ar` not written yet), Astro i18n
docs, Google Search Central (localized versions, multi-regional sites, spam policies), Cloudflare
Workers static-assets docs (404 handling, html_handling), the Fontsource API, and font files
measured with fontTools (numbers below are measured unless marked "estimate").

---

## 1. Decisions in one screen

| Topic | Decision |
|---|---|
| URL shape | English stays at the root. Each locale gets a prefix and native ASCII slugs: `/es`, `/es/descargar-videos-pinterest`. No trailing slash (locale homes are `/es`, not `/es/`). |
| Locales | `es pt fr de it nl ru tr id vi th ar`. One version per language, with **language-only hreflang** (`es`, `pt`, `fr` …), and no region pages. `<html lang>` can be more specific (`pt-BR`). |
| Page set | **Partial per locale**, taken from the research (`pages[].skip`). Today that is 110 pages across 8 locales (es 16, pt 17, de 16, fr 15, id 15, it 12, ru 11, nl 8). The 4 pending locales come to about 50 more. No page exists in a locale without researched demand. This is the main defence against doorway or scaled-content flags. |
| Routing | Astro's built-in `i18n` config is **not** used: it has no per-page translated slugs, and its custom paths need `output: 'server'`. Instead, three prerendered route files: `src/pages/[locale]/index.astro`, `[locale]/[slug].astro` and `[locale]/404.astro`. All of them are fed by one route map, `src/i18n/routes.ts`. |
| Source of truth | `src/i18n/routes.ts` maps `pageId → { en: path, es: slug, … }`. Every URL, canonical, hreflang, sitemap entry, nav link, language-menu link and island route notice is derived from it. |
| Content | One JSON file per locale and page in `src/content/i18n/<locale>/<pageId>.json`. An Astro 5 content collection validates it with a shared zod schema (`src/i18n/schema.ts`) that enforces the title/description length rules at build time. Copy is written natively from the research. Nothing is translated string by string from the English page. |
| Templates | `HomePage.astro`, `ToolPage.astro` and `GuidePage.astro` under `src/components/i18n/`. They reuse TicketHero, HowToSteps, FaqSection, CompareTable and RelatedTools, which gain optional `ui`/`locale` props whose defaults keep English output unchanged. **English `.astro` pages are not rewritten** (this protects current rankings). |
| Head | BaseLayout looks up `{pageId, locale}` from `Astro.url.pathname` through the route map. It emits `<html lang dir>`, a self canonical, every existing alternate plus `x-default` (the English URL), `og:locale` plus `og:locale:alternate`, and a localized breadcrumb. None of the 17 English page files has to change for this. |
| Sitemap | One `sitemap.xml` with `xmlns:xhtml` and `xhtml:link` alternates generated from the same map. HTML `<link>` tags are still required, because Yandex ignores sitemap hreflang (ru research). A test asserts the sitemap and the HTML agree. |
| React islands | Strings move to typed message catalogs (`src/i18n/island/<locale>.ts`). The page passes **only its own locale's messages as island props**. English uses built-in defaults, so the English JS and HTML do not grow, and no locale's strings ship in a shared bundle. |
| Language selector | The React `LanguageSelector` (localStorage plus DOM rewriting through `i18n-client.ts`) is replaced by a server-rendered `<details>` menu of real `<a href hreflang lang>` links to the current page's alternates, or to the locale home when no alternate exists. **No auto-redirect by IP or Accept-Language.** `i18n.ts`, `i18n-client.ts`, `LanguageSelector.tsx` and the `preferred_lang` logic in `DownloaderForm` are deleted. |
| RTL (ar) | `dir="rtl"`. One mechanical sweep converts physical CSS and Tailwind classes to logical ones before any other work starts, and is verified by a zero-diff LTR screenshot comparison. The perforation stays symmetric. The stub tear hinge and directional icons mirror. URL inputs and code stay LTR. |
| Fonts | Big Shoulders Display covers **latin, latin-ext and vietnamese only**. Latin-ext and Vietnamese are added through `unicode-range` (no cost to pages that don't use them). Cyrillic uses **Sofia Sans Extra Condensed** for the whole headline. Thai uses **Noto Sans Thai, instanced to a condensed width at 900**. Arabic uses **Noto Sans Arabic, instanced to a condensed width at 900**. Everything is self-hosted, subset, loaded only on its locale, and served as one file per script covering weights 800 and 900. |
| 404 | `[locale]/404.astro` builds `dist/<loc>/404/index.html`. A small `astro:build:done` integration renames it to `dist/<loc>/404.html`. Cloudflare's `404-page` mode serves the **nearest** `404.html` up the tree, so `/es/<anything missing>` gets a Spanish 404 with status 404. |

---

## 2. What the repo does today (findings that drive the design)

- **`src/layouts/BaseLayout.astro`** hard-codes the following, all of which must become locale-aware:
  - `<html lang="en">`, `og:locale en_US`, and `hreflang="en"` plus `x-default`, both pointing at the current URL. Its comment reads: "Only declare real locale URLs. Fake multi-locale hreflang pointing at English hurts SEO." Keep that rule.
  - The breadcrumb root `"Home"`.
  - The `nav` and `mobileNav` arrays, footer columns, "Skip to content", aria labels (also set inside the inline menu script), and the "not affiliated with Pinterest Inc." line.
  - Font preloads (latin 800/900 only).
  - Two hydrated `LanguageSelector` islands (`client:idle`), plus `StickyPasteBar`.
- **`src/lib/i18n.ts` / `i18n-client.ts` / `LanguageSelector.tsx`:** the existing language switcher is client-only.
  - It rewrites the H1 and nav link text in the DOM by string matching, which is fragile and not indexable.
  - It stores `preferred_lang`, so it ships 13 languages of strings to every visitor.
  - `DownloaderForm.tsx` (lines ~303–324) also reads `preferred_lang` and swaps its placeholder and button, which produces mixed-language English pages and hydration drift.
  - The de research found quality problems in these strings (Sie vs du, a "1080p" over-claim). Delete the whole mechanism rather than reuse it.
- **`src/lib/seo.ts`:** `webPageSchema` hard-codes `inLanguage: 'en-US'`. `SITEMAP_ROUTES` lists the English routes and priorities. `TOOL_LINKS` and `RelatedTools.ALL_TOOLS` duplicate the tool list with English blurbs.
- **`src/pages/sitemap.xml.ts`:** a plain `urlset` with no xhtml namespace.
- **`src/lib/urls.ts` / `host-redirect.ts` / `src/worker.ts`:**
  - Canonicals are apex + https with no trailing slash.
  - The Worker 301s trailing-slash URLs, but only for paths that reach it. `wrangler.jsonc` `run_worker_first` lists `"/*/"` and `"/*/*/"`.
  - Cloudflare's own `drop-trailing-slash` handling answers **307** (docs: "/folder/ → 307 to /folder"). That is why the Worker patterns exist.
  - All v1 localized URLs are at most 2 segments deep (`/es/slug/`), so they are already covered. A 3-segment URL (`/es/blog/x/`) would need `"/*/*/*/"`.
- **`wrangler.jsonc`:** `not_found_handling: "404-page"`. Cloudflare serves "the nearest `404.html`", walking up the directory tree.
- **Astro build naming:** in `astro/dist/core/util.js` `getOutputFilename`, only `/404` and `/500` become `404.html`/`500.html`. `/es/404` would be written as `es/404/index.html`, which is why the rename hook is needed.
- **`/api/extract`** returns `{ error: "<English sentence>" }`, although `src/lib/extract/types.ts` already has `ExtractErrorCode`:
  - Codes: `invalid_input | blocked | not_pinterest | removed_or_private | wrong_link_type | avatar_not_found | collection_empty | no_media`.
  - The mcp-server branch promises identical `/api/extract` responses, so adding a `code` field is a follow-up that must wait for that merge and update the parity fixtures.
- **`src/lib/pinterest-route.ts`** returns English `path`, `label` and `badge` strings, used by DownloaderForm route notices and by StickyPasteBar's redirect target.
- **SEO gates:**
  - `scripts/seo_health_check.py` runs on `postbuild`. For indexable pages it enforces: title 30–65 (error) / 40–62 (warning), description 110–160 / 120–158, a canonical, JSON-LD, exactly one `<h1>`, and `<img alt>`.
  - `scripts/verify_seo_build_artifacts.py` **fails on any hreflang other than `en`/`x-default`** on money pages. It must change.
  - `tests/seo-invariants.entry.ts` covers URL helpers, redirects, wrangler routing, sitemap coverage and MCP drift.
- **Thin and dishonest English pages exist**: `pinterest-4k-downloader` (33 lines, "4K" title against PRODUCT.md's "no fake 4K") and `pinterest-story-downloader` (38 lines). The research rightly skips most of these. Do not multiply them by 12.
- **Physical-direction styling is limited:**
  - About 30 physical Tailwind utilities across components (`pl-`×12, `border-l`×5, `right-`×5, `pr-`×3, `left-`×3, `border-r`×2, `ml`/`mr`), plus `text-left`.
  - In CSS: `ticket.css` 10 occurrences, `results.css` 25, `blog.css` 18.
  - There are already about 113 logical usages.

---

## 3. Locales

| code | hreflang | `<html lang>` | `og:locale` | dir | headline script/font | research |
|---|---|---|---|---|---|---|
| es | `es` | `es` | `es_LA` | ltr | Big Shoulders latin | done (16 pages) |
| pt | `pt` | `pt-BR` | `pt_BR` | ltr | Big Shoulders latin | done (17) |
| fr | `fr` | `fr` | `fr_FR` | ltr | Big Shoulders latin | done (15) |
| de | `de` | `de` | `de_DE` | ltr | Big Shoulders latin | done (16) |
| it | `it` | `it` | `it_IT` | ltr | Big Shoulders latin | done (12) |
| nl | `nl` | `nl` | `nl_NL` | ltr | Big Shoulders latin | done (8) |
| id | `id` | `id` | `id_ID` | ltr | Big Shoulders latin | done (15) |
| ru | `ru` | `ru` | `ru_RU` | ltr | Sofia Sans Extra Condensed (latin+cyrillic) | done (11) |
| tr | `tr` | `tr` | `tr_TR` | ltr | Big Shoulders latin + **latin-ext** | pending |
| vi | `vi` | `vi` | `vi_VN` | ltr | Big Shoulders latin + **vietnamese** | pending |
| th | `th` | `th` | `th_TH` | ltr | Noto Sans Thai condensed + Big Shoulders for Latin words | pending |
| ar | `ar` | `ar` | `ar_AR` | **rtl** | Noto Sans Arabic condensed + Big Shoulders for Latin words | pending |

`x-default` always points to the English URL of the same page. English keeps hreflang `en` and
`og:locale en_US`.

`src/i18n/locales.ts` (owned by infra):

```ts
export const LOCALES = ['es','pt','fr','de','it','nl','ru','tr','id','vi','th','ar'] as const;
export type Locale = typeof LOCALES[number];
export type AnyLocale = 'en' | Locale;
export const LOCALE_META: Record<AnyLocale, {
  hreflang: string; htmlLang: string; ogLocale: string; dir: 'ltr'|'rtl';
  endonym: string;          // shown in the language menu, rendered with lang={htmlLang}
  script: 'latin'|'latin-ext'|'vietnamese'|'cyrillic'|'thai'|'arabic';
  homeLabel: string;        // breadcrumb root ("Inicio", "Startseite", "الرئيسية" …) – or move to ui/<loc>.ts
}> = { /* … */ };
```

Drop the flag emoji from the menu: flags are countries, not languages (🇸🇦 for all Arabic, 🇺🇸 for
all English).

---

## 4. Page inventory and coverage

**pageIds.** Stable keys equal to the English slug, with `home` for `/`:

- `home`, `pinterest-pin-downloader`, `pinterest-video-downloader`, `pinterest-image-downloader`, `pinterest-gif-downloader`
- `pinterest-board-downloader`, `pinterest-profile-downloader`, `pinterest-profile-picture-downloader`, `pinterest-carousel-downloader`
- `pinterest-audio-downloader`, `pinterest-to-mp4`, `pinterest-video-downloader-chrome`, `pinterest-story-downloader`, `pinterest-4k-downloader`
- `how-to-download-pinterest-videos`, `how-to-download-pinterest-video-in-gallery`, `how-to-download-pinterest-video-on-laptop`, `download-pinterest-videos-iphone-android`

**Templates.** `home` → HomePage. Tool pages → ToolPage. `how-to-*` and the iphone-android page → GuidePage.

**Never localized in v1:** blog posts, `/blog`, about/contact/privacy/terms, `pinterest-seo-title-generator`
(its generator only outputs English), `pinterest-mcp-server` (developer audience), `/embed`.
Localized chrome links to these with `hreflang="en" lang="en"` and an "(English)" marker.

**Coverage today** (from the research JSONs; `-` means skipped):

| pageId | es | pt | fr | de | it | nl | id | ru |
|---|---|---|---|---|---|---|---|---|
| home | /es | /pt | /fr | /de | /it | /nl | /id | /ru |
| pin | descargar-pin-pinterest | baixar-pin-pinterest | telecharger-epingle-pinterest | pinterest-pin-herunterladen | scaricare-pin-da-pinterest | pinterest-pin-downloaden | download-pin-pinterest | skachat-pin-s-pinterest |
| video | descargar-videos-pinterest | baixar-video-pinterest | telecharger-video-pinterest | pinterest-video-herunterladen | scaricare-video-da-pinterest | pinterest-video-downloaden | download-video-pinterest | skachat-video-s-pinterest |
| image | descargar-imagenes-pinterest | baixar-imagem-pinterest | telecharger-photo-pinterest | pinterest-bilder-herunterladen | scaricare-immagini-da-pinterest | pinterest-foto-downloaden | download-foto-pinterest | skachat-foto-s-pinterest |
| gif | descargar-gif-pinterest | baixar-gif-pinterest | telecharger-gif-pinterest | pinterest-gif-herunterladen | scaricare-gif-da-pinterest | pinterest-gif-downloaden | download-gif-pinterest | skachat-gif-s-pinterest |
| board | descargar-tableros-pinterest | baixar-pasta-pinterest | telecharger-tableau-pinterest | pinterest-pinnwand-herunterladen | scaricare-bacheca-pinterest | pinterest-bord-downloaden | download-board-pinterest | skachat-dosku-pinterest |
| profile | descargar-perfil-pinterest | baixar-perfil-pinterest | - | pinterest-profil-herunterladen | - | - | - | - |
| profile-picture | descargar-foto-perfil-pinterest | baixar-foto-de-perfil-pinterest | telecharger-photo-de-profil-pinterest | pinterest-profilbild-herunterladen | - | - | download-foto-profil-pinterest | skachat-avatarku-s-pinterest |
| carousel | descargar-carrusel-pinterest | baixar-carrossel-pinterest | - | pinterest-karussell-herunterladen | - | - | - | - |
| story | - | - | - | - | - | - | download-story-pinterest | - |
| audio | pinterest-a-mp3 | baixar-som-pinterest | telecharger-mp3-pinterest | pinterest-audio-herunterladen | scaricare-audio-da-pinterest | - | download-mp3-pinterest | - |
| 4k | - | baixar-video-pinterest-full-hd ⚠ | telecharger-pinterest-4k ⚠ | - | - | - | - | - |
| to-mp4 | pinterest-a-mp4 | pinterest-para-mp4 | convertisseur-pinterest-mp4 | pinterest-in-mp4-umwandeln | convertitore-pinterest-mp4 | - | pinterest-ke-mp4 | - |
| chrome | descargar-videos-pinterest-chrome | baixar-video-pinterest-chrome | telecharger-video-pinterest-chrome | pinterest-video-downloader-chrome | - | - | download-video-pinterest-di-chrome | - |
| how-to | como-descargar-videos-pinterest | como-baixar-video-do-pinterest | comment-telecharger-une-video-pinterest | pinterest-videos-speichern | come-scaricare-video-da-pinterest | hoe-pinterest-video-downloaden | cara-download-video-pinterest | kak-skachat-video-s-pinterest |
| gallery | guardar-videos-pinterest-galeria | como-salvar-video-do-pinterest-na-galeria | enregistrer-video-pinterest-galerie | pinterest-video-in-galerie-speichern | come-salvare-video-pinterest-in-galleria | pinterest-video-opslaan | cara-menyimpan-video-pinterest-ke-galeri | kak-sohranit-video-s-pinterest-v-galereyu |
| laptop | descargar-videos-pinterest-pc | como-baixar-video-do-pinterest-no-pc | telecharger-video-pinterest-pc | pinterest-video-herunterladen-pc | come-scaricare-video-da-pinterest-su-pc | - | cara-download-video-pinterest-di-laptop | kak-skachat-video-s-pinterest-na-kompyuter |
| iphone-android | descargar-videos-pinterest-celular | baixar-video-pinterest-iphone-android | telecharger-video-pinterest-iphone | pinterest-video-herunterladen-iphone-android | scaricare-video-pinterest-iphone-android | - | cara-download-video-pinterest-di-hp | skachat-video-s-pinterest-na-iphone-i-android |

All 110 researched titles and descriptions already sit inside 40–62 / 120–158 (checked by
script). The `it` research gives bare slugs without `/it/`; normalize them when routes.ts is filled.

⚠ **4K pages (fr, pt):** PRODUCT.md says "no fake 4K", and `pin-media.ts` serves 1200x images
and the 720p/1080p streams Pinterest publishes. These pages may ship only as honest explainers
("Pinterest does not serve 4K; here is the best available quality"), with titles that don't
promise 4K. Otherwise skip them as es did. **The orchestrator decides.** The English 4K page
has the same problem, but it is out of scope here.

---

## 5. URLs and routing

### 5.1 Route map (single source of truth)

`src/i18n/routes.ts`. It is plain TypeScript with no Astro imports, so the esbuild-bundled node tests can import it.

```ts
export const PAGE_IDS = [ 'home', 'pinterest-video-downloader', /* … */ ] as const;
export type PageId = typeof PAGE_IDS[number];

export const PAGES: Record<PageId, {
  en: string;                                  // English path, e.g. '/pinterest-video-downloader' or '/'
  template: 'home' | 'tool' | 'guide';
  variant?: FormVariant;                       // DownloaderForm variant for this page
  field: Stock;                                // ticket stock, same as the English page
  sitemap: { changefreq: Changefreq; priority: number };   // localized pages inherit the English values
}> = { /* … */ };

/** Locale slugs. Missing key = page does not exist in that locale. '' = locale home. */
export const SLUGS: Record<Locale, Partial<Record<PageId, string>>> = {
  es: { home: '', 'pinterest-video-downloader': 'descargar-videos-pinterest', /* … */ },
  /* … */
};

export function pathFor(pageId: PageId, locale: AnyLocale): string | null;   // '/es/descargar-…', '/es', '/pinterest-…', or null
export function routeForPath(pathname: string): { pageId: PageId; locale: AnyLocale } | null;   // reverse lookup, slash-insensitive
export function alternatesFor(pageId: PageId): { hreflang: string; href: string }[];          // existing locales + en + x-default, absolute
export function localeHome(locale: AnyLocale): string;   // '/' or '/es'
export function localePagesOf(locale: AnyLocale): PageId[];
```

Rules, enforced by unit tests (section 12):

- Slugs are lowercase ASCII matching `[a-z0-9]+(-[a-z0-9]+)*`.
- Slugs are unique within a locale, and never `404`, `api`, `mcp`, `blog`, `fonts`, `images` or `_astro`.
- No locale code may equal an existing top-level path, and no locale path may equal an `astro.config.mjs` redirect source.

### 5.2 Route files

```
src/pages/[locale]/index.astro     → /es, /pt, …            (getStaticPaths: LOCALES)
src/pages/[locale]/[slug].astro    → /es/<slug>             (getStaticPaths: every (locale, pageId≠home) in SLUGS)
src/pages/[locale]/404.astro       → /es/404 → renamed to es/404.html after build
```

```astro
---
// src/pages/[locale]/[slug].astro
import { getEntry } from 'astro:content';
import { LOCALES } from '../../i18n/locales';
import { SLUGS, PAGES } from '../../i18n/routes';
export function getStaticPaths() {
  return LOCALES.flatMap((locale) =>
    Object.entries(SLUGS[locale])
      .filter(([pageId, slug]) => pageId !== 'home' && slug)
      .map(([pageId, slug]) => ({ params: { locale, slug }, props: { locale, pageId } })),
  );
}
const { locale, pageId } = Astro.props;
const entry = await getEntry('i18nPages', `${locale}/${pageId}`);
if (!entry) throw new Error(`Missing content src/content/i18n/${locale}/${pageId}.json`);
// pick HomePage / ToolPage / GuidePage by PAGES[pageId].template
---
```

Astro's routing priority puts static segments ahead of `[locale]`: `/blog/x` stays with
`blog/[slug].astro`, and `/about` stays with `about.astro`. `getStaticPaths` emits only real
locales, so nothing else is generated. Everything is prerendered (`output: 'static'`), so the
localized pages are plain static assets served by Cloudflare without invoking the Worker.

**Why not Astro `i18n`:** according to the docs, Astro i18n assumes identical path segments
across locales (no per-page translated slugs). Custom locale paths need `output: "server"` with
"no individual prerendered pages". Its middleware would also run on `/api/*` and `/mcp`. We
only need `currentLocale`, which `routeForPath` already provides.

### 5.3 Worker, wrangler, redirects

- **`run_worker_first`:** unchanged for v1 (`"/*/"` and `"/*/*/"` already send `/es/` and `/es/slug/` to the Worker's 301). Add a test that computes the deepest localized URL and asserts the array has a matching `/*/…/` pattern, so a later `/es/blog/x` cannot silently fall back to Cloudflare's 307.
- **`hostRedirectUrl`:** no change (it already strips slashes and forces https and apex). Add test cases for `/es/` → `/es` and `/ar/x/` → `/ar/x`.
- **No locale redirects of any kind.** The middleware and Worker must not read `Accept-Language`, `CF-IPCountry` or cookies to choose a language. Google: "Avoid automatically redirecting users… based on their assumed language", and Googlebot "sends HTTP requests without setting `Accept-Language`." Add a live check (section 13) that `/` with `Accept-Language: es` is byte-identical to `/`.
- **Slug renames later:** add the old path to `redirects` in `astro.config.mjs`. It is emitted into `dist/_redirects` (already used for the English vanity aliases).

### 5.4 Per-locale 404

- `[locale]/404.astro` renders a voided ticket in the locale's language. It is `noindex`, with no hreflang and no canonical.
- Its links point to the locale's home and to its video/pin/board pages, falling back to the locale home.
- Add an inline integration in `astro.config.mjs`:

```js
{ name: 'locale-404', hooks: { 'astro:build:done': async ({ dir }) => {
  for (const loc of LOCALES) {             // import from a plain .mjs copy or read routes JSON
    const from = new URL(`${loc}/404/index.html`, dir), to = new URL(`${loc}/404.html`, dir);
    if (existsSync(from)) { renameSync(from, to); rmSync(new URL(`${loc}/404/`, dir), { recursive: true }); }
  }
}}}
```

Confirm in the build that `dir` resolves to the asset root (`dist/`) with the Cloudflare adapter. Otherwise target `dist/` explicitly.

Result: `/es/no-existe` → Cloudflare looks for `es/no-existe/404.html`, then `es/404.html` → 404 status with the Spanish page. `/es/404` itself is no longer an asset, so it returns 404 as well.

---

## 6. Content model

### 6.1 Files and ownership

```
src/i18n/locales.ts            infra       LOCALE_META
src/i18n/routes.ts             infra       PAGES, SLUGS, pathFor, alternatesFor, routeForPath
src/i18n/schema.ts             infra       zod schema for page JSON (imported by content.config.ts AND tests)
src/i18n/inline.ts             infra       renderInline(): escape → **b**, `code`, [[pageId|text]], [text](https://allowlisted)
src/i18n/jsonld.ts             infra       localized JSON-LD builders (wrap src/lib/seo.ts)
src/i18n/ui/en.ts + <loc>.ts   en: infra; <loc>: content writer   chrome strings (type UiStrings)
src/i18n/island/en.ts + <loc>.ts  en: islands builder; <loc>: content writer   island strings (type IslandMessages)
src/i18n/fonts.ts              rtl-fonts   fontAssetsFor(locale) → { preload: string[] } (+ CSS class hook)
src/content.config.ts          infra       defineCollection i18nPages (glob loader, base ./src/content/i18n)
src/content/i18n/<loc>/<pageId>.json   content writer per locale
```

Use JSON and not `.astro` copies. The page structure lives once, in the templates. Writers cannot
break markup, inject raw HTML or create unlinked pages. Zod catches length and shape errors at
`astro build`, and the same schema runs in `npm test`.

### 6.2 Page JSON schema (freeze this; writers start from it)

```ts
// src/i18n/schema.ts
import { z } from 'astro/zod';
const Inline = z.string().min(1);                 // mini-markup only, no '<'
const noHtml = (s: string) => !/[<>]/.test(s);
export const PageContent = z.object({
  pageId: z.enum(PAGE_IDS), locale: z.enum(LOCALES),   // must match file path
  meta: z.object({
    title: z.string().min(40).max(62),            // health check: 40–62 optimal, 30–65 hard
    description: z.string().min(120).max(158),    // health check: 120–158 optimal
  }),
  keywords: z.object({ primary: z.string(), secondary: z.array(z.string()) }),   // QA only, never rendered (no meta keywords)
  nav: z.object({                                 // used by other pages' nav, footer matrix, related cards
    label: z.string().max(28), short: z.string().max(14),
    card: z.object({ title: z.string().max(40), blurb: z.string().max(90), badge: z.string().max(8) }),
  }),
  hero: z.object({ h1: z.string().max(60).refine(noHtml), lede: Inline.max(220) }),
  intro: z.array(Inline).min(1).max(3),
  features: z.array(z.object({ h: z.string().max(40), p: Inline.max(200) })).length(3).optional(),
  sections: z.array(z.object({
    h2: z.string().max(80), paragraphs: z.array(Inline).min(1), list: z.array(Inline).optional(),
  })).min(1).max(6),                               // guides: the article body; tools: "which tool", local app wording, honest-quality note
  steps: z.object({
    title: z.string(), intro: Inline, exampleLabel: z.string(),
    items: z.array(z.object({ title: z.string().max(60), body: Inline })).min(3).max(6),
  }),
  faq: z.object({ title: z.string(), items: z.array(z.object({ q: z.string(), a: Inline })).min(4).max(9) }),
  related: z.object({ title: z.string() }),
  schema: z.object({ appName: z.string(), howToName: z.string(), howToDescription: z.string() }),
  datePublished: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), dateModified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  review: z.object({ writer: z.string(), nativeReviewer: z.string().optional() }),   // provenance, not rendered
});
```

`home` adds `aside: {dt, dd}[3]`, `guides` (links to localized guide pages) and a `credit`
section.

**Inline mini-markup** (`renderInline` escapes everything first):

- `**bold**` and `` `code` ``.
- `[[pageId|anchor text]]`: an internal link resolved with `pathFor(pageId, locale)`. **The build fails** if that page does not exist in the locale. This keeps internal links in-locale by construction.
- `[[en:/blog/slug|anchor]]`: an explicit English link, rendered with `hreflang="en" lang="en"`.
- `[text](https://…)`: external links, allowed only to `help.pinterest.com` and `pinterest.com`. Rendered with `rel="noopener"`.

### 6.3 Writing rules for content writers

These rules are in addition to the schema.

- **Inputs:** start from `docs/i18n/research/<loc>.json`. Use its `pages[]` title, description, h1, faqTopics and evidence, its `glossary` and its `formats`. Write the copy natively and read the English page only for facts. Use the research's Pinterest app wording (es: "Compartir → Copiar enlace", Galería/Fotos).
- **Honesty:**
  - Public content only.
  - No numbers about users, downloads or ratings.
  - No "4K" or "1080p" promises. Say "the highest quality Pinterest publishes for that pin".
  - "No watermark" means *we add none*.
  - Keep a credit-creators line, and include the "Independent tool, not affiliated with Pinterest Inc." line (it also lives in the footer).
- **Substance:** each tool page needs at least 3 FAQ answers grounded in the research's local intent traps. Examples: es "descargar pinterest" means the app; "fotos de perfil de pinterest" means ideas. The page's paragraphs must also differ in substance from English (local devices, phrasing, app menus). Target length is about the English page's length; never pad.
- **Typography from the research:**
  - de: explicit hyphens in compounds, no ẞ.
  - fr: accented capitals, no narrow nbsp in H1.
  - id: `&nbsp;` before short words at line ends. Write it as U+00A0 in JSON.
  - ru: № needs the Cyrillic face.
  - All locales: no `→` in stamps, because Big Shoulders lacks U+2192. Use `›`.
- **Locale-variant names:** pt copy is Brazilian (`lang="pt-BR"`). Spanish is neutral Latin American with tú and "video", not "vídeo".

---

## 7. Templates and component changes

| Component | Change (English output must remain identical) |
|---|---|
| `BaseLayout.astro` | Gets `locale?: AnyLocale` (default: `routeForPath(Astro.url.pathname)?.locale ?? 'en'`) and `ui?: UiStrings` (default `en`).<br>• Renders `lang` and `dir`, alternates, `og:locale`/`og:locale:alternate`, the localized breadcrumb, nav, mobile nav, footer and skip link.<br>• The inline menu script reads aria labels from `data-label-open`/`data-label-close`.<br>• Font preloads come from `fontAssetsFor(locale)`.<br>• `LanguageSelector` becomes `LanguageMenu.astro`.<br>• StickyPasteBar gets `messages` and `paths` props for non-en locales. |
| `TicketHero.astro` | Passes `locale`, `messages` (non-en only) and `routes` (the current locale's `{pageId → path}` for route notices) to DownloaderForm. Accepts `h1`/`lede` already rendered by `renderInline`. |
| `HowToSteps`, `FaqSection`, `CompareTable`, `RelatedTools`, `BookmarkletGuide`, `AdSlot`, `FooterKeywordMatrix` | Optional `ui`/`locale` props.<br>• RelatedTools and FooterKeywordMatrix build their lists from `localePagesOf(locale)` plus each page's `nav.card` and `nav.label` (via `getCollection`).<br>• For English, they keep their current arrays.<br>• `BookmarkletGuide` targets `https://pintdownload.app/<loc>?url=` on localized pages. |
| `components/i18n/HomePage.astro`, `ToolPage.astro`, `GuidePage.astro` | New. They mirror the English page structure: Ticket hero, intro, features, sections, steps, compare, FAQ and related tools. Guides render `sections` as an article with numbered steps. |
| `LanguageMenu.astro` | New, with no JS needed. A `<details><summary>` shows the current endonym. Inside, `<a href={alt} hreflang={meta.hreflang} lang={meta.htmlLang}>` for all 13 languages. When the current page lacks a version in that language, the link goes to that locale's home (no `hreflang` attribute on that link). The current language is marked `aria-current="true"`. A small inline script closes it on outside click and Escape. Targets are at least 44px and the list scrolls with `overscroll-behavior: contain`. |
| `src/lib/seo.ts` | `webPageSchema` and `softwareAppSchema` get an optional `inLanguage` (default `'en-US'`, so English is unchanged). Add `localizedSitemapEntries()`. Leave `SITEMAP_ROUTES` as it is. |
| Delete | `src/lib/i18n.ts`, `src/lib/i18n-client.ts`, `src/components/LanguageSelector.tsx`, and the `preferred_lang` and `languageChange` code in DownloaderForm. |

**Header nav per locale:** the same 8 slots by pageId. A slot whose page does not exist in that
locale is omitted. "Guides" points to the locale's `how-to-download-pinterest-videos` page.

**Footer:**

- Tools column: localized pages only.
- Learn column: localized guides, plus "Blog (English)".
- Company column: About, Contact, Privacy and Terms, each marked English (`hreflang="en" lang="en"`).

---

## 8. Head: canonical, hreflang, Open Graph, JSON-LD

For a page with `{pageId, locale}`:

```html
<html lang="es" dir="ltr">
<link rel="canonical" href="https://pintdownload.app/es/descargar-videos-pinterest">
<link rel="alternate" hreflang="en" href="https://pintdownload.app/pinterest-video-downloader">
<link rel="alternate" hreflang="es" href="https://pintdownload.app/es/descargar-videos-pinterest">
<link rel="alternate" hreflang="pt" href="https://pintdownload.app/pt/baixar-video-pinterest">
… one per locale that has this pageId …
<link rel="alternate" hreflang="x-default" href="https://pintdownload.app/pinterest-video-downloader">
<meta property="og:locale" content="es_LA">
<meta property="og:locale:alternate" content="en_US"> … (one per alternate)
```

- **One generator:** `alternatesFor(pageId)` runs for every member of the cluster, so the sets are identical by construction. Every page self-references, every link is reciprocal, URLs are fully qualified, and there are no partial clusters. These are Google's three hard rules.
- **Canonical is always self.** A localized page never canonicalizes to English: Google treats translations as distinct when "the main content … is translated".
- Pages outside the map (blog, legal, mcp, title generator, 404) keep today's behavior: `en` plus `x-default` both pointing at themselves, which is valid as a self-only cluster. `noindex` pages output no alternates.
- **JSON-LD** (`src/i18n/jsonld.ts`). Every entity carries `inLanguage = htmlLang`.
  - `WebPage`: localized name and description.
  - `SoftwareApplication`: the localized `schema.appName`, offers price 0. **Never `aggregateRating`**, which is already a test.
  - `HowTo`: from `steps`.
  - `FAQPage`: from `faq`, only when the FAQ is visible on the page.
  - `BreadcrumbList`: the root uses `LOCALE_META.homeLabel` and points to `/es`.
  - Guides add `Article` with `datePublished`/`dateModified` from the JSON (the real publish date, not the build date).
  - `Organization` keeps the same `@id` (`https://pintdownload.app/#organization`) on all locales.
  - Don't add `WebSite` with `SearchAction` to localized pages: Google retired the sitelinks search box in 2024. English stays untouched.
  - Expectations: Google limited FAQ rich results to authoritative gov and health sites and deprecated HowTo rich results in 2023. This markup is for consistency and for other consumers, not for rich results.

---

## 9. Sitemap

`src/pages/sitemap.xml.ts` adds the `xhtml` namespace and emits one `<url>` for every English
route and blog post (unchanged) **and** for every localized URL. Each URL in a cluster carries
the full alternate set:

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://pintdownload.app/es/descargar-videos-pinterest</loc>
    <lastmod>2026-11-02</lastmod>                       <!-- content JSON dateModified; never "today" -->
    <changefreq>weekly</changefreq><priority>0.98</priority>   <!-- inherits PAGES[pageId].sitemap -->
    <xhtml:link rel="alternate" hreflang="en" href="https://pintdownload.app/pinterest-video-downloader"/>
    <xhtml:link rel="alternate" hreflang="es" href="https://pintdownload.app/es/descargar-videos-pinterest"/>
    …
    <xhtml:link rel="alternate" hreflang="x-default" href="https://pintdownload.app/pinterest-video-downloader"/>
  </url>
```

- English URLs in a cluster get the same `xhtml:link` children.
- Size: about 160 localized URLs plus the existing ones, with at most 13 links each. That is far below the 50,000 URL / 50 MB limit, so one file is enough.
- Google says one hreflang method is enough. We emit HTML (required for Yandex) and sitemap from the same function, and a test asserts they are equal.
- `robots.txt`: no change (locale folders are allowed, and it already lists `Sitemap:`).
- `scripts/indexnow.mjs`: today it builds a URL list from static and blog pages. Make it read `localizedSitemapEntries()` or the built sitemap, so new locale URLs are pinged.

---

## 10. React islands: strings without bloating every page

**Inventory:**

- `DownloaderForm.tsx` (2,410 lines): `VARIANT_COPY` has 8 variants × 7 fields, plus 17 `setError` messages, about 30 JSX text nodes and 14 aria, title and placeholder strings.
- `results/parts.tsx`, `AudioTrimmer.tsx`, `ImageCropperModal.tsx`: a few strings each.
- `StickyPasteBar.tsx`: about 7 strings, plus the English redirect paths.
- `pinterest-route.ts`: English labels, badges and paths.

**Design:**

1. **Catalog types.**
   - `src/i18n/island/en.ts` exports `EN_ISLAND: IslandMessages`, a nested object with `common`, `variants[FormVariant]`, `errors[ExtractErrorCode | client codes]`, `results`, `zip`, `trimmer`, `cropper`, `sticky` and `routeNotice[kind]`.
   - Each component imports `EN_ISLAND` as its default. That is the same weight as today's inline literals, so English JS is unchanged.
2. **Per-locale catalogs** (`src/i18n/island/<loc>.ts`) are imported **only by Astro templates** on the server and passed as a serialized prop: `<DownloaderForm client:load variant=… messages={pickIsland(locale, variant)} routes={…} />`.
   - `pickIsland` sends `common`, `errors`, `results`, `zip`, `trimmer`, `cropper`, `routeNotice` and only the current variant's copy.
   - Estimate: 4–7 KB raw JSON in the island's `props` attribute, about 1.5–2 KB after brotli.
   - No locale catalog enters any client bundle. Verify with a build check (`grep` of `dist/_astro/*.js` for a unique Spanish string must be empty).
3. **Merge:** `const m = useMemo(() => deepMerge(EN_ISLAND, props.messages), [props.messages])`. A missing key falls back to English, and the tests make sure no key is missing.
4. **Interpolation and plurals.**
   - Message values are plain strings with `{name}` tokens.
   - Counts use a plural map keyed by `Intl.PluralRules` category, for example `{ one: '{n} pin', other: '{n} pins' }`. `ru` needs `one/few/many/other`, `ar` needs `zero/one/two/few/many/other`, and `th`/`vi`/`id` need `other` only.
   - A 20-line `fmt(msg, vars, locale)` helper does this. Numbers go through `Intl.NumberFormat(htmlLang)`.
   - Functions cannot be passed as island props, which is why plain data is used.
5. **Server error codes.**
   - After mcp-server merges, `/api/extract` adds `code` (and `actualKind`) next to `error`. This is an additive JSON field, and the parity fixtures are updated in the same PR.
   - The client shows `m.errors[code]` and falls back to the server's English `error`.
   - Until then, localized pages show a generic localized error with the server text as a secondary detail.
6. **Route notices and StickyPasteBar.**
   - `pinterest-route.ts` returns `pageId` (and keeps `path` for compatibility).
   - Components resolve the URL with the `routes` prop (`{pageId → localized path}` for this locale only), falling back to the locale home, whose hub form handles every link type.
   - StickyPasteBar navigates to `routes['pinterest-board-downloader'] ?? routes.home`, so a Spanish visitor stays in Spanish.
7. **URL input** gets `dir="ltr"`, `inputMode="url"` and `lang="en"`-neutral handling. In `ar`, test whether the Arabic placeholder renders RTL inside an LTR input. If it does not, use `dir="auto"` and verify the caret direction after paste (QA item).
8. **Hydration.** Server and client render the same locale (it comes from props, not localStorage), so there is no mismatch. Delete the `useEffect` that reads `preferred_lang`.

---

## 11. RTL support (Arabic)

**Step 0, before any i18n work: a mechanical logical-property sweep.** It must produce no
visual change in LTR. It is verified by pixel-diffing 6 pages at 390 and 1440 in light and dark,
before and after.

**Tailwind 3.4 class replacements:**

| Physical | Logical |
|---|---|
| `pl-*` / `pr-*` | `ps-*` / `pe-*` |
| `ml-*` / `mr-*` | `ms-*` / `me-*` |
| `left-*` / `right-*` | `start-*` / `end-*` |
| `border-l*` / `border-r*` | `border-s*` / `border-e*` |
| `rounded-l*` / `rounded-r*` | `rounded-s*` / `rounded-e*` |
| `text-left` / `text-right` | `text-start` / `text-end` |

- Add `rtl:space-x-reverse` wherever `space-x-*` is used.
- In `tailwind.config.mjs`, nothing changes: the `rtl:` and `ltr:` variants are built in.

**CSS** (`ticket.css`, `results.css`, and `blog.css` for future use): `padding-left` → `padding-inline-start`, `left:` → `inset-inline-start:`, `text-align:left` → `start`, and so on.

**Specific mirroring:**

| Element | RTL treatment |
|---|---|
| Perforation `.perf::before/::after` | Symmetric notches. No change, but use `inset-inline-start/end` for hygiene. |
| Stub tear (`.ticket[data-tearing] .stub`) | The hinge moves to the right: `[dir=rtl] … { transform-origin: 100% 0; transform: translate(-6px,18px) rotate(3.5deg); }` |
| Stamps (`rotate(-2deg)`, `stamp-in`) | Mirror the angle in RTL (`rotate(2deg)`) so the stamp leans the same way relative to reading direction. |
| Seam hero grid | CSS grid mirrors automatically. `.seam-lip::before { inset: 0 -100vw -400vh }` is left/right symmetric. Re-check that the stub lands on the counter at 1440. |
| `.ticket { text-align:left }`, `.tool-body .text-center{text-align:left}` | Change to `start`. |
| Directional icons (chevrons `M9 6l6 6-6 6`, ArrowUp is fine, `ChevronRight` in results, carousel prev/next) | Add a `rtl:-scale-x-100` class. Carousel arrow-key handlers swap ArrowLeft and ArrowRight under RTL. Horizontal scrollers start at the inline-start edge, so check `scrollLeft` maths, which is negative in RTL in modern browsers. |
| URLs, `pin.it`, `/pin/`, code, file names, `MP4`, `1080p` | Wrap in `<bdi>` or `<code dir="ltr">`. `renderInline` emits `` `code` `` as `<code dir="ltr">`. The serial `№ 1120…` is in `dir="ltr"` `<span>`s. |
| Digits | Use Western digits (0–9) in Arabic copy, which is common on Gulf and Levant web, and in UI numbers (`Intl.NumberFormat('ar', {numberingSystem:'latn'})`). The ar writer confirms this. |
| Letter-spacing and uppercase | `:lang(ar), :lang(th) { letter-spacing: 0 !important }` on `.t-display`, `.t-label`, `.stub-btn`, `.stamp`, `.ticket-serial` and `.receipt-band`. Positive tracking breaks Arabic joining. `text-transform: uppercase` has no effect and stays harmless. |

---

## 12. Fonts per script

### 12.1 What Big Shoulders Display covers

Inspected in `node_modules/@fontsource/big-shoulders-display` (5.3.0). The Fontsource API
agrees: the subsets are `latin`, `latin-ext` and `vietnamese` only. fontTools checks of the
woff2 files:

| Need | latin subset (shipped today) | latin+latin-ext+vietnamese |
|---|---|---|
| es pt fr de it nl id | covered (ẞ missing: never type it; Ÿ, U+202F missing) | — |
| tr `Ğ ğ İ Ş ş` | **missing** | covered by latin-ext |
| vi `Ă Đ Ơ Ư ẠẤẦ…` | **missing** | covered by vietnamese |
| ru Cyrillic, `№` | **missing** | **missing** (no Cyrillic at all) |
| th Thai | **missing** | **missing** |
| ar Arabic | **missing** | **missing** |
| `→` U+2192 (used in English stamps) | missing (already falls back today) | missing |

### 12.2 Per-script headline faces (self-hosted, subset)

| Script | Face | Why it keeps the condensed gothic feel | Files (measured woff2) | Load on |
|---|---|---|---|---|
| Latin (en es pt fr de it nl id) | Big Shoulders Display 800/900 latin (current) | itself | 14.6 KB + 14.0 KB (preloaded today) | all |
| Latin-ext (tr) | Big Shoulders latin-ext, `unicode-range` U+0100-02BA… | same family | 12.8 KB (800) + 12.5 KB (900) | downloaded only when a page uses those glyphs; preload 900 on `/tr` |
| Vietnamese (vi) | Big Shoulders vietnamese, `unicode-range` | same family | 4.7 KB + 4.6 KB | as above, preload 900 on `/vi` |
| Cyrillic (ru) | **Sofia Sans Extra Condensed** 800/900 (OFL; Fontsource: cyrillic, latin, 100–900). Alternatives: Fira Sans Extra Condensed, Roboto Condensed. Oswald tops out at 700, too light. | Extra-condensed grotesque with a tall x-height and flat terminals. It is set for the **whole** ru headline (Latin "PINTEREST" too), so the face does not switch mid-line. The ru research recommends this. | cyrillic 900 9.7 KB + latin 900 15.7 KB ≈ 25 KB per weight | ru only. Big Shoulders is not preloaded on ru. |
| Thai (th) | **Noto Sans Thai**, instanced from the variable font (`wdth` 62.5–100, `wght` 100–900) to `wdth 62.5–75, wght 900` and subset to U+0E00–0E7F plus basics | The condensed width axis gives a narrow, heavy, loopless Thai that sits beside Big Shoulders Latin. Latin words in Thai headlines keep Big Shoulders through the font stack. | **14.1 KB** (wdth 62.5) / 14.3 KB (wdth 75), one file declared `font-weight: 800 900` | th only |
| Arabic (ar) | **Noto Sans Arabic**, instanced (`wdth` 62.5–100 available) to `wdth 75, wght 900`, subset to U+0600–06FF plus basics. Alternatives: Cairo Black (14.0 KB, but wide and round); Noto Kufi Arabic 900 (45 KB, geometric Kufi, very "signage", but heavier). | Condensed Naskh-grotesque at black weight reads as a ticket headline. Kufi is the stylistic fallback if visual QA prefers it. Latin words keep Big Shoulders. | **30.5 KB** (wdth 75) / 30.2 KB (62.5), one file for 800–900. Estimate: 15–20 KB if subset to the glyphs actually used in ar strings at build time. | ar only |

**Budget per locale** (headline fonts only; body text stays system-ui, which covers Thai,
Arabic and Cyrillic on iOS, Android, Windows and macOS):

| Locale | Font bytes |
|---|---|
| en / es / pt / fr / de / it / nl / id | 28.6 KB (unchanged) |
| tr | about 54 KB |
| vi | about 38 KB |
| ru | about 25 KB (900 only, declared for 800–900) to 51 KB (both weights) |
| th | about 43 KB (Big Shoulders latin + 14 KB) |
| ar | about 59 KB (Big Shoulders latin + 30.5 KB) |

All faces are OFL-1.1. Ship `public/fonts/licenses/OFL-*.txt`.

**Generation:** `scripts/fonts/build_script_fonts.py` (owned by rtl-fonts; uses `fontTools.varLib.instancer` and `fontTools.subset`).

- It downloads the Google Fonts variable TTFs from `github.com/google/fonts` into a scratch dir and writes `public/fonts/noto-sans-thai-cond-900.woff2` and `public/fonts/noto-sans-arabic-cond-900.woff2`.
- It copies the Fontsource Big Shoulders latin-ext/vietnamese and Sofia files from `node_modules`. Add `@fontsource/sofia-sans-extra-condensed` as a devDependency, or vendor the 4 files.
- The generated binaries are committed. The build never downloads fonts.

### 12.3 CSS per script

```css
/* ticket.css: add next to the existing @font-face blocks */
@font-face { font-family:'Big Shoulders Display'; font-weight:800; font-display:swap;
  src:url('/fonts/big-shoulders-display-latin-ext-800-normal.woff2') format('woff2');
  unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }
/* … 900, and vietnamese 800/900 with U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB */
@font-face { font-family:'PD Cyrillic Display'; font-weight:800 900; font-display:swap; src:url('/fonts/sofia-sans-extra-condensed-cyrillic-900.woff2') format('woff2'); unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116; }
@font-face { font-family:'PD Cyrillic Display'; font-weight:800 900; font-display:swap; src:url('/fonts/sofia-sans-extra-condensed-latin-900.woff2') format('woff2'); unicode-range:U+0000-00FF,U+2000-206F; }
@font-face { font-family:'PD Thai Display';   font-weight:800 900; font-display:swap; src:url('/fonts/noto-sans-thai-cond-900.woff2') format('woff2');   unicode-range:U+0E01-0E5B,U+200C-200D,U+25CC; }
@font-face { font-family:'PD Arabic Display'; font-weight:800 900; font-display:swap; src:url('/fonts/noto-sans-arabic-cond-900.woff2') format('woff2'); unicode-range:U+0600-06FF,U+200C-200F,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FEFC; }

/* One custom property drives every display usage (.t-display, .stub-btn, .stamp, .t-label, .ticket-serial, tool-body h2 …) */
:root            { --font-display: 'Big Shoulders Display', 'Arial Narrow', ui-sans-serif, sans-serif; }
:lang(ru)        { --font-display: 'PD Cyrillic Display', 'Arial Narrow', ui-sans-serif, sans-serif; }
:lang(th)        { --font-display: 'Big Shoulders Display', 'PD Thai Display', ui-sans-serif, sans-serif; }
:lang(ar)        { --font-display: 'Big Shoulders Display', 'PD Arabic Display', ui-sans-serif, sans-serif; }

/* Line-height: vertical metrics differ (measured: Big Shoulders asc 0.984/desc 0.213 em;
   Noto Thai 1.061/0.45; Noto Arabic 1.374/0.738). 0.88–0.9 clips accents and marks. */
:lang(fr) .t-display, :lang(pt) .t-display, :lang(de) .t-display { line-height: 1.0; padding-top: .08em; } /* per fr/pt research; de 0.92 may suffice */
:lang(vi) .t-display { line-height: 1.12; padding-top: .12em; }   /* stacked marks on caps: Ấ Ầ Ẩ */
:lang(th) .t-display { line-height: 1.3; }
:lang(ar) .t-display { line-height: 1.3; }
:lang(th) .t-display, :lang(ar) .t-display, :lang(th) .t-label, :lang(ar) .t-label,
:lang(th) .stub-btn,  :lang(ar) .stub-btn  { letter-spacing: 0; text-transform: none; }
.t-display { hyphens: manual; font-synthesis: none; }
```

- `text-transform: uppercase` follows `lang`. Turkish `i → İ` and German `ß → SS` both depend on `<html lang>` being right, which it will be.
- Thai has no spaces between words. Rely on the browser's dictionary breaking: no `word-break: break-all`, and use `text-wrap: balance` on H1.
- Re-tune `--seam-h1` (the desktop seam alignment between the H1 cap line and the ticket top) per script after the line-height changes.
- Preloads come from `fontAssetsFor(locale)`: en-like locales keep today's two preloads, ru preloads the Sofia 900 file(s), th and ar preload their script file and Big Shoulders latin 900, tr and vi add their 900 subset.
- Optional CLS polish: a `size-adjust`/`ascent-override` fallback `@font-face` for each display face over `local('Arial Narrow'), local('Arial')`.

---

## 13. Extending the SEO gates and tests

### 13.1 `tests/seo-invariants.entry.ts` (node, esbuild-bundled; can import `src/i18n/*.ts` and read JSON with `fs`)

- **Route map:**
  - Slug format, uniqueness, no reserved words, no collision with English paths or `astro.config.mjs` redirect sources.
  - `pathFor` returns no trailing slash. `routeForPath(pathFor(x, l))` round-trips.
- **Alternates:**
  - For every pageId, all members' `alternatesFor` sets are equal.
  - Each set contains its own URL, `en` and `x-default` (the English URL), and only hreflang codes from `LOCALE_META`. All URLs are absolute `https://pintdownload.app/…`.
- **Content files:**
  - Every `SLUGS` entry has `src/content/i18n/<loc>/<pageId>.json`, and every JSON has a `SLUGS` entry.
  - Each file passes `PageContent.parse`, and its `pageId`/`locale` match its path.
  - Titles and descriptions are unique within a locale.
  - Every `[[pageId|…]]` exists in that locale.
  - No `<`/`>` in any string. No `4K`/`aggregateRating`/rating claims (regex list per locale, for example `\b4K\b` outside an explicit honest-4K FAQ flag).
- **Catalogs:**
  - `ui/<loc>.ts` and `island/<loc>.ts` have exactly the key tree of `en`. `{tokens}` match per key.
  - Plural maps contain every category of `new Intl.PluralRules(htmlLang).resolvedOptions().pluralCategories`.
  - No catalog value equals the English value, except an allowlist (`MP4`, `GIF`, `ZIP`, `pin.it`, `PintDownload`, …).
- **Wrangler:** `run_worker_first` covers the deepest localized path depth. `not_found_handling === '404-page'`.
- **Redirects:** `hostRedirectUrl('https://pintdownload.app/es/')` → `/es`. Same for `/ar/x/` and `www`.

### 13.2 `scripts/verify_seo_build_artifacts.py` (post-build)

- Replace `if hl - {"en","x-default"}` with an expected set loaded from a JSON the build emits: `dist/.i18n-routes.json`, written by the same integration that renames the 404s. That keeps Python from re-implementing the map.
- Add localized money pages (home, video, pin, image, board) per locale to the existing checks: canonical, no noindex, JSON-LD, no keywords meta, no aggregateRating.
- Titles and descriptions must be unique per locale.

### 13.3 New `scripts/verify_i18n_build.py` (post-build, wired into `test:seo-build`)

For every HTML file in `dist`:

1. `<html lang>` equals `LOCALE_META[locale].htmlLang`. `dir="rtl"` if and only if the path is under `/ar`.
2. The canonical equals the page's own URL. Hreflang `<link>`s equal `.i18n-routes.json` for its pageId.
3. **Reciprocity:** every alternate target exists in `dist` as an indexable page that lists this URL back, with an identical set.
4. No hreflang target is `noindex`, a redirect or a 404.
5. `og:locale` is correct. JSON-LD `inLanguage` equals `htmlLang`. The breadcrumb root is the locale home.
6. **Internal links stay in-locale:** every `href="/…"` on a localized page is a URL of the same locale, or carries `hreflang="en"` (an allowlisted English-only page), or is an asset or `mailto:`.
7. **No English leftovers.** Take visible text nodes, excluding `code`, `[translate=no]`, `bdi`, URLs and `script`/`style`. Flag:
   - any of about 60 English function-word bigrams ("the ", " and ", " your ", "you can", "click", "download the"),
   - and any sentence identical to one on the English twin.
   The allowlist covers brand and tech words (Pinterest, PintDownload, MP4, MP3, GIF, ZIP, pin.it, iPhone, Android, Chrome, Safari, Windows, Mac). In id, "download" is native usage and is allowed.
8. `dist/<loc>/404.html` exists, is `noindex`, and is in the right language. `dist/<loc>/404/` does not exist.
9. **Sitemap:** has `xmlns:xhtml`. Every localized URL appears once. Each `<url>`'s xhtml set equals that page's HTML alternates. `lastmod` is never the build date for unchanged content.
10. **Island bundle isolation:** no unique string from any non-en catalog appears in `dist/_astro/*.js`.

### 13.4 `scripts/seo_health_check.py`

Keep the existing rules; they already apply to every HTML file, including localized ones.
Add three:

- a missing `<html lang>` is an error;
- an indexable page with no self-referencing hreflang is an error;
- a `<title>` containing a template marker (`{`, `undefined`) is an error.

Lengths are counted in code points, as today. The 40–62 and 120–158 rules apply unchanged to
th and ar. Writers check with the same counter.

### 13.5 Live checks (against `npm run preview` / `wrangler dev`, then production)

| Request | Expected |
|---|---|
| `GET /es/` | 301 → `/es` (Worker) |
| `GET /es/descargar-videos-pinterest/` | 301 to the slashless URL |
| `GET /es/does-not-exist` | **404** with the Spanish body |
| `GET /ar/x` | 404 with the Arabic body, `dir=rtl` |
| `GET /` with `Accept-Language: es-MX` and with `CF-IPCountry: MX` | Same 200 English body. No redirect, no `Vary: Accept-Language`. |
| `GET https://www.pintdownload.app/de` | 301 → apex |
| `/sitemap.xml` | Validates against the sitemap XSD, with the xhtml namespace |
| Crawl from `/` and each locale home (depth 3) | No 4xx and no redirect chains. Every localized page reachable within 2 clicks of its locale home. |

---

## 14. Build plan for the next workflow

### Phase 0: gates (orchestrator)

- `mcp-server` is merged to `main`. That branch also edits `wrangler.jsonc`, `llms.txt`, `tests/seo-invariants.entry.ts`, `src/lib/extract/*` and `/api/extract` parity. Branch `i18n` from the merged main.
- Research JSONs for `tr`, `vi`, `th` and `ar` exist in this folder in the same shape as `es.json`.
- Decisions taken on the open questions in section 16.

### Phase 1: logical-property sweep (1 agent, sequential, short)

- **Owns:** class and CSS edits across `src/**` for direction only, and `src/styles/*.css` direction properties.
- **Done when:** the build passes and before/after screenshots of 6 pages at 390 and 1440, in light and dark, show zero pixel diff.

### Phase 2: three parallel builders (exclusive file ownership)

| Builder | Owns | Delivers |
|---|---|---|
| **infra/routing** | `src/i18n/{locales,routes,schema,inline,jsonld}.ts`, `src/i18n/ui/en.ts` (+ `UiStrings` type), `src/content.config.ts`, `src/pages/[locale]/*`, `src/components/i18n/*`, `LanguageMenu.astro`, `BaseLayout.astro`, `TicketHero.astro` (props only), `components/seo/*`, `FooterKeywordMatrix.astro`, `AdSlot.astro`, `src/lib/seo.ts`, `sitemap.xml.ts`, `astro.config.mjs` (404 integration + `.i18n-routes.json`), `wrangler.jsonc` (only if depth grows), deletes `i18n.ts`/`i18n-client.ts`/`LanguageSelector.tsx`, `public/llms.txt` (adds a "Languages" section listing the 12 locale homes with endonyms), tests (13.1) and scripts (13.2–13.4) | `SLUGS` pre-filled from the research for all researched locales. A **pilot**: `es` home + video + board + one guide with real content (with the es writer). An English HTML snapshot diff showing only intended head and language-menu changes. |
| **islands/strings** | `DownloaderForm.tsx`, `results/parts.tsx`, `AudioTrimmer.tsx`, `ImageCropperModal.tsx`, `StickyPasteBar.tsx`, `TitleGenerator.tsx` (English only; just remove `i18n` imports if any), `src/lib/pinterest-route.ts`, `src/i18n/island/en.ts` + `IslandMessages` type + `fmt`/plural helpers, `/api/extract` additive `code` + parity fixture update | English behavior and HTML identical (snapshot). Island accepts `messages` and `routes`. Bundle-isolation check passes. |
| **rtl-fonts** | `src/styles/ticket.css`/`results.css` (fonts, script rules, RTL transforms), `tailwind.config.mjs` (`fontFamily.display` → `var(--font-display)`), `public/fonts/**`, `scripts/fonts/build_script_fonts.py`, `src/i18n/fonts.ts` | Fonts generated and committed. `fontAssetsFor` is implemented; infra imports it through an agreed stub signature from day 1. A test page shows Latin, tr, vi, ru, th and ar headlines. |

**Interface contracts fixed up front** (from this doc):

- `UiStrings`/`IslandMessages` key trees: infra and islands publish the `en` files first, and writers copy the shape.
- `fontAssetsFor(locale): { preload: string[] }`.
- `PageContent` schema (section 6.2).
- The `routes` prop shape: `Partial<Record<PageId,string>> & { home: string }`.

### Phase 3: content writers (12 in parallel, one per locale)

- **Each owns:** `src/content/i18n/<loc>/*.json`, `src/i18n/ui/<loc>.ts` and `src/i18n/island/<loc>.ts`.
- **Inputs:** `docs/i18n/research/<loc>.json`/`.md` (pages, titles, glossary, typography notes), the English page sources (facts only), section 6.3 rules, and the es pilot as the reference.
- **Must:**
  - Run `npm test` (schema, lengths, links, catalog parity) and `npm run build` locally before handing off.
  - Leave `routes.ts` alone. Write slug change requests to `docs/i18n/research/<loc>-slug-requests.md` for infra to apply.

### Phase 4: QA (parallel)

1. **Automated:** the full `npm test`, `npm run build` (postbuild health check), `npm run test:seo-build` and `verify_i18n_build.py`.
2. **Native review ×12**, by a different agent from the writer, working from a checklist:
   - fluency, register (tú or du, and so on) and the research's search vocabulary;
   - Pinterest UI wording against `help.pinterest.com/<lang>`;
   - honesty (no quality over-claims, public-only, credit, not affiliated);
   - no English leftovers, and no word-for-word calques of the English page.
3. **Visual QA per script group** (Latin; tr+vi; ru; th; ar RTL):
   - Playwright at **390×844 and 1440×900**, light and dark.
   - Pages: home, video, board, the longest-H1 page per locale (from research `h1Fit`/`lengthExpansion`), 404.
   - DownloaderForm states (idle, invalid, error, loading, single result, carousel result, board ZIP progress), with `/api/extract` mocked from `tests/fixtures`.
   - Assertions:
     - `document.documentElement.scrollWidth <= innerWidth`;
     - the H1 is not clipped (`scrollHeight <= clientHeight + 1` on its container), and accents and marks are inside their boxes;
     - `document.fonts.check('900 1em "PD Thai Display"')` (etc.) is true;
     - the stub label stays on one line;
     - the language menu is reachable by keyboard;
     - RTL: the stub tear goes the right way, chevrons are mirrored, the input caret is LTR on paste.
4. **SEO crawl** against `wrangler dev`: the section 13.5 table plus a full-site link crawl.
5. **Perf:** Lighthouse mobile on `/`, `/es`, `/ru`, `/th`, `/ar` and one deep page each. Font bytes match the section 12 budget, CLS = 0, and the island props size is under 8 KB raw.

### Phase 5: close-out

1. A skeptic challenges each finding.
2. One fix batch and one confirm round.
3. Deploy.
4. Submit the sitemap in Search Console, Bing Webmaster and Yandex Webmaster. Run IndexNow for the new URLs, and use URL Inspection on one page per locale.
5. Two weeks later, check the GSC performance report filtered by `/es/` and the other prefixes, plus the "Alternate page with proper canonical" and "Duplicate" buckets.

---

## 15. Risks and mitigations

| Risk | Mitigation |
|---|---|
| **Doorway or scaled-content signals**: 12 × about 16 near-identical tool pages. Google lists "automated transformations like… translating" and "substantially similar pages" as spam. | Partial page sets driven by real local demand (research `skip`). Native copy with local intents, FAQs and app wording. A native reviewer per locale. The English-leftover and identical-sentence check. No thin or dishonest pages (4K, story) without a decision. |
| English rankings regress because BaseLayout or components change | English pages are not rewritten. Defaults keep English output. An HTML snapshot diff of every English page before and after allows only head alternates, language-menu markup and removed island props. |
| hreflang clusters break (not reciprocal, pointing at 404s or redirects) | One generator, unit tests plus a post-build reciprocity check, sitemap equal to HTML, and the live crawl. |
| Merge conflicts with `mcp-server` (wrangler, llms.txt, seo-invariants, `/api/extract` parity, `pinterest-route`) | Phase 0 gate. The `/api/extract` `code` field is a separate, additive commit that updates the parity fixtures. |
| Cloudflare quirks: `drop-trailing-slash` answers 307 beyond `run_worker_first` depth; 404 page naming | The depth test. The 404 rename integration and its post-build check. Live checks. |
| Yandex ignores sitemap hreflang; Bing leans on `lang` and content | HTML `<link>` alternates on every page, and correct `<html lang>`. |
| Fonts: Cyrillic, Thai and Arabic fall back to wide system faces; FOUT and CLS; accent clipping at line-height 0.9 | Per-script faces (section 12). `:lang()` line-heights. Preloads only for that locale. Visual QA checks for clipped marks. |
| RTL regressions in the 2,400-line DownloaderForm (carousels, scrollers, arrow keys) | The logical sweep first. Explicit RTL QA states. Mirrored key handlers. |
| Island string payload or accidental bundling of all locales | Props-only delivery and the bundle-isolation check. |
| Pluralization and grammar bugs (ru, ar) | Plural-category tests. Native review of every count string. |
| Over-claims creep in during writing ("4K", "1080p", "sin marca de agua" read as removing Pinterest marks) | Schema regexes. Reviewer checklist. PRODUCT.md honesty rules quoted in the writer brief. |
| Thai/Arabic SERP truncation differs from the code-point length rules | Accept the shared rule (it is gated in CI). Spot-check with a SERP preview tool during native review. |
| Stale localized pages when English facts change (for example, a new supported link type) | `dateModified` in the JSON. A test that warns when a localized page is older than the English page's last change to its `facts` list. Optional: a `factsVersion` field per pageId. |
| Users who had `preferred_lang` in localStorage see English on English URLs | This is intended, because one language per URL is required. The language menu is one tap away. Optionally, later, a dismissible "Also available in Español" hint on English pages that never redirects and is positioned so it causes no CLS. |
| OG images are English-only | Acceptable for v1. Later, per-locale OG cards through `scripts/create_og_image.py`. |

---

## 16. Open questions for the orchestrator

1. **4K pages (fr `telecharger-pinterest-4k`, pt `baixar-video-pinterest-full-hd`):** ship them as honest "is 4K possible?" explainers, or skip them like es?
2. **id `download-story-pinterest`:** the English story page is thin (38 lines). Strengthen the English twin or skip it? (es research: Pinterest folded Idea Pins into ordinary pins in 2023.)
3. **Blog:** v1 localizes none. Should a later phase localize the top 1–2 indexable guides per locale, for example `/es/blog/<slug>`? That needs `"/*/*/*/"` in `run_worker_first` and blog-template localization.
4. **Arabic headline face:** start with Noto Sans Arabic condensed 900 (measured 30 KB), with Noto Kufi Arabic 900 (45 KB) as the stylistic alternative. The final pick happens in visual QA.
5. **Thai width:** `wdth` 62.5 or 75. Same size either way; pick in visual QA.
6. **Arabic digits:** Western digits are proposed. The ar writer and reviewer confirm.
7. **Language menu on English blog and legal pages:** link to the locale homes (proposed), or hide the menu?
