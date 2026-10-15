# Arabic (ar) SEO research for PintDownload

Locale `ar`, hreflang `ar`, `<html lang="ar" dir="rtl">`, og:locale `ar_AR`. Markets: Saudi Arabia, Egypt, UAE, Morocco, Iraq. One Modern Standard Arabic version serves all of them.

The full data, including every raw autocomplete list, is in `ar.json` next to this file.

## What the evidence says

- **The Arabic head term is "تحميل من بنترست" (download from Pinterest).** It completes to فيديو, صور, بدقة عالية, بدون علامة مائية and gif in every market. Leave out "من" and the query means installing the Pinterest app (apk, لايت, للكمبيوتر, من جوجل).
- **Spell it "بنترست".** Google folds بينترست, بنتريست and the rest into بنترست. The machine-translated competitors write بينترست and miss it.
- **Use "تحميل" for "download".** Pinterest's own UI uses "تنزيل", so that word is for quoting app labels and appears once per page in body copy.
- **"بدون علامة مائية" (without watermark) is the strongest modifier.** It completes the video, home, save, copy-link and how-to queries, plus all the dialect forms (ازاي / كيفاش / شلون احمل). The reason: Pinterest's own video download only works when the creator allows it, and it stamps the creator's name and username on the video.
- **Other strong modifiers:** بدون برامج (no software), بدون حساب (no account), اونلاين, للمعرض / إلى الاستديو (to the gallery), للكمبيوتر, على الايفون, and 4k / بدقة عالية.
- **There is no Arabic query word for "pin".** "تحميل منشور", "دبوس" and "بن" all return nothing. People search by **link** (تحميل من رابط بنترست، تحويل رابط بنترست إلى فيديو) or by media type. Pinterest's Arabic UI calls a Pin "منشور".
- **The five markets search the same way.** Of 484 market/seed pairs, 404 return the same suggestions as Saudi Arabia (mean Jaccard 0.92). That rules out regional pages.

Collection method: 1,196 Google Suggest requests (hl=ar; gl = sa, eg, ae, ma, iq), spaced 1.15 s apart, with 0 errors. Batch 1 sent 163 seeds to all 5 markets. Batch 2 sent 83 follow-up seeds to SA, EG and MA. Batch 3 expanded the three head terms letter by letter (22 letters).

## Page plan

Slugs stay English under `/ar/`. A transliterated slug matches nothing anyone types. Arabic-script slugs turn into long `%D8%…` strings when shared on WhatsApp and break the ASCII-only canonical, sitemap and redirect code. The English slugs are themselves queries Arabic-locale users type, such as "pinterest video downloader" and "pinterest to mp4". Arabic tool competitors also keep English slugs.

The repo's `seo_health_check.py` ran against mock heads for all 13 pages: 0 errors and 0 warnings. Titles are 45–61 characters and descriptions 134–147.

| Priority | English slug | Arabic path | Primary keyword | H1 |
|---|---|---|---|---|
| high | index | `/ar` | تحميل من بنترست | تحميل من بنترست |
| high | pinterest-video-downloader | `/ar/pinterest-video-downloader` | تحميل فيديو من بنترست | تحميل فيديو من بنترست |
| high | pinterest-image-downloader | `/ar/pinterest-image-downloader` | تحميل صور من بنترست | تحميل صور من بنترست |
| high | how-to-download-pinterest-videos | `/ar/how-to-download-pinterest-videos` | طريقة تحميل فيديو من بنترست | طريقة تحميل فيديو من بنترست |
| high | how-to-download-pinterest-video-in-gallery | `/ar/how-to-download-pinterest-video-in-gallery` | حفظ فيديو من بنترست في الاستديو | حفظ فيديو بنترست في الاستديو |
| medium | pinterest-pin-downloader | `/ar/pinterest-pin-downloader` | تحميل من رابط بنترست (re-targeted to "download by link") | تحميل من رابط بنترست |
| medium | pinterest-gif-downloader | `/ar/pinterest-gif-downloader` | تحميل gif من بنترست | تحميل GIF من بنترست |
| medium | pinterest-board-downloader | `/ar/pinterest-board-downloader` | تحميل جميع صور لوحة بنترست | تحميل لوحة بنترست كاملة |
| medium | download-pinterest-videos-iphone-android | `/ar/download-pinterest-videos-iphone-android` | تحميل فيديو من بنترست على الايفون | تحميل فيديو بنترست على الآيفون والأندرويد |
| medium | pinterest-4k-downloader | `/ar/pinterest-4k-downloader` | تحميل من بنترست بدقة عالية (honest re-angle, no 4K claim) | تحميل من بنترست بدقة عالية |
| low | pinterest-to-mp4 | `/ar/pinterest-to-mp4` | تحويل رابط بنترست إلى فيديو | تحويل رابط بنترست إلى فيديو MP4 |
| low | pinterest-profile-picture-downloader | `/ar/pinterest-profile-picture-downloader` | تحميل صورة بروفايل بنترست | تحميل صورة بروفايل بنترست |
| low | how-to-download-pinterest-video-on-laptop | `/ar/how-to-download-pinterest-video-on-laptop` | تحميل الفيديو من بنترست للكمبيوتر | تحميل فيديو من بنترست للكمبيوتر |

