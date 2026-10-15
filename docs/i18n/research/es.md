# Spanish (es) localisation research: PintDownload

Markets: Mexico, Spain, Argentina, Colombia, US Hispanic. Collected 2026-10-14. The machine-readable version, including all raw autocomplete responses, is `es.json` in this folder.

## Decisions in one screen

- **One Spanish version, `hreflang="es"`, `<html lang="es">`.** Not `es-419` (Google: codes like es-419 "aren't supported") and not per-country pages. Across 830 autocomplete requests the five markets returned nearly the same suggestions: 384 of 464 market/seed comparisons in batch 1 matched Mexico exactly, and the rest differed by one long-tail item. Every Spanish competitor checked declares plain `es`.
- **URLs:** `/es` and `/es/<spanish-ascii-slug>`, no trailing slash. Add the routes to the sitemap with reciprocal `en` / `es` / `x-default` alternates. `BaseLayout.astro` currently hard-codes `lang="en"`, `og:locale en_US` and only the `en` alternate, so it needs a `lang` prop.
- **Language variety:** neutral Latin American Spanish with tú. Spell it "video", not "vídeo": searchers in every market, Spain included, type "video". Use "celular" and "PC/computadora" in titles; mention "móvil", "ordenador" and "portátil" once in body copy. Use "enlace" as Pinterest's UI does, and "link" once per page because people search both.
- **16 pages localised, 3 skipped** (story/Idea Pin, 4K, SEO title generator). Every title is 40–62 characters and every description 120–158 characters, checked by script.

## Pages

| English page | Spanish URL | Priority | Primary keyword | H1 | Title / desc length |
|---|---|---|---|---|---|
| `index` | `/es` | high | descargar de Pinterest | Descargador de Pinterest | 60 / 148 |
| `pinterest-pin-downloader` | `/es/descargar-pin-pinterest` | high | descargar pin de Pinterest | Descargar pin de Pinterest | 56 / 151 |
| `pinterest-video-downloader` | `/es/descargar-videos-pinterest` | high | descargar videos de Pinterest | Descargar videos de Pinterest | 55 / 151 |
| `pinterest-image-downloader` | `/es/descargar-imagenes-pinterest` | high | descargar imágenes de Pinterest | Descargar imágenes de Pinterest | 59 / 149 |
| `pinterest-gif-downloader` | `/es/descargar-gif-pinterest` | high | descargar GIF de Pinterest | Descargar GIF de Pinterest | 58 / 150 |
| `pinterest-board-downloader` | `/es/descargar-tableros-pinterest` | high | descargar tableros de Pinterest | Descargar tableros de Pinterest | 54 / 149 |
| `pinterest-profile-downloader` | `/es/descargar-perfil-pinterest` | low | descargar perfil de Pinterest | Descargar perfil de Pinterest | 55 / 149 |
| `pinterest-profile-picture-downloader` | `/es/descargar-foto-perfil-pinterest` | medium | descargar foto de perfil de Pinterest | Descargar foto de perfil de Pinterest | 55 / 147 |
| `pinterest-carousel-downloader` | `/es/descargar-carrusel-pinterest` | medium | descargar carrusel de Pinterest | Descargar carrusel de Pinterest | 56 / 148 |
| `pinterest-audio-downloader` | `/es/pinterest-a-mp3` | medium | Pinterest a MP3 | Pinterest a MP3 | 57 / 154 |
| `pinterest-to-mp4` | `/es/pinterest-a-mp4` | medium | Pinterest a MP4 | Pinterest a MP4 | 60 / 157 |
| `pinterest-video-downloader-chrome` | `/es/descargar-videos-pinterest-chrome` | low | descargar videos de Pinterest en Chrome | Descargar videos de Pinterest en Chrome | 53 / 154 |
| `how-to-download-pinterest-videos` | `/es/como-descargar-videos-pinterest` | high | cómo descargar videos de Pinterest | Cómo descargar videos de Pinterest | 61 / 151 |
| `how-to-download-pinterest-video-in-gallery` | `/es/guardar-videos-pinterest-galeria` | medium | cómo guardar videos de Pinterest en la galería | Guardar videos de Pinterest en la galería | 58 / 150 |
| `how-to-download-pinterest-video-on-laptop` | `/es/descargar-videos-pinterest-pc` | medium | cómo descargar videos de Pinterest en PC | Descargar videos de Pinterest en PC | 59 / 147 |
| `download-pinterest-videos-iphone-android` | `/es/descargar-videos-pinterest-celular` | high | cómo descargar videos de Pinterest en el celular | Descargar videos de Pinterest en el celular | 62 / 148 |

