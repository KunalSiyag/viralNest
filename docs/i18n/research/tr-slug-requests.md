# tr: requests for infra (slugs, titles, templates)

Writer: writer-tr (agent), 2026-10-16. **No slug, title, description or H1 changes requested.** All 15 tr pages use the plan §3 values as they are; `npm run i18n:check -- tr --strict` reports 0 errors.

## 1. Brand names in uppercased Turkish headings (template, optional)

**What happens:** display headings are CSS-uppercased and `<html lang="tr">` makes the browser apply Turkish casing, so `Pinterest` prints as **PİNTEREST** (and `iPhone` as **İPHONE**). Turkish words are correct (**İNDİR**, **NASIL**, **FOTOĞRAFI**), only the brand looks wrong. Seen on every tr H1 at 390 and 1440 (`viralnest-shots/i18n/writer-tr/*-top.png`).

**Evidence:** research `tr.json` → `typography.brandNamesInCaps`: "Wrap brand names in uppercased headings in `<span lang="en">` (Pinterest, iPhone, PintDownload, Chrome) and keep Turkish suffixes outside the span: `<span lang="en">Pinterest</span>'ten`." Turkish all-caps headlines in print often keep PİNTEREST, so this is cosmetic, not a blocker.

**Request:** where TicketHero, section H2s, step/FAQ titles and stamps render a display string, wrap `Pinterest`, `PintDownload`, `iPhone` and `Chrome` in `<span lang="en">` for `locale === 'tr'` (a small helper next to `escapeHtml`). Content strings stay plain text, so writers need no change.

## 2. Typographic apostrophe in two fixed H1s (optional, plan matrix)

The fixed H1s `Pinterest'ten Video Nasıl İndirilir?` and `Pinterest'te 4K Var mı?` use a straight `'`. Body copy uses `’` (research `formats.quotes`: "Typographic ’ in body copy; straight ' is acceptable in <title> and meta"). If infra edits the matrix, change only the two H1s (not the titles) to `Pinterest’ten Video Nasıl İndirilir?` and `Pinterest’te 4K Var mı?`, and the tr files will follow. Leaving them as they are is acceptable.

## 3. Known, not tr-specific

- Step pictures (`public/images/step1–3.webp`) still carry English text; Turkish renders need the latin-ext font files (research `typography.stepArt`).
- In `astro dev`, a missing URL such as `/tr/yok` shows the English dev 404; the Turkish 404 itself renders correctly at `/tr/404` and is served for missing `/tr/*` URLs only on a Cloudflare build.

## Release decisions (release-integrator, 2026-10-16)

1. **Brand names in uppercased headings: applied for the H1.** `headingHtml()` in `src/i18n/inline.ts` wraps Pinterest, PintDownload, iPhone and Chrome in `<span lang="en">` on tr pages; the three localized templates use it for the hero H1. `/tr` now prints "PINTEREST İNDİRİCİ" (screenshot `release/tr-home-390.png`). Section H2s and stamps are not wrapped yet (deferred, cosmetic).
2. **Typographic apostrophe in two fixed H1s: declined.** The writer marked it acceptable as is; the straight apostrophe matches the titles, and changing the matrix for it is not worth a second round.
3. **Step pictures / dev-only 404:** deferred (step art) and not a bug (the built `/tr/yok` returns the Turkish 404 with status 404).