### Titles and descriptions

| Page | Title | Description |
|---|---|---|
| index | تحميل من بنترست: فيديو وصور وGIF مجانًا \| PintDownload | حمّل فيديوهات وصور وGIF ولوحات بنترست العامة بلصق الرابط فقط. مجانًا وبدون حساب أو برامج، ولا نضيف أي علامة مائية. يعمل على الجوال والكمبيوتر. |
| video | تحميل فيديو من بنترست بدون علامة مائية MP4 \| PintDownload | حمّل فيديو من بنترست بصيغة MP4 بأعلى جودة متاحة (720p أو 1080p حسب المصدر). الصق الرابط فقط، بدون برامج أو حساب، ولا نضيف أي علامة مائية. |
| image | تحميل صور من بنترست بجودة عالية وبدون حساب \| PintDownload | حمّل صور بنترست بأكبر حجم يتيحه بنترست للعامة، وليس الصورة المصغرة. الصق رابط المنشور واحفظ الصورة في الاستديو أو على الكمبيوتر، مجانًا وبدون حساب. |
| how-to | طريقة تحميل فيديو من بنترست بدون علامة مائية (خطوة بخطوة) | شرح طريقة تحميل فيديو من بنترست على الآيفون والأندرويد والكمبيوتر: انسخ الرابط من زر المشاركة، الصقه في الأداة، واحفظ MP4 في الاستديو. بدون برامج. |
| gallery | حفظ فيديو من بنترست في الاستديو أو المعرض بدون برامج | خطوات حفظ فيديو بنترست في الاستديو على سامسونج وأندرويد أو في تطبيق الصور على الآيفون، وماذا تفعل إذا نزل الفيديو ولم يظهر في الاستديو. مجانًا. |
| pin (link) | تحميل من رابط بنترست: الصق رابط المنشور واحفظه \| PintDownload | انسخ رابط أي منشور عام من بنترست أو رابط pin.it المختصر والصقه هنا، واحفظ الفيديو أو الصورة أو GIF أو كل صور المنشور. مجانًا وبدون حساب. |
| gif | تحميل GIF من بنترست: صور متحركة تبقى متحركة \| PintDownload | حمّل صور GIF المتحركة من بنترست كملف GIF حقيقي لا يتحول إلى صورة ثابتة. الصق رابط المنشور واحفظ الصورة المتحركة على جوالك أو الكمبيوتر مجانًا. |
| board | تحميل جميع صور لوحة بنترست دفعة واحدة (ZIP) \| PintDownload | حمّل جميع صور وفيديوهات لوحة بنترست العامة دفعة واحدة في ملف ZIP. الصق رابط اللوحة ونجمع لك منشوراتها العامة. مجانًا، ولا يعمل مع اللوحات السرية. |
| phone | تحميل فيديو من بنترست على الآيفون والأندرويد بدون برامج | حمّل فيديو بنترست على الآيفون من Safari واحفظه في الصور عبر تطبيق الملفات، أو على الأندرويد من Chrome إلى الاستديو. بدون تطبيقات وبدون علامة مائية. |
| HD / 4K | تحميل من بنترست بدقة عالية: هل يوجد 4K فعلًا؟ | نحمّل لك أعلى دقة ينشرها بنترست فعلًا: فيديو 720p أو 1080p وصور حتى 1200 بكسل عرضًا. لا نرفع الدقة صناعيًا ولا نعد بـ4K غير موجود. جرّب برابطك. |
| to-mp4 | تحويل رابط بنترست إلى فيديو MP4 مجانًا \| PintDownload | حوّل رابط منشور فيديو من بنترست إلى ملف MP4 تشغّله على أي جهاز وبدون إنترنت. الصق الرابط واختر الجودة واحفظ الملف، مجانًا وبدون برامج أو حساب. |
| profile picture | تحميل صورة بروفايل بنترست بأكبر حجم متاح \| PintDownload | اعرض صورة الملف الشخصي لأي حساب عام على بنترست بحجم أكبر واحفظها على جهازك. الصق رابط الحساب فقط، بدون تسجيل دخول وبدون تطبيق. مجانًا. |
| laptop | تحميل فيديو من بنترست للكمبيوتر واللابتوب بدون برامج | حمّل فيديوهات وصور بنترست على الكمبيوتر أو اللابتوب (ويندوز وماك وكروم بوك) من المتصفح مباشرة، بدون تثبيت برنامج بنترست أو أي إضافة. مجانًا. |