### Titles and descriptions

- **/es**: Descargador de Pinterest: videos, fotos y GIF | PintDownload. *Descarga videos de Pinterest en MP4, fotos, GIF, tableros y perfiles públicos con solo pegar el enlace. Gratis, sin registrarte y sin instalar apps.*
- **descargar-pin-pinterest**: Descargar pin de Pinterest por enlace: foto, video o GIF. *Pega el enlace de un pin público (pinterest.com/pin o pin.it) y descarga su imagen, video MP4, GIF o todas las fotos del carrusel. Gratis y sin cuenta.*
- **descargar-videos-pinterest**: Descargar videos de Pinterest en MP4, sin marca de agua. *Descarga videos de Pinterest en MP4 con el enlace del pin o de pin.it. Gratis, sin marca de agua añadida y sin instalar apps, en el celular o en la PC.*
- **descargar-imagenes-pinterest**: Descargar imágenes de Pinterest en alta calidad, sin cuenta. *Descarga fotos, fondos de pantalla e imágenes de Pinterest en la mayor resolución pública disponible. Pega el enlace del pin; sin cuenta ni registro.*
- **descargar-gif-pinterest**: Descargar GIF de Pinterest con animación, gratis y sin app. *Guarda GIF de Pinterest sin perder el movimiento: pega el enlace del pin y descarga el archivo GIF animado, no una foto fija. Gratis, en celular o PC.*
- **descargar-tableros-pinterest**: Descargar tableros de Pinterest en ZIP: fotos y videos. *Pega el enlace de un tablero público de Pinterest y descarga sus pines, fotos y videos, en un solo archivo ZIP. Sin extensiones, sin cuenta y gratis.*
- **descargar-perfil-pinterest**: Descargar perfil de Pinterest: pines públicos en un ZIP. *Descarga en un ZIP los pines públicos de un perfil de Pinterest, con fotos y videos, pegando el enlace de la cuenta. Gratis, sin registro y sin apps.*
- **descargar-foto-perfil-pinterest**: Descargar foto de perfil de Pinterest y verla en grande. *Mira en grande y descarga la foto de perfil de una cuenta pública de Pinterest: pega el enlace del perfil y guarda la imagen más grande disponible.*
- **descargar-carrusel-pinterest**: Descargar carrusel de Pinterest: todas las fotos del pin. *Descarga todas las imágenes de un carrusel de Pinterest de una vez: pega el enlace del pin y guarda cada foto por separado o todas juntas en un ZIP.*
- **pinterest-a-mp3**: Pinterest a MP3: extrae el audio de un video de Pinterest. *Convierte un video de Pinterest a MP3: pega el enlace de un pin de video público y guarda la música o la voz. Gratis; usa solo audio que puedas conservar.*
- **pinterest-a-mp4**: Pinterest a MP4: convierte videos de Pinterest online gratis. *Convierte un enlace de Pinterest a MP4: pega la URL del pin y descarga un video que se reproduce en cualquier celular o PC. Sin registro y sin marca de agua.*
- **descargar-videos-pinterest-chrome**: Descargar videos de Pinterest en Chrome sin extensión. *Descarga videos, fotos y tableros de Pinterest desde Chrome con un marcador de un clic (bookmarklet), sin instalar extensiones. Funciona en Windows y Mac.*
- **como-descargar-videos-pinterest**: Cómo descargar videos de Pinterest: guía paso a paso sin apps. *Guía para descargar videos de Pinterest: copia el enlace en la app, pégalo en PintDownload y guarda el MP4 en tu celular o PC. Sin apps y sin registro.*
- **guardar-videos-pinterest-galeria**: Cómo guardar videos de Pinterest en la galería del celular. *Guarda videos de Pinterest directo en la galería de Android o en Fotos del iPhone. Paso a paso, gratis y sin apps, y qué hacer si el video no aparece.*
- **descargar-videos-pinterest-pc**: Cómo descargar videos de Pinterest en PC, computadora o Mac. *Descarga videos de Pinterest en tu computadora con Windows, Mac o Chromebook: copia el enlace del pin, pégalo y guarda el MP4 en Descargas. Gratis.*
- **descargar-videos-pinterest-celular**: Descargar videos de Pinterest en el celular (iPhone y Android). *Descarga videos de Pinterest en tu iPhone o Android desde Safari o Chrome, sin instalar apps, y guárdalos en Fotos o en la Galería. Gratis y en MP4.*

Secondary keywords, Spanish FAQ topics and per-page autocomplete evidence are in `es.json` under `pages[]`.

### Skipped pages

