# PintDownload i18n plan (build-ready)

Merged from `architecture.md` and the 12 locale research files in this folder. The machine-readable twin is `i18n-plan.json` (same decisions; the matrix there also carries secondary keywords, ledes, lengths and every change made to the research). Validated by script: 0 errors across all 166 page×locale rows.

**Scope:** 166 localized pages across 12 locales: 151 to ship, 9 audio pages gated on Q1, 6 4K explainers gated on Q2. 62 page×locale pairs skipped for lack of local demand or honesty. English stays at the root and is not rewritten.

## 1. Locales

x-default is always the English URL of the same page. English keeps `hreflang="en"`, `og:locale en_US`.

| Locale | hreflang | `<html lang>` | og:locale | dir | Home | Menu label | Register | Headline font | Release | Pages (ship / gated) |
|---|---|---|---|---|---|---|---|---|---|---|
| es | `es` | `es` | `es_LA` | ltr | `/es` | Español | tú; neutral Latin American; "video" not "vídeo" | Big Shoulders Display latin (current) | A | 15 / 1 |
| pt | `pt` | `pt-BR` | `pt_BR` | ltr | `/pt` | Português | você; Brazilian; pt-PT UI labels in parentheses only where the screen differs | Big Shoulders Display latin (current) | A | 15 / 2 |
| fr | `fr` | `fr` | `fr_FR` | ltr | `/fr` | Français | vous; U+00A0 before : ; ? ! | Big Shoulders Display latin (current) | A | 13 / 2 |
| de | `de` | `de` | `de_DE` | ltr | `/de` | Deutsch | du; sentence case; hyphenated brand compounds; never ẞ | Big Shoulders Display latin (current) | A | 15 / 1 |
| it | `it` | `it` | `it_IT` | ltr | `/it` | Italiano | tu; imperative "Scarica" in H1/buttons, infinitive "Scaricare" at title start | Big Shoulders Display latin (current) | A | 11 / 1 |
| nl | `nl` | `nl` | `nl_NL` | ltr | `/nl` | Nederlands | je/jij; sentence case; hyphenate long compounds | Big Shoulders Display latin (current) | A | 8 / 0 |
| id | `id` | `id` | `id_ID` | ltr | `/id` | Bahasa Indonesia | kamu (never mixed with Anda); "download" as the search verb, "unduh" in body/buttons | Big Shoulders Display latin (current) | A | 13 / 1 |
| tr | `tr` | `tr` | `tr_TR` | ltr | `/tr` | Türkçe | polite plural imperatives in body ("indirin"), bare imperatives in titles/buttons | Big Shoulders Display latin + latin-ext via unicode-range (Ğ ğ İ Ş ş) | A | 13 / 2 |
| vi | `vi` | `vi` | `vi_VN` | ltr | `/vi` | Tiếng Việt | bạn; sentence case; store text NFC | Big Shoulders Display latin + vietnamese via unicode-range | A | 14 / 2 |
| ru | `ru` | `ru` | `ru_RU` | ltr | `/ru` | Русский | вы; titles use declined "Пинтереста", H1/body use Latin "Pinterest"; never mention VPNs | Sofia Sans Extra Condensed 800/900 for the whole headline (latin + cyrillic + №) | B | 11 / 0 |
| th | `th` | `th` | `th_TH` | ltr | `/th` | ไทย | friendly-neutral, no ครับ/ค่ะ, pronoun usually dropped; show "pintdownload.app" near the brand | Noto Sans Thai instanced to condensed wdth, wght 900; Latin words stay Big Shoulders | B | 11 / 2 |
| ar | `ar` | `ar` | `ar_AR` | rtl | `/ar` | العربية | MSA; spell the brand "بنترست"; "تحميل" for the search verb, "تنزيل" only when quoting app buttons; Western digits | Noto Sans Arabic instanced to wdth 75, wght 900 (Noto Kufi Arabic is the visual-QA alternative); Latin words stay Big Shoulders | C | 12 / 1 |

Display line-height (today 0.88–0.9, which clips accents and marks): Latin locales: 1.0 + padding-top .08em (accented capitals reach 0.98em); tr: 1.0 + padding-top .08em (İ dot); vi: 1.12 + padding-top .12em (stacked marks Ấ Ầ Ẩ); ru: 1.0; th: 1.3; letter-spacing 0; never word-break: keep-all; ar: 1.3; letter-spacing 0.

## 2. Coverage grid

Slug under `/<locale>/`. `—` = skipped. `(Q1)`/`(Q2)` = built but gated.

| page | es | pt | fr | de | it | nl | id | tr | vi | ru | th | ar |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| home | (home) | (home) | (home) | (home) | (home) | (home) | (home) | (home) | (home) | (home) | (home) | (home) |
| pin | descargar-pin-pinterest | baixar-pin-pinterest | telecharger-epingle-pinterest | pinterest-pin-herunterladen | scaricare-pin-da-pinterest | pinterest-pin-downloaden | download-pin-pinterest | pinterest-pin-indir | tai-ghim-pinterest | skachat-pin-s-pinterest | pinterest-pin-downloader | pinterest-pin-downloader |
| video | descargar-videos-pinterest | baixar-video-pinterest | telecharger-video-pinterest | pinterest-video-herunterladen | scaricare-video-da-pinterest | pinterest-video-downloaden | download-video-pinterest | pinterest-video-indir | tai-video-pinterest | skachat-video-s-pinterest | pinterest-video-downloader | pinterest-video-downloader |
| image | descargar-imagenes-pinterest | baixar-imagem-pinterest | telecharger-photo-pinterest | pinterest-bilder-herunterladen | scaricare-immagini-da-pinterest | pinterest-foto-downloaden | download-foto-pinterest | pinterest-fotograf-indir | tai-anh-pinterest | skachat-foto-s-pinterest | pinterest-image-downloader | pinterest-image-downloader |
| gif | descargar-gif-pinterest | baixar-gif-pinterest | telecharger-gif-pinterest | pinterest-gif-herunterladen | scaricare-gif-da-pinterest | pinterest-gif-downloaden | download-gif-pinterest | pinterest-gif-indir | tai-gif-pinterest | skachat-gif-s-pinterest | pinterest-gif-downloader | pinterest-gif-downloader |
| board | descargar-tableros-pinterest | baixar-pasta-pinterest | telecharger-tableau-pinterest | pinterest-pinnwand-herunterladen | scaricare-bacheca-pinterest | pinterest-bord-downloaden | download-board-pinterest | pinterest-pano-indir | tai-bang-pinterest | skachat-dosku-pinterest | pinterest-board-downloader | pinterest-board-downloader |
| profile | descargar-perfil-pinterest | baixar-perfil-pinterest | — | pinterest-profil-herunterladen | — | — | — | pinterest-profil-indir | tai-ho-so-pinterest | — | — | — |
| profile-picture | descargar-foto-perfil-pinterest | baixar-foto-de-perfil-pinterest | telecharger-photo-de-profil-pinterest | pinterest-profilbild-herunterladen | — | — | download-foto-profil-pinterest | pinterest-profil-fotografi-indir | tai-avatar-pinterest | skachat-avatarku-s-pinterest | pinterest-profile-picture-downloader | pinterest-profile-picture-downloader |
| carousel | descargar-carrusel-pinterest | baixar-carrossel-pinterest | — | pinterest-karussell-herunterladen | — | — | — | — | — | — | — | — |
| story | — | — | — | — | — | — | — | — | — | — | — | — |
| audio | pinterest-a-mp3 (Q1) | baixar-som-pinterest (Q1) | telecharger-mp3-pinterest (Q1) | pinterest-audio-herunterladen (Q1) | scaricare-audio-da-pinterest (Q1) | — | download-mp3-pinterest (Q1) | pinterest-mp3-donusturucu (Q1) | tai-nhac-pinterest (Q1) | — | pinterest-audio-downloader (Q1) | — |
| 4k | — | baixar-video-pinterest-full-hd (Q2) | telecharger-pinterest-4k (Q2) | — | — | — | — | pinterest-4k-video-indir (Q2) | tai-video-pinterest-4k (Q2) | — | pinterest-hd-downloader (Q2) | pinterest-4k-downloader (Q2) |
| to-mp4 | pinterest-a-mp4 | pinterest-para-mp4 | convertisseur-pinterest-mp4 | pinterest-in-mp4-umwandeln | convertitore-pinterest-mp4 | — | pinterest-ke-mp4 | pinterest-mp4-donusturucu | chuyen-video-pinterest-sang-mp4 | — | — | pinterest-to-mp4 |
| chrome | descargar-videos-pinterest-chrome | baixar-video-pinterest-chrome | telecharger-video-pinterest-chrome | pinterest-video-downloader-chrome | — | — | download-video-pinterest-di-chrome | — | tai-video-pinterest-tren-chrome | — | pinterest-video-downloader-chrome | — |
| seo-title | — | — | — | — | — | — | — | — | — | — | — | — |
| how-to | como-descargar-videos-pinterest | como-baixar-video-do-pinterest | comment-telecharger-une-video-pinterest | pinterest-videos-speichern | come-scaricare-video-da-pinterest | hoe-pinterest-video-downloaden | cara-download-video-pinterest | pinterestten-video-nasil-indirilir | cach-tai-video-pinterest | kak-skachat-video-s-pinterest | how-to-download-pinterest-videos | how-to-download-pinterest-videos |
| gallery | guardar-videos-pinterest-galeria | como-salvar-video-do-pinterest-na-galeria | enregistrer-video-pinterest-galerie | pinterest-video-in-galerie-speichern | come-salvare-video-pinterest-in-galleria | pinterest-video-opslaan | cara-menyimpan-video-pinterest-ke-galeri | pinterest-video-galeriye-kaydetme | luu-video-pinterest-vao-thu-vien-anh | kak-sohranit-video-s-pinterest-v-galereyu | — | how-to-download-pinterest-video-in-gallery |
| laptop | descargar-videos-pinterest-pc | como-baixar-video-do-pinterest-no-pc | telecharger-video-pinterest-pc | pinterest-video-herunterladen-pc | come-scaricare-video-da-pinterest-su-pc | — | cara-download-video-pinterest-di-laptop | pinterest-video-indir-pc | tai-video-pinterest-ve-may-tinh | kak-skachat-video-s-pinterest-na-kompyuter | how-to-download-pinterest-video-on-laptop | how-to-download-pinterest-video-on-laptop |
| iphone-android | descargar-videos-pinterest-celular | baixar-video-pinterest-iphone-android | telecharger-video-pinterest-iphone | pinterest-video-herunterladen-iphone-android | scaricare-video-pinterest-iphone-android | — | cara-download-video-pinterest-di-hp | pinterest-video-indir-iphone-android | tai-video-pinterest-ve-dien-thoai | skachat-video-s-pinterest-na-iphone-i-android | download-pinterest-videos-iphone-android | download-pinterest-videos-iphone-android |

Totals: es 16, pt 17, fr 15, de 16, it 12, nl 8, id 14, tr 15, vi 16, ru 11, th 13, ar 13 = 166.

## 3. Page × locale matrix

Title and description lengths are code points after NFC, the way `seo_health_check.py` counts them. P = priority (P1 first). Rows marked * were changed from the research (see §4).

### es: Español (release A)

| page | path | P | primary keyword | title (len) | description (len) | H1 |
|---|---|---|---|---|---|---|
| home | `/es` | P1 | descargar de Pinterest | Descargador de Pinterest: videos, fotos y GIF \| PintDownload (60) | Descarga videos de Pinterest en MP4, fotos, GIF, tableros y perfiles públicos con solo pegar el enlace. Gratis, sin registrarte y sin instalar apps. (148) | Descargador de Pinterest |
| pin | `/es/descargar-pin-pinterest` | P1 | descargar pin de Pinterest | Descargar pin de Pinterest por enlace: foto, video o GIF (56) | Pega el enlace de un pin público (pinterest.com/pin o pin.it) y descarga su imagen, video MP4, GIF o todas las fotos del carrusel. Gratis y sin cuenta. (151) | Descargar pin de Pinterest |
| video | `/es/descargar-videos-pinterest` | P1 | descargar videos de Pinterest | Descargar videos de Pinterest en MP4, sin marca de agua (55) | Descarga videos de Pinterest en MP4 con el enlace del pin o de pin.it. Gratis, sin marca de agua añadida y sin instalar apps, en el celular o en la PC. (151) | Descargar videos de Pinterest |
| image | `/es/descargar-imagenes-pinterest` | P1 | descargar imágenes de Pinterest | Descargar imágenes de Pinterest en alta calidad, sin cuenta (59) | Descarga fotos, fondos de pantalla e imágenes de Pinterest en la mayor resolución pública disponible. Pega el enlace del pin; sin cuenta ni registro. (149) | Descargar imágenes de Pinterest |
| gif | `/es/descargar-gif-pinterest` | P1 | descargar GIF de Pinterest | Descargar GIF de Pinterest con animación, gratis y sin app (58) | Guarda GIF de Pinterest sin perder el movimiento: pega el enlace del pin y descarga el archivo GIF animado, no una foto fija. Gratis, en celular o PC. (150) | Descargar GIF de Pinterest |
| board | `/es/descargar-tableros-pinterest` | P1 | descargar tableros de Pinterest | Descargar tableros de Pinterest en ZIP: fotos y videos (54) | Pega el enlace de un tablero público de Pinterest y descarga sus pines, fotos y videos, en un solo archivo ZIP. Sin extensiones, sin cuenta y gratis. (149) | Descargar tableros de Pinterest |
| profile | `/es/descargar-perfil-pinterest` | P3 | descargar perfil de Pinterest | Descargar perfil de Pinterest: pines públicos en un ZIP (55) | Descarga en un ZIP los pines públicos de un perfil de Pinterest, con fotos y videos, pegando el enlace de la cuenta. Gratis, sin registro y sin apps. (149) | Descargar perfil de Pinterest |
| profile-picture | `/es/descargar-foto-perfil-pinterest` | P2 | descargar foto de perfil de Pinterest | Descargar foto de perfil de Pinterest y verla en grande (55) | Mira en grande y descarga la foto de perfil de una cuenta pública de Pinterest: pega el enlace del perfil y guarda la imagen más grande disponible. (147) | Descargar foto de perfil de Pinterest |
| carousel | `/es/descargar-carrusel-pinterest` | P2 | descargar carrusel de Pinterest | Descargar carrusel de Pinterest: todas las fotos del pin (56) | Descarga todas las imágenes de un carrusel de Pinterest de una vez: pega el enlace del pin y guarda cada foto por separado o todas juntas en un ZIP. (148) | Descargar carrusel de Pinterest |
| audio (gated Q1) | `/es/pinterest-a-mp3` | P2 | Pinterest a MP3 | Pinterest a MP3: extrae el audio de un video de Pinterest (57) | Convierte un video de Pinterest a MP3: pega el enlace de un pin de video público y guarda la música o la voz. Gratis; usa solo audio que puedas conservar. (154) | Pinterest a MP3 |
| to-mp4 | `/es/pinterest-a-mp4` | P2 | Pinterest a MP4 | Pinterest a MP4: convierte videos de Pinterest online gratis (60) | Convierte un enlace de Pinterest a MP4: pega la URL del pin y descarga un video que se reproduce en cualquier celular o PC. Sin registro y sin marca de agua. (157) | Pinterest a MP4 |
| chrome | `/es/descargar-videos-pinterest-chrome` | P3 | descargar videos de Pinterest en Chrome | Descargar videos de Pinterest en Chrome sin extensión (53) | Descarga videos, fotos y tableros de Pinterest desde Chrome con un marcador de un clic (bookmarklet), sin instalar extensiones. Funciona en Windows y Mac. (154) | Descargar videos de Pinterest en Chrome |
| how-to | `/es/como-descargar-videos-pinterest` | P1 | cómo descargar videos de Pinterest | Cómo descargar videos de Pinterest: guía paso a paso sin apps (61) | Guía para descargar videos de Pinterest: copia el enlace en la app, pégalo en PintDownload y guarda el MP4 en tu celular o PC. Sin apps y sin registro. (151) | Cómo descargar videos de Pinterest |
| gallery | `/es/guardar-videos-pinterest-galeria` | P2 | cómo guardar videos de Pinterest en la galería | Cómo guardar videos de Pinterest en la galería del celular (58) | Guarda videos de Pinterest directo en la galería de Android o en Fotos del iPhone. Paso a paso, gratis y sin apps, y qué hacer si el video no aparece. (150) | Guardar videos de Pinterest en la galería |
| laptop | `/es/descargar-videos-pinterest-pc` | P2 | cómo descargar videos de Pinterest en PC | Cómo descargar videos de Pinterest en PC, computadora o Mac (59) | Descarga videos de Pinterest en tu computadora con Windows, Mac o Chromebook: copia el enlace del pin, pégalo y guarda el MP4 en Descargas. Gratis. (147) | Descargar videos de Pinterest en PC |
| iphone-android | `/es/descargar-videos-pinterest-celular` | P1 | cómo descargar videos de Pinterest en el celular | Descargar videos de Pinterest en el celular (iPhone y Android) (62) | Descarga videos de Pinterest en tu iPhone o Android desde Safari o Chrome, sin instalar apps, y guárdalos en Fotos o en la Galería. Gratis y en MP4. (148) | Descargar videos de Pinterest en el celular |

