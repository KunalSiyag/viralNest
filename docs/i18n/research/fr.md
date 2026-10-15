# French (fr) localization research: PintDownload

Locale `fr` · hreflang `fr` · markets: France, Canada (Québec), Belgium, Francophone Africa (CI, SN, CM: 55 seeds each). 535 autocomplete requests in total.
Machine-readable data, including the raw autocomplete lists: `fr.json` in the same folder. Research date: 2026-10-14.

## Bottom line

- **One French version covers every market.** Google autocomplete (`hl=fr`) gives almost the same suggestions for gl=fr, ca and be (117 seeds each; Canada differed on 9 seeds and Belgium on 10, each time by one extra tail suggestion). Côte d’Ivoire, Senegal and Cameroon (55 seeds each) match too, with more app/APK and phone tails. Use `hreflang="fr"`, not fr-FR/fr-CA, and keep `x-default` on English.
- **15 pages to localize, 4 to skip** (profile ZIP, carousel, story/Idea Pin, SEO title generator). Reasons are below.
- **The French market searches with verbs.** "télécharger vidéo pinterest", "télécharger photo/image pinterest", and "enregistrer … dans sa galerie". Competitors mostly title their pages with the noun form, "Téléchargeur de vidéos Pinterest" (Klickpin, ScreenApp, Submagic), and keep English slugs under /fr/. Native, verb-first titles with French slugs are an opening.
- All 15 titles (55–62 chars) and descriptions (149–157 chars) pass the repo's `seo_health_check.py` with 0 errors and 0 warnings. I tested them on synthetic pages run through its own `check_html_file()`.

## Page decisions

URLs use `/fr` plus an ASCII slug, with no trailing slash. The French home page is `https://pintdownload.app/fr`.

| English page | French URL | Primary keyword | Title (chars) | H1 | Priority |
|---|---|---|---|---|---|
| index | /fr | téléchargeur pinterest | Téléchargeur Pinterest — vidéo, photo et GIF \| PintDownload (59) | Téléchargeur Pinterest | high |
| pinterest-video-downloader | /fr/telecharger-video-pinterest | télécharger vidéo pinterest | Télécharger une vidéo Pinterest en MP4 HD — gratuit, en ligne (61) | Télécharger une vidéo Pinterest | high |
| pinterest-image-downloader | /fr/telecharger-photo-pinterest | télécharger photo pinterest | Télécharger une photo Pinterest en HD — taille originale (56) | Télécharger une photo Pinterest | high |
| pinterest-board-downloader | /fr/telecharger-tableau-pinterest | télécharger tableau pinterest | Télécharger un tableau Pinterest entier en ZIP — gratuit (56) | Télécharger un tableau Pinterest | high |
| how-to-download-pinterest-videos | /fr/comment-telecharger-une-video-pinterest | comment télécharger une vidéo pinterest | Comment télécharger une vidéo Pinterest — 3 méthodes simples (60) | Comment télécharger une vidéo Pinterest | high |
| how-to-download-pinterest-video-in-gallery | /fr/enregistrer-video-pinterest-galerie | comment enregistrer une vidéo pinterest dans sa galerie | Enregistrer une vidéo Pinterest dans sa galerie — sans appli (60) | Enregistrer une vidéo Pinterest dans sa galerie | high |
| download-pinterest-videos-iphone-android | /fr/telecharger-video-pinterest-iphone | télécharger vidéo pinterest iphone | Télécharger une vidéo Pinterest sur iPhone (et Android) (55) | Télécharger une vidéo Pinterest sur iPhone | high |
| pinterest-pin-downloader | /fr/telecharger-epingle-pinterest | télécharger épingle pinterest | Télécharger une épingle Pinterest — image, vidéo ou GIF (55) | Télécharger une épingle Pinterest | medium |
| pinterest-gif-downloader | /fr/telecharger-gif-pinterest | télécharger gif pinterest | Télécharger un GIF Pinterest animé — gratuit, sans compte (57) | Télécharger un GIF Pinterest | medium |
| pinterest-profile-picture-downloader | /fr/telecharger-photo-de-profil-pinterest | télécharger photo de profil pinterest | Photo de profil Pinterest en HD — voir et télécharger en grand (62) | Photo de profil Pinterest en HD | medium |
| pinterest-audio-downloader | /fr/telecharger-mp3-pinterest | telecharger mp3 pinterest | Télécharger le son d’une vidéo Pinterest en MP3 — gratuit (57) | Le son d’une vidéo Pinterest en MP3 | medium |
| pinterest-4k-downloader | /fr/telecharger-pinterest-4k | télécharger vidéo pinterest 4k | Télécharger Pinterest en 4K ? La vraie qualité maximale (55) | Pinterest en 4K ? La vraie qualité max | medium |
| pinterest-to-mp4 | /fr/convertisseur-pinterest-mp4 | convertisseur pinterest mp4 | Convertisseur Pinterest MP4 — vidéo Pinterest en MP4 gratuit (60) | Convertir Pinterest en MP4 | medium |
| how-to-download-pinterest-video-on-laptop | /fr/telecharger-video-pinterest-pc | télécharger vidéo pinterest pc | Télécharger une vidéo Pinterest sur PC ou Mac — gratuit (55) | Télécharger une vidéo Pinterest sur PC | medium |
| pinterest-video-downloader-chrome | /fr/telecharger-video-pinterest-chrome | extension telecharger video pinterest | Télécharger des vidéos Pinterest dans Chrome — sans extension (61) | Vidéos Pinterest dans Chrome, sans extension | low |

