# Portuguese (pt) SEO research: PintDownload

Markets: **Brazil (primary)** and Portugal (secondary). Research date: 2026-10-14. All the data behind this summary is in `pt.json`, next to this file. That includes the raw autocomplete for 276 seeds (BR round 1, BR round 2, PT), the competitor pages, and Pinterest's own pt-BR and pt-PT UI labels.

## Decisions at a glance

| | |
|---|---|
| hreflang | `pt`. There is one Portuguese set, written in Brazilian Portuguese, and it covers BR, PT, AO and MZ. All 6 tool competitors checked also use `pt`. |
| `<html lang>` / og:locale | `pt-BR` / `pt_BR` |
| URL prefix | `/pt` (no trailing slash), with Portuguese ASCII slugs |
| Pages | 17 localized, 2 skipped (story, SEO title generator) |
| SEO rules | Every title is 48–60 chars and every description 146–158. I ran synthetic pages through the repo's own `check_html_file`: 0 errors, 0 warnings. |

**Why `pt` and not `pt-BR`.** A `pt-BR`-only tag would leave Portugal on x-default, which is English. A separate pt-PT set isn't justified yet: Portuguese searches are low-volume and already mix in Brazilian *baixar* (e.g. "baixar pinterest video 4k" autocompletes with gl=pt). If a real pt-PT rewrite ever ships, retag this set `pt-BR` and point `pt` at it. BaseLayout currently hard-codes only `en` and `x-default`. It needs reciprocal alternates (en ↔ pt, with x-default → en).

## Top keywords (Google autocomplete, gl=br)

- **Main verb:** *baixar* (download). *Salvar* (save) is second; it's also Pinterest's word for saving a pin to a board, so watch the ambiguity.
- **Core phrases:** *baixar vídeo do pinterest*, *baixar imagem do pinterest*, *baixar foto do pinterest*, *baixar gif do pinterest*, *baixar do pinterest*, *baixador de vídeo pinterest*.
- **Brazilian modifiers that recur across seeds:** *pelo link / por link*, *sem marca d’água* (no watermark), *grátis*, *no celular*, *na galeria*, *no pc*, *no iphone*, *hd / full hd / 4k*, *online*, *sem login*.
- **Local intents:**
  - *para postar na shopee*: reposting for Shopee Vídeo affiliate income. Answer it with a rights-and-credit FAQ.
  - *gif do pinterest não mexe*: the GIF stops moving after download.
  - *como baixar várias imagens de uma vez do pinterest*: several images at once.
  - *para imprimir*, *em png*.
  - *baixar video pinterest privado*: private pins. The honest answer is no.
- **Avoid these head terms:** they look relevant but mean something else.
  - *foto de perfil pinterest* means finding aesthetic PFP images, not downloading an avatar.
  - *carrossel pinterest* and *pinterest story* mean Instagram templates.
  - *baixar pinterest* mixes in app-install intent (apk, lite, pc).
- **Caveat:** many exact *baixar vídeo …* seeds return `[]` even though sibling phrasings return suggestions, and a control query worked at the same time. Google appears to filter some download-video completions, so an empty result means no evidence, not no demand.

## Pages

