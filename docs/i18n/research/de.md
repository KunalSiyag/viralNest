# German (de) SEO research: PintDownload

Markets: Germany, Austria, Switzerland. Researched 2026-10-14. The machine-readable plan with all raw evidence is in `de.json`.

## Decisions at a glance

- **hreflang:** `de`, one German set for DE, AT and CH. For the 24 core seeds, AT and CH autocomplete matched DE. The few apparent extras (`gratis`, `pinterest videos downloaden`) also exist in DE when queried directly, so region pages would be near-duplicates. Every de page carries `de` + `en` + `x-default` (en).
- **URLs:** `/de` and `/de/<german-slug>`, lowercase ASCII, no trailing slash.
- **Voice:** *du* (lowercase), like Pinterest's own German help center. Every tool competitor's German page is a machine translation in formal *Sie*, with English slugs and Title-Cased German. That is the gap to fill.
- **Pages:** 16 to publish, 2 skipped (story, 4K), 1 deferred (SEO title generator).

## Page plan

| EN page | DE path | Primary keyword | Title (chars) |
|---|---|---|---|
| index | `/de` | pinterest downloader | Pinterest-Downloader – Videos, Bilder & GIFs kostenlos (54) |
| pin | `/de/pinterest-pin-herunterladen` | pinterest pin herunterladen | Pinterest-Pin herunterladen – Bild, Video & GIF kostenlos (57) |
| video | `/de/pinterest-video-herunterladen` | pinterest video herunterladen | Pinterest-Video herunterladen – kostenlos als MP4 in HD (55) |
| image | `/de/pinterest-bilder-herunterladen` | pinterest bilder herunterladen | Pinterest-Bilder herunterladen – in HD, ohne Anmeldung (54) |
| gif | `/de/pinterest-gif-herunterladen` | pinterest gif herunterladen | Pinterest-GIF herunterladen – animiert speichern, kostenlos (59) |
| board | `/de/pinterest-pinnwand-herunterladen` | pinterest pinnwand herunterladen | Pinterest-Pinnwand herunterladen – alle Pins als ZIP (52) |
| profile | `/de/pinterest-profil-herunterladen` | pinterest profil herunterladen | Pinterest-Profil herunterladen – alle Pins als ZIP sichern (58) |
| profile picture | `/de/pinterest-profilbild-herunterladen` | pinterest profilbild herunterladen | Pinterest-Profilbild herunterladen – groß ansehen & speichern (61) |
| carousel | `/de/pinterest-karussell-herunterladen` | pinterest karussell herunterladen | Pinterest-Karussell herunterladen – alle Bilder auf einmal (58) |
| audio | `/de/pinterest-audio-herunterladen` | pinterest audio herunterladen | Pinterest-Audio herunterladen – Musik & Ton als MP3 (51) |
| to-mp4 | `/de/pinterest-in-mp4-umwandeln` | pinterest video umwandeln | Pinterest in MP4 umwandeln – Video-Konverter online & gratis (60) |
| chrome | `/de/pinterest-video-downloader-chrome` | pinterest video downloader chrome | Pinterest-Video-Downloader für Chrome – ohne Erweiterung (56) |
| guide: videos | `/de/pinterest-videos-speichern` | pinterest videos speichern | Pinterest-Videos speichern: So geht’s auf Handy und PC (54) |
| guide: gallery | `/de/pinterest-video-in-galerie-speichern` | pinterest video in galerie speichern | Pinterest-Video in der Galerie speichern – ohne App (51) |
| guide: laptop | `/de/pinterest-video-herunterladen-pc` | pinterest video herunterladen pc | Pinterest-Video am PC herunterladen – Laptop, Mac & Windows (59) |
| guide: iPhone/Android | `/de/pinterest-video-herunterladen-iphone-android` | pinterest video herunterladen iphone | Pinterest-Video aufs iPhone & Android-Handy herunterladen (57) |
| story | skipped | — | — |
| 4k | skipped | — | — |
| seo-title-generator | deferred: `/de/pinterest-titel-generator` | pinterest titel generator | pre-validated, publish later |

All titles are 51–61 characters and all descriptions 149–158 (repo rules: 40–62 and 120–158). A script checked them, and also checked that every slug is unique ASCII and that no H1 word overflows a 375px phone in Big Shoulders Display 900. Descriptions, H1s, 3–6 secondary keywords, the autocomplete evidence and FAQ topics for each page are in `de.json`.

**Keeping the guides apart from the tools:** the tool page owns *herunterladen*. The general guide owns *speichern* and the question forms ("wie kann man …", "kann man …"). The other three guides each own a destination or device: Galerie, PC, iPhone/Android. The MP4 page owns *umwandeln* and *Konverter*.

## Skipped pages

- **Story / Idea Pin.** German completions are only long tails (`… herunterladen kostenlos/pc`), and "Ideen-Pin" finds nothing. Pinterest retired the format (autocomplete suggests "pinterest idea pins gone"), and the English page has no FAQ. An FAQ on the video and Karussell pages covers it instead.
- **4K.** Every 4K query is an English string that the English page already targets. Promising 4K would also break the "no fake 4K" rule, since the extractor serves about 720p video and 1200px images. The video page's quality FAQ covers it honestly.
- **SEO title generator (deferred).** People do search for it (`pinterest titel generator kostenlos ohne anmeldung`, `pin beschreibung generator deutsch`), but `/api/generate-seo` only writes English. Publish once it accepts a language parameter.