- **pinterest-story-downloader:** almost no Spanish demand. "descargar historias de pinterest" returns no completions, "pinterest historias" means Instagram story-highlight ideas, and "idea pin" only completes in English. Pinterest folded Idea Pins into ordinary Pins in 2023. Add one FAQ about multi-page pins to the video and carousel pages instead.
- **pinterest-4k-downloader:** a Spanish version can't be honest. `src/lib/pin-media.ts` serves images at Pinterest's public 1200x size and video at the 720p/1080p streams Pinterest publishes, and PRODUCT.md says "no fake 4K". The Spanish 4K queries ("descargar fotos de pinterest 4k", "pinterest downloader 4k") get an honest FAQ on the image and video pages.
- **pinterest-seo-title-generator:** the tool only produces English (`/api/generate-seo` has hard-coded English templates and no language in the Gemini prompt). The Spanish demand is also a different intent: "titulos para pinterest" means notebook lettering ideas, and "seo pinterest" completes in English.

## What the evidence says

- **Head terms:** "descargar de pinterest" (gratis, imagen, gif, fotos, app, en línea), "descargar videos de pinterest" (app, sin marca de agua, sin watermark, seguro, en pc, klickpin), "descargar imagenes de pinterest" (en alta calidad, sin cuenta, por link, online, es seguro), "descargador de pinterest" (gif, **mp3**, app, imagenes).
- **The modifiers that win in Spanish:** "sin marca de agua", "sin aplicaciones" / "sin app", "en alta calidad" / "sin perder calidad", "con link" / "por enlace", "gratis", "en el celular", "en pc", "en tu galería", "para editar", "es seguro".
- **Intent traps:**
  - "descargar pinterest" without "de" means installing the app (apk, para pc).
  - "fotos de perfil de pinterest" means profile-picture ideas (aesthetic, anime).
  - "titulos para pinterest" means notebook lettering.
  - "carrusel pinterest" means Instagram carousel ideas.
  - "sonido de pinterest al guardar" is the app's sound effect.
  - "extensión de Pinterest para Chrome" means Pinterest's Save button.
- **Weak spellings and variants:** "bajar" (thin), "laptop" (thin compared with "pc"/"computadora"), and the singular "descargar tablero" (the plural "tableros" is the one with completions).
- **Competitors:** KlickPin (English slugs under `/es/`, its title is itself an autocomplete suggestion), SavePin (Spanish slugs, invented-looking reviews), PinDown (claims 2K/4K), PinterestVideo.com, Publer, AdaptlyPost and VidAU. Their Spanish is mostly machine-translated (KlickPin has headings like "Does KlickPin ¿Trabajas en el móvil?"), so native-quality Spanish with honest scope is a real differentiator. Editorial sites (Metricool, Tecnobits, internetpasoapaso) compete for the how-to queries with short Spanish slugs.

## Pinterest app wording (from help.pinterest.com/es)

- **Sharing:** **Compartir**, then **Copiar enlace**; **Enviar** sends to Pinterest contacts.
- **Ellipsis menu** ("icono de puntos suspensivos", which people call "los tres puntos"): **Descargar imagen**, **Descargar**, **Añadir al collage**, **Denunciar**.
- **Saving:** **Guardar** is the red button that saves a pin to a board. Android saves downloads to **Galería** and iPhone to **Fotos**.
- **Boards:** **tablero** / **tableros**, **tableros grupales**. The secret-board toggle reads "Convertir este tablero en secreto".
- **Profiles:** **perfil**, **foto de perfil**, **Editar perfil**.
- **Video pins:** **Pin de video**. The newsroom keeps "Idea Pins" in English.
- **Device steps must match the OS labels:** iOS **Archivos → Descargas → Compartir → Guardar video**; Android **Descargas**, **Galería**, **Google Fotos**, **Mis archivos** (Samsung); Chrome **barra de marcadores**.

## Glossary highlights (full list in `es.json` under `glossary`)

| English | Spanish | Note |
|---|---|---|
| download / save to phone | descargar / guardar | Use "guardar" only for the device, never for Pinterest's Guardar button |
| link | enlace (plus "link" once per page) | Pinterest UI says "Copiar enlace" |
| pin / pins | pin / pines | lowercase common noun in our copy |
| board | tablero | never "pasta" or "carpeta" |
| phone / computer | celular (móvil) / PC, computadora (ordenador) | |
| no watermark | sin marca de agua | honest form: no watermark is added |
| Admit one · public link | **PASE · ENLACE PÚBLICO** | 142px, narrower than the English 153px; "VALE POR UNO" is 198px |
| No. (serial) | N.º | RAE abbreviation; the glyph is in the font subset |
| Ready · Video pin | LISTO · PIN DE VIDEO | |
| Void | ANULADO | |
| receipt | comprobante | not "recibo" or "tique" |
| claim the file | canjear / recoger | "vale" (voucher) is the native ticket metaphor |
| stub labels | DESCARGAR, DESCARGAR VIDEO, VER PINES DEL TABLERO, DESCARGAR PERFIL (ZIP), VER FOTO DE PERFIL | keep each at or under about 250px |