### pt: Português (release A)

| page | path | P | primary keyword | title (len) | description (len) | H1 |
|---|---|---|---|---|---|---|
| home | `/pt` | P1 | baixar do pinterest | Baixar do Pinterest: Vídeo, Foto e GIF Grátis \| PintDownload (60) | Baixe vídeos em MP4, fotos, GIFs, pastas e perfis públicos do Pinterest colando o link. Grátis, sem login e sem marca d’água, no celular ou no PC. (146) | Baixar do Pinterest |
| pin | `/pt/baixar-pin-pinterest` | P2 | baixar pin pinterest | Baixar Pin do Pinterest pelo Link: Foto, Vídeo e GIF (52) | Cole o link de um pin (pinterest.com/pin ou pin.it) e baixe a foto em alta resolução, o vídeo em MP4, o GIF animado ou todas as imagens do carrossel. (149) | Baixar pin do Pinterest |
| video | `/pt/baixar-video-pinterest` | P1 | baixar vídeo do pinterest | Baixar Vídeo do Pinterest em MP4 HD, Grátis e sem Login (55) | Cole o link do pin e baixe o vídeo do Pinterest em MP4 na melhor qualidade disponível. Sem marca d’água nossa, sem app e sem login. Funciona com pin.it. (152) | Baixar vídeo do Pinterest |
| image | `/pt/baixar-imagem-pinterest` | P1 | baixar imagem do pinterest | Baixar Imagem do Pinterest em Alta Resolução, Grátis (52) | Baixe fotos, wallpapers e artes do Pinterest na maior resolução que o pin oferece. Cole o link e salve a imagem na galeria ou no PC, sem conta e sem login. (155) | Baixar imagem do Pinterest |
| gif | `/pt/baixar-gif-pinterest` | P2 | baixar gif do pinterest | Baixar GIF do Pinterest Animado: Grátis e pelo Link (51) | Baixe GIFs do Pinterest sem perder a animação. Cole o link do pin e salve o arquivo .gif original que continua se mexendo, no celular ou no PC, sem login. (154) | Baixar GIF do Pinterest |
| board | `/pt/baixar-pasta-pinterest` | P2 | baixar pasta do pinterest | Baixar Pasta do Pinterest Inteira em ZIP, Grátis (48) | Cole o link de uma pasta pública do Pinterest e baixe todas as imagens e vídeos de uma vez em um arquivo ZIP. Grátis, sem login e sem instalar extensão. (152) | Baixar pasta do Pinterest |
| profile | `/pt/baixar-perfil-pinterest` | P3 | baixar perfil do pinterest | Baixar Perfil do Pinterest: Todos os Pins em ZIP, Grátis (56) | Baixe os pins públicos de um perfil do Pinterest de uma vez: fotos e vídeos em um único ZIP. Cole o link do perfil; não precisa de conta nem de login. (150) | Baixar perfil do Pinterest |
| profile-picture | `/pt/baixar-foto-de-perfil-pinterest` | P2 | baixar foto de perfil do pinterest | Baixar Foto de Perfil do Pinterest em HD, Grátis (48) | Veja e baixe a foto de perfil de um perfil público do Pinterest no maior tamanho disponível. Cole o link do perfil e salve a imagem no celular ou no PC. (152) | Baixar foto de perfil do Pinterest |
| carousel | `/pt/baixar-carrossel-pinterest` | P2 | baixar carrossel do pinterest | Baixar Carrossel do Pinterest: Todas as Imagens, Grátis (55) | Baixe todas as imagens de um pin em carrossel do Pinterest de uma vez, na maior resolução disponível. Cole o link do pin e salve cada cartão, sem login. (152) | Baixar carrossel do Pinterest |
| audio (gated Q1) | `/pt/baixar-som-pinterest` | P2 | baixar som do pinterest | Baixar Som do Pinterest: Extraia o Áudio de um Vídeo (52) | Tire o som de um vídeo público do Pinterest e salve só o áudio, quando o pin tem trilha. Grátis e sem login. Guarde apenas áudio que você tem direito de usar. (158) | Baixar som do Pinterest |
| 4k* (gated Q2) | `/pt/baixar-video-pinterest-full-hd` | P2 | baixar vídeo do pinterest em full hd | Vídeo do Pinterest em Full HD ou 4K? A Qualidade Real (53) | Baixe o vídeo do Pinterest na maior qualidade que o pin tem, até 1080p quando existe. Sem promessa falsa de 4K: veja a resolução real antes de baixar. (150) | Full HD ou 4K? A qualidade real |
| to-mp4 | `/pt/pinterest-para-mp4` | P2 | pinterest para mp4 | Pinterest para MP4: Converter Vídeo do Pinterest Grátis (55) | Transforme o link de um vídeo do Pinterest em um arquivo MP4 que toca em qualquer celular ou PC. Cole o link do pin e baixe, sem cadastro e sem marca d’água. (157) | Pinterest para MP4 |
| chrome | `/pt/baixar-video-pinterest-chrome` | P3 | extensão para baixar vídeo do pinterest | Baixar Vídeo do Pinterest no Chrome sem Extensão (48) | Baixe vídeos, fotos e pastas do Pinterest direto da aba do Chrome com um favorito de 1 clique (bookmarklet). Não é extensão: nada para instalar na loja. (152) | Baixar vídeo do Pinterest no Chrome |
| how-to* | `/pt/como-baixar-video-do-pinterest` | P1 | como baixar vídeo do pinterest | Como Baixar Vídeo do Pinterest no Celular e no PC, sem App (58) | Passo a passo para baixar vídeo do Pinterest: use o botão Baixar do app quando ele aparece ou cole o link no PintDownload. iPhone, Android e PC, sem pagar. (155) | Como baixar vídeo do Pinterest |
| gallery | `/pt/como-salvar-video-do-pinterest-na-galeria` | P1 | como salvar vídeo do pinterest na galeria | Como Salvar Vídeo do Pinterest na Galeria do Celular (52) | Salve vídeos do Pinterest direto na galeria do Android ou no app Fotos do iPhone, sem instalar aplicativo. Copie o link, cole aqui e baixe o MP4 em 3 passos. (157) | Salvar vídeo do Pinterest na galeria |
| laptop | `/pt/como-baixar-video-do-pinterest-no-pc` | P2 | como baixar vídeo do pinterest no pc | Como Baixar Vídeo do Pinterest no PC, Notebook ou Mac (53) | Baixe vídeos do Pinterest no PC com Windows, no notebook ou no Mac pelo navegador: copie o link do pin, cole aqui e salve o MP4 na pasta Downloads. Grátis. (155) | Baixar vídeo do Pinterest no PC |
| iphone-android | `/pt/baixar-video-pinterest-iphone-android` | P2 | baixar vídeo do pinterest no iphone e android | Baixar Vídeo do Pinterest no iPhone e Android, sem App (54) | Baixe vídeos do Pinterest no iPhone (Safari) ou no Android (Chrome) sem instalar app: copie o link do pin, cole aqui e salve o MP4 em Fotos ou na Galeria. (154) | Vídeo do Pinterest no iPhone e Android |

### fr: Français (release A)

| page | path | P | primary keyword | title (len) | description (len) | H1 |
|---|---|---|---|---|---|---|
| home | `/fr` | P1 | téléchargeur pinterest | Téléchargeur Pinterest — vidéo, photo et GIF \| PintDownload (59) | Téléchargez gratuitement vidéos MP4, photos HD, GIF et tableaux Pinterest publics. Copiez le lien, collez-le, enregistrez le fichier. Sans compte ni appli. (155) | Téléchargeur Pinterest |
| pin | `/fr/telecharger-epingle-pinterest` | P2 | télécharger épingle pinterest | Télécharger une épingle Pinterest — image, vidéo ou GIF (55) | Collez le lien d’une épingle Pinterest (ou pin.it) et récupérez l’image HD, la vidéo MP4, le GIF ou toutes les images d’un carrousel. Gratuit, sans compte. (155) | Télécharger une épingle Pinterest |
| video | `/fr/telecharger-video-pinterest` | P1 | télécharger vidéo pinterest | Télécharger une vidéo Pinterest en MP4 HD — gratuit, en ligne (61) | Collez le lien d’une épingle vidéo et enregistrez-la en MP4 HD, sans logo ajouté. Liens pin.it acceptés, sans appli ni compte, sur téléphone comme sur PC. (154) | Télécharger une vidéo Pinterest |
| image* | `/fr/telecharger-photo-pinterest` | P1 | télécharger photo pinterest | Télécharger une photo Pinterest en HD — grand format (52) | Enregistrez une photo ou une image Pinterest en grand format, pas en miniature. Collez le lien de l’épingle : gratuit et sans compte Pinterest. (143) | Télécharger une photo Pinterest |
| gif | `/fr/telecharger-gif-pinterest` | P2 | télécharger gif pinterest | Télécharger un GIF Pinterest animé — gratuit, sans compte (57) | Enregistrez un GIF Pinterest qui reste animé, pas une image figée. Collez le lien de l’épingle GIF et récupérez le fichier en boucle, sur mobile ou PC. (151) | Télécharger un GIF Pinterest |
| board | `/fr/telecharger-tableau-pinterest` | P1 | télécharger tableau pinterest | Télécharger un tableau Pinterest entier en ZIP — gratuit (56) | Collez le lien d’un tableau Pinterest public et téléchargez ses épingles, images et vidéos, dans un seul fichier ZIP. Gratuit, sans compte ni extension. (152) | Télécharger un tableau Pinterest |
| profile-picture | `/fr/telecharger-photo-de-profil-pinterest` | P2 | télécharger photo de profil pinterest | Photo de profil Pinterest en HD — voir et télécharger en grand (62) | Affichez et téléchargez en grand la photo de profil d’un compte Pinterest public, pas la petite vignette ronde. Collez le lien du profil : c’est gratuit. (153) | Photo de profil Pinterest en HD |
| audio (gated Q1) | `/fr/telecharger-mp3-pinterest` | P2 | telecharger mp3 pinterest | Télécharger le son d’une vidéo Pinterest en MP3 — gratuit (57) | Extrayez la musique ou la voix d’une épingle vidéo Pinterest publique en MP3, si la vidéo a du son. Gratuit, sans compte. Gardez seulement l’audio autorisé. (156) | Le son d’une vidéo Pinterest en MP3 |
| 4k* (gated Q2) | `/fr/telecharger-pinterest-4k` | P2 | télécharger vidéo pinterest 4k | Télécharger Pinterest en 4K ? La vraie qualité maximale (55) | Pinterest diffuse rarement ses vidéos en 4K. PintDownload récupère la meilleure version publiée (souvent 720p ou 1080p) et les photos en grand format public. (157) | Pinterest en 4K ? La vraie qualité max |
| to-mp4 | `/fr/convertisseur-pinterest-mp4` | P2 | convertisseur pinterest mp4 | Convertisseur Pinterest MP4 — vidéo Pinterest en MP4 gratuit (60) | Convertissez une vidéo Pinterest en MP4 lisible partout : collez le lien de l’épingle et téléchargez le fichier avec le son. Sans inscription ni logo ajouté. (157) | Convertir Pinterest en MP4 |
| chrome | `/fr/telecharger-video-pinterest-chrome` | P3 | extension telecharger video pinterest | Télécharger des vidéos Pinterest dans Chrome — sans extension (61) | Un favori dans la barre de Chrome remplace l’extension : sur une épingle, un clic ouvre PintDownload avec son lien. Vidéos, photos et tableaux publics. (151) | Vidéos Pinterest dans Chrome, sans extension |
| how-to | `/fr/comment-telecharger-une-video-pinterest` | P1 | comment télécharger une vidéo pinterest | Comment télécharger une vidéo Pinterest — 3 méthodes simples (60) | Trois façons d’enregistrer une vidéo Pinterest sur téléphone ou ordinateur : l’option de l’appli si elle existe, PintDownload, ou l’enregistrement d’écran. (155) | Comment télécharger une vidéo Pinterest |
| gallery | `/fr/enregistrer-video-pinterest-galerie` | P1 | comment enregistrer une vidéo pinterest dans sa galerie | Enregistrer une vidéo Pinterest dans sa galerie — sans appli (60) | Mettez une vidéo Pinterest dans la galerie de votre téléphone Samsung ou Android : copiez le lien, collez-le, enregistrez le MP4. Sans application, gratuit. (156) | Enregistrer une vidéo Pinterest dans sa galerie |
| laptop | `/fr/telecharger-video-pinterest-pc` | P2 | télécharger vidéo pinterest pc | Télécharger une vidéo Pinterest sur PC ou Mac — gratuit (55) | Téléchargez une vidéo Pinterest sur PC Windows, Mac ou Chromebook, sans logiciel : copiez l’URL de l’épingle, collez-la, le MP4 arrive dans Téléchargements. (156) | Télécharger une vidéo Pinterest sur PC |
| iphone-android | `/fr/telecharger-video-pinterest-iphone` | P1 | télécharger vidéo pinterest iphone | Télécharger une vidéo Pinterest sur iPhone (et Android) (55) | Enregistrez une vidéo Pinterest dans l’app Photos de l’iPhone ou de l’iPad depuis Safari, et dans la galerie sur Android. Sans appli, gratuit, en HD. (149) | Télécharger une vidéo Pinterest sur iPhone |

