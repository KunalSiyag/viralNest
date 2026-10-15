# Dutch (nl) SEO research: PintDownload

Markets: Netherlands and Flanders (Belgium). Researched 2026-10-14. Full data, including raw autocomplete for 210 seeds in NL and BE, is in `nl.json`.

## Decision in one paragraph

Build **8 Dutch pages** under `/nl/` with Dutch slugs. Use **hreflang `nl`**, not `nl-NL`, so one version serves both NL and BE. **Skip 11 pages**: their intents return no Dutch autocomplete, are already served by the English pages (Dutch speakers type English queries like "pinterest video downloader"), or would be thin near-duplicates. Competitor Dutch pages are machine-translated: they keep English slugs, mix "u" and "je", and one still has Italian headings. Native Dutch copy built on Pinterest's own Dutch UI labels is the edge.

## Pages to build

| EN page | nl path | Primary keyword | Title (chars) | H1 |
|---|---|---|---|---|
| index | `/nl` | pinterest downloader | Pinterest downloader — video, foto & GIF gratis \| PintDownload (62) | Pinterest downloader |
| pinterest-pin-downloader | `/nl/pinterest-pin-downloaden` | pinterest pin downloaden | Pinterest pin downloaden — foto, video of GIF gratis (52) | Pinterest pin downloaden |
| pinterest-video-downloader | `/nl/pinterest-video-downloaden` | pinterest video downloaden | Pinterest video downloaden — gratis als HD MP4, zonder app (58) | Pinterest video downloaden |
| pinterest-image-downloader | `/nl/pinterest-foto-downloaden` | pinterest foto downloaden | Pinterest foto downloaden — afbeeldingen in HD, gratis (54) | Pinterest foto downloaden |
| pinterest-gif-downloader | `/nl/pinterest-gif-downloaden` | pinterest gif downloaden | Pinterest GIF downloaden — bewegende GIF's gratis opslaan (57) | Pinterest GIF downloaden |
| pinterest-board-downloader | `/nl/pinterest-bord-downloaden` | pinterest bord downloaden | Pinterest bord downloaden — alle pins als ZIP, gratis (53) | Pinterest bord downloaden |
| how-to-download-pinterest-videos | `/nl/hoe-pinterest-video-downloaden` | hoe pinterest video downloaden | Hoe download je een Pinterest-video? Uitleg voor elk toestel (60) | Hoe download je een Pinterest-video? |
| how-to-download-pinterest-video-in-gallery | `/nl/pinterest-video-opslaan` | pinterest video opslaan | Pinterest video opslaan in galerij of filmrol — zonder app (58) | Pinterest video opslaan in je galerij |

All titles are 52–62 characters and all descriptions 146–156. A script checked both ranges, the slug format, unique paths, and that each H1's longest word fits a 360px phone in Big Shoulders 900 at 46px. Descriptions, secondary keywords, FAQ topics and the evidence behind each keyword choice are per page in `nl.json`.

### Strongest Dutch queries found (autocomplete, hl=nl)
- **pinterest video downloaden** (+ online, hoe…), **pinterest video's downloaden**, **pinterest video downloader gratis**
- **hoe pinterest video downloaden** (the completion for four different question seeds), **hoe download je een video van pinterest**, **hoe kan ik filmpjes van pinterest downloaden**
- **pinterest foto downloaden**, **pinterest afbeelding(en) downloaden**, **pinterest foto opslaan in filmrol**, **pinterest afbeelding opslaan op telefoon**, **pinterest plaatjes downloaden**
- **pinterest bord downloaden**, **pinterest board downloaden**, **pinterest bord exporteren**
- **pinterest gif downloaden**, **gif van pinterest downloaden**
- **pinterest pin downloaden**, **pinterest pins downloaden**, **van pinterest naar mp4**
- Trap: **pinterest downloaden** completes with macbook / windows / laptop / app / pc, so it means *installing the Pinterest app*. Don't use it as a primary keyword.

## Skipped (no thin pages)