## Formats

- **Dates:** "14 de octubre de 2026"; months and weekdays are lowercase. The short form is dd/mm/aaaa.
- **Numbers:** a single "es" page serves comma-decimal markets (ES, AR, CO) and point-decimal markets (MX, US). Format numbers at runtime with `Intl.NumberFormat` using the browser's es-* locale, and keep static copy to whole numbers (1080p, 600 × 600 px, 12 MB). Never digit-group pin IDs. Four-digit numbers take no separator.
- **Punctuation and case:** questions open with ¿ and close with ?. Headings are sentence case. Write "solo" with no accent and "p. ej." for e.g.

## Typography (Big Shoulders Display)

- **Glyph coverage is fine:** checked with fontkitten against both self-hosted woff2 files. All of á é í ó ú ü ñ, their capitals, ¿ ¡ º ª « » are present.
- **Line-height is the real problem.** Cap height is 0.80em, but accented capitals reach 0.979em. At the H1 line-height of 0.88–0.9, accents on line 2 touch line 1, and an opening ¿ hits the next line. First-line accents also stick out 0.14em above the line box, so an `overflow: hidden` wrapper would crop them. Fix with `:lang(es)` headlines at `line-height: 1` (0.98 at minimum), no overflow clipping on headline wrappers, and no ¿ at the start of display H1s. The proposed H1s are statements and avoid it.
- **Length:** Spanish H1s run between 1% shorter and 13% wider than English. At 375px every Spanish H1 fits in 3 lines or fewer, the same as English. At 320px three Spanish H1s take 4 lines, against 5 for two English guide H1s. Don't turn on hyphenation in the gothic.
- **Accents must survive uppercase:** keep them in the source text (RAE requires accents on capitals). `text-transform: uppercase` with `lang="es"` handles the rest.

## Risks to flag

1. **English pages overclaim quality.** The English 4K page ("4K ultra quality", "original uncompressed") and the image page's "original-resolution" copy contradict the 1200x image cap in the code. Don't carry those claims into Spanish. The current `i18n.ts` Spanish hero also promises "Full HD 1080p" for photos and boards, and needs fixing (see `notes.i18nTsFixes`).
2. **The video pages may compete with each other.** Six pages target video queries (tool, MP4, hub guide, celular, galería, PC). Keep their H1s and primary keywords distinct and cross-link them. If Search Console shows the galería and celular guides swapping places, merge galería into celular.
3. **The profile ZIP page is thin** and its head term is ambiguous with profile pictures. Ship it last, link to the foto de perfil page in the first screen, and watch Search Console.
4. **Autocomplete gives relative demand, not volumes.** It shows which queries exist, not how many people type them. Before deciding launch order, validate the high-priority pages with Search Console data after launch, or with a keyword tool.

## Sources

- Google Search Central, localized versions: https://developers.google.com/search/docs/specialty/international/localized-versions
- Pinterest help (es):
  - https://help.pinterest.com/es/article/download-an-image
  - https://help.pinterest.com/es/article/send-pins-boards-and-profiles
  - https://help.pinterest.com/es/article/story-pins
  - https://help.pinterest.com/es/guide/boards
  - https://help.pinterest.com/es/article/create-a-board
  - https://help.pinterest.com/es/articles/edit-your-profile
- Pinterest newsroom (es): https://newsroom.pinterest.com/es/news/idea-pin-sharing-available/
- Competitors:
  - https://klickpin.com/es/
  - https://www.savepin.app/pinterest-downloader/es/
  - https://pindown.io/es2
  - https://pinterestvideo.com/es1
  - https://publer.com/es/tools/pinterest-photo-downloader
  - https://adaptlypost.com/es/free-tools/pinterest-video-downloader
  - https://www.vidau.ai/es/pinterest-video-downloader/
- Editorial guides:
  - https://metricool.com/es/descargar-video-pinterest/
  - https://metricool.com/es/descargar-tablero-pinterest/
  - https://tecnobits.net/descargar-videos-pinterest/
  - https://internetpasoapaso.com/descargar-videos-pinterest/