| EN slug | pt URL | Primary keyword | Title (chars) | H1 |
|---|---|---|---|---|
| index | `/pt` | baixar do pinterest | Baixar do Pinterest: Vídeo, Foto e GIF Grátis \| PintDownload (60) | Baixar do Pinterest |
| pinterest-pin-downloader | `/pt/baixar-pin-pinterest` | baixar pin pinterest | Baixar Pin do Pinterest pelo Link: Foto, Vídeo e GIF (52) | Baixar pin do Pinterest |
| pinterest-video-downloader | `/pt/baixar-video-pinterest` | baixar vídeo do pinterest | Baixar Vídeo do Pinterest em MP4 HD, Grátis e sem Login (55) | Baixar vídeo do Pinterest |
| pinterest-image-downloader | `/pt/baixar-imagem-pinterest` | baixar imagem do pinterest | Baixar Imagem do Pinterest em Alta Resolução, Grátis (52) | Baixar imagem do Pinterest |
| pinterest-gif-downloader | `/pt/baixar-gif-pinterest` | baixar gif do pinterest | Baixar GIF do Pinterest Animado: Grátis e pelo Link (51) | Baixar GIF do Pinterest |
| pinterest-board-downloader | `/pt/baixar-pasta-pinterest` | baixar pasta do pinterest | Baixar Pasta do Pinterest Inteira em ZIP, Grátis (48) | Baixar pasta do Pinterest |
| pinterest-profile-downloader | `/pt/baixar-perfil-pinterest` | baixar perfil do pinterest | Baixar Perfil do Pinterest: Todos os Pins em ZIP, Grátis (56) | Baixar perfil do Pinterest |
| pinterest-profile-picture-downloader | `/pt/baixar-foto-de-perfil-pinterest` | baixar foto de perfil do pinterest | Baixar Foto de Perfil do Pinterest em HD, Grátis (48) | Baixar foto de perfil do Pinterest |
| pinterest-carousel-downloader | `/pt/baixar-carrossel-pinterest` | baixar carrossel do pinterest | Baixar Carrossel do Pinterest: Todas as Imagens, Grátis (55) | Baixar carrossel do Pinterest |
| pinterest-audio-downloader | `/pt/baixar-som-pinterest` | baixar som do pinterest | Baixar Som do Pinterest: Extraia o Áudio de um Vídeo (52) | Baixar som do Pinterest |
| pinterest-4k-downloader | `/pt/baixar-video-pinterest-full-hd` | baixar vídeo do pinterest em full hd | Baixar Vídeo do Pinterest em Full HD (e a Verdade do 4K) (56) | Vídeo do Pinterest em Full HD |
| pinterest-to-mp4 | `/pt/pinterest-para-mp4` | pinterest para mp4 | Pinterest para MP4: Converter Vídeo do Pinterest Grátis (55) | Pinterest para MP4 |
| pinterest-video-downloader-chrome | `/pt/baixar-video-pinterest-chrome` | extensão para baixar vídeo do pinterest | Baixar Vídeo do Pinterest no Chrome sem Extensão (48) | Baixar vídeo do Pinterest no Chrome |
| how-to-download-pinterest-videos | `/pt/como-baixar-video-do-pinterest` | como baixar vídeo do pinterest | Como Baixar Vídeo do Pinterest no Celular e no PC (2026) (56) | Como baixar vídeo do Pinterest |
| how-to-download-pinterest-video-in-gallery | `/pt/como-salvar-video-do-pinterest-na-galeria` | como salvar vídeo do pinterest na galeria | Como Salvar Vídeo do Pinterest na Galeria do Celular (52) | Salvar vídeo do Pinterest na galeria |
| how-to-download-pinterest-video-on-laptop | `/pt/como-baixar-video-do-pinterest-no-pc` | como baixar vídeo do pinterest no pc | Como Baixar Vídeo do Pinterest no PC, Notebook ou Mac (53) | Baixar vídeo do Pinterest no PC |
| download-pinterest-videos-iphone-android | `/pt/baixar-video-pinterest-iphone-android` | baixar vídeo do pinterest no iphone e android | Baixar Vídeo do Pinterest no iPhone e Android, sem App (54) | Vídeo do Pinterest no iPhone e Android |

`pt.json` has the descriptions, secondary keywords, per-page autocomplete evidence and FAQ topics. Pages that need special care:

- **4K → Full HD:** re-angled, because PRODUCT.md bans fake 4K. Competitors overclaim (SavePin "2K, 4K", Snappin "4K"). This page wins *4k* queries by answering them honestly.
- **Audio:** the title deliberately avoids "MP3"; see Risks.
- **Chrome:** the title says *sem extensão* (without an extension). That's honest, because the product is a bookmarklet, and it still matches the *extensão* queries.

### Skipped

- **pinterest-story-downloader.** Pinterest folded Idea Pins (*Pins de ideia*) into regular pins. In Brazil, *pinterest story* means Instagram-story template ideas (*aniversário amiga*, *dia dos pais*). The download long tail is tiny, and the English page is thin. It becomes one FAQ on the video page instead.
- **pinterest-seo-title-generator.** The generator only outputs English (the Gemini prompt sets no language, and the fallback templates are English). *gerador de titulo pinterest* has no suggestions, and *seo pinterest* completions are mostly Korean actors. The English page also carries an unsourced "+40%" stat.

## Pinterest app wording (copy must match the screen)

| Action | pt-BR (Brazil) | pt-PT (Portugal) |
|---|---|---|
| Share | Compartilhar | Partilhar |
| Copy link | Copiar link | Copiar ligação |
| Download image | Baixar imagem (menu ⋯ reticências) | Transferir imagem |
| Download video (when the creator allows it) | Compartilhar → Baixar | Transferir |
| Save to a board | Salvar | Guardar |
| Board | pasta (secret board: *pasta secreta*) | álbum (older UI: *painel*) |
| Profile picture | foto do perfil | — |
| Carousel / slides | Pins em carrossel / cartões | — |
| Phone gallery | Galeria (Android) / Fotos (iPhone) | Galeria / Fotografias |
| Downloads folder / Files app | Downloads / Arquivos | Transferências / Ficheiros |