`fr.json` holds the meta descriptions, the 3–6 secondary keywords per page, the FAQ topics in French and the autocomplete evidence behind each decision.

### Skipped (no thin pages)

- **pinterest-profile-downloader:** "télécharger profil pinterest" only completes to "telecharger photo profil pinterest", which means the avatar, and that intent is served by the photo-de-profil page. A French page would be thin and would cannibalize that page. Instead, the board page gets an FAQ that points to the profile tool.
- **pinterest-carousel-downloader:** "télécharger carrousel pinterest" returns nothing, and "carrousel pinterest" means creating carousels or ads. Carousels are covered on the épingle page instead.
- **pinterest-story-downloader:** "épingle idée pinterest" has no real tail, "story pinterest" means Instagram-story inspiration, and Idea Pins are a legacy format. The English page is thin as well.
- **pinterest-seo-title-generator:** the tool cannot output French. `/api/generate-seo` has no language input, its Gemini prompt is in English, and the fallback uses English templates. "générateur titre pinterest" also returns no suggestions.

## Evidence highlights (Google autocomplete, hl=fr)

- **Video, the biggest cluster:** "télécharger vidéo pinterest" completes to hd, en ligne gratuit, 4k, mp3, avec lien, iphone, apk, sans logo. The unaccented "telecharger video pinterest" adds lien, 1080p and haute qualité. The verb "enregistrer" is common: "comment enregistrer une vidéo pinterest dans sa galerie" completes to samsung, iphone and téléphone.
- **Photo and image:** both words are strong ("télécharger photo/image pinterest" + hd, gratuit, en ligne, lien, sans compte, 4k). The slug uses "photo", the description uses "image", and Pinterest's own button reads « Télécharger l’image ».
- **4K:** "4k" shows up in almost every French suggestion list, so the demand is real. The page must answer it honestly: Pinterest rarely serves 4K video.
- **MP4 and MP3:** "convertisseur pinterest" completes to mp4, mp3, gif, "mp4 gratuit" and "mp4 4k". There is also "telecharger mp3/son/audio pinterest".
- **Phones:** French phone queries are about the iPhone. The Android searches use "galerie"; "télécharger vidéo pinterest android" only returns English completions. That split gives the galerie page (Android/Samsung) and the iPhone page different intents.
- **PC:** "pc" dominates "ordinateur" and "mac". "Laptop" is never used.
- **Traps:**
  - "télécharger pinterest" (pc, mac, windows, apk, lite) is people looking for the official app.
  - "photo de profil pinterest", "pp pinterest" and "gif pinterest bonne nuit" are people looking for ideas, not downloads.
  - "sans filigrane" returns nothing. People type "sans logo" or "sans watermark".

## Pinterest app wording (French help center)

