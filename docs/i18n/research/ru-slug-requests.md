# ru: requests to infra (writer-ru, 2026-10-16)

No slug, title, description or H1 changes: all 11 ru pages use the plan matrix as written. ru has no audio, 4K, to-mp4, Chrome, profile or carousel page (plan §2), so none were written; those intents live as sections and FAQs on the video, image, pin, board and computer pages.

## Outside the ru files

1. **Short prepositions at the end of a fixed H1.** Russian typography binds в, с, к, и, о, на, по to the next word with a no-break space (research `formats.nbsp`). All ru body copy does this. The plan-fixed H1s can't, because `i18n:check` compares them with the matrix byte for byte. At 390 px `/ru` breaks as «СКАЧАТЬ С / PINTEREST». Proposal: compare `meta.title`, `meta.description` and `hero.h1` with U+00A0 folded to a space in `checkPageFile` (`src/i18n/content-rules.ts`), so writers may bind them. Alternatively, `TicketHero` could bind them for `lang="ru"` at render time. Evidence: `viralnest-shots/i18n/writer-ru/home-390-top.jpg`.
2. **StickyPasteBar at 360–390 px (`src/components/StickyPasteBar.tsx`).** «Вставить» makes the paste overlay 121 px wide. At 390 px the link field is 148 px, and at 360 px it is 118 px, so the overlay covers the whole field (pasting still works, but typing doesn't). This is the same issue de reported («Einfügen»). Please make the same fix: on localized pages below 400 px, show only the clipboard icon and keep the label as `aria-label`. Evidence: `viralnest-shots/i18n/writer-ru/board-sticky-360.png` and `board-sticky-390.png`, measured with `scratchpad/pw/scripts/writer-ru-sticky.mjs`.
3. **Default example board.** `pinterest/spice-up-your-dinner-plans` and `official-news` return `collection_empty` on the dev `/api/extract`. ru sets `steps.exampleUrl` to `https://ru.pinterest.com/pinterest/pinterest-presents/`, which I checked returns 37 pins. The `exampleUrlFor('board')` default still points at the broken board for every other locale.
4. **English fallback pin titles in board results.** In a ru board receipt, untitled pins read «Pin 783444». That string comes from the server (`src/lib/extract/upstream.ts:94` and `:152`, `` `Pin ${id.slice(-6)}` ``), not from the catalog. Proposal: send an empty title, or a flag, and let the island use `fallbacks.pinN`.
5. **«Обновлено: <date>» on guides (optional).** The research asks the hub guide to show the update date in the body for Yandex, and to keep the year out of the title. A content string would go stale, so I did not write one. A template line under the H1 of guide pages, built from `dateModified` with `Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' })`, would do it for every locale.

## For the native reviewer (unverified labels)

These come from the research's help.pinterest.com/ru table or from the Russian iOS/Android UI as I know it. None was checked on a device. Each page's `review.writer` repeats its own items.

- **Pinterest:**
  - «Поделиться» → «Скопировать ссылку», «Сохранить», «…» → «Скачать изображение», «Скачивание видеопинов» (verified in the help center).
  - Unverified: that the app sometimes saves only a still frame of a video, worded carefully.
- **iOS:**
  - «Файлы» → «Загрузки», «Поделиться» → «Сохранить видео», the «Анимированные» album.
  - The Safari downloads icon next to the address bar, and unpacking a ZIP by tapping it in «Файлы».
  - The research's help table says «Фотографии» where the copy uses the app name «Фото».
- **Android:**
  - «Файлы» from Google with «Извлечь», Samsung «Мои файлы», Xiaomi «Проводник», «Переместить».
  - The DCIM and Movies folders, and the «Галерея» and «Google Фото» download album.
  - Setting a video as lock-screen wallpaper on some phones (worded as "on some phones").
- **Desktop:**
  - «Копировать адрес ссылки» in Chrome and Яндекс Браузер.
  - `Ctrl+J` and `Ctrl+Shift+B` in Яндекс Браузер. The bookmarklet guide names it beside Chrome and Edge.
- **Telegram:** the «Открыть в браузере» item in its in-app browser.
- **Wording choices to confirm:**
  - The void stamp «Отказ» (rather than «Аннулировано»).
  - The ticket label «Билет · публичная ссылка» (the research's short variant).
  - VK Клипы in the credit band, used instead of Reels because Instagram is blocked in Russia.

## Release decisions (release-integrator, 2026-10-16)

1. **Short prepositions in fixed H1s: applied.** `checkPageFile` now folds U+00A0 to a space when comparing title, description, H1 and keyword with the matrix, and every ru H1 binds с/на/в/и to the next word (e.g. `Скачать с\u00A0Pinterest`). The built `/ru` H1 is `Скачать с&nbsp;Pinterest`.
2. **StickyPasteBar: applied** (icon-only paste below 400 px on localized pages). Measured: ru link field keeps 76 px free at 360 px and 106 px at 390 px (was fully covered).
3. **Default example board: applied** (see de/fr notes; ru keeps its own `ru.pinterest.com` example).
4. **English fallback pin titles from the server: deferred.** `Pin ${id}` comes from `src/lib/extract/upstream.ts`; changing the API body touches the MCP server and the parity fixtures, so it goes to the extractor owner.
5. **«Обновлено» date line on guides: deferred** (optional, all locales).