### de: Deutsch (release A)

| page | path | P | primary keyword | title (len) | description (len) | H1 |
|---|---|---|---|---|---|---|
| home | `/de` | P1 | pinterest downloader | Pinterest-Downloader – Videos, Bilder & GIFs kostenlos (54) | Kostenloser Pinterest-Downloader: Videos als MP4, Bilder, GIFs sowie ganze Pinnwände und Profile als ZIP speichern. Ohne Anmeldung, ohne Wasserzeichen. (151) | Pinterest-Downloader |
| pin | `/de/pinterest-pin-herunterladen` | P2 | pinterest pin herunterladen | Pinterest-Pin herunterladen – Bild, Video & GIF kostenlos (57) | Einzelnen Pinterest-Pin herunterladen: Link einfügen, dann Bild, MP4-Video, GIF oder alle Karussell-Bilder speichern. Kostenlos, ohne Anmeldung, auch pin.it. (157) | Pinterest-Pin herunterladen |
| video | `/de/pinterest-video-herunterladen` | P1 | pinterest video herunterladen | Pinterest-Video herunterladen – kostenlos als MP4 in HD (55) | Pinterest-Videos kostenlos herunterladen: Link vom Video-Pin einfügen und als MP4 speichern – ohne Wasserzeichen, ohne App, ohne Anmeldung, auch per pin.it. (156) | Pinterest-Videos herunterladen |
| image | `/de/pinterest-bilder-herunterladen` | P1 | pinterest bilder herunterladen | Pinterest-Bilder herunterladen – in HD, ohne Anmeldung (54) | Pinterest-Bilder in der größten verfügbaren Auflösung speichern, auch wenn „Bild herunterladen“ fehlt. Pin-Link einfügen, JPG laden – kostenlos, ohne Konto. (156) | Pinterest-Bilder herunterladen |
| gif | `/de/pinterest-gif-herunterladen` | P2 | pinterest gif herunterladen | Pinterest-GIF herunterladen – animiert speichern, kostenlos (59) | GIFs von Pinterest herunterladen, ohne dass die Animation verloren geht: GIF-Pin-Link einfügen und die Datei mit Loop speichern. Kostenlos, ohne Anmeldung. (155) | Pinterest-GIFs herunterladen |
| board | `/de/pinterest-pinnwand-herunterladen` | P1 | pinterest pinnwand herunterladen | Pinterest-Pinnwand herunterladen – alle Pins als ZIP (52) | Ganze Pinterest-Pinnwand herunterladen: öffentlichen Pinnwand-Link einfügen und alle Bilder und Videos als ZIP-Datei speichern. Kostenlos, ohne Anmeldung. (154) | Pinterest-Pinnwand herunterladen |
| profile | `/de/pinterest-profil-herunterladen` | P3 | pinterest profil herunterladen | Pinterest-Profil herunterladen – alle Pins als ZIP sichern (58) | Öffentliche Pins eines Pinterest-Profils gesammelt herunterladen: Profil-Link einfügen und Bilder und Videos als ZIP speichern. Kostenlos und ohne Login. (153) | Pinterest-Profil herunterladen |
| profile-picture | `/de/pinterest-profilbild-herunterladen` | P2 | pinterest profilbild herunterladen | Pinterest-Profilbild herunterladen – groß ansehen & speichern (61) | Pinterest-Profilbild groß ansehen und speichern statt nur als Mini-Kreis: öffentlichen Profil-Link einfügen, Bild als JPG laden – kostenlos, ohne Anmeldung. (156) | Pinterest-Profilbild herunterladen |
| carousel | `/de/pinterest-karussell-herunterladen` | P3 | pinterest karussell herunterladen | Pinterest-Karussell herunterladen – alle Bilder auf einmal (58) | Alle Bilder eines Pinterest-Karussells herunterladen: Pin-Link einfügen und jedes Bild einzeln oder alle zusammen als ZIP speichern. Kostenlos, ohne Login. (155) | Pinterest-Karussell herunterladen |
| audio (gated Q1) | `/de/pinterest-audio-herunterladen` | P3 | pinterest audio herunterladen | Pinterest-Audio herunterladen – Musik & Ton als MP3 (51) | Musik oder Ton aus einem öffentlichen Pinterest-Video als MP3 speichern: Link einfügen, Audio extrahieren – kostenlos. Nutze nur Ton, den du verwenden darfst. (158) | Pinterest-Audio herunterladen |
| to-mp4 | `/de/pinterest-in-mp4-umwandeln` | P2 | pinterest video umwandeln | Pinterest in MP4 umwandeln – Video-Konverter online & gratis (60) | Pinterest-Videos online in MP4 umwandeln: Pin-Link einfügen und eine MP4-Datei laden, die überall läuft – kostenlos, ohne Registrierung, ohne Wasserzeichen. (156) | Pinterest in MP4 umwandeln |
| chrome | `/de/pinterest-video-downloader-chrome` | P3 | pinterest video downloader chrome | Pinterest-Video-Downloader für Chrome – ohne Erweiterung (56) | Pinterest-Videos, Bilder und Pinnwände in Chrome laden – per Lesezeichen (Bookmarklet) statt Erweiterung: nichts installieren, ein Klick im offenen Tab. (152) | Pinterest-Downloader für Chrome |
| how-to | `/de/pinterest-videos-speichern` | P2 | pinterest videos speichern | Pinterest-Videos speichern: So geht’s auf Handy und PC (54) | Wie kann man Pinterest-Videos herunterladen? Anleitung für iPhone, Android und PC: Link kopieren, einfügen und als MP4 speichern – kostenlos, ohne App. (151) | Pinterest-Videos speichern: So geht’s |
| gallery | `/de/pinterest-video-in-galerie-speichern` | P1 | pinterest video in galerie speichern | Pinterest-Video in der Galerie speichern – ohne App (51) | So speicherst du Pinterest-Videos in der Galerie deines Handys oder in der Fotos-App vom iPhone: Link kopieren, einfügen, sichern. Ohne App, ohne Anmeldung. (156) | Pinterest-Video in der Galerie speichern |
| laptop | `/de/pinterest-video-herunterladen-pc` | P2 | pinterest video herunterladen pc | Pinterest-Video am PC herunterladen – Laptop, Mac & Windows (59) | Pinterest-Videos am PC oder Laptop herunterladen: Pin-Link aus der Adressleiste kopieren, einfügen und als MP4 speichern. Für Windows, Mac und Chromebook. (154) | Pinterest-Video am PC herunterladen |
| iphone-android | `/de/pinterest-video-herunterladen-iphone-android` | P2 | pinterest video herunterladen iphone | Pinterest-Video aufs iPhone & Android-Handy herunterladen (57) | Pinterest-Videos auf dem iPhone in der Fotos-App oder auf Android in der Galerie speichern: Link kopieren, in Safari oder Chrome einfügen – ohne App. (149) | Pinterest-Video auf iPhone & Android herunterladen |

### it: Italiano (release A)

| page | path | P | primary keyword | title (len) | description (len) | H1 |
|---|---|---|---|---|---|---|
| home | `/it` | P1 | scaricare da pinterest | Pinterest Downloader: video, foto e GIF gratis \| PintDownload (61) | Scarica da Pinterest video MP4, immagini e GIF: incolla il link del Pin (anche pin.it) e salva il file. Gratis, senza registrazione, solo contenuti pubblici. (157) | Scarica da Pinterest |
| pin | `/it/scaricare-pin-da-pinterest` | P2 | scaricare pin da pinterest | Scaricare un Pin da Pinterest — immagine, video o GIF (53) | Incolla il link di un Pin pubblico e scarica l’immagine, il video MP4, la GIF o tutte le foto di un carosello. Gratis, senza account e senza installare app. (156) | Scarica un Pin da Pinterest |
| video | `/it/scaricare-video-da-pinterest` | P1 | scaricare video da pinterest | Scaricare video da Pinterest — MP4 HD gratis, senza filigrana (61) | Pinterest video downloader gratuito: incolla il link di un Pin video (anche pin.it) e scarica l’MP4 in HD, senza filigrana. Niente app né registrazione. (152) | Scarica video da Pinterest |
| image* | `/it/scaricare-immagini-da-pinterest` | P1 | scaricare immagini da pinterest | Scaricare immagini e foto da Pinterest in alta risoluzione (58) | Scarica foto e immagini da Pinterest nella massima risoluzione disponibile: incolla il link del Pin e salva il file JPG. Gratis e senza registrarsi. (148) | Scarica immagini da Pinterest |
| gif | `/it/scaricare-gif-da-pinterest` | P2 | scaricare gif da pinterest | Scaricare GIF da Pinterest — GIF animate gratis, senza app (58) | Scarica le GIF animate da Pinterest senza perdere l’animazione: incolla il link del Pin e salva il file GIF originale. Gratis, senza app e senza account. (153) | Scarica GIF da Pinterest |
| board | `/it/scaricare-bacheca-pinterest` | P2 | scaricare bacheca pinterest | Scaricare una bacheca Pinterest intera in ZIP — gratis (54) | Incolla il link di una bacheca pubblica e scarica i suoi Pin, immagini e video, in un unico file ZIP. Gratis e senza account. Bacheche segrete escluse. (151) | Scarica una bacheca Pinterest |
| audio (gated Q1) | `/it/scaricare-audio-da-pinterest` | P3 | scaricare audio da pinterest | Scaricare l’audio da Pinterest — MP3 dai Pin video, gratis (58) | Estrai musica o voce da un Pin video pubblico e salvala in MP3, quando l’audio è disponibile. Gratis e senza login. Usa solo audio che hai diritto a tenere. (156) | Scarica l’audio da Pinterest |
| to-mp4 | `/it/convertitore-pinterest-mp4` | P2 | convertitore pinterest mp4 | Pinterest in MP4 — convertitore video online gratuito (53) | Converti un video di Pinterest in MP4: incolla il link del Pin (anche pin.it) e scarica un MP4 che si apre ovunque. Gratis, senza iscrizione né filigrana. (154) | Converti Pinterest in MP4 |
| how-to | `/it/come-scaricare-video-da-pinterest` | P1 | come scaricare video da pinterest | Come scaricare video da Pinterest: guida gratuita e senza app (61) | Guida passo passo per scaricare video da Pinterest su iPhone, Android e PC: tocca Condividi, poi Copia link, incollalo e salva l’MP4. Gratis e senza app. (153) | Come scaricare video da Pinterest |
| gallery | `/it/come-salvare-video-pinterest-in-galleria` | P2 | come salvare un video da pinterest nella galleria | Come salvare un video da Pinterest nella Galleria, senza app (60) | Salva i video di Pinterest nella Galleria di Android o nell’app Foto di iPhone: copia il link del Pin, scarica l’MP4 e ritrovalo. Gratis e senza login. (151) | Salva i video di Pinterest in Galleria |
| laptop | `/it/come-scaricare-video-da-pinterest-su-pc` | P2 | come scaricare video da pinterest su pc | Come scaricare video da Pinterest su PC e Mac (MP4 gratis) (58) | Scarica video da Pinterest su PC, Mac o Chromebook: copia l’URL del Pin, incollalo e salva l’MP4 nella cartella Download. Gratis, senza programmi. (146) | Scarica video da Pinterest su PC |
| iphone-android | `/it/scaricare-video-pinterest-iphone-android` | P2 | come scaricare video da pinterest su iphone | Scaricare video da Pinterest su iPhone e Android (MP4 HD) (57) | Scarica video da Pinterest su iPhone con Safari e su Android con Chrome: Copia link, incolla e salva l’MP4 in Foto o in Galleria. Gratis e senza app. (149) | Video Pinterest su iPhone e Android |

### nl: Nederlands (release A)

| page | path | P | primary keyword | title (len) | description (len) | H1 |
|---|---|---|---|---|---|---|
| home | `/nl` | P1 | pinterest downloader | Pinterest downloader — video, foto & GIF gratis \| PintDownload (62) | Gratis Pinterest downloader: sla openbare video's op als MP4, foto's in HD, GIF's en hele borden als ZIP. Zonder account of app, op je telefoon en pc. (150) | Pinterest downloader |
| pin | `/nl/pinterest-pin-downloaden` | P2 | pinterest pin downloaden | Pinterest pin downloaden — foto, video of GIF gratis (52) | Download één Pinterest-pin: plak de pin- of pin.it-link en sla de foto, MP4-video, GIF of alle afbeeldingen uit een carrousel op. Gratis, zonder account. (153) | Pinterest pin downloaden |
| video | `/nl/pinterest-video-downloaden` | P1 | pinterest video downloaden | Pinterest video downloaden — gratis als HD MP4, zonder app (58) | Plak de link van een openbare videopin en download de Pinterest-video als MP4 in de beste beschikbare kwaliteit. Gratis, geen account, geen watermerk. (150) | Pinterest video downloaden |
| image | `/nl/pinterest-foto-downloaden` | P1 | pinterest foto downloaden | Pinterest foto downloaden — afbeeldingen in HD, gratis (54) | Pinterest-foto's en afbeeldingen downloaden in de grootste openbare versie: wallpapers, kunst en plaatjes als JPG of PNG. Gratis, zonder account of app. (152) | Pinterest foto downloaden |
| gif | `/nl/pinterest-gif-downloaden` | P2 | pinterest gif downloaden | Pinterest GIF downloaden — bewegende GIF's gratis opslaan (57) | Download een GIF van Pinterest mét animatie: plak de link van een openbare GIF-pin en sla het bewegende bestand op. Gratis, zonder account of app. (146) | Pinterest GIF downloaden |
| board | `/nl/pinterest-bord-downloaden` | P2 | pinterest bord downloaden | Pinterest bord downloaden — alle pins als ZIP, gratis (53) | Download een openbaar Pinterest-bord in één keer: plak de bordlink en sla de pins op als ZIP met foto's en video's. Gratis, zonder account of extensie. (151) | Pinterest bord downloaden |
| how-to | `/nl/hoe-pinterest-video-downloaden` | P1 | hoe pinterest video downloaden | Hoe download je een Pinterest-video? Uitleg voor elk toestel (60) | Zo download je een video van Pinterest: tik op Delen → Link kopiëren, plak de link in PintDownload en sla de MP4 op. Voor iPhone, Android, laptop en pc. (152) | Hoe download je een Pinterest-video? |
| gallery | `/nl/pinterest-video-opslaan` | P1 | pinterest video opslaan | Pinterest video opslaan in galerij of filmrol — zonder app (58) | Zo zet je een Pinterest-video in de Foto's-app van je iPhone of de galerij van je Android-telefoon: link kopiëren, plakken, MP4 opslaan. Gratis, zonder app. (156) | Pinterest video opslaan in je galerij |

