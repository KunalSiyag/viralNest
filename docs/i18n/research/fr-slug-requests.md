# fr: requests for infra (slugs, titles, templates)

Writer: writer-fr (agent), 2026-10-16. **No slug changes requested.** All 15 French pages are written to the current slugs, titles, descriptions and H1s of plan §3. The requests below are small and none blocks the release.

## 1. Image page description: one plain space before « : » (typography, optional)

**Page:** `pinterest-image-downloader`, `/fr/telecharger-photo-pinterest`.

The fixed description in `docs/i18n/i18n-plan.json` has a normal space before the colon, while every other French title and description uses U+00A0 there (French norm, research `formats.punctuation`):

- now: `… Collez le lien de l’épingle : gratuit et sans compte Pinterest.` (U+0020 before `:`)
- want: the same text with U+00A0 before `:`

Same length (143 code points), so no SEO check changes. Until the plan is updated, the content file keeps the plan's string exactly (the check compares them).

## 2. `HowToSteps`: the colon after the example label (typography, optional)

`src/components/seo/HowToSteps.astro` line 46 prints `{exampleLabel}:` with no space, so French pages show `Exemple de lien: https://…`. French wants U+00A0 before the colon. Suggestion: add a `ui.howTo.labelColon` string (`':'` in English, `' :'` in fr) or let the template insert U+00A0 when `locale === 'fr'`. Writers cannot fix this from content.

## 3. Board example link returns nothing (all locales)

`exampleUrlFor('board')` in `src/components/i18n/page-data.ts` gives `https://www.pinterest.com/pinterest/spice-up-your-dinner-plans/`. On 2026-10-16, `/api/extract` answered `collection_empty` for it, and also for `pinterest/official-news` and four public boards of `pinterestfr` (for example `/pinterestfr/ongles-dhalloween/`, listed with 79 pins on the profile). So board extraction may be failing in general, not only for the example. I did not set `steps.exampleUrl` on the French board page because I could not find a board that works.

## 4. Profile picture: the avatar URL gives a 403 (all locales)

On `/fr/telecharger-photo-de-profil-pinterest`, `https://www.pinterest.com/pinterestfr/` extracts, but the avatar is `https://i.pinimg.com/1200x/7f/4c/6f/7f4c6f29d7275b4b2154b6221aa9c876.jpg`, which returns **403**. The receipt shows a broken image. The `280x280_RS` URL of the same file returns 200 and the `600x600_RS` one returns 403. The cause is `upgradeAvatarUrl()` in `src/lib/extract/media.ts`, which rewrites avatars to `/1200x/`. Suggestion: try the sizes from largest to smallest and keep the first that returns 200.

## Release decisions (release-integrator, 2026-10-16)

1. **Image description U+00A0 before « : »: applied** to the plan matrix (`i18n-plan.json` + `.md` §3 and §4) and to `src/content/i18n/fr/pinterest-image-downloader.json`. The check also folds U+00A0 to a space when it compares fixed fields.
2. **`HowToSteps` colon: applied.** `src/components/seo/HowToSteps.astro` prints U+00A0 before the colon when the page path is French (`Exemple de lien de tableau :`). Other locales and English are unchanged.
3. **Board example: applied** (`pinterest/pinterest-presents`, 37 pins, for every locale and English). Board extraction for other boards still fails on production; the shared extractor (`src/lib/extract/`) is outside the i18n release and its parity suite replays recorded upstream responses, so the fix belongs to the extractor owner.
4. **Avatar 403: not fixed here, confirmed.** The `1200x` rewrite in `upgradeAvatarUrl()` returns 403 for 3 of 4 avatars probed (pinterestfr, nasa, natgeo, bonappetitmag); the only size that answered 200 for all four is the `280x280_RS` URL Pinterest itself returns, while `originals` and `736x` each work for some. A correct fix needs to probe sizes (or keep the returned URL); the shared extractor (`src/lib/extract/`) is outside the i18n release and its parity suite replays recorded upstream responses, so the fix belongs to the extractor owner. It affects the English page too.