Secondary keywords, FAQ topics, evidence lines and per-page notes are in `ar.json` → `pages`.

### Skipped pages (6). These get no `ar` hreflang alternate.

- **pinterest-profile-downloader:** no Arabic demand. All five "download a whole profile" phrasings return nothing. "تحميل حساب بنترست" means installing the app. Fold it into an FAQ on the board page.
- **pinterest-carousel-downloader:** no demand ("تحميل كاروسيل بنترست" and "تحميل صور متعددة" return nothing). The pin (link) page and the image FAQ cover it as "منشور متعدد الصور".
- **pinterest-story-downloader:** the format is retired, and "قصص بنترست" means children's stories while "ستوري بنترست" means Instagram story ideas. The real phrase "تحميل فيديو ستوري … بدون علامة مائية" is about video, so it goes on the video page.
- **pinterest-audio-downloader:** thin demand, and the feature is not honest yet. The "MP3" button saves the **MP4 video under a .mp3 filename** (`DownloaderForm.tsx`, around lines 966 and 2072).
- **pinterest-video-downloader-chrome:** "…بنترست كروم" completes to car chrome trim (كرومات), and "اضافة كروم بنترست" means Pinterest's own Save extension. Our tool is a bookmarklet, so an Arabic "إضافة" page would mislead. The laptop guide covers the bookmarklet.
- **pinterest-seo-title-generator:** `/api/generate-seo` only produces English. Arabic demand is "الربح من بنترست" (making money from Pinterest), a blog topic.

## Pinterest's Arabic UI words (for the how-to steps)

Sources are the help.pinterest.com/ar articles listed in `ar.json` → `evidence.pinterestAppTerms`.

| English | Pinterest Arabic | Note |
|---|---|---|
| Pin | منشور / منشورات | never "دبوس" |
| Video Pin | منشورات الفيديو | |
| Share | مشاركة | "أيقونة مشاركة" |
| Copy link | نسخ الرابط | |
| Download image | تنزيل الصورة | in the ellipsis menu "رمز النقاط الثلاث" |
| Save (to board) | حفظ | do not use it for saving to the phone without "على جهازك" |
| Board / secret board | لوحة / "حافظ على سرية هذه اللوحة" | |
| Profile / profile picture | الملف الشخصي / صورة ملفك الشخصي | the query word is "صورة بروفايل" |
| Gallery | المعرض (Android), الصور (iPhone) | Samsung's app is "الاستديو", which is why people search it |
| Idea Pin | none found | the format is retired |

## Claim-ticket vocabulary

Arabic has native ticket words, so these replace calques:

- **"Admit one · public link"** → **تذكرة دخول · رابط عام**
- **"No."** → **رقم**, followed by Latin digits inside `<bdi>`
- **Stub label** → **تحميل** (the searched verb)
- **Receipt band** → **جاهز · منشور فيديو**
- **Void** → **ملغاة**; **Done** → **تم**; **Partial** → **جزئي**
- **Placeholder** → **الصق رابط بنترست هنا (منشور، فيديو، لوحة، حساب)…**
- **Design vocabulary:** كعب التذكرة (stub), الشباك (counter), إيصال (receipt), تذكرة استلام (claim ticket)

Arabic has no capital letters and must never be letter-spaced, because tracking breaks the joins between letters.

## Formats

