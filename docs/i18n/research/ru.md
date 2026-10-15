# Russian (ru) SEO research: PintDownload

Researched 2026-10-14/15 for three markets: Russia (primary), Kazakhstan and Belarus, plus Russian speakers elsewhere. Machine-readable data, including all raw Google and Yandex autocomplete, is in `ru.json`.

## Decisions at a glance

- **hreflang:** `ru` (not `ru-RU`/`ru-KZ`/`ru-BY`), with `x-default` set to English. `<html lang="ru">`, `og:locale` `ru_RU`. Autocomplete vocabulary is the same in RU, KZ and BY in both engines, so regional variants would be duplicate pages.
- **Yandex matters.** Yandex has 70.3% of Russian search, against Google's 28.1% (Statcounter, Sep 2026). Google leads in KZ (68%) and BY (59%). Yandex reads hreflang **only from `<link rel="alternate">` in the HTML head**; it dropped sitemap hreflang support. Every version must list all of its alternates. Today BaseLayout hard-codes `hreflang="en"`, `x-default` and `og:locale=en_US`.
- **URLs:** `/ru/<translit-slug>`, with the home page at `/ru`. Slugs are transliterated Russian (Yandex matches and bolds translit in URLs). Brand words stay Latin (`pinterest`, `iphone`, `android`, `gif`).
- **Ship 11 pages and skip 8.** Pages were skipped for no demand, for duplicating another page's search intent, or because the copy would have to claim something the product doesn't do.
- **Biggest risk:** the site is behind Cloudflare. Since June 2025, Russian ISPs have throttled Cloudflare-fronted sites to about 16 KB per asset, and I found no 2026 source saying this was lifted. Verify from a real Russian connection before building (details under Risks).

## Pages

| EN slug | RU path | Primary keyword | Title (chars) | Priority |
|---|---|---|---|---|
| index | `/ru` | скачать с пинтереста | Скачать с Пинтереста по ссылке — видео, фото и GIF онлайн (57) | high |
| pinterest-pin-downloader | `/ru/skachat-pin-s-pinterest` | скачать пин с пинтереста | Скачать пин с Пинтереста по ссылке — фото, видео или GIF (56) | medium |
| pinterest-video-downloader | `/ru/skachat-video-s-pinterest` | скачать видео с пинтереста | Скачать видео с Пинтереста по ссылке — MP4 без водяного знака (61) | high |
| pinterest-image-downloader | `/ru/skachat-foto-s-pinterest` | скачать фото с пинтереста | Скачать фото с Пинтереста в хорошем качестве — по ссылке (56) | high |
| pinterest-gif-downloader | `/ru/skachat-gif-s-pinterest` | скачать гиф с пинтереста | Скачать гиф с Пинтереста по ссылке — анимированные GIF (54) | medium |
| pinterest-board-downloader | `/ru/skachat-dosku-pinterest` | скачать доску пинтерест | Скачать доску Пинтерест целиком — все пины в ZIP-архиве (55) | medium |
| pinterest-profile-downloader | SKIP | | | |
| pinterest-profile-picture-downloader | `/ru/skachat-avatarku-s-pinterest` | скачать аватарку с пинтереста | Скачать аватарку с Пинтереста в полном размере — онлайн (55) | low |
| pinterest-carousel-downloader | SKIP | | | |
| pinterest-story-downloader | SKIP | | | |
| pinterest-audio-downloader | SKIP | | | |
| pinterest-4k-downloader | SKIP | | | |
| pinterest-to-mp4 | SKIP | | | |
| pinterest-video-downloader-chrome | SKIP | | | |
| pinterest-seo-title-generator | SKIP | | | |
| how-to-download-pinterest-videos | `/ru/kak-skachat-video-s-pinterest` | как скачать видео с пинтереста | Как скачать видео с Пинтереста: на телефон и компьютер (54) | high |
| how-to-download-pinterest-video-in-gallery | `/ru/kak-sohranit-video-s-pinterest-v-galereyu` | как сохранить видео с пинтереста в галерею | Как сохранить видео с Пинтереста в галерею телефона (51) | high |
| how-to-download-pinterest-video-on-laptop | `/ru/kak-skachat-video-s-pinterest-na-kompyuter` | как скачать видео с пинтереста на компьютер | Как скачать видео с Пинтереста на компьютер, ПК и ноутбук (57) | medium |
| download-pinterest-videos-iphone-android | `/ru/skachat-video-s-pinterest-na-iphone-i-android` | скачать видео с пинтерест на айфон | Скачать видео с Пинтереста на айфон и андроид по ссылке (55) | medium |