### id: Bahasa Indonesia (release A)

| page | path | P | primary keyword | title (len) | description (len) | H1 |
|---|---|---|---|---|---|---|
| home | `/id` | P1 | pinterest downloader | Pinterest Downloader — Download Video, Foto & GIF Gratis (56) | Pinterest downloader gratis: video jadi MP4, foto HD, GIF, serta board dan profil dalam ZIP. Tanpa login, tanpa watermark tambahan, di HP atau laptop. (150) | Pinterest Downloader |
| pin | `/id/download-pin-pinterest` | P2 | download pin pinterest | Download Pin Pinterest — Foto, Video & GIF dari Link (52) | Download satu Pin Pinterest lewat link pinterest.com/pin atau pin.it: foto HD, video MP4, GIF, dan semua slide Pin carousel. Gratis, tanpa login. (145) | Download Pin Pinterest |
| video | `/id/download-video-pinterest` | P1 | download video pinterest | Download Video Pinterest HD tanpa Watermark — MP4 Gratis (56) | Download video Pinterest jadi MP4 HD gratis. Tempel link Pin atau pin.it, simpan ke galeri HP atau laptop. Tanpa aplikasi dan login, tanpa watermark tambahan. (158) | Download Video Pinterest |
| image* | `/id/download-foto-pinterest` | P1 | download foto pinterest | Download Foto Pinterest HD — Ukuran Terbesar, Gratis (52) | Download foto dan gambar Pinterest dalam ukuran terbesar yang tersedia, bukan thumbnail yang pecah. Cocok untuk wallpaper. Gratis, tanpa login. (143) | Download Foto Pinterest |
| gif | `/id/download-gif-pinterest` | P2 | download gif pinterest | Download GIF Pinterest — Simpan GIF Bergerak, Gratis (52) | Download GIF Pinterest tanpa kehilangan animasinya. Tempel link Pin GIF publik, lalu simpan file .gif aslinya ke HP atau laptop. Gratis, tanpa login. (149) | Download GIF Pinterest |
| board | `/id/download-board-pinterest` | P3 | download board pinterest | Download Board Pinterest — Simpan Semua Pin Jadi ZIP (52) | Download board (papan) Pinterest publik sekaligus: tempel link papan, simpan foto dan video Pin-nya dalam satu file ZIP. Gratis, tanpa login, tanpa daftar. (155) | Download Board Pinterest |
| profile-picture | `/id/download-foto-profil-pinterest` | P2 | download foto profil pinterest | Download Foto Profil Pinterest (PP) Ukuran Penuh — Gratis (57) | Download foto profil (PP) Pinterest dari profil publik dalam ukuran terbesar yang tersedia, bukan ikon kecil. Tempel link profil, lihat, lalu simpan. Gratis. (157) | Download Foto Profil Pinterest |
| audio (gated Q1) | `/id/download-mp3-pinterest` | P3 | download mp3 pinterest | Download MP3 Pinterest — Ambil Audio dari Video Pin (51) | Download MP3 Pinterest: ambil suara atau musik dari video Pin publik yang punya audio. Tempel link, lalu simpan. Gratis, tanpa login. Hormati hak cipta. (152) | Download MP3 Pinterest |
| to-mp4 | `/id/pinterest-ke-mp4` | P2 | pinterest ke mp4 | Pinterest ke MP4 — Ubah Video Pinterest Jadi MP4 Gratis (55) | Ubah video Pinterest jadi MP4 yang bisa diputar di HP, laptop, atau TV. Tempel link Pin publik, lalu download MP4 dengan suaranya jika ada. Tanpa daftar. (153) | Pinterest ke MP4 |
| chrome | `/id/download-video-pinterest-di-chrome` | P3 | download video pinterest di chrome | Download Video Pinterest di Chrome — Tanpa Ekstensi (51) | Download video, foto, dan papan Pinterest dari tab Chrome dengan bookmarklet satu klik, bukan ekstensi Web Store. Gratis untuk Windows, Mac, dan Chromebook. (156) | Download Video Pinterest di Chrome |
| how-to | `/id/cara-download-video-pinterest` | P1 | cara download video pinterest | Cara Download Video Pinterest tanpa Aplikasi & Watermark (56) | Cara download video Pinterest tanpa aplikasi: salin tautan, tempel di PintDownload, simpan MP4 ke galeri HP atau laptop. Gratis, tanpa watermark tambahan. (154) | Cara Download Video Pinterest |
| gallery | `/id/cara-menyimpan-video-pinterest-ke-galeri` | P1 | cara menyimpan video pinterest ke galeri | Cara Menyimpan Video Pinterest ke Galeri HP tanpa Aplikasi (58) | Video Pinterest tidak masuk galeri? Salin tautan Pin, tempel di PintDownload, lalu simpan MP4 ke Galeri Android atau app Foto iPhone. Gratis, tanpa login. (154) | Cara Menyimpan Video Pinterest ke Galeri |
| laptop | `/id/cara-download-video-pinterest-di-laptop` | P2 | cara download video pinterest di laptop | Cara Download Video Pinterest di Laptop & PC (MP4 Gratis) (57) | Cara download video Pinterest di laptop Windows, MacBook, atau PC lewat browser: salin link, tempel, simpan MP4 hingga 1080p jika tersedia. Tanpa software. (155) | Cara Download Video Pinterest di Laptop |
| iphone-android | `/id/cara-download-video-pinterest-di-hp` | P2 | cara download video pinterest di hp | Cara Download Video Pinterest di HP Android & iPhone (52) | Simpan video Pinterest ke HP: ke Galeri Android atau app Foto iPhone lewat Chrome atau Safari. Salin tautan, tempel, simpan MP4. Tanpa install aplikasi. (152) | Cara Download Video Pinterest di HP |

### tr: Türkçe (release A)

| page | path | P | primary keyword | title (len) | description (len) | H1 |
|---|---|---|---|---|---|---|
| home | `/tr` | P1 | pinterest indirici | Pinterest İndirici — Video, Fotoğraf ve GIF Ücretsiz İndir (58) | Pinterest videolarını MP4, fotoğrafları, GIF'leri, panoları ve profilleri linkle indirin. Ücretsiz; üyelik, uygulama ya da APK gerekmez, filigran eklemeyiz. (156) | Pinterest İndirici |
| pin | `/tr/pinterest-pin-indir` | P2 | pinterest pin indir | Pinterest Pin İndir — Linkten Video, Fotoğraf ve GIF Kaydet (59) | Tek bir Pinterest Pin linkini yapıştırın; fotoğrafı, MP4 videoyu, GIF'i ya da karusel Pininin tüm kartlarını indirin. pin.it kısa linkleri de çalışır. (150) | Pinterest Pin İndir |
| video | `/tr/pinterest-video-indir` | P1 | pinterest video indir | Pinterest Video İndir — HD MP4, Filigransız ve Ücretsiz (55) | Pinterest video indir: video Pininin linkini yapıştırın, HD MP4 dosyasını filigran eklemeden kaydedin. pin.it linki de olur; uygulama ve üyelik gerekmez. (153) | Pinterest Video İndir |
| image | `/tr/pinterest-fotograf-indir` | P1 | pinterest fotoğraf indir | Pinterest Fotoğraf İndir — HD Resim ve Duvar Kağıdı Kaydet (58) | Pinterest fotoğraf ve resimlerini en büyük boyutuyla indirin. Duvar kağıdı, çizim ya da tarif görseli fark etmez: linki yapıştırın, HD JPG'yi kaydedin. (151) | Pinterest Fotoğraf İndir |
| gif | `/tr/pinterest-gif-indir` | P2 | pinterest gif indir | Pinterest GIF İndir — Hareketli GIF'leri Ücretsiz Kaydet (56) | Pinterest GIF'lerini hareketi bozulmadan indirin. GIF Pininin linkini yapıştırın, döngüyü kaydedin; üyelik ve filigran yok, telefonda ve PC'de çalışır. (151) | Pinterest GIF İndir |
| board | `/tr/pinterest-pano-indir` | P2 | pinterest pano indirme | Pinterest Pano İndirme — Tüm Panoyu ZIP Olarak Kaydet (53) | Herkese açık bir Pinterest panosunun linkini yapıştırın, pinleri tek ZIP dosyasında toplu indirin. Fotoğraflar ve videolar birlikte gelir; üyelik gerekmez. (155) | Pinterest Pano İndirme |
| profile | `/tr/pinterest-profil-indir` | P3 | pinterest profil indir | Pinterest Profil İndir — Tüm Pinleri ZIP Olarak Kaydet (54) | Herkese açık bir Pinterest profilindeki pinleri fotoğraf ve videolarıyla tek ZIP dosyasında indirin. Profil linkini yapıştırmanız yeterli; giriş gerekmez. (154) | Pinterest Profil İndir |
| profile-picture | `/tr/pinterest-profil-fotografi-indir` | P2 | pinterest profil fotoğrafı indir | Pinterest Profil Fotoğrafı İndir — PP'yi Tam Boy ve HD Gör (58) | Pinterest profil fotoğrafını (PP) tam boyutta görün ve indirin. Herkese açık profil linkini yapıştırın, en büyük resmi kaydedin; giriş yok, filigran yok. (153) | Pinterest Profil Fotoğrafı İndir |
| audio (gated Q1) | `/tr/pinterest-mp3-donusturucu` | P2 | pinterest mp3 dönüştürücü | Pinterest MP3 Dönüştürücü — Video Pininin Sesini İndir (54) | Herkese açık Pinterest video Pininin sesini indirin: linki yapıştırın, ses dosyasını kaydedin. Ücretsiz ve üyeliksiz; yalnızca hakkınız olan sesleri saklayın. (158) | Pinterest MP3 Dönüştürücü |
| 4k* (gated Q2) | `/tr/pinterest-4k-video-indir` | P2 | pinterest 4k video indir | Pinterest'te 4K Video Var mı? Gerçek Kaliteyi MP4 İndir (55) | Pinterest videoları çoğunlukla 720p, bazen 1080p yayınlanır; 4K nadirdir. Pinin sunduğu en yüksek kaliteyi MP4 olarak indirin, sahte 4K üretmeyiz. (146) | Pinterest'te 4K Var mı? |
| to-mp4 | `/tr/pinterest-mp4-donusturucu` | P2 | pinterest mp4 dönüştürücü | Pinterest MP4 Dönüştürücü — Pin Linkini MP4'e Çevir (51) | Pinterest video linkini MP4 dosyasına dönüştürün. Herkese açık Pin linkini yapıştırın, her telefonda ve PC'de oynayan MP4'ü indirin; üyelik ve filigran yok. (156) | Pinterest MP4 Dönüştürücü |
| how-to | `/tr/pinterestten-video-nasil-indirilir` | P1 | pinterestten video nasıl indirilir | Pinterest'ten Video Nasıl İndirilir? Telefon ve PC Rehberi (58) | Pinterest'ten video nasıl indirilir? Uygulamada Paylaş → Bağlantıyı kopyala, linki yapıştır, MP4'ü kaydet. iPhone, Android ve PC için adım adım anlatım. (152) | Pinterest'ten Video Nasıl İndirilir? |
| gallery | `/tr/pinterest-video-galeriye-kaydetme` | P1 | pinterest video galeriye kaydetme | Pinterest Video Galeriye Kaydetme — iPhone ve Android Rehberi (61) | Pinterest videosunu galeriye kaydetme: linki kopyalayın, MP4'ü indirin, Fotoğraflar'a ya da Galeri'ye kaydedin. Video galeriye gelmiyorsa çözümü burada. (152) | Pinterest Video Galeriye Kaydetme |
| laptop | `/tr/pinterest-video-indir-pc` | P2 | pinterest video indir pc | Pinterest Video İndir PC — Bilgisayara ve Laptopa MP4 Kaydet (60) | Pinterest videolarını Windows PC, Mac veya laptopa indirin. Tarayıcıda Pin linkini kopyalayıp yapıştırın; MP4 İndirilenler klasörüne iner. Program kurmak yok. (158) | Pinterest Video İndir: PC ve Laptop |
| iphone-android | `/tr/pinterest-video-indir-iphone-android` | P1 | pinterest video indir iphone | Pinterest Video İndir iPhone ve Android — Uygulamasız MP4 (57) | iPhone'da Safari, Android'de Chrome ile Pinterest videosunu telefona indirin: Bağlantıyı kopyala'ya dokunun, linki yapıştırın, MP4'ü kaydedin. Uygulama yok. (156) | Pinterest Video İndir: iPhone ve Android |

### vi: Tiếng Việt (release A)