## What the evidence says

- **"Pinterest Video Downloader" is a real German query.** It is the #1 completion for "pinterest video" and comes with a German modifier ("… deutsch"). But almost every long tail uses *herunterladen*, so the H1s use the verb ("Pinterest-Videos herunterladen") and keep "Downloader" as a secondary keyword.
- **"Bild herunterladen" broke for many users.** "pinterest bilder herunterladen geht nicht mehr" is the #1 completion in AT and appears in DE and CH, also with iPad and PC. Lead the image page with it.
- **People ask about legality.** Modifiers include `legal`, `erlaubt`, `legal oder illegal` and `datenschutz`. Every core page needs a plain-language FAQ: private use vs. republishing, credit the creator, no legal advice.
- **Gallery is the save target.** "in galerie speichern" is the #2 completion for "pinterest video speichern" in all three markets.
- **Avoid these queries:**
  - bare "pinterest herunterladen/downloaden" + pc/iphone means installing the Pinterest app
  - "pinterest profilbilder" means profile-picture inspiration, not downloading
  - "pinterest chrome" means chrome nail designs

## Pinterest's German UI wording

Copy has to match these labels exactly (source: help.pinterest.com/de):

- **Teilen** (share icon) → **Link kopieren**
- **Drei-Punkte-Symbol** → **Bild herunterladen** / **Herunterladen**
- **Merken** is Pinterest's save-to-board. Never call it "speichern".
- Nouns: **Pinnwand** (pl. Pinnwände), **geheime Pinnwand**, **Profil**, **Profilbild**/**Profilfoto**, **Video-Pin**, **Bild-Pin**, **Karussell-Pin**
- **Idea Pin** stays in English.

## Glossary highlights

- The cloakroom ticket (*Garderobenmarke*) maps naturally onto the claim-ticket design. Tagline: **"Link abgeben, Datei abholen."**
- Ticket strings:
  - header: **EINLASS · ÖFFENTLICHER LINK**
  - serial: **Nr. ———**
  - ready band: **ABHOLBEREIT · VIDEO-PIN**
  - error stamp: **UNGÜLTIG** (not *entwertet*, which in DACH means a validated ticket)
  - receipt button: **Abholen**
  - stub button: stays an action, **HERUNTERLADEN**
- Say **kostenlos** (main) or **gratis** (sometimes), **ohne Anmeldung**, **ohne Wasserzeichen**.
- Say **größte verfügbare Auflösung**, never *Originalgröße*: the code serves 1200x images.
- Hyphenate brand compounds: Pinterest-Video, Pin-Link, ZIP-Datei.

The full UI string table is in `de.json` under `glossary.uiStrings`.

## Formats and typography

- **Numbers:** `4,2 MB`, `1200 px` (no separator in 4-digit technical values), `1200 × 1800 px`.
- **Dates and time:** `14. Oktober 2026`, `14.10.2026`, `14:30 Uhr`. Use the `de-DE` Intl locale.
- **Punctuation:** quotes „…“; spaced en dash ` – ` (never the em dash); apostrophe ’.
- **Keys:** Strg/Umschalt.
- **Capitalisation:** German sentence case. No English Title Case.
- **Big Shoulders Display:** has the umlauts, ß, „“ and ’, but not the capital ẞ. Let `text-transform: uppercase` with `lang="de"` print SS (GRÖSSE).
  - The longest word, HERUNTERLADEN, measures 277px at 46px (the phone column is 343px). Most H1s wrap to 2 lines, the guides to 3, and the iPhone/Android guide to 4.
  - Check the umlaut dots at line-height 0.88–0.9 for clipping.
  - The label and stub strings above all fit the phone ticket.
- **Fix the current `i18n.ts` German strings:**
  - typo "Pinwände"
  - verbs wrongly capitalised ("MP4 Herunterladen")
  - formal *Sie* instead of *du*
  - the "1080p" over-claim

## Risks

1. **Product bug: AT/CH links rejected.** `www.pinterest.at` and `www.pinterest.ch` redirect to `at.pinterest.com` and `ch.pinterest.com`. The `isPinterestUrl` regex in `src/pages/api/extract.ts` (about line 1104) rejects both; I tested this in node. Austrian and Swiss desktop users who copy the address bar will get "Invalid link". The same applies to nl., pl., se. and others. Fix: allow `([a-z]{2}\.|www\.)?`, coordinated with the `mcp-server` branch, which is moving this code.
2. **Honesty in the English copy.** The English image page and the form hint promise "original resolution", but the code serves 1200x. The German pages avoid this claim. The English copy should be fixed too.
3. **German legal requirements (not legal advice).** German-language pages aimed at DACH, once monetised, bring Impressum obligations (DDG §5 / AT ECG), a German privacy policy and ad-consent (TDDDG) expectations. Missing ones are a common target for paid warning letters (Abmahnungen) in Germany. Review before launch.
4. **Thin demand on some pages.** Profil, Karussell, Audio and Chrome rest on long-tail autocomplete only. Publish them last and make each one substantial.
5. **Autocomplete limits.** It shows which queries exist, not search volume. Check Search Console after launch.