Every how-to should lead with the app's own **Compartilhar → Baixar**, which exists for many videos. Then cover **Compartilhar → Copiar link → paste here** for when it's missing. That's honest, and it's what Tecnoblog, the reference guide in Brazil, describes.

## Glossary highlights

The full glossary, including every receipt and stub string, is in `pt.json`.

- **Core terms:**
  - *download* → **baixar**, never *descarregar* or *transferir* in Brazilian copy
  - *board* → **pasta**
  - *profile picture* → **foto de perfil**; drop "DP"
  - *phone* → **celular**
  - *laptop* → **PC / notebook**
  - *watermark* → **marca d’água**, claimed only as "não adicionamos marca d’água"
  - *free* → **grátis**
  - *no login* → **sem login / sem cadastro**
  - *bookmarklet* → **favorito de 1 clique (bookmarklet)**
- **Claim-ticket metaphor:**
  - *Admit one · public link* → **VALE UM · LINK PÚBLICO** ("vale 1" is how Brazilian vouchers read; "ADMITE UM" sounds machine-translated)
  - stub → **canhoto**, the real word for a tear-off ticket stub
  - No. → **Nº**
  - receipt → **comprovante**
  - counter → **balcão**
  - Void → **ANULADO**
  - Ready · Video pin → **PRONTO · PIN DE VÍDEO**
  - Download another → **Baixar outro**
  - Packing n of N → **Compactando n de N arquivos…**
- **Buttons:** CTAs always say **Baixar …**. The metaphor verb *retirar* ("pick up at the counter") isn't clear enough for a primary action.

## Formats

- **Numbers:** `1.234,5` and `12,4 MB`. Specs stay as is: `1080p`, `1200 px`.
- **Dates:** `14/10/2026`, long form `14 de outubro de 2026` (lowercase month).
- **Time:** 24h.
- **Punctuation:** curly quotes “ ” and apostrophe ’.

## Typography (Big Shoulders Display)

- **Glyph coverage:** the self-hosted woff2 files are byte-identical to the fontsource *latin* subset, so every Portuguese diacritic, plus º · ’ “ ” – — …, is present. No latin-ext file is needed.
- **Accent clearance (risk):** I measured the 900 weight. Accented capitals (Í É Ú À) reach 0.979 em and Ç descends to −0.157 em. At the display line-height of 0.88–0.90:
  - An accent on line 2 overlaps the line above by about 0.08 em, roughly 5 px at the 3.75 rem desktop H1.
  - A first-line accent sits about 0.14 em outside the line box, so any `overflow:hidden` clips it.
  - **Fix:** under `:lang(pt)`, set heading line-height to 1.0, or add `padding-top: .15em`. Check 'SALVAR VÍDEO DO PINTEREST NA GALERIA' at 360, 1024 and 1440 px.
- **Length:** H1s are about as long as English. UI strings run 15–30% longer, so receipt buttons ("Enviar para o celular", "Cortar / redimensionar") may wrap below 28 rem.

## Risks

1. **The "MP3" download is not MP3.** `DownloaderForm.tsx` (~L966, ~L2072) saves the MP4 video bytes under a `.mp3` name. The pt audio page therefore avoids promising MP3. Fix the encoder before anyone advertises it, in any language.
2. **Cannibalisation** across the video, MP4, Full HD, how-to, gallery, iPhone/Android and PC pages. Each has a separate primary keyword and angle; the map is in the `pt.json` notes. Cross-link them with exact-match pt anchors. If the iPhone/Android guide can't be made clearly device-specific, merge it into the gallery guide with a 301 redirect.
3. **Full HD page:** confirm the extractor really lists 1080p streams before printing "até 1080p". If the content can't be made substantial, 301 it to the video page rather than ship it thin.
4. **Image and avatar claims:** the largest public size is the 1200 px copy (originals return 403). Write "maior resolução disponível", never "original" or "sem compressão".
5. **"(2026)" in the how-to title** goes stale. Drive it from a build constant.
6. **Shopee and repost intent** must get rights-first answers, never framed as a growth tip.
7. **Portugal** is served by Brazilian copy. Add pt-PT labels in parentheses only where the screen differs (Partilhar, Copiar ligação, Transferir imagem, álbum, telemóvel).