| page | path | P | primary keyword | title (len) | description (len) | H1 |
|---|---|---|---|---|---|---|
| home | `/vi` | P1 | pinterest downloader | Pinterest Downloader: tải video, ảnh, GIF \| PintDownload (56) | Pinterest downloader miễn phí: tải video MP4, ảnh, GIF, cả bảng và hồ sơ công khai về điện thoại, máy tính. Không đăng nhập, không cài app, không chèn logo. (156) | Tải video, ảnh, GIF từ Pinterest |
| pin | `/vi/tai-ghim-pinterest` | P2 | tải ghim pinterest | Tải Ghim Pinterest bằng link: ảnh, video, GIF miễn phí (54) | Tải Ghim Pinterest bằng link, kể cả link pin.it: ảnh nét, video MP4, GIF hoặc từng ảnh trong Ghim nhiều ảnh. Miễn phí, không cần đăng nhập, không cài app. (154) | Tải Ghim Pinterest bằng link |
| video | `/vi/tai-video-pinterest` | P1 | tải video pinterest | Tải video Pinterest không logo, MP4 HD miễn phí (47) | Dán link Ghim video để tải video Pinterest về máy dạng MP4, bản HD nét nhất Pinterest có (thường 720p, có khi 1080p). Không chèn logo, không cần đăng nhập. (155) | Tải video Pinterest |
| image | `/vi/tai-anh-pinterest` | P1 | tải ảnh pinterest | Tải ảnh Pinterest chất lượng cao, không bị mờ, miễn phí (55) | Tải ảnh Pinterest cỡ lớn nhất Pinterest cung cấp, không phải ảnh thu nhỏ bị mờ. Dán link Ghim là xong, hợp lưu hình nền, ảnh tham khảo. Không cần đăng nhập. (156) | Tải ảnh Pinterest chất lượng cao |
| gif | `/vi/tai-gif-pinterest` | P2 | tải gif pinterest | Tải GIF Pinterest: lưu ảnh động, giữ nguyên chuyển động (55) | Tải GIF Pinterest đúng định dạng .gif, ảnh động vẫn chuyển động, không thành ảnh tĩnh. Dán link Ghim GIF, dùng được trên điện thoại, máy tính. Miễn phí. (152) | Tải GIF Pinterest |
| board | `/vi/tai-bang-pinterest` | P2 | tải bảng pinterest | Tải bảng Pinterest: toàn bộ ảnh, video về một file ZIP (54) | Tải bảng Pinterest công khai: toàn bộ ảnh, video gom vào một file ZIP, hoặc tải từng Ghim. Miễn phí, không cần đăng nhập, dùng được cả trên điện thoại. (151) | Tải bảng Pinterest |
| profile | `/vi/tai-ho-so-pinterest` | P3 | tải hồ sơ pinterest | Tải hồ sơ Pinterest: lưu Ghim công khai về file ZIP (51) | Tải hồ sơ Pinterest công khai: ảnh, video đang hiển thị trên hồ sơ gom vào một file ZIP. Miễn phí, không cần đăng nhập. Hồ sơ riêng tư không hỗ trợ. (148) | Tải hồ sơ Pinterest |
| profile-picture | `/vi/tai-avatar-pinterest` | P2 | tải avatar pinterest | Tải avatar Pinterest: xem, lưu ảnh đại diện cỡ lớn nhất (55) | Tải avatar Pinterest từ link hồ sơ công khai: xem ảnh đại diện phóng to, lưu bản lớn nhất Pinterest có thay vì ảnh nhỏ trong app. Miễn phí, không đăng nhập. (156) | Tải avatar Pinterest |
| audio (gated Q1) | `/vi/tai-nhac-pinterest` | P2 | tải nhạc pinterest | Tải nhạc Pinterest: tách âm thanh từ video ra MP3 (49) | Tải nhạc Pinterest dạng MP3 từ Ghim video có tiếng, hoặc giữ cả video MP4. Có thể cắt lấy một đoạn ngắn. Miễn phí, chỉ dùng âm thanh bạn có quyền sử dụng. (154) | Tải nhạc từ video Pinterest |
| 4k* (gated Q2) | `/vi/tai-video-pinterest-4k` | P3 | tải video pinterest 4k | Tải video Pinterest 4K được không? Chất lượng thật (50) | Tải video Pinterest 4K? Pinterest hiếm khi có 4K: thường 720p, có khi 1080p; ảnh rộng khoảng 1200px. Ở đây bạn lấy bản nét nhất có thật, không ghi 4K giả. (154) | Tải video Pinterest 4K được không? |
| to-mp4 | `/vi/chuyen-video-pinterest-sang-mp4` | P3 | chuyển video pinterest sang mp4 | Chuyển video Pinterest sang MP4 online, miễn phí (48) | Chuyển video Pinterest sang MP4 bằng link Ghim: file phát được trên mọi điện thoại, máy tính, giữ tiếng nếu video gốc có. Không cần đăng ký, không chèn logo. (157) | Chuyển video Pinterest sang MP4 |
| chrome | `/vi/tai-video-pinterest-tren-chrome` | P3 | tải video pinterest trên chrome | Tải video Pinterest trên Chrome, không cần cài tiện ích (55) | Tải video Pinterest trên Chrome bằng bookmarklet: kéo nút lên thanh dấu trang, mở Ghim trên pinterest.com, bấm một lần. Không cài tiện ích, không đăng nhập. (156) | Tải video Pinterest trên Chrome |
| how-to | `/vi/cach-tai-video-pinterest` | P1 | cách tải video trên pinterest | Cách tải video trên Pinterest: 3 bước, không cần cài app (56) | Cách tải video trên Pinterest về điện thoại, máy tính: sao chép liên kết Ghim, dán vào PintDownload, lưu MP4. Có cách xử lý video mờ, mất tiếng. (144) | Cách tải video trên Pinterest |
| gallery | `/vi/luu-video-pinterest-vao-thu-vien-anh` | P2 | lưu video pinterest vào thư viện ảnh | Lưu video Pinterest vào thư viện ảnh, album điện thoại (54) | Lưu video Pinterest vào thư viện ảnh: app Ảnh trên iPhone, Bộ sưu tập trên Samsung hay Google Photos. Tải MP4 bằng trình duyệt rồi lưu vào máy, không cần app. (158) | Lưu video Pinterest vào thư viện ảnh |
| laptop | `/vi/tai-video-pinterest-ve-may-tinh` | P1 | tải video pinterest về máy tính | Tải video Pinterest về máy tính, laptop, MacBook (48) | Tải video Pinterest về máy tính Windows, laptop hay MacBook chỉ bằng trình duyệt, không cần phần mềm, tiện ích hay đăng nhập. File MP4 vào thư mục Tải xuống. (157) | Tải video Pinterest về máy tính |
| iphone-android | `/vi/tai-video-pinterest-ve-dien-thoai` | P1 | tải video pinterest về điện thoại | Tải video Pinterest về điện thoại iPhone, Android (49) | Tải video Pinterest về điện thoại iPhone, Samsung, Android bằng Safari hoặc Chrome, không cần app: sao chép liên kết Ghim, dán vào PintDownload, lưu vào Ảnh. (157) | Tải video Pinterest về điện thoại |

### ru: Русский (release B)

| page | path | P | primary keyword | title (len) | description (len) | H1 |
|---|---|---|---|---|---|---|
| home | `/ru` | P1 | скачать с пинтереста | Скачать с Пинтереста по ссылке — видео, фото и GIF онлайн (57) | Скачайте видео MP4, фото и GIF с Pinterest по ссылке на пин или pin.it. Бесплатно, без регистрации и Telegram-ботов, прямо в браузере телефона или ПК. (150) | Скачать с Pinterest |
| pin | `/ru/skachat-pin-s-pinterest` | P2 | скачать пин с пинтереста | Скачать пин с Пинтереста по ссылке — фото, видео или GIF (56) | Вставьте ссылку на публичный пин (pinterest.com/pin/… или pin.it) и скачайте фото, видео MP4, GIF или все фото из карусели. Бесплатно, без регистрации. (151) | Скачать пин с Pinterest |
| video | `/ru/skachat-video-s-pinterest` | P1 | скачать видео с пинтереста | Скачать видео с Пинтереста по ссылке — MP4 без водяного знака (61) | Скачайте видео с Pinterest в MP4 по ссылке на пин или pin.it: со звуком и в лучшем доступном качестве. Водяной знак не добавляем. Бесплатно, без регистрации. (157) | Скачать видео с Pinterest |
| image* | `/ru/skachat-foto-s-pinterest` | P1 | скачать фото с пинтереста | Скачать фото с Пинтереста в хорошем качестве — по ссылке (56) | Скачайте фото и картинки с Pinterest в максимальном размере, а не миниатюру: вставьте ссылку на пин и сохраните JPG или PNG. Бесплатно и без регистрации. (153) | Скачать фото с Pinterest |
| gif | `/ru/skachat-gif-s-pinterest` | P2 | скачать гиф с пинтереста | Скачать гиф с Пинтереста по ссылке — анимированные GIF (54) | Сохраните гифку с Pinterest по ссылке на пин: GIF остаётся анимированным, а не превращается в стоп-кадр. Работает на телефоне и компьютере, без приложений. (155) | Скачать GIF с Pinterest |
| board | `/ru/skachat-dosku-pinterest` | P2 | скачать доску пинтерест | Скачать доску Пинтерест целиком — все пины в ZIP-архиве (55) | Скачайте публичную доску Pinterest полностью: вставьте ссылку на доску, и мы соберём доступные фото и видео в один ZIP-архив. Бесплатно, без регистрации. (153) | Скачать доску Pinterest |
| profile-picture | `/ru/skachat-avatarku-s-pinterest` | P3 | скачать аватарку с пинтереста | Скачать аватарку с Пинтереста в полном размере — онлайн (55) | Посмотрите и скачайте аватарку (фото профиля) пользователя Pinterest в полном размере, а не крошечную миниатюру. Нужна только ссылка на публичный профиль. (154) | Скачать аватарку с Pinterest |
| how-to | `/ru/kak-skachat-video-s-pinterest` | P1 | как скачать видео с пинтереста | Как скачать видео с Пинтереста: на телефон и компьютер (54) | Пошаговая инструкция: как скопировать ссылку на видео в Pinterest, скачать MP4 и найти файл на Android, iPhone, Windows или Mac. Без приложений и ботов. (152) | Как скачать видео с Pinterest |
| gallery | `/ru/kak-sohranit-video-s-pinterest-v-galereyu` | P1 | как сохранить видео с пинтереста в галерею | Как сохранить видео с Пинтереста в галерею телефона (51) | Как сохранить видео с Pinterest в галерею на Android и в «Фото» на iPhone: скопируйте ссылку, скачайте MP4 и найдите ролик. Без Telegram-ботов и приложений. (156) | Как сохранить видео с Pinterest в галерею |
| laptop | `/ru/kak-skachat-video-s-pinterest-na-kompyuter` | P2 | как скачать видео с пинтереста на компьютер | Как скачать видео с Пинтереста на компьютер, ПК и ноутбук (57) | Скачайте видео с Pinterest на компьютер с Windows, Mac или Chromebook: скопируйте адрес пина в браузере, вставьте ссылку и сохраните MP4 в «Загрузки». (150) | Как скачать видео с Pinterest на компьютер |
| iphone-android | `/ru/skachat-video-s-pinterest-na-iphone-i-android` | P2 | скачать видео с пинтерест на айфон | Скачать видео с Пинтереста на айфон и андроид по ссылке (55) | Как скачать видео с Pinterest на iPhone (через «Файлы» в «Фото») и на Android (в галерею): скопируйте ссылку на пин, вставьте её и сохраните MP4. (145) | Видео с Pinterest на iPhone и Android |

### th: ไทย (release B)

| page | path | P | primary keyword | title (len) | description (len) | H1 |
|---|---|---|---|---|---|---|
| home* | `/th` | P1 | ดาวน์โหลด pinterest | ดาวน์โหลด Pinterest ฟรี วิดีโอ รูป ไม่มีลายน้ำ \| PintDownload (61) | เว็บโหลด Pinterest ฟรี วางลิงก์แล้วเซฟวิดีโอเป็น MP4 รูปขนาดใหญ่สุด GIF หรือโหลดทั้งบอร์ดเป็น ZIP ไม่ต้องล็อกอิน ไม่ต้องลงแอป ใช้ได้ทั้งมือถือและคอม (148) | ดาวน์โหลด Pinterest |
| pin* | `/th/pinterest-pin-downloader` | P3 | โหลดพิน pinterest | โหลดพิน Pinterest จากลิงก์ ได้ทั้งรูป วิดีโอ GIF ฟรี (52) | วางลิงก์พิน Pinterest หรือลิงก์สั้น pin.it แล้วโหลดพินนั้นได้ทันที ทั้งรูปขนาดใหญ่สุด วิดีโอ MP4 GIF และพินหลายรูปครบทุกภาพ ฟรี ไม่ต้องล็อกอิน (142) | โหลดพิน Pinterest |
| video | `/th/pinterest-video-downloader` | P1 | โหลดวิดีโอ pinterest | โหลดวิดีโอ Pinterest ฟรี เป็น MP4 ไม่มีลายน้ำ ไม่ต้องลงแอป (58) | โหลดวิดีโอและคลิป Pinterest เป็นไฟล์ MP4 ฟรี แค่วางลิงก์พินหรือ pin.it ไม่มีลายน้ำ ไม่ต้องล็อกอิน เซฟลงเครื่องได้ทั้ง iPhone, Android และคอม (140) | โหลดวิดีโอ Pinterest |
| image* | `/th/pinterest-image-downloader` | P1 | โหลดรูป pinterest | โหลดรูป Pinterest ฟรี เซฟรูปขนาดใหญ่สุด ไม่ใช่รูปย่อ (52) | โหลดรูปจาก Pinterest ขนาดใหญ่สุดที่ Pinterest เปิดให้โหลด ไม่ใช่รูปย่อ วางลิงก์พินแล้วเซฟลงมือถือ ไอแพด หรือคอมได้เลย ฟรี ไม่ต้องล็อกอิน ไม่มีลายน้ำ (148) | โหลดรูป Pinterest |
| gif | `/th/pinterest-gif-downloader` | P2 | โหลด gif pinterest | โหลด GIF Pinterest ฟรี เซฟภาพเคลื่อนไหวให้ยังขยับ (49) | โหลด GIF และภาพเคลื่อนไหวจาก Pinterest ให้ยังขยับเหมือนเดิม ไม่กลายเป็นภาพนิ่ง วางลิงก์พิน GIF แล้วเซฟลงมือถือหรือคอม ฟรี ไม่ต้องล็อกอิน (136) | โหลด GIF Pinterest |
| board | `/th/pinterest-board-downloader` | P2 | โหลดบอร์ด pinterest | โหลดบอร์ด Pinterest ทั้งบอร์ดเป็น ZIP ฟรี ไม่ต้องล็อกอิน (56) | โหลดรูปและวิดีโอทั้งบอร์ด Pinterest ในครั้งเดียว วางลิงก์บอร์ดสาธารณะแล้วรับไฟล์ ZIP ไฟล์เดียว ไม่ต้องเซฟทีละรูป ฟรี ไม่ต้องล็อกอิน (131) | โหลดบอร์ด Pinterest |
| profile-picture | `/th/pinterest-profile-picture-downloader` | P3 | โหลดรูปโปรไฟล์ pinterest | โหลดรูปโปรไฟล์ Pinterest ขนาดเต็ม ดูรูปโปรไฟล์แบบเต็มรูป (56) | ดูและโหลดรูปโปรไฟล์ของบัญชี Pinterest สาธารณะแบบเต็มรูป ขนาดใหญ่ที่สุดที่ Pinterest มี วางลิงก์โปรไฟล์แล้วเซฟได้เลย ฟรี ไม่ต้องล็อกอิน (134) | โหลดรูปโปรไฟล์ Pinterest |
| audio (gated Q1) | `/th/pinterest-audio-downloader` | P3 | โหลดเสียง pinterest | โหลดเสียง Pinterest ดึงเสียงจากวิดีโอพิน ฟรี ไม่ต้องล็อกอิน (59) | ดึงเสียงเพลงหรือเสียงพูดจากวิดีโอพิน Pinterest สาธารณะ ตัดเฉพาะท่อนที่ต้องการแล้วเซฟเป็นไฟล์เสียง ฟรี ไม่ต้องล็อกอิน ใช้เฉพาะเสียงที่มีสิทธิ์ใช้ (144) | โหลดเสียง Pinterest |
| 4k (gated Q2) | `/th/pinterest-hd-downloader` | P2 | โหลดรูป pinterest ให้ชัด | โหลดรูป Pinterest ให้ชัด ได้ความละเอียดสูงสุดที่มีจริง (54) | รูปจาก Pinterest ไม่ชัด? วางลิงก์พินแล้วรับไฟล์ใหญ่ที่สุดที่ Pinterest เก็บไว้ ทั้งรูปและวิดีโอ ไม่ใช่รูปย่อ ไม่บีบอัดซ้ำ และไม่อ้าง 4K ถ้าต้นฉบับไม่ใช่ (152) | โหลดรูป Pinterest ให้ชัด |
| chrome | `/th/pinterest-video-downloader-chrome` | P3 | ส่วนขยาย chrome โหลด pinterest | ส่วนขยาย Chrome โหลด Pinterest? ใช้บุ๊กมาร์กเล็ตแทน ฟรี (55) | อยากได้ส่วนขยาย Chrome ไว้โหลด Pinterest? ใช้บุ๊กมาร์กเล็ตแทน ลากไปไว้ที่แถบบุ๊กมาร์ก แล้วกดครั้งเดียวบนหน้าพิน บอร์ด หรือโปรไฟล์ ไม่ต้องติดตั้งอะไร (148) | โหลด Pinterest บน Chrome |
| how-to | `/th/how-to-download-pinterest-videos` | P2 | วิธีโหลดวิดีโอ pinterest | วิธีโหลดวิดีโอ Pinterest ทีละขั้นตอน บนมือถือและคอม ฟรี (55) | สอนวิธีโหลดวิดีโอ Pinterest ทีละขั้น ตั้งแต่คัดลอกลิงก์ในแอปจนได้ไฟล์ MP4 ในเครื่อง ใช้ได้ทั้ง iPhone, Android, ไอแพด และคอม ฟรี ไม่ต้องลงแอปเพิ่ม (146) | วิธีโหลดวิดีโอ Pinterest |
| laptop | `/th/how-to-download-pinterest-video-on-laptop` | P2 | โหลดวิดีโอ pinterest ลงคอม | โหลดวิดีโอ Pinterest ลงคอม Windows และ Mac ฟรี ทีละขั้นตอน (58) | สอนโหลดวิดีโอ Pinterest ลงคอมและโน้ตบุ๊ก ทั้ง Windows, Mac และ Chromebook คัดลอกลิงก์จากแถบที่อยู่ วางในช่อง แล้วได้ไฟล์ MP4 ฟรี ไม่ต้องลงโปรแกรม (145) | โหลดวิดีโอ Pinterest ลงคอม |
| iphone-android | `/th/download-pinterest-videos-iphone-android` | P2 | โหลดวิดีโอ pinterest iphone | โหลดวิดีโอ Pinterest ลง iPhone และ Android เข้าอัลบั้มได้เลย (60) | โหลดวิดีโอ Pinterest ลง iPhone, ไอแพด และ Android ผ่าน Safari หรือ Chrome ไม่ต้องลงแอปเพิ่ม พร้อมวิธีย้ายไฟล์เข้าอัลบั้มรูปหรือแกลเลอรี่เมื่อวิดีโอไม่ขึ้น (154) | โหลดวิดีโอ Pinterest ลงมือถือ |