- The UI calls a pin « Épingle »; also « Épingle vidéo » and « Épingle carrousel ».
- Boards are « tableau » (« Garder ce tableau secret », « Créer un tableau »), and the avatar is « photo de profil ».
- Sharing uses the « icône de partage », then « Copier le lien » or « Envoyer ».
- The ⋯ menu offers « Télécharger l’image » for images and « Télécharger » on mobile. Files land in « Galerie » on Android and « Photos » on iPhone.
- **Watch out:** in Pinterest, « Enregistrer » means saving a pin to a board, so never use a bare « Enregistrer » button.
- Video download only exists when the creator allows it. The how-to guide should say so first.

## Glossary essentials

- **Terms:** board = tableau; pin = épingle; carousel = carrousel; PFP = photo de profil / « pp » ("DP" is unknown in French); bookmarklet = favori (marque-page in Firefox, signet in Safari and Québec); watermark = "sans logo ajouté".
- **Register:** use « vous » throughout.
- **Claim-ticket voice:** French has a ready-made frame in the coat-check ticket and counter pick-up (« à retirer »).
  - « Admit one · public link » becomes « Entrée · lien public ».
  - Serial « N° … »; stub = talon; perforation = pointillés.
  - Receipt band « À retirer · Épingle vidéo », which also avoids the gender agreement of Prêt/Prête.
  - Void stamp « Annulé »; Saves as « Enregistré sous ».
- **Pitfalls:**
  - "Trim sound" must be « Découper l’audio », not « Couper le son » (which means mute).
  - Don't use « Retirer » on a button (it also means remove).
  - Keep the PFP stub short: « Photo de profil HD ». The literal « Obtenir la photo de profil (HD) » measures 353px and will not fit a phone ticket.

## Formats and typography

- **Numbers:** 1,5 Mo (Ko/Mo/Go, never MB); non-breaking space before % and as the thousands separator; 720p / 1080p / 4K stay as they are.
- **Dates:** « 14 octobre 2026 ». Avoid numeric dates: France and Belgium write 14/10, Québec prefers ISO.
- **Punctuation:** non-breaking space before : ; ? ! and inside « » (the France norm). Big Shoulders lacks U+202F, so use U+00A0 in headings, labels, `<title>` and meta.
- **Font coverage:** the shipped Big Shoulders woff2 has every French glyph except Ÿ, which is rare.
- **Main risk is line height on accented capitals.** É/À/Ê reach 0.98 em in the 900 weight, against a display line-height of 0.88–0.90. Accents on line 2 collide with line 1, and line-1 accents poke above the line box. Recommendation: `:lang(fr)` headline line-height 1.0 (at least 0.98) plus 0.1em top padding, then re-check the desktop seam alignment. `text-transform: uppercase` keeps the accents only with `lang="fr"`.
- **Length:** French H1s run 18% shorter to 30% longer than English, measured in the actual font. The final H1s never need more lines than English on a 343px phone or the desktop column, and the longest word, TÉLÉCHARGEUR, is 244px at 46px.

## Risks

1. **Honesty carry-over:** the English sources claim "4K ultra quality", "original uncompressed" and "full-resolution uncropped" avatars. The SEO generator page claims an unsourced "up to 40%". Do not translate any of these. The French 4K and quality lines say « souvent 720p ou 1080p », which mirrors the English FAQ; check it against real `/api/extract` output before launch.
2. **Cannibalization** among the video tool, MP4 converter, how-to hub, galerie, iPhone and PC pages. Each targets a distinct French intent, as mapped above; interlink them, and don't copy the English "…to Gallery" title onto the how-to hub.
3. **"télécharger pinterest" is mixed intent** (many people want the app). Add one honest FAQ that links the official stores, and never offer an APK.
4. **Implementation needs:**
   - `html lang="fr"`, server-rendered French and French JSON-LD (FAQPage and HowTo, no ratings).
   - A breadcrumb « Accueil » → /fr. BaseLayout currently hardcodes "Home" and splits titles on "—", which is why the French titles put the page name before " — ".
   - Reciprocal hreflang, sitemap alternates and French alt text.
   - The existing `i18n.ts` French strings need rewriting: they promise "Full HD 1080p" for everything.
5. **Legal tone:** droit d’auteur plus droit à l’image (France: art. 9 du Code civil) matter most on the photo-de-profil page. Keep it to plain guidance, not legal advice, and say « non affilié à Pinterest Inc. ».
6. **Proofreading:** have a native French speaker review the copy before launch, ideally one who knows Québec usage.