All 11 titles (51–61 chars) and descriptions (145–157 chars) pass the repo's `scripts/seo_health_check.py` rules with **0 errors and 0 warnings**. I checked this by running its own `check_html_file()` on mock pages.

## What the evidence says

- **Head term:** «скачать с пинтереста». Its prepositional variants are «с пинтерест», «из пинтереста» and «с pinterest». Avoid «пинтерест скачать» / «pinterest скачать»: their completions (на пк, приложение, на андроид, на русском) come from people installing the Pinterest app.
- **«по ссылке» (by link) is the strongest modifier in both engines.** The others are онлайн, бесплатно, в хорошем качестве, без водяного знака, в галерею, на телефон, на пк, на айфон, на андроид.
- **People are looking for a way around Telegram bots.** Yandex suggests «как скачать видео с пинтереста без телеграмма» and Google «как сохранить видео из пинтереста в галерею без телеграмма». RU competitors are bots (@pinDropBot, @pintgetbot, one of which forces subscribing to 3 channels), ad-heavy SaveFrom and machine-translated downloaders. Our angle: **«по ссылке, прямо в браузере, без Telegram-ботов, приложений и регистрации».**
- **Spelling:** search queries use Cyrillic «пинтерест/пинтереста» (declined or not), while editorial sites and Pinterest itself write «Pinterest». Titles use «Пинтереста» to match queries; H1s, body and legal lines use «Pinterest».
- **GIF:** «гиф», «гифку» and «GIF» all appear; use all three.
- **Photos:** «фото» and «картинку» are about equal in volume; «изображение» is smaller.
- **Avatar trap:** «аватарка пинтерест» means looking for aesthetic avatar pictures (аниме, эстетичная, котик), not downloading a user's profile photo. Target «скачать аватарку с пинтереста» and «фото профиля пинтерест» instead.
- **Noise:** bare «скачать пин» / «скачать все пины» / «ссылка на пин» are full of Brawl Stars pins, Pinduoduo and VPN apps. Always qualify them with «с пинтереста».
- **Extra Russian long tail:** «живые обои с пинтереста» (live wallpapers, strong in G+Y), «pin.it что это за ссылка», «почему не скачивается видео с пинтереста», «законно ли скачивать с пинтереста видео», «скачать видео пинтерест 1080p», «со звуком».

## Kept pages in detail

### /ru (index)
- **Description (150):** Скачайте видео MP4, фото и GIF с Pinterest по ссылке на пин или pin.it. Бесплатно, без регистрации и Telegram-ботов, прямо в браузере телефона или ПК.
- **H1:** Скачать с Pinterest
- **Secondary:** скачать с пинтереста по ссылке; скачать с пинтерест онлайн бесплатно; сайт для скачивания с пинтереста; загрузчик pinterest; pinterest downloader; скачать с пинтереста без водяного знака
- **FAQ:** как скачать по ссылке; бесплатно ли; что можно скачать; нужен ли бот или приложение (нет); куда сохраняется файл (Галерея / Файлы → Загрузки → Фото / Загрузки); водяной знак (we add none); законно ли; 4К (honest answer); why a link fails

### /ru/skachat-pin-s-pinterest
- **Description (151):** Вставьте ссылку на публичный пин (pinterest.com/pin/… или pin.it) и скачайте фото, видео MP4, GIF или все фото из карусели. Бесплатно, без регистрации.
- **H1:** Скачать пин с Pinterest
- **Secondary:** скачать пин с пинтерест по ссылке; как скачать пин с пинтереста на телефон; сохранить пин из пинтереста по ссылке; скачать видео пин с пинтерест; pin.it что это за ссылка
- **FAQ:** link formats incl. ru.pinterest.com; what pin.it is; «Сохранить» ≠ download; carousel (this page takes over the skipped carousel page); video/GIF; board/profile links; free