### ar: العربية (release C)

| page | path | P | primary keyword | title (len) | description (len) | H1 |
|---|---|---|---|---|---|---|
| home | `/ar` | P1 | تحميل من بنترست | تحميل من بنترست: فيديو وصور وGIF مجانًا \| PintDownload (54) | حمّل فيديوهات وصور وGIF ولوحات بنترست العامة بلصق الرابط فقط. مجانًا وبدون حساب أو برامج، ولا نضيف أي علامة مائية. يعمل على الجوال والكمبيوتر. (142) | تحميل من بنترست |
| pin | `/ar/pinterest-pin-downloader` | P2 | تحميل من رابط بنترست | تحميل من رابط بنترست: الصق رابط المنشور واحفظه \| PintDownload (61) | انسخ رابط أي منشور عام من بنترست أو رابط pin.it المختصر والصقه هنا، واحفظ الفيديو أو الصورة أو GIF أو كل صور المنشور. مجانًا وبدون حساب. (136) | تحميل من رابط بنترست |
| video | `/ar/pinterest-video-downloader` | P1 | تحميل فيديو من بنترست | تحميل فيديو من بنترست بدون علامة مائية MP4 \| PintDownload (57) | حمّل فيديو من بنترست بصيغة MP4 بأعلى جودة متاحة (720p أو 1080p حسب المصدر). الصق الرابط فقط، بدون برامج أو حساب، ولا نضيف أي علامة مائية. (137) | تحميل فيديو من بنترست |
| image | `/ar/pinterest-image-downloader` | P1 | تحميل صور من بنترست | تحميل صور من بنترست بجودة عالية وبدون حساب \| PintDownload (57) | حمّل صور بنترست بأكبر حجم يتيحه بنترست للعامة، وليس الصورة المصغرة. الصق رابط المنشور واحفظ الصورة في الاستديو أو على الكمبيوتر، مجانًا وبدون حساب. (147) | تحميل صور من بنترست |
| gif | `/ar/pinterest-gif-downloader` | P2 | تحميل gif من بنترست | تحميل GIF من بنترست: صور متحركة تبقى متحركة \| PintDownload (58) | حمّل صور GIF المتحركة من بنترست كملف GIF حقيقي لا يتحول إلى صورة ثابتة. الصق رابط المنشور واحفظ الصورة المتحركة على جوالك أو الكمبيوتر مجانًا. (142) | تحميل GIF من بنترست |
| board | `/ar/pinterest-board-downloader` | P2 | تحميل جميع صور لوحة بنترست | تحميل جميع صور لوحة بنترست دفعة واحدة (ZIP) \| PintDownload (58) | حمّل جميع صور وفيديوهات لوحة بنترست العامة دفعة واحدة في ملف ZIP. الصق رابط اللوحة ونجمع لك منشوراتها العامة. مجانًا، ولا يعمل مع اللوحات السرية. (145) | تحميل لوحة بنترست كاملة |
| profile-picture | `/ar/pinterest-profile-picture-downloader` | P3 | تحميل صورة بروفايل بنترست | تحميل صورة بروفايل بنترست بأكبر حجم متاح \| PintDownload (55) | اعرض صورة الملف الشخصي لأي حساب عام على بنترست بحجم أكبر واحفظها على جهازك. الصق رابط الحساب فقط، بدون تسجيل دخول وبدون تطبيق. مجانًا. (134) | تحميل صورة بروفايل بنترست |
| 4k (gated Q2) | `/ar/pinterest-4k-downloader` | P2 | تحميل من بنترست بدقة عالية | تحميل من بنترست بدقة عالية: هل يوجد 4K فعلًا؟ (45) | نحمّل لك أعلى دقة ينشرها بنترست فعلًا: فيديو 720p أو 1080p وصور حتى 1200 بكسل عرضًا. لا نرفع الدقة صناعيًا ولا نعد بـ4K غير موجود. جرّب برابطك. (143) | تحميل من بنترست بدقة عالية |
| to-mp4 | `/ar/pinterest-to-mp4` | P3 | تحويل رابط بنترست إلى فيديو | تحويل رابط بنترست إلى فيديو MP4 مجانًا \| PintDownload (53) | حوّل رابط منشور فيديو من بنترست إلى ملف MP4 تشغّله على أي جهاز وبدون إنترنت. الصق الرابط واختر الجودة واحفظ الملف، مجانًا وبدون برامج أو حساب. (142) | تحويل رابط بنترست إلى فيديو MP4 |
| how-to | `/ar/how-to-download-pinterest-videos` | P1 | طريقة تحميل فيديو من بنترست | طريقة تحميل فيديو من بنترست بدون علامة مائية (خطوة بخطوة) (57) | شرح طريقة تحميل فيديو من بنترست على الآيفون والأندرويد والكمبيوتر: انسخ الرابط من زر المشاركة، الصقه في الأداة، واحفظ MP4 في الاستديو. بدون برامج. (146) | طريقة تحميل فيديو من بنترست |
| gallery | `/ar/how-to-download-pinterest-video-in-gallery` | P1 | حفظ فيديو من بنترست في الاستديو | حفظ فيديو من بنترست في الاستديو أو المعرض بدون برامج (52) | خطوات حفظ فيديو بنترست في الاستديو على سامسونج وأندرويد أو في تطبيق الصور على الآيفون، وماذا تفعل إذا نزل الفيديو ولم يظهر في الاستديو. مجانًا. (143) | حفظ فيديو بنترست في الاستديو |
| laptop | `/ar/how-to-download-pinterest-video-on-laptop` | P3 | تحميل الفيديو من بنترست للكمبيوتر | تحميل فيديو من بنترست للكمبيوتر واللابتوب بدون برامج (52) | حمّل فيديوهات وصور بنترست على الكمبيوتر أو اللابتوب (ويندوز وماك وكروم بوك) من المتصفح مباشرة، بدون تثبيت برنامج بنترست أو أي إضافة. مجانًا. (140) | تحميل فيديو من بنترست للكمبيوتر |
| iphone-android | `/ar/download-pinterest-videos-iphone-android` | P2 | تحميل فيديو من بنترست على الايفون | تحميل فيديو من بنترست على الآيفون والأندرويد بدون برامج (55) | حمّل فيديو بنترست على الآيفون من Safari واحفظه في الصور عبر تطبيق الملفات، أو على الأندرويد من Chrome إلى الاستديو. بدون تطبيقات وبدون علامة مائية. (147) | تحميل فيديو بنترست على الآيفون والأندرويد |

## 4. Cross-check results and fixes

Checked by `tools/build_plan.py` (re-run: `python3 -I tools/build_plan.py . ../viralnest && python3 -I tools/sections.py .` from this folder; rules in `i18n-plan.json` → `validation.rules`):

- title 40–62 and description 120–158 code points after NFC (seo_health_check.py optimal band; zod schema will enforce the same)
- H1 ≤ 60 chars; no < or >; no glyphs missing from Big Shoulders (→ ẞ Ÿ U+202F)
- slug lowercase ASCII kebab-case, not reserved, unique per locale; full path never equals an English route, astro redirect source or public/ file; locale prefixes collide with nothing
- title, description, H1, slug and primary keyword unique within a locale
- honesty: no 4K outside the gated explainer (whose H1 must ask, not promise); no "original size/resolution"; no unconditional 1080p/Full HD; MP3 only on gated audio pages
- glossary: board term present on board page; banned variants (de Pinwände/Sie, ar misspellings, th วีดีโอ, id Anda, …) absent

**Result: 0 errors after fixes.** Problems found in the research rows (by the script or by review) and fixed in the table below: 8 pages claimed "original" or "full" image size although images are the 1200px public copy (fr image and 4K, it image, ru image, id image, th home, pin and image); 3 pages promised 4K or Full HD in the title or H1 (pt, tr, vi 4K pages; tr also claimed "4K if uploaded in 4K", which the extractor never returns); 1 title carried a hard-coded year (pt how-to); 1 home slug was malformed (de). No duplicate slugs, titles, descriptions, H1s or primary keywords within any locale. No slug collides with an English route, an astro redirect source or a `public/` file, and no locale prefix collides with anything. Every board page uses its glossary term, and no banned glossary variant appears. All 166 rows also pass the repo’s own `seo_health_check.check_html_file` on mock page heads (0 errors, 0 warnings).

Changes made to the research:

| locale | page | field | was | now | why |
|---|---|---|---|---|---|
| pt | 4k | title | Baixar Vídeo do Pinterest em Full HD (e a Verdade do 4K) | Vídeo do Pinterest em Full HD ou 4K? A Qualidade Real | honesty: "Baixar em Full HD" promised 1080p for every pin; most are 720p |
| pt | 4k | h1 | Vídeo do Pinterest em Full HD | Full HD ou 4K? A qualidade real | honesty: H1 must not promise Full HD |
| pt | how-to | title | Como Baixar Vídeo do Pinterest no Celular e no PC (2026) | Como Baixar Vídeo do Pinterest no Celular e no PC, sem App | hard-coded "(2026)" goes stale |
| fr | image | title | Télécharger une photo Pinterest en HD — taille originale | Télécharger une photo Pinterest en HD — grand format | honesty: images are served at the 1200px public size, not "taille originale" |
| fr | image | description | Enregistrez une photo ou une image Pinterest dans sa résolution d’origine, pas en miniature. Collez le lien de l’épingle : gratuit et sans compte Pinterest. | Enregistrez une photo ou une image Pinterest en grand format, pas en miniature. Collez le lien de l’épingle : gratuit et sans compte Pinterest. | honesty: "résolution d’origine" is false (1200px public copy) |
| fr | 4k | description | Pinterest diffuse rarement ses vidéos en 4K. PintDownload récupère la meilleure version publiée (souvent 720p ou 1080p) et les photos en taille d’origine. | Pinterest diffuse rarement ses vidéos en 4K. PintDownload récupère la meilleure version publiée (souvent 720p ou 1080p) et les photos en grand format public. | honesty: not the original size |
| de | home | slug | de |  | locale home has an empty slug (path is /<loc>) |
| it | image | description | Scarica foto e immagini da Pinterest nella risoluzione originale disponibile: incolla il link del Pin e salva il file JPG. Gratis e senza registrarsi. | Scarica foto e immagini da Pinterest nella massima risoluzione disponibile: incolla il link del Pin e salva il file JPG. Gratis e senza registrarsi. | honesty: not the original resolution |
| id | image | title | Download Foto Pinterest HD — Gambar Ukuran Asli, Gratis | Download Foto Pinterest HD — Ukuran Terbesar, Gratis | honesty: "ukuran asli" (original size) is false; images are the 1200px public copy |
| id | image | description | Download foto dan gambar Pinterest ukuran asli, bukan thumbnail yang pecah. Cocok untuk wallpaper dan referensi. Gratis, tanpa login, langsung ke galeri. | Download foto dan gambar Pinterest dalam ukuran terbesar yang tersedia, bukan thumbnail yang pecah. Cocok untuk wallpaper. Gratis, tanpa login. | honesty: "ukuran asli" (original size) is false |
| tr | 4k | title | Pinterest 4K ve HD Video İndir — Kaynak Kalitesinde MP4 | Pinterest'te 4K Video Var mı? Gerçek Kaliteyi MP4 İndir | honesty: old title/H1 promised 4K; the extractor serves 720p/1080p |
| tr | 4k | description | Pinterest videosunu Pinin sunduğu en yüksek kalitede indirin: 1080p varsa 1080p, 4K yüklendiyse 4K. Görüntüyü büyütüp sahte 4K üretmeyiz; MP4 olarak kaydedin. | Pinterest videoları çoğunlukla 720p, bazen 1080p yayınlanır; 4K nadirdir. Pinin sunduğu en yüksek kaliteyi MP4 olarak indirin, sahte 4K üretmeyiz. | honesty: old text claimed "4K yüklendiyse 4K", which the extractor never returns |
| tr | 4k | h1 | Pinterest 4K ve HD Video İndir | Pinterest'te 4K Var mı? | honesty: H1 must not promise 4K |
| vi | 4k | h1 | Video Pinterest 4K: chất lượng thật | Tải video Pinterest 4K được không? | honesty: H1 must ask, not promise 4K |
| ru | image | description | Скачайте фото и картинки с Pinterest в исходном размере, а не миниатюру: вставьте ссылку на пин и сохраните JPG или PNG. Бесплатно и без регистрации. | Скачайте фото и картинки с Pinterest в максимальном размере, а не миниатюру: вставьте ссылку на пин и сохраните JPG или PNG. Бесплатно и без регистрации. | honesty: not the original size |
| th | home | description | เว็บโหลด Pinterest ฟรี วางลิงก์แล้วเซฟวิดีโอเป็น MP4 รูปขนาดเต็ม GIF หรือโหลดทั้งบอร์ดเป็น ZIP ไม่ต้องล็อกอิน ไม่ต้องลงแอป ใช้ได้ทั้งมือถือและคอม | เว็บโหลด Pinterest ฟรี วางลิงก์แล้วเซฟวิดีโอเป็น MP4 รูปขนาดใหญ่สุด GIF หรือโหลดทั้งบอร์ดเป็น ZIP ไม่ต้องล็อกอิน ไม่ต้องลงแอป ใช้ได้ทั้งมือถือและคอม | honesty: "full size" -> "largest size" |
| th | image | title | โหลดรูป Pinterest ฟรี เซฟรูปขนาดเต็ม ไม่ใช่รูปย่อ | โหลดรูป Pinterest ฟรี เซฟรูปขนาดใหญ่สุด ไม่ใช่รูปย่อ | honesty: "full size" -> "largest size" |
| th | image | description | โหลดรูปจาก Pinterest ขนาดเต็มตามที่ผู้โพสต์อัปโหลดไว้ ไม่ใช่รูปย่อ วางลิงก์พินแล้วเซฟลงมือถือ ไอแพด หรือคอมได้เลย ฟรี ไม่ต้องล็อกอิน ไม่มีลายน้ำ | โหลดรูปจาก Pinterest ขนาดใหญ่สุดที่ Pinterest เปิดให้โหลด ไม่ใช่รูปย่อ วางลิงก์พินแล้วเซฟลงมือถือ ไอแพด หรือคอมได้เลย ฟรี ไม่ต้องล็อกอิน ไม่มีลายน้ำ | honesty: "full size as the poster uploaded it" is false (1200px public copy) |
| th | pin | description | วางลิงก์พิน Pinterest หรือลิงก์สั้น pin.it แล้วโหลดพินนั้นได้ทันที ทั้งรูปขนาดเต็ม วิดีโอ MP4 GIF และพินหลายรูปครบทุกภาพ ฟรี ไม่ต้องล็อกอิน | วางลิงก์พิน Pinterest หรือลิงก์สั้น pin.it แล้วโหลดพินนั้นได้ทันที ทั้งรูปขนาดใหญ่สุด วิดีโอ MP4 GIF และพินหลายรูปครบทุกภาพ ฟรี ไม่ต้องล็อกอิน | honesty: "full size" -> "largest size" |

