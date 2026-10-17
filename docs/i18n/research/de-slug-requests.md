# de: requests to infra (writer-de, 2026-10-16)

No slug, title, description or H1 changes: all 16 de pages use the plan matrix as written.

## Outside the de files

1. **StickyPasteBar at 360 px (`src/components/StickyPasteBar.tsx`).** The paste button sits on top of the link field and is 119 px wide with the German "Einfügen". At 390 px a 44 px strip of the field stays visible and tappable (same as the es pilot). At 360 px only 14 px is left, so you can hardly tap into the field to type. Proposal: on localized pages below 400 px, show only the clipboard icon in that overlay button (keep the label as `aria-label`), the same way the Save button already drops its icon. To help in the meantime, de already uses the short Save label "Laden". Evidence: `viralnest-shots/i18n/writer-de/board-sticky-390.png`, measured with `scratchpad/pw/scripts/writer-de-sticky.mjs`.
2. **Default example board (`exampleUrlFor('board')` in `src/components/i18n/page-data.ts`, also the English board page).** `pinterest/spice-up-your-dinner-plans`, `official-news` and `pinterest-predicts` all return `collection_empty` on the dev `/api/extract` today. `https://www.pinterest.com/pinterest/pinterest-presents/` returns 37 pins, and so does its `pinterest.de` form. de sets this as `steps.exampleUrl` in its own board page. Other locales still inherit the broken default.
3. **Same label on stub and receipt (optional, all locales).** On the GIF form the stub and the receipt's collect button both read "GIF herunterladen" ("Download GIF" in en). de avoids this for video ("Video herunterladen" on the stub, "MP4 herunterladen" on the receipt), but the GIF pair comes from the shared `{format}` key.

## For the native reviewer (unverified phone labels)

Taken from the research or from the iOS/Android German UI as I know it, not checked on a device:

- iOS: Dateien › Downloads, Teilen › „Video sichern“ / „Bild sichern“, the Safari download prompt button „Laden“, and tapping a ZIP in Dateien to unpack it.
- Android: the Dateien app, Samsung „Eigene Dateien“, the Galerie / Google Fotos album „Download“, folders DCIM and Movies, and the Chrome download notice.
- Pinterest DE: Teilen › „Link kopieren“, „Merken“, Drei-Punkte-Symbol › „Bild herunterladen“, „geheim“. The claim that the app offers its own video download only on some pins is hedged on purpose.

## Release decisions (release-integrator, 2026-10-16)

1. **StickyPasteBar at 360 px: applied.** On localized pages the paste button shows only the clipboard icon below 400 px; the label stays as its `aria-label`. Measured on the build: at 360 px the de link field keeps 95 px free (was 14 px), at 390 px 125 px. English is unchanged. Screenshot: `viralnest-shots/i18n/release/sticky-de-360.png`.
2. **Default example board: applied.** `exampleUrlFor('board')` and the English board page now use `https://www.pinterest.com/pinterest/pinterest-presents/`. Note: `spice-up-your-dinner-plans` (74 pins) and other boards still return `collection_empty` on production too; that is an extractor problem (the board HTML no longer carries pin ids and the `BoardFeedResource` call is refused), and the shared extractor (`src/lib/extract/`) is outside the i18n release and its parity suite replays recorded upstream responses, so the fix belongs to the extractor owner.
3. **Same label on stub and receipt (GIF): deferred.** Optional and shared by every locale through the `{format}` key; not a release blocker.
**Native-review labels:** unchanged, still for the reviewer.