### /ru/skachat-video-s-pinterest
- **Description (157):** Скачайте видео с Pinterest в MP4 по ссылке на пин или pin.it: со звуком и в лучшем доступном качестве. Водяной знак не добавляем. Бесплатно, без регистрации.
- **H1:** Скачать видео с Pinterest
- **Secondary:** скачать видео с пинтереста по ссылке; скачать видео с пинтерест онлайн бесплатно; скачать видео с пинтереста без водяного знака; скачать видео с пинтереста в хорошем качестве; пинтерест в мп4; скачать видео пинтерест 1080p
- **FAQ:** по ссылке; quality (whatever the creator uploaded; 4К is rare); why Pinterest has no video download (creators can turn off «Скачивание видеопинов»; the in-app «Скачать» can save only a still frame); sound; watermark (we don't add one); Pinterest to MP4 (takes over the skipped pinterest-to-mp4 page); iPhone/Android; a pin with no video; no bot needed

### /ru/skachat-foto-s-pinterest
- **Description (149):** Скачайте фото и картинки с Pinterest в исходном размере, а не миниатюру: вставьте ссылку на пин и сохраните JPG или PNG. Бесплатно и без регистрации.
- **H1:** Скачать фото с Pinterest
- **Secondary:** скачать картинку с пинтереста; скачать фото с пинтереста в хорошем качестве; скачать фото с пинтерест по ссылке; скачать изображение с пинтерест; как скачать картинку с пинтереста в хорошем качестве; скачать обои с пинтерест
- **FAQ:** original file vs preview; difference from the app's «Скачать изображение»; 4К (only if the original is that large); обои; carousels; можно ли использовать картинки (copyright); почему не могу сохранить фото

### /ru/skachat-gif-s-pinterest
- **Description (155):** Сохраните гифку с Pinterest по ссылке на пин: GIF остаётся анимированным, а не превращается в стоп-кадр. Работает на телефоне и компьютере, без приложений.
- **H1:** Скачать GIF с Pinterest
- **Secondary:** скачать гифку с пинтереста; скачать gif с pinterest; как скачать гифку с пинтереста на телефон; скачать гиф с пинтерест по ссылке; сохранить гифку с пинтереста
- **FAQ:** phone/PC; GIF saved as a still image; GIF saved as MP4; animation in the gallery (iPhone «Анимированные» album); account needed?

### /ru/skachat-dosku-pinterest
- **Description (153):** Скачайте публичную доску Pinterest полностью: вставьте ссылку на доску, и мы соберём доступные фото и видео в один ZIP-архив. Бесплатно, без регистрации.
- **H1:** Скачать доску Pinterest
- **Secondary:** как скачать всю доску с пинтереста; скачать доску с пинтерест полностью; скачать все пины с доски пинтерест; скачать доску с пинтереста онлайн; как скопировать ссылку на доску в пинтерест
- **FAQ:** whole board at once; copying a board link; secret boards (no); how many pins (no invented numbers); opening a ZIP on a phone; carousels; all of a user's pins (this page takes over the skipped profile page)

### /ru/skachat-avatarku-s-pinterest
- **Description (154):** Посмотрите и скачайте аватарку (фото профиля) пользователя Pinterest в полном размере, а не крошечную миниатюру. Нужна только ссылка на публичный профиль.
- **H1:** Скачать аватарку с Pinterest
- **Secondary:** скачать аватарку пинтерест; скачать фото профиля пинтерест; аватарку с пинтереста в полном размере; как посмотреть аватарку в пинтересте; как сохранить аватарку из пинтереста на пк
- **FAQ:** viewing full size; saving to PC or gallery; resolution (no upscaling); difference from the profile ZIP; no account needed; JPG; ethics (someone else's photo)

### /ru/kak-skachat-video-s-pinterest (hub guide)
- **Description (152):** Пошаговая инструкция: как скопировать ссылку на видео в Pinterest, скачать MP4 и найти файл на Android, iPhone, Windows или Mac. Без приложений и ботов.
- **H1:** Как скачать видео с Pinterest
- **FAQ:** copying the link («Поделиться» → «Скопировать ссылку»); почему не скачивается; without Telegram or an app; законно ли; where the file goes; why «Скачать» in Pinterest saves only a picture
- **Note:** keep the year out of the title. Show «Обновлено: …» in the body and `dateModified` in JSON-LD.

### /ru/kak-sohranit-video-s-pinterest-v-galereyu
- **Description (156):** Как сохранить видео с Pinterest в галерею на Android и в «Фото» на iPhone: скопируйте ссылку, скачайте MP4 и найдите ролик. Без Telegram-ботов и приложений.
- **H1:** Как сохранить видео с Pinterest в галерею
- **Note:** this page owns the verb «сохранить» and «в галерею», which iPhone users type too.

### /ru/kak-skachat-video-s-pinterest-na-kompyuter
- **Description (150):** Скачайте видео с Pinterest на компьютер с Windows, Mac или Chromebook: скопируйте адрес пина в браузере, вставьте ссылку и сохраните MP4 в «Загрузки».
- **H1:** Как скачать видео с Pinterest на компьютер
- **Note:** includes a «В Chrome без расширения» bookmarklet section in place of the skipped Chrome page.

### /ru/skachat-video-s-pinterest-na-iphone-i-android
- **Description (145):** Как скачать видео с Pinterest на iPhone (через «Файлы» в «Фото») и на Android (в галерею): скопируйте ссылку на пин, вставьте её и сохраните MP4.
- **H1:** Видео с Pinterest на iPhone и Android
- **FAQ:** iPhone: Safari → «Файлы» → «Загрузки» → «Поделиться» → «Сохранить видео»; Android: «Загрузки» → «Галерея» / «Google Фото»; no App Store / Google Play / RuStore app needed; live wallpapers (we save MP4, and a Live Photo needs a converter); open the link in Safari, not inside Pinterest's or Telegram's in-app browser

**Keyword map for the video pages:** the tool page owns «скачать видео…»; the hub owns «как скачать…»; the gallery guide owns «сохранить … в галерею»; the computer guide owns «на компьютер/пк/ноутбук/мак»; the iPhone/Android page owns «на айфон / на андроид».

## Skipped pages

- **profile-downloader:** Yandex returns nothing; Google has 1–3 completions per seed, and bare «профиль пинтерест» means account settings. The board page's FAQ covers it, and a draft is ready in `phase2Draft`.
- **carousel-downloader:** «карусель пинтерест» means creating a carousel. The pin page covers it.
- **story-downloader:** no demand («идея пин» and «истории пинтерест» are unrelated intents). Pinterest's ru help has no Idea Pin term any more.
- **audio-downloader:** there is demand («скачать звук из видео пинтерест», «скачать музыку с пинтереста»), but the product's «MP3» is the MP4 URL saved under an .mp3 name (`DownloaderForm.tsx` ~L966). Ship only after the tool outputs real audio; a draft is ready.
- **4k-downloader:** the demand is real but mostly wallpaper browsing, and a 4K promise would break the honesty rule. The video and image pages each carry an honest «Можно ли скачать в 4К?».
- **pinterest-to-mp4:** same results page as the video page. SavePin ranks one page for both, and Yandex autocompletes SavePin's title. «пинтерест в мп4» moves into the video page.
- **video-downloader-chrome:** Russians search for an extension («расширение»); we have only a bookmarklet. It becomes a section of the computer guide.
- **seo-title-generator:** `/api/generate-seo` produces English only (no language parameter, English fallback templates), and the demand is a different intent («продвижение в пинтерест»).

## Pinterest app wording (verified on help.pinterest.com/ru)

| English | Russian in Pinterest | Notes |
|---|---|---|
| Pin / Video Pin | пин / видеопин | lowercase; masculine |
| Board / secret board | доска / секретная доска | «Создать доску», «Сделать доску секретной» |
| Share | «Поделиться» | iOS share icon label |
| Copy link | «Скопировать ссылку» | third-party articles also say «Копировать ссылку» |
| Send | «Отправить» | |
| Download image | «Скачать изображение» | in the «…» menu; Android saves to «Галерея», iOS to «Фотографии» |
| Save (to board) | «Сохранить» | not a device download; worth an FAQ |
| Video download setting | «Скачивание видеопинов» | the creator controls it |
| Idea Pin | none any more | avoid |
| iOS system | «Фото», «Файлы» → «Загрузки», «Сохранить видео» | |
| Android system | «Галерея», «Google Фото», «Загрузки» | |

## Glossary highlights

- **UI:** Download = «Скачать»; Download ZIP = «Скачать ZIP-архив»; Paste = «Вставить»; placeholder = «Вставьте ссылку на пин, доску или профиль Pinterest…»; Processing = «Ищем файл…»; Preview = «Предпросмотр»; FAQ = «Частые вопросы»; public only = «только публичные пины»; not affiliated = «PintDownload не связан с Pinterest Inc.»
- **Claim-ticket metaphor:** Russian has the cloakroom «номерок» and the pickup «квитанция», so use «Ссылка — ваш номерок, файл — то, что вы забираете».
  - Ticket labels: «БИЛЕТ»
  - Admit one: «ВХОДНОЙ БИЛЕТ · ПУБЛИЧНАЯ ССЫЛКА» (a literal «впустить одного» is unnatural)
  - Stub: «корешок» / «отрывной талон», optionally with a decorative «КОНТРОЛЬ», the word printed on Russian ticket stubs
  - Serial: «№ 1120271…»
  - Perforation: «линия отрыва»; counter: «выдача»; collect: «Забрать»; receipt: «квитанция»
- **Grammar:** use `Intl.PluralRules('ru')` (one/few/many) for every counter, e.g. «21 пин / 24 пина / 25 пинов». Instructions take the polite «вы» imperative (Скопируйте, Вставьте, Нажмите). UI labels go in «ёлочки».

## Formats

- Numbers: decimal comma; thousands separated by a no-break space (`12 345`; `Intl.NumberFormat('ru-RU')`). Sizes as «3,4 МБ». Resolutions stay `1080p`.
- Dates: `15.10.2026` or «15 октября 2026 г.»; 24-hour time.
- Typography: put a no-break space after short prepositions (в, с, к, и, о, на, по) and before « — ».

## Typography

- **Big Shoulders Display has no Cyrillic.** The self-hosted woff2 has 230 glyphs, none in U+0400–04FF, and no `№`. Upstream ships only latin, latin-ext and vietnamese. Russian H1s would fall back to Arial Narrow on desktop, and on phones to the regular-width system sans at 900, which loses the condensed gothic and is roughly 30–40% wider.
- **Fix:** add a Cyrillic condensed face for `:lang(ru)`, applied to the whole headline so faces don't mix inside one line. Sofia Sans Extra Condensed (cyrillic, 100–900) is the closest; alternatives are Fira Sans Extra Condensed (900), Roboto Condensed (900) and Oswald (700 max). Check that Ё and № exist at 900.
- **Lengths:** H1s run 19–42 chars, in line with the English ones. Test the two longest at 360px: «КАК СКАЧАТЬ ВИДЕО С PINTEREST НА КОМПЬЮТЕР» (42) and «КАК СОХРАНИТЬ ВИДЕО С PINTEREST В ГАЛЕРЕЮ» (41). Don't use `hyphens: auto` on uppercase display text.

## Risks

1. **Cloudflare throttling in Russia.** pintdownload.app answers with `server: cloudflare`. Since 9 June 2025, Russian ISPs have limited Cloudflare-fronted sites to about the first 16 KB of each asset; Cloudflare said it cannot fix this. I found no 2026 report that it ended.
   - If it is still in force, Russian users, and possibly YandexBot, get broken pages, and Yandex rankings can't happen.
   - check-host.net's RU data-centre nodes returned HTTP 200, which does not test this.
   - Verify with Yandex Webmaster «Проверка ответа сервера» and a residential RU connection.
   - KZ and BY are unaffected.
2. **VPN law.** Advertising ways around blocks has been illegal in Russia since 1 March 2024, so no Russian copy may suggest a VPN, even in troubleshooting.
3. **Pinterest in Russia** is not blocked but keeps getting fined (6 mln RUB in Dec 2025, more reported in Sep 2026). A block would cut RU demand.
4. **Overlap between the four video pages.** Keep the keyword map above and cross-link with descriptive anchor text.
5. **Data localisation (152-FZ/242-FZ).** Not an issue today because there are no accounts. Review if analytics or ad cookies are added.
6. **The display font** (see Typography).

## Sources

- Autocomplete: Google `suggestqueries` (hl=ru, gl=ru/kz/by) and Yandex `suggest-ff.cgi` (lr=225/159/149), raw results in `ru.json`.
- Competitors fetched on 2026-10-14: savepin.app/pinterest-downloader/ru, pinssaver.com/ru (+ gif and image pages), pintsave.net/ru, klickpin.com/ru (+ board, profile, carousel, story, ideas, gif, image and chrome-extension pages), pinterestdownloader.com/ru.
- Editorial: lifehacker.ru, appleinsider.ru, kod.ru.
- Pinterest help (ru): nodes 1326, 3769, 3724; articles send-pins-boards-and-profiles, create-a-board.
- Yandex hreflang: yandex.ru/support/webmaster/ru/yandex-indexing/locale-pages.
- Market share: gs.statcounter.com (RU/KZ/BY, Sep 2026).
- Cloudflare throttling: zona.media and 3dnews.ru (both 2025-06-27), heise.de, blog.cloudflare.com.
- Pinterest fines: comnews.ru (2025-12-19), minorityaze.org.