Also normalized: the Italian research gave bare slugs, so every `it` path is now prefixed with `/it` (12 rows).

Writer warnings (not in title/description/H1, so not blocking):

- pt:pinterest-gif-downloader "original" refers to the original GIF file (original): acceptable, writer keeps it about the file, not resolution
- it:pinterest-gif-downloader "original" refers to the original GIF file (originale): acceptable, writer keeps it about the file, not resolution
- id:home lede says "ukuran asli": writer must rephrase as "largest available size"
- th:pinterest-4k-downloader lede says "ต้นฉบับ": writer must rephrase as "largest available size"

Planner decisions on page status: `id` story page skipped (format retired, English twin is 38 lines, the other 11 locales skip it); audio pages gated on Q1; 4K explainers gated on Q2. The tr audio row carries the researched no-MP3 fallback (`/tr/pinterest-video-sesi-indir`).

## 5. Skipped pages

| page | skipped in | main reason |
|---|---|---|
| profile | fr, it, nl, id, ru, th, ar | Little or no demand; "profile" queries mostly want the profile picture. FAQ on the board page. |
| profile-picture | it, nl | Local query means profile-picture ideas, not downloading one. |
| carousel | fr, it, nl, id, tr, vi, ru, th, ar | No local download demand (carousel queries are about making carousels). Folded into pin/image pages. |
| story | es, pt, fr, de, it, nl, id, tr, vi, ru, th, ar | Pinterest folded Idea Pins into regular Pins; "story" queries mean Instagram templates. Becomes an FAQ on video/pin pages. |
| audio | nl, ru, ar | Thin or English-only demand, and the MP3 is not real yet. |
| 4k | es, de, it, nl, id, ru | No honest page possible or no local-language demand; quality FAQ on the video page. |
| to-mp4 | nl, ru, th | Competes with the video page for the same query; MP4 becomes a section there. |
| chrome | it, nl, tr, ru, ar | Searchers want an installable extension (ours is a bookmarklet) or the term means something else; becomes a section of the PC guide. |
| seo-title | es, pt, fr, de, it, nl, id, tr, vi, ru, th, ar | `/api/generate-seo` only writes English; local queries often mean something else (lettering, headboards, board names). de draft kept for later. |
| gallery | th | Same search as the iPhone/Android page in Thai; merged there. |
| laptop | nl | No "laptop" demand; merged into the how-to guide. |
| iphone-android | nl | Searches do not split by phone; merged into the gallery guide. |

Per-locale reasons are in `i18n-plan.json` → `skipped[]`.

## 6. Architecture decisions

architecture.md (sections 1–16) is adopted as the build spec. The items below are the merged decisions plus planner amendments (marked AMEND).