| EN page | Why |
|---|---|
| profile-downloader | "pinterest profiel downloaden/opslaan" and "alle pins van profiel" return nothing. Covered as a secondary keyword and FAQ on the board page. |
| profile-picture-downloader | "pinterest profielfoto downloaden/bekijken/groot" return nothing. "leuke profielfoto pinterest" is a different intent (people looking for profile-picture ideas). |
| carousel-downloader | No Dutch completions. Folded into the pin page (Pinterest calls slides "kaarten"). |
| story-downloader | No demand, and Pinterest retired Idea Pins (no Dutch help page remains). |
| audio-downloader | Only English "pinterest mp3…" completions. Mentioned in the video FAQ. |
| 4k-downloader | Only English and wallpaper intent, plus an honesty risk (no fake 4K). Answered in the video FAQ. |
| to-mp4 | Only one Dutch completion ("van pinterest naar mp4"), so it became an H2 and secondary keyword on the video page. Revisit if Search Console shows demand. |
| video-downloader-chrome | "pinterest extensie chrome" most likely means Pinterest's own extension, and our tool is a bookmarklet. Not a fit. |
| seo-title-generator | No Dutch demand, the generator prompt is English-only, and the English page has an unsupported "+40%" claim. |
| video-on-laptop | No Dutch completions; "pinterest downloaden laptop" means installing the app. Became a section of the how-to guide. |
| iphone-android | Dutch queries don't split by OS. Merged into `/nl/pinterest-video-opslaan`. Don't emit an nl alternate on the English page. |

## Pinterest's own Dutch labels (help.pinterest.com/nl)

The how-to copy must use these exact labels.
- Share: **Delen** (the share icon, "deelpictogram") → **Link kopiëren**
- Download in the menu: desktop **Afbeelding downloaden**, app **Download afbeelding**; the app's "…" menu: **Downloaden**
- Save to board: **Bewaren**. Use "downloaden" or "opslaan" for files, never "bewaren".
- **bord / borden**, **privébord** / **verborgen bord**, **profiel**, **profielfoto**, **startpagina**, **videopin**
- Carousel: **carrousel**, with slides called **kaarten**
- Where files land: Android **galerij**, iOS **Foto's**; the app itself says "Kies uit **filmrol**"

## Glossary highlights

- Voice: informal **je**, sentence case in titles. Write *Pinterest-link, Pinterest-video's, GIF-pin, pin.it-link*. Plurals take an apostrophe: video's, foto's, GIF's.
- **pins**, never "pinnen" (in Dutch that also means paying by debit card).
- Claim-ticket metaphor: ticket → **afhaalbon / bon**; "Admit one · public link" → **Afhaalbon · openbare link**; "No." → **Nr.**; collect → **ophalen**; stamps: Done **Klaar**, Void **Ongeldig**, Partial **Deels**, Not Pinterest **Geen Pinterest**; counter → **balie**.
- Button fixes: per-variant **Download MP4 / Download foto / Download ZIP**. Today the board page would show "Download MP4". The processing text "HD-media uitpakken…" becomes **Bestand ophalen…**.

## Formats

Decimal comma and thousands dot (2,4 MB; 12.500), no separators in 1080p or 1200 px. Dates: "14 oktober 2026" (NL numeric 14-10-2026, BE 14/10/2026). 24-hour time. Quotes: ‘ ’ or “ ”. og:locale `nl_NL`.

## Typography

- Big Shoulders latin subset has every Dutch diacritic (ë ï é ó ö ü …), checked with fontTools. The Ĳ ligature glyph is missing, which is fine: always type IJ as two letters, and never use `text-transform: capitalize`.
- H1 length matches English (−4% to +1%) because "downloaden" replaces "Downloader". The guide H1s are 17–25% shorter.
- Long Dutch compounds overflow at the phone H1 size: "PROFIELFOTODOWNLOADER" measures 451px against a 328px line. Keep display words short, and add `hyphens: auto` (needs `lang="nl"`) plus `overflow-wrap: anywhere` on headings.

## Risks and gotchas

1. BaseLayout hard-codes `<html lang="en">` and only en/x-default alternates. Localized pages need a lang prop and reciprocal en↔nl alternates.
2. Breadcrumb name comes from `title.split('—')[0]`, so keep the em dash in titles.
3. Honesty: say "grootste openbare versie", not "originele resolutie" (originals get rewritten to 1200x). Don't port the English 4K, "uncompressed" or "+40%" claims. Soften the nl hero subtitle's "1080p HD" promise.
4. The iOS Dutch share-sheet labels ("Bewaar video", "Bewaar in Bestanden") and the "Geanimeerd" album name come from memory, not a fetched source. Verify them on a device.
5. The market is small and bilingual, so expect modest volume per page. The English pages will keep catching English-language queries from NL and BE.
