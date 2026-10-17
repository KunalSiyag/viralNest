# Writers guide (one writer per locale)

Read this, then copy the Spanish pilot. The full rules are in `i18n-plan.md` (§3 matrix for your locale, §8 Phase 3) and `architecture.md` §6.2–6.3.

## What you own

Only these files, for your locale `<loc>`:

| File | What it is | Start from |
|---|---|---|
| `src/content/i18n/<loc>/<pageId>.json` | One file per page: meta, hero, intro, sections, steps, FAQ, nav card | `src/content/i18n/es/*.json` |
| `src/i18n/ui/<loc>.ts` | Site chrome: header, footer, language menu, 404, shared section titles | `src/i18n/ui/es.ts` (shape: `ui/en.ts`) |
| `src/i18n/island/<loc>.ts` | Everything the download form, result receipts, trimmer, cropper and sticky bar print | `src/i18n/island/es.ts` (shape and translator notes: `island/types.ts`) |

Do not edit anything else (routes, templates, components, English pages, tests). If you need a change there, write it down (see "Requests" below).

## The Spanish pilot is the reference

- Pages: `home`, `pinterest-video-downloader`, `pinterest-board-downloader`, `how-to-download-pinterest-video-in-gallery` in `src/content/i18n/es/`.
- Chrome: `src/i18n/ui/es.ts`. Islands: `src/i18n/island/es.ts`.
- Rendered: `/es`, `/es/descargar-videos-pinterest`, `/es/descargar-tableros-pinterest`, `/es/guardar-videos-pinterest-galeria` (see "Preview").

Match its structure and density, not its sentences. Write natively from `docs/i18n/research/<loc>.json` and `.md` (pages, faqTopics, evidence, glossary, formats); read the English page for facts only.

## Adding a page

1. Find the page in `i18n-plan.md` §3 under your locale. The **title, description, H1 and primary keyword are fixed**; copy them exactly (the check compares them).
2. Create `src/content/i18n/<loc>/<pageId>.json`. The file name is the English `pageId` (for example `pinterest-gif-downloader.json`), never your slug. Set `"locale"` and `"pageId"` to match the path.
3. Fill every field the es file has: `meta`, `keywords`, `nav` (label, short, card title/blurb/badge), `hero` (h1, lede), `intro`, `features` (tools), `sections`, `steps`, `faq`, `related`, `schema`, `datePublished`, `dateModified` (real dates, `YYYY-MM-DD`), `review.writer` (leave `review.nativeReviewer` to the reviewer).
4. Inline markup inside strings (no raw HTML):
   - `**bold**`, `` `code` ``
   - `[[pageId|anchor text]]` internal link. It must point at a page that exists and is routed **in your locale**, or the check and the build fail. Link only to pages you have written.
   - `[[en:/blog/slug|anchor]]` for an English page (rendered with `hreflang="en"`). Write the anchor in your language; if it must stay English (a product name such as "Profile Downloader"), use `[[en!:/path|anchor]]`, which adds `lang="en"`.
   - `[text](https://help.pinterest.com/…)` external links, pinterest.com and help.pinterest.com only.
5. Write pages in priority order: P1, then P2, then P3. Gated pages (audio, 4K) are already open, so write them too.
6. Text must be NFC (the check rejects decomposed accents). Use `›`, never `→`, in anything that can print in the display font.

## Honesty (the check enforces part of this; reviewers enforce the rest)

- Public content only. No numbers about users, downloads or ratings.
- Images: "the largest size Pinterest publishes", never "original". Video: "usually 720p, 1080p when the pin has it". No 4K promise outside the honest 4K explainer page.
- MP3 is made in the visitor's browser from the video's sound.
- "No watermark" means we add none; the creator's own marks stay.
- Keep a credit-the-creator line and "independent tool, not affiliated with Pinterest, Inc.".
- At least 3 FAQ answers grounded in your research's local intent traps.

## The check (run it often; it takes under a second)

```sh
npm run i18n:check -- <loc>            # your locale only
npm run i18n:check -- <loc> --strict   # before hand-off: missing pages become errors
```

It validates the page schema and length limits (code points after NFC), the fixed title/description/H1 against the plan, inline markup and links, honesty and banned terms, duplicates within your locale, and that `ui/<loc>.ts` and `island/<loc>.ts` have exactly the English keys, the same `{tokens}` and every plural form your language needs (`new Intl.PluralRules('<loc>').resolvedOptions().pluralCategories`). Warnings about other locales are not yours.

Before hand-off also run `npm test` (the islands suite checks your island catalog). Only run `npm run build` when the orchestrator says you may; several agents share `dist/`.

## Preview

Locales are switched off until release (`live: false` in `src/i18n/locales.ts`; do not change it). To see your pages:

```sh
PD_I18N_PREVIEW=<loc> npx astro dev --port <your port> --host 127.0.0.1
# then open http://127.0.0.1:<port>/<loc> and /<loc>/<your-slug>
```

- A page appears only once its JSON exists, and **astro dev must be restarted after you add a new file** (the content index is read at startup). Edits to existing files hot-reload.
- `PD_I18N_PREVIEW=es,<loc>` or `=all` previews several locales.
- Check at 390 px and 1440 px, light and dark: no horizontal scroll, H1 not clipped, form labels fit (long labels wrap; shorten them if a button looks crowded), and paste a real public pin to read the receipt in your language.
- Your slugs are in `src/i18n/routes.ts` (`SLUGS`). th and ar keep the English slugs under their prefix.

## Requests (slugs, titles, anything outside your files)

Do not edit routes or the plan. Write the request, with the reason and the research evidence, in `docs/i18n/research/<loc>-slug-requests.md`. Infra applies it; until then keep writing to the current slug and title.

## Hand-off checklist

- [ ] Every page in your §3 matrix has a JSON file, P1 first.
- [ ] `ui/<loc>.ts` and `island/<loc>.ts` exist (no English left in them).
- [ ] `npm run i18n:check -- <loc> --strict` reports 0 errors.
- [ ] `npm test` passes.
- [ ] Previewed with `PD_I18N_PREVIEW=<loc>`; unverified Pinterest app labels flagged for the native reviewer (the reviewer signs `review.nativeReviewer`).