- **urls:** English stays at the root. Locale prefix + native ASCII slugs, no trailing slash: /es, /es/descargar-videos-pinterest. th and ar keep the English slugs under their prefix (research: romanised Thai and Arabic-script slugs match nothing people type and encode badly when shared). de keeps the English slug for the Chrome page on purpose.
- **hreflang:** Language-only codes (es pt fr de it nl id tr vi ru th ar) plus en; x-default = English URL of the same pageId. <html lang> may be more specific (pt-BR). One generator, alternatesFor(pageId), feeds HTML <link> tags and sitemap xhtml:link; a test asserts they are equal. Only live (pageId, locale) pairs appear; gated and unreleased pages are absent from every cluster.
- **routing:** No Astro i18n config. src/i18n/routes.ts is the single source (PAGES, SLUGS, pathFor, routeForPath, alternatesFor, localeHome, localePagesOf). Three prerendered routes: src/pages/[locale]/index.astro, [locale]/[slug].astro, [locale]/404.astro (renamed to <loc>/404.html by an astro:build:done hook so Cloudflare serves it with status 404).
- **routeStatus:** AMEND: SLUGS entries carry a status (live | gated-audio | gated-4k) and LOCALE_META carries live: boolean. getStaticPaths, alternates, sitemap, nav, footer and the language menu use only live pages of live locales. This lets Releases A/B/C and the Q1/Q2 gates ship from one codebase without branches. Content JSON for gated pages may exist; it is simply not routed.
- **contentModel:** One JSON per (locale, pageId) in src/content/i18n/<loc>/<pageId>.json, validated by the zod schema in architecture.md §6.2 (title 40–62, description 120–158, H1 ≤ 60, no raw HTML, [[pageId|text]] internal links that fail the build when the target is not live in that locale, external links allowlisted to pinterest.com/help.pinterest.com). AMEND: schema adds .refine(s => s === s.normalize("NFC")) on every string (vi research: decomposed text breaks the length rule).
- **breadcrumb:** AMEND: localized breadcrumbs and BreadcrumbList JSON-LD use content nav.label, not title.split("—"). Titles are therefore free to use ":" or "|" as the research wrote them; no locale needs to force an em dash. English pages keep today’s behaviour.
- **jsonLd:** src/i18n/jsonld.ts: WebPage, SoftwareApplication (price 0, never aggregateRating), HowTo, FAQPage (only when visible), BreadcrumbList rooted at the locale home with LOCALE_META.homeLabel, Article with real datePublished/dateModified on guides; inLanguage = htmlLang on every entity; Organization @id shared with English; no WebSite/SearchAction on localized pages.
- **sitemap:** One sitemap.xml with xmlns:xhtml; every live localized URL once with the full alternate set; lastmod from content dateModified (never build date). indexnow.mjs reads the same entries. robots.txt unchanged.
- **templates:** HomePage.astro, ToolPage.astro, GuidePage.astro under src/components/i18n/. Shared components (TicketHero, HowToSteps, FaqSection, CompareTable, RelatedTools, BookmarkletGuide, FooterKeywordMatrix, AdSlot) gain optional ui/locale props whose defaults keep English HTML byte-identical apart from the head alternates and language menu. English .astro pages are not rewritten.
- **islands:** Typed catalogs src/i18n/island/<loc>.ts imported only by server templates; each page passes pickIsland(locale, variant) as a prop (≈4–7 KB raw). English defaults stay inline, so the English bundle does not grow and no locale string enters dist/_astro/*.js (post-build check). Plurals via Intl.PluralRules maps (ru one/few/many/other, ar zero…other). Route notices and StickyPasteBar resolve targets through a routes prop of the current locale. /api/extract gains an additive error code field only after mcp-server merges (parity fixtures updated in the same commit); until then localized pages show a localized generic error with the English server text as detail.
- **languageSelector:** Server-rendered LanguageMenu.astro (<details>, real <a hreflang lang> links, endonyms, no flags). Links go to the current page’s live alternate, else that locale’s home (no hreflang attribute then). No redirect or banner by IP, Accept-Language or cookie. src/lib/i18n.ts, i18n-client.ts, LanguageSelector.tsx and DownloaderForm’s preferred_lang code are deleted (their strings overclaim 1080p and contain errors flagged by de/it/ar/id/nl research). English blog/legal pages: the menu links to locale homes.
- **rtl:** Before any i18n work, one mechanical sweep converts physical Tailwind/CSS direction properties to logical ones, verified by zero pixel diff on 6 pages at 390/1440 light/dark. Then dir="rtl" on /ar, mirrored stub tear and stamp angle, rtl:-scale-x-100 on directional icons, swapped arrow-key handlers in carousels, <bdi>/dir="ltr" for URLs, code, pin.it, MP4, serial numbers; letter-spacing 0 for ar and th; Western digits (Intl.NumberFormat("ar",{numberingSystem:"latn"})). The URL input stays LTR; caret behaviour after paste is a QA item. Step illustrations with English text are replaced or captioned per locale.
- **fonts:** All headline faces self-hosted, subset, loaded only on their locale, one custom property --font-display switched by :lang(). Body text stays system-ui. Budgets (KB of headline font per page): latin locales 28.6, tr 54, vi 38, ru 25–51, th 43, ar 59. No → (U+2192) in any display string: use ›. de never types ẞ; fr uses U+00A0 (not U+202F) before : ; ? !; tr keeps brand names in <span lang="en"> so uppercase does not print PİNTEREST.

**Tests:**

- tests/seo-invariants.entry.ts: route-map rules (slug format, reserved words, uniqueness, no collision with English routes/redirect sources/public files, pathFor round-trip, no trailing slash); alternates identical across a cluster, include self + en + x-default, absolute URLs; content file ↔ SLUGS parity; schema parse; unique title/description per locale; internal links live in-locale; honesty regexes (4K outside the explainer, "original size" equivalents, unconditional 1080p/Full HD, MP3 while Q1 is open); catalog key-tree and {token} parity; plural categories complete; wrangler run_worker_first covers the deepest localized depth; hostRedirectUrl strips /es/ and /ar/x/.
- scripts/verify_seo_build_artifacts.py: expected hreflang set read from dist/.i18n-routes.json instead of the hard-coded {en, x-default}; localized money pages join the existing canonical/noindex/JSON-LD/aggregateRating checks.
- scripts/verify_i18n_build.py (new): <html lang>/dir, self canonical, reciprocal hreflang with identical sets, no alternate pointing at noindex/redirect/404, og:locale, JSON-LD inLanguage, in-locale internal links, English-leftover detector, per-locale 404.html present, sitemap == HTML alternates, island bundle isolation.
- scripts/seo_health_check.py: add errors for missing <html lang>, indexable page without self hreflang, and template markers in <title>.
- Live table (architecture.md §13.5): /es/ → 301 /es; /es/missing → 404 Spanish body; / with Accept-Language es-MX or CF-IPCountry MX is byte-identical English, no Vary; www → apex; sitemap validates.
- The planner validator (docs/i18n/tools/build_plan.py) is the seed of the content tests; its rules are listed under validation.rules.

## 7. Product issues found while cross-checking

| id | severity | finding | action |
|---|---|---|---|
| F1 | blocker for audio pages | The "MP3" is the MP4 video saved under a .mp3 name (DownloaderForm.tsx ~966 in the ZIP pack, ~1898 single-pin row); the trimmer exports WAV. Affects English too. | Q1. Until resolved, all 9 localized audio pages stay gated and the English ZIP should stop writing a fake .mp3. |
| F2 | high, all markets | The /api/extract host allowlist (main: src/pages/api/extract.ts:1104; being moved on mcp-server) only allows www/in/uk/br/id/jp/de/fr/es/it/ca/au subdomains. Desktop links from tr., nl., ru., pt., mx., at., ch., pl., se., ar. … .pinterest.com are rejected as invalid (verified in node). The client regex in DownloaderForm.tsx:431 is already permissive. | Phase 0b: after mcp-server merges, accept any two-letter country subdomain (^(www\.\|[a-z]{2}\.)?pinterest\.[a-z.]+) in the shared extractor, with tests and a parity-fixture note (only previously rejected inputs change). |
| F3 | honesty | English pinterest-4k-downloader promises "4K ultra quality" / "original uncompressed"; the image page and form hint say "original resolution", but pin-media serves the 1200px public copy and 720p/1080p video. These are the x-default/en twins of localized pages. | Q2 (English 4K page). The "original resolution" wording on the image page is a small copy fix recommended regardless. |
| F4 | build prerequisite | BaseLayout hard-codes lang="en", og:locale en_US, en-only alternates, the "Home" breadcrumb, nav/footer strings and latin-only font preloads; verify_seo_build_artifacts.py fails on any hreflang besides en/x-default. | Phase 2 infra builder (architecture.md §7, §13.2). |
| F5 | font | Big Shoulders latin subset lacks Ğ ğ İ Ş ş (tr), 102 of 146 Vietnamese letters, all Cyrillic/Thai/Arabic and →. Display line-height 0.88–0.9 clips accents (es pt fr de it), Vietnamese stacked marks, Thai and Arabic marks. | Phase 2 fonts builder; visual QA asserts no clipped marks. |
| F6 | market risk (ru) | Russian ISPs have throttled Cloudflare-fronted sites to ~16 KB per response since June 2025; no source says it ended. Big Shoulders has no Cyrillic. | ru ships in Release B anyway (Kazakhstan/Belarus unaffected, cost is low); after deploy, check with Yandex Webmaster’s server-response tool. Never mention VPNs in ru copy. |
| F7 | compliance (later) | German pages bring Impressum/privacy/consent expectations once ads run; vi forbids gambling ads. | Q4 for de. When an ad network is added, block gambling categories on /vi. |
| F8 | content quality | Existing client-side strings in src/lib/i18n.ts overclaim ("Full HD 1080p", "1080p HD") and contain errors (de "Pinwände" and Sie; ar "أنقش" for paste, "بوردات"; it "Scaricatore"; nl "HD-media uitpakken"; id "Mengekstrak"). | Deleted with the old switcher; new catalogs are written from the research glossaries. |
| F9 | copy | DownloaderForm shows the "Download MP4" CTA label on non-video variants in nl (research); island catalogs must key CTA labels by variant. | Phase 2 islands builder. |

## 8. Build workflow

### Phase 0: Gates

Owner: orchestrator.

- mcp-server is merged to main; branch i18n from that main (it touches wrangler.jsonc, llms.txt, seo-invariants, the extractor and /api/extract parity).
- Answers to the open questions recorded in i18n-plan.json (openQuestions[].answer).
- Phase 0b (one agent, separate small PR): F2 host allowlist; if Q1 = "make it real", the audio extraction change; English honesty copy fixes per Q2/F3.

### Phase 1: Logical-property sweep

Owner: 1 agent.

Owns: `class and CSS direction edits across src/**`; `src/styles/*.css direction properties`.

Done when: npm run build passes; zero pixel diff on 6 pages × 390/1440 × light/dark.

### Phase 2: Three parallel builders (exclusive file ownership)

| builder | owns | delivers |
|---|---|---|
| infra-routing | src/i18n/{locales,routes,schema,inline,jsonld}.ts; src/i18n/ui/en.ts (+ UiStrings type); src/content.config.ts; src/pages/[locale]/*; src/components/i18n/*; src/components/LanguageMenu.astro; src/layouts/BaseLayout.astro; src/components/TicketHero.astro (props only); src/components/seo/*; FooterKeywordMatrix.astro; AdSlot.astro; RelatedTools.astro; HowToSteps/FaqSection/CompareTable/BookmarkletGuide (optional props only); src/lib/seo.ts; src/pages/sitemap.xml.ts; astro.config.mjs (404 rename + .i18n-routes.json); scripts/indexnow.mjs; public/llms.txt (Languages section); tests/seo-invariants.entry.ts (i18n block); scripts/verify_seo_build_artifacts.py; scripts/verify_i18n_build.py; scripts/seo_health_check.py; delete src/lib/i18n.ts, i18n-client.ts, LanguageSelector.tsx | routes.ts SLUGS pre-filled from i18n-plan.json matrix (with status), LOCALE_META from locales[], the es pilot (home, video, board, gallery guide) with the es writer, English HTML snapshot diff limited to head alternates + language menu. |
| islands-strings | src/components/DownloaderForm.tsx; src/components/results/*; AudioTrimmer.tsx; ImageCropperModal.tsx; StickyPasteBar.tsx; TitleGenerator.tsx (remove i18n imports only); src/lib/pinterest-route.ts; src/i18n/island/en.ts + IslandMessages type + fmt/plural helpers; /api/extract additive code field + parity fixtures (only after mcp-server merge) | English behaviour and HTML identical; islands accept messages + routes props; per-variant CTA labels; bundle-isolation check green. |
| fonts-rtl | src/styles/ticket.css, results.css (font-face, :lang rules, RTL transforms); tailwind.config.mjs (fontFamily.display → var(--font-display)); public/fonts/** + licenses; scripts/fonts/build_script_fonts.py; src/i18n/fonts.ts; package.json devDependency @fontsource/sofia-sans-extra-condensed | Committed subset fonts; fontAssetsFor(locale) per the agreed stub signature; a test page showing Latin, tr, vi, ru, th, ar headlines at 390 and 1440. |

Contracts fixed before the builders start: PageContent zod schema (architecture.md §6.2 + NFC refine); UiStrings / IslandMessages key trees (en files published first); fontAssetsFor(locale): { preload: string[] }; routes prop: Partial<Record<PageId,string>> & { home: string }; route status vocabulary: live | gated-audio | gated-4k.

### Phase 3: Content writers (12 in parallel)

Owner: one writer per locale.

Owns: `src/content/i18n/<loc>/*.json`; `src/i18n/ui/<loc>.ts`; `src/i18n/island/<loc>.ts`.

Inputs:

- i18n-plan.json matrix rows for the locale (title, description, H1, keywords are fixed; changing them is a slug/meta change request)
- <loc>.json/.md research (faqTopics, evidence, glossary, formats, typography)
- English page sources for facts only
- architecture.md §6.3 writing rules
- the es pilot as the reference

Rules:

- Native copy, never sentence-by-sentence translation; at least 3 FAQ answers grounded in local intent traps from the research
- Honesty: public only; no numbers about users/downloads/ratings; "largest size Pinterest publishes", never "original"; quality as "usually 720p, 1080p when the pin has it"; "no watermark" means we add none; credit-creators line; "Independent tool, not affiliated with Pinterest Inc."
- Use the research’s Pinterest UI labels and flag unverified phone labels in review.nativeReviewer notes
- Fix the lede warnings listed in validation.warnings
- Run npm test and npm run build before handing off; slug/title changes go to docs/i18n/research/<loc>-slug-requests.md for infra

Order: Write P1 pages first, then P2, then P3; gated pages last (content exists, route stays gated).

### Phase 4: QA (parallel)

- Automated: npm test, npm run build (postbuild health check), npm run test:seo-build, verify_i18n_build.py.
- Native review ×12 by a different agent than the writer (fluency, register, search vocabulary, Pinterest UI labels against help.pinterest.com/<lang>, honesty, no English leftovers, no calques); human proofreaders where Q3 provides them.
- Visual QA per script group (Latin; tr+vi; ru; th; ar RTL) with Playwright at 390×844 and 1440×900, light and dark: home, video, board, longest-H1 page, 404, DownloaderForm states with /api/extract mocked from tests/fixtures. Assert no horizontal scroll, H1 not clipped, script font loaded, stub label on one line, language menu keyboard-reachable, RTL mirroring correct.
- SEO crawl against wrangler dev: architecture.md §13.5 table + full link crawl (no 4xx, no redirect chains, every localized page within 2 clicks of its locale home).
- Perf: Lighthouse mobile on /, /es, /ru, /th, /ar and one deep page each; font bytes within budget; CLS 0; island props < 8 KB raw.

### Phase 5: Close-out and release

- Skeptic agent challenges every QA finding; one fix batch; one confirm round.
- Release A (es pt fr de it nl id tr vi) → Release B (ru th) → Release C (ar), each flipping LOCALE_META.live once its script-group QA is green.
- Per release: submit sitemap in Search Console, Bing Webmaster (and Yandex Webmaster for ru); IndexNow the new URLs; URL Inspection on one page per locale.
- Two weeks after each release: GSC performance filtered by prefix, plus the "Alternate page with proper canonical" and "Duplicate" buckets; merge or 301 any pair of pages Google treats as one (watch list below).

**Cannibalisation watch list** (check in GSC two weeks after release):

- es: pinterest-video-downloader vs how-to-download-pinterest-videos vs pinterest-to-mp4; download-pinterest-videos-iphone-android ("celular") vs how-to-download-pinterest-video-in-gallery
- pt: download-pinterest-videos-iphone-android vs gallery guide (research: merge with 301 if not clearly device-specific)
- fr: six video pages: tool, MP4, how-to, galerie, iPhone, PC
- it: video tool vs how-to vs MP4 converter; gallery guide vs iPhone/Android guide
- ru: four video pages (keyword map in ru.md)
- vi: home vs video vs MP4 vs video guide (vi.json keywordOwnership)
- tr: home targets "pinterest indirici", video page "pinterest video indir"
- id: video tool vs cara-download guide vs di-hp guide

## 9. Decisions taken by the planner

- Locales: es pt fr de it nl id tr vi ru th ar; one version per language; language-only hreflang; x-default = English twin.
- id story page skipped (like every other locale); its topic becomes an FAQ on the id video and pin pages.
- SEO title generator not localized anywhere (generator is English-only); de draft kept in skipped[].deferredDraft for later.
- Audio pages built but gated on Q1; 4K explainers built but gated on Q2.
- Copy fixes applied to research titles/descriptions for honesty and staleness (changesFromResearch[]).
- Breadcrumb names come from content nav.label, so titles do not need an em dash.
- Staged releases by script group: A (Latin incl. tr, vi), B (ru, th), C (ar).
- Arabic uses Western digits; Thai width and Arabic face (Noto Sans Arabic vs Noto Kufi Arabic) are picked in visual QA.
- Language menu on English-only pages links to locale homes. No auto-redirects or language banners.
- Blog posts, legal pages, /pinterest-mcp-server and /embed stay English-only in v1; localizing 1–2 guides per locale is a possible later phase (needs "/*/*/*/" in run_worker_first).

## 10. Risks

- Doorway/scaled-content signals from ~150 similar pages: mitigated by research-driven partial page sets (62 page×locale pairs skipped), native copy with local intents, a reviewer per locale and the identical-sentence check.
- English ranking regression: English pages are not rewritten; snapshot diff of every English page allows only head alternates and the language menu.
- Broken hreflang clusters: one generator, unit tests, post-build reciprocity, sitemap == HTML, live crawl; gated/unreleased pages never appear in any cluster.
- Merge conflicts with mcp-server: Phase 0 gate; extractor changes (F2, error codes) land as separate commits with parity notes.
- Russia reachability (F6) and Pinterest being fined in Russia: ru is cheap to ship; verify after deploy.
- Unverified phone UI labels (it, nl, id, vi, th, tr, ar iOS menus): reviewer checklist item; wording kept generic where unconfirmed.
- Thin demand pages (es/pt/de/tr/vi profile, de carousel/Chrome, vi 4K/MP4/Chrome, it audio): P3, written last; GSC review at two weeks decides keep/merge.
- Autocomplete shows which queries exist, not how many: launch order is a hypothesis to check against Search Console.

## 11. Open questions for you

**Q1. Audio pages and the fake MP3.** The "MP3" button saves the MP4 video under a .mp3 name. Should we make real audio extraction (lazy-loaded in-browser MP3 encoder for the video’s audio track; it also fixes the English audio page), or keep the 9 localized audio pages unpublished and only stop the fake .mp3 file?

Recommendation: Build real MP3 extraction in Phase 0b. Every market searches "mp3"; the pages are already researched and validated. Until it ships, the pages stay gated.

**Q2. 4K explainer pages and the English 4K page.** Six locales researched an honest "Is 4K possible? Here is the real quality" page (pt, fr, tr, vi, th, ar; titles now ask instead of promising). Their hreflang twin, the English 4K page, still promises "4K ultra quality" and "original uncompressed". Publish the six and rewrite the English 4K page to the same honest angle?

Recommendation: Yes to both. If the English 4K page must stay untouched (it may hold rankings), skip the six; es, de, it, nl, ru and id already fold 4K into a video-page FAQ.

**Q3. Human proofreading.** Are human native speakers available to proofread any locale before it goes live? Otherwise launch on agent writer + separate agent reviewer only.

Recommendation: Agent review is enough to launch es/pt/fr/de/it/nl/id; ask for humans first on ar, th and ru, where agent errors are hardest to spot and the research flagged the most unverified UI labels.

**Q4. German legal pages.** Once ads run on /de, German visitors expect an Impressum with a real name and postal address, plus a German privacy notice and ad consent. Do you want to publish these before ads go on /de (needs your details), or keep /de ad-free?

Recommendation: Launch /de now (no ad network is wired up), and decide before monetising. Not legal advice.

## 12. Headline keywords per locale

| locale | home | video | image | board | how-to |
|---|---|---|---|---|---|
| es | descargar de Pinterest | descargar videos de Pinterest | descargar imágenes de Pinterest | descargar tableros de Pinterest | cómo descargar videos de Pinterest |
| pt | baixar do pinterest | baixar vídeo do pinterest | baixar imagem do pinterest | baixar pasta do pinterest | como baixar vídeo do pinterest |
| fr | téléchargeur pinterest | télécharger vidéo pinterest | télécharger photo pinterest | télécharger tableau pinterest | comment télécharger une vidéo pinterest |
| de | pinterest downloader | pinterest video herunterladen | pinterest bilder herunterladen | pinterest pinnwand herunterladen | pinterest videos speichern |
| it | scaricare da pinterest | scaricare video da pinterest | scaricare immagini da pinterest | scaricare bacheca pinterest | come scaricare video da pinterest |
| nl | pinterest downloader | pinterest video downloaden | pinterest foto downloaden | pinterest bord downloaden | hoe pinterest video downloaden |
| id | pinterest downloader | download video pinterest | download foto pinterest | download board pinterest | cara download video pinterest |
| tr | pinterest indirici | pinterest video indir | pinterest fotoğraf indir | pinterest pano indirme | pinterestten video nasıl indirilir |
| vi | pinterest downloader | tải video pinterest | tải ảnh pinterest | tải bảng pinterest | cách tải video trên pinterest |
| ru | скачать с пинтереста | скачать видео с пинтереста | скачать фото с пинтереста | скачать доску пинтерест | как скачать видео с пинтереста |
| th | ดาวน์โหลด pinterest | โหลดวิดีโอ pinterest | โหลดรูป pinterest | โหลดบอร์ด pinterest | วิธีโหลดวิดีโอ pinterest |
| ar | تحميل من بنترست | تحميل فيديو من بنترست | تحميل صور من بنترست | تحميل جميع صور لوحة بنترست | طريقة تحميل فيديو من بنترست |

## Decisions from the user (2026-10-15)

1. **Audio:** build a real MP3. Decode the video's audio in the visitor's browser and encode a genuine MP3 with a small encoder (no server cost), replacing the renamed-MP4 ".mp3". Publish the 9 localized audio pages.
2. **4K honesty:** rewrite the English 4K page and the image page's "original resolution" wording so they match what the tool delivers, and publish the 6 honest "is 4K possible?" pages (pt, fr, tr, vi, th, ar).
3. **Proofreading:** agent native-language review for every locale, then ship all 12. The user spot-checks ar, th and ru after launch.
4. **German:** launch /de with no ad slots on /de pages. Add an Impressum later, before ads are enabled there.

Also before the build, independent of the decisions above: fix the link check so it accepts Pinterest country subdomains (tr., nl., ru., pt., …) on the merged code.