- **Digits:** Western 0–9 everywhere, via `Intl` with `ar-u-nu-latn-ca-gregory`. Searchers type Western digits (4k, 1080, mp4), pin IDs must match their URLs, and Morocco and the UAE default to them. `ar-SA`, `ar-EG` and `ar-IQ` would print ١٢٣ and can default `ar-SA` to the Hijri calendar.
- **Dates:** "14 أكتوبر 2026", Gregorian. Iraq's default is "تشرين الأول", so set the locale explicitly.
- **Decimals:** none in static copy. Morocco uses a decimal comma and the others a point.
- **Plurals:** six categories (zero, one, two, few, many, other). Every counted string needs all six forms, or avoid the counted noun (forms for منشور, ملف and صورة are in the JSON).
- **Punctuation:** ، ؛ ؟ and «» for quoted UI labels. Units in Latin (MB, 1080p, 1200 × 1200) inside `<bdi>`.

## RTL notes

- Set `dir="rtl"` server-side on /ar routes. The current language selector flips direction client-side over English HTML, which is not enough for crawlers or first paint.
- Convert physical CSS to logical properties. Components have about 53 `text-left` and 7 `border-l/r`, and `src/styles` has about 46 left/right declarations. Tailwind 3.4 already supports `ms/me/ps/pe/start/end` and `rtl:`.
- The stub tears from its top-left corner today. In RTL it should tear from the top-right: `transform-origin: 100% 0`, `translate(-6px, 18px) rotate(3.5deg)`.
- Big Shoulders has no Arabic glyphs. Add a heavy Arabic display face: Alexandria, which is based on Egyptian street signage and fits the printed-ticket look, or Noto Kufi Arabic or Cairo. Use line-height of about 1.2 (0.88 clips dots), no uppercase, no tracking, no italics.
- The URL input types LTR while its Arabic placeholder reads RTL. Use `:placeholder-shown { direction: rtl }`.
- Wrap URLs, pin.it links, filenames, pin IDs and "MP4 (1080p)" in `<bdi>` or `dir="ltr"`.
- Mirror arrows, chevrons and breadcrumbs. Do not mirror the download, play or logo icons.
- `step1–3.webp` contain English labels and a left-to-right flow. Arabic pages need Arabic versions.

## Risks and fixes to raise

1. **Honesty in the English sources:**
   - The 4K page claims "4K ultra quality, original uncompressed". The extractor only returns 720p, 1080p or 540p video and 1200 px images.
   - The image page says "original".
   - The MP3 is a renamed MP4.

   The Arabic copy avoids all three. The English pages should be fixed too.
2. **Watermark wording:** say "لا نضيف أي علامة مائية" (we add none), never that we remove watermarks. Logos burned into a video (TikTok, Instagram) stay. Pinterest's download is a creator opt-in, so keep the "credit the creator / personal use" line next to the claim.
3. **i18n.ts Arabic bugs:**
   - The placeholder "أنقش" means "engrave"; it should be "الصق".
   - "بوردات" should be "لوحات".
   - "1080p" is claimed for everything.
   - The Saudi flag is used for an all-Arab locale.
4. **Cannibalisation:** two pairs need separate primaries.
   - Video tool vs how-to guide: the tool takes the bare head term, the guide takes "طريقة / كيف".
   - Gallery guide vs phone guide: the gallery guide takes الاستديو / المعرض, the phone guide takes device names.
5. **Thin pages:** if the team wants fewer pages, fold these into their parents first, in this order: to-mp4, profile picture, laptop. The HD / 4K page must ship with real resolution content or not at all.
6. **Unverified:** the iOS Arabic labels (الملفات، حفظ الفيديو، التنزيلات) are standard but were not confirmed on an Apple Arabic help page. Check them on a device before making screenshots.
7. **Ranking evidence is indirect.** Google SERPs could not be fetched: Bing blocked curl and WebSearch is US-only. Competitor strategy comes from their pages, plus competitor titles that appear as Google suggestions (SavePin's "تنزيل فيديو من بنترست بسهولة وسرعة", expertsphp, publer).

## Competitors checked

| Competitor | What we found |
|---|---|
| KlickPin `/ar/` | Machine-translated, English slugs, hreflang `ar` |
| SavePin `/pinterest-downloader/ar/` | Correct "بنترست" spelling; its title is itself a Google suggestion |
| PinterestDownloader.io `/ar-04` | Invalid `lang`; its canonical points to the English root |
| PinDown `/ar1` | Claims "1080p, 2K, 4K"; has a "private downloader" page |
| pinterestvideo.com `/ar/` | No RTL; leftover English "Step:" text |
| Editorial articles (amwaly, mhtwyat, arageek) | Win the "كيف / طريقة" queries using the exact searched vocabulary |

None of the tools explains why the watermark exists, uses Pinterest's own Arabic UI words, or is honest about resolution. Those are our openings.
