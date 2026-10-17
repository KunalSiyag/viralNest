# ar: requests for infra (slugs, titles, checks, templates)

Writer: writer-ar (agent), 2026-10-16. **No slug changes requested.** 12 of the 13 ar pages are written to the plan §3 titles, descriptions and H1s, and `npm run i18n:check -- ar` reports 0 errors. The 13th page (`pinterest-4k-downloader`) is written but kept out of the tree because of request 1.

## 1. The 4K page H1 fails `i18n:check` (blocking for that page only)

**Page:** `pinterest-4k-downloader` at `/ar/pinterest-4k-downloader` (status `gated-4k`, gate open).

**What happens:** `checkPageFile` in `src/i18n/content-rules.ts` requires the 4K page H1 to ask a question (`/[?？]|ไหม|هل|var mı|được không/`). The fixed ar H1 from the plan matrix is `تحميل من بنترست بدقة عالية` ("download from Pinterest in high resolution"), which is not a question, so the file reports:

```
error  hero.h1  4K page H1 must ask, not promise
```

Writing a question H1 instead gives the opposite error (`differs from the plan matrix`). Either way, a file in `src/content/i18n/ar/` with an error fails `npm test` (seo-invariants "i18n content files") for every writer, so the page is **not in the tree**. `npm run i18n:check -- ar --strict` therefore reports 1 error: `missing content for /ar/pinterest-4k-downloader`.

The ar H1 makes no 4K promise at all: it is the research's primary keyword (`تحميل من بنترست بدقة عالية`, a top-3 completion of the head term in SA, EG, MA and IQ; research `ar.json` page `pinterest-4k-downloader`). The title already asks: `… هل يوجد 4K فعلًا؟`. th has the same shape (`โหลดรูป Pinterest ให้ชัด`).

**Request (preferred): narrow the check.** Only demand a question when the H1 names 4K:

```ts
if (isFourK && /4K/i.test(page.hero.h1) && !/[?？؟]|ไหม|هل|var mı|được không/.test(page.hero.h1)) { … }
```

(Also add the Arabic question mark `؟` U+061F to the class: `[?？]` does not match it.)

**Fallback: change the matrix H1** to `تحميل من بنترست بدقة عالية: هل يوجد 4K؟` (40 code points; keeps the primary keyword and asks). I checked the file below against both: with the matrix H1 the only error is the "must ask" rule; with this H1 the only error is the matrix comparison.

**Ready file:** save the JSON below as `src/content/i18n/ar/pinterest-4k-downloader.json` once either fix lands (it carries the current matrix H1; with the fallback, replace `hero.h1`). It passes the schema, links, honesty and uniqueness rules. A copy is in the writer's scratchpad: `scratchpad/writer-ar/pinterest-4k-downloader.json`, and `scratchpad/writer-ar/check-one.mjs <repo> ar <file> [h1]` runs the page rules on it without putting it in the tree. No other ar page links to it yet, so adding it changes nothing else.

## 2. Seen in the RTL preview, outside the ar files (small)

- **404 serial:** `/ar/404` prints `No. 404` in the ticket header (hard-coded in `src/pages/[locale]/404.astro`). Arabic wants `رقم 404`, the same wording as `ticket.serial` in `src/i18n/island/ar.ts`. Screenshot: `viralnest-shots/i18n/writer-ar/404-390.png`.
- **ZIP line-item note:** `DownloaderForm.tsx` joins the pack contents with `', '` (`MP4, MP3, صورة الغلاف`). Arabic uses `،`. Optional: a `listSeparator` key in the island catalog.
- **Board tiles:** untitled pins show the server's `Pin 783444` titles in English (`/api/extract` item titles), not the catalog's `fallbacks.pinN` (`المنشور {n}`). Seen on `receipt-board-390-hero.png`.
- **Default board example:** `pinterest/spice-up-your-dinner-plans` still returns nothing (also reported by de and fr). The ar board page sets `steps.exampleUrl` to `https://www.pinterest.com/pinterest/pinterest-presents/`, which returned 37 pins (36 images, 1 video) on 2026-10-16 in `astro dev`.
- **Step pictures** (`public/images/step1–3.webp`) still show English labels and a left-to-right flow on /ar (known; research `ar.json` → `notes.rtl.illustrations`).

## 3. Bidi notes (already handled in the ar files, for reviewers)

- `collection.byUser` / `atUser` start the handle with U+200E (LRM): without it the `@` jumps to the end in RTL (`pinterest@`). `single.audioName` puts U+200E before `{kbps}` so `192 kbps` stays one run. These are plain-text equivalents of `<bdi>` for strings the island prints with `fmt()`.
- Content writes `MP3 (192 kbps)` rather than `بجودة 192 kbps` for the same reason.
- The hub placeholder is just `الصق رابط بنترست هنا…`: the longer research placeholder was cut off at 390 px.
- `›` between quoted labels («مشاركة» › «نسخ الرابط») is mirrored by the browser in RTL, so it points forward (checked in Chromium).

## 4. For the native reviewer (unverified labels)

From the research or standard Arabic UI, **not** confirmed on a device (research `ar.json` → `evidence.pinterestAppTerms` "iOS labels (unverified)"):

- iOS: «الملفات» › «التنزيلات», «مشاركة» › «حفظ الفيديو» / «حفظ الصورة», the Safari download prompt, «تنزيل الملف المرتبط» on long-press, the Photos album «متحركة».
- Samsung: «ملفاتي», «الاستديو» (also spelled الاستوديو), extracting a ZIP in «ملفاتي». Xiaomi «المعرض».
- Pinterest (from help.pinterest.com/ar): «مشاركة», «نسخ الرابط», «رمز النقاط الثلاث» › «تنزيل الصورة», «حافظ على سرية هذه اللوحة». The video «تنزيل» button is described as appearing only when the creator allows it.

## Ready content: `src/content/i18n/ar/pinterest-4k-downloader.json`

```json
{
  "pageId": "pinterest-4k-downloader",
  "locale": "ar",
  "meta": {
    "title": "تحميل من بنترست بدقة عالية: هل يوجد 4K فعلًا؟",
    "description": "نحمّل لك أعلى دقة ينشرها بنترست فعلًا: فيديو 720p أو 1080p وصور حتى 1200 بكسل عرضًا. لا نرفع الدقة صناعيًا ولا نعد بـ4K غير موجود. جرّب برابطك."
  },
  "keywords": {
    "primary": "تحميل من بنترست بدقة عالية",
    "secondary": [
      "تحميل فيديوهات بنترست بدقة عالية",
      "تحميل فيديو من بنترست 4k",
      "تنزيل من بنترست 4k",
      "تحميل صور بنترست 4k",
      "تحميل من بنترست بجودة عالية"
    ]
  },
  "nav": {
    "label": "الدقة العالية و4K",
    "short": "دقة عالية",
    "card": {
      "title": "تحميل بدقة عالية: هل يوجد 4K؟",
      "blurb": "ما ينشره بنترست فعلًا: فيديو 720p عادةً، و1080p إذا كانت في المنشور.",
      "badge": "4K؟"
    }
  },
  "hero": {
    "h1": "تحميل من بنترست بدقة عالية",
    "lede": "أعلى دقة ينشرها بنترست لكل منشور، مع شرح صريح لما يعنيه «4K» هنا. الصق رابطك وسترى الدقة الحقيقية قبل الحفظ."
  },
  "intro": [
    "يبحث كثيرون عن تحميل من بنترست بدقة 4K، والجواب الصريح: **بنترست لا ينشر الفيديو بدقة 4K تقريبًا**. يعيد بنترست ترميز كل ما يُرفع إليه، وملفات الفيديو العامة عادةً بدقة 720p، و1080p إذا كانت متاحة في المنشور، والصور حتى **1200 بكسل عرضًا**.",
    "PintDownload يحفظ أكبر ملف موجود فعلًا في المنشور، ويكتب لك دقته في الإيصال. لا نرفع الدقة صناعيًا، ولا نكتب «4K» على فيديو دقته 720p."
  ],
  "features": [
    {
      "h": "فيديو MP4",
      "p": "عادةً 720p، و1080p إذا كانت في المنشور. تظهر كل الدقات المتاحة لتختار منها."
    },
    {
      "h": "صور JPG وPNG",
      "p": "حتى 1200 بكسل عرضًا، وهو أكبر حجم ينشره بنترست. الملف الذي رفعه صاحب الصورة ليس عامًا."
    },
    {
      "h": "صوت MP3",
      "p": "ملف MP3 (192 kbps) يصنعه متصفحك من صوت الفيديو، ولا يُرفع أي شيء."
    }
  ],
  "sections": [
    {
      "h2": "لماذا تقول مواقع أخرى 4K؟",
      "paragraphs": [
        "لأنها تكبّر الملف صناعيًا، أو تكتب الرقم في العنوان فقط. التكبير يزيد عدد البكسلات لكنه لا يضيف تفاصيل لم تكن في الفيديو، فتبدو الحواف ناعمة أكثر من اللازم أو كأنها مرسومة.",
        "إذا رأيت موقعًا يعد بـ4K لمنشور من بنترست، فقارن دقة الملف الحقيقية في خصائص الفيديو بعد تحميله."
      ]
    },
    {
      "h2": "كيف أعرف دقة الملف قبل التحميل؟",
      "paragraphs": [
        "بعد لصق الرابط يظهر في الإيصال ما يقدمه المنشور: دقات الفيديو المتاحة (720p أو 1080p) ومقاس الصورة. اختر الأعلى إن أردت أوضح صورة، أو الأقل إن أردت ملفًا أصغر لواتساب."
      ]
    },
    {
      "h2": "خلفيات 4K من بنترست؟",
      "paragraphs": [
        "خلفية من بنترست بعرض 1200 بكسل تبدو جيدة على معظم الجوالات. أما على شاشة كمبيوتر كبيرة بدقة 4K فستبدو أقل حدة، لأن بنترست لم ينشر الصورة بهذا الحجم أصلًا.",
        "وإذا كنت تحتاج ملفًا بدقة عالية فعلًا للطباعة أو لعمل تجاري، فاطلبه من صاحبه أو اشترِ ترخيصه، فنسخة بنترست للمعاينة، لا الملف الذي يُطبع منه."
      ]
    },
    {
      "h2": "لماذا تبدو بعض الفيديوهات منخفضة الجودة؟",
      "paragraphs": [
        "لأن المصدر نفسه منخفض الدقة: إذا رُفع الفيديو صغيرًا، أو نُشر بدقة 720p فقط، فلن تجد نسخة أعلى منه في أي مكان على بنترست. وما تراه في التطبيق هو ما تحصل عليه هنا."
      ]
    }
  ],
  "steps": {
    "title": "طريقة الحصول على أعلى دقة متاحة",
    "intro": "للمنشورات العامة فقط. الإيصال يعرض الدقة الحقيقية قبل الحفظ.",
    "exampleLabel": "مثال على رابط منشور",
    "items": [
      {
        "title": "انسخ رابط المنشور",
        "body": "في التطبيق: «مشاركة» › «نسخ الرابط». على الكمبيوتر: العنوان الذي فيه `/pin/`. روابط `pin.it` تعمل أيضًا."
      },
      {
        "title": "الصقه بالأعلى",
        "body": "يقرأ PintDownload الملفات التي ينشرها بنترست لهذا المنشور العام."
      },
      {
        "title": "اختر أعلى دقة ظاهرة",
        "body": "منشورات الفيديو تعرض 720p، و1080p إذا كانت في المنشور. والدقة مكتوبة بجانب كل ملف."
      },
      {
        "title": "احفظ الملف كما هو",
        "body": "حمّل MP4 أو الصورة دون أي تعديل، واذكر اسم صاحبه إن شاركته."
      }
    ]
  },
  "faq": {
    "title": "أسئلة شائعة عن الدقة العالية و4K",
    "items": [
      {
        "q": "هل يمكن تحميل فيديوهات بنترست بدقة 4K؟",
        "a": "نادرًا جدًا. بنترست ينشر الفيديو عادةً بدقة 720p، و1080p إذا كانت متاحة، ونعرض لك الدقات الموجودة كما هي دون تكبير."
      },
      {
        "q": "ما أعلى دقة للصور؟",
        "a": "أكبر نسخة عامة من الصورة، وعرضها عادةً حتى 1200 بكسل. أما الملف الذي رفعه صاحبها فليس متاحًا للعامة، فلا تصل إليه أي أداة."
      },
      {
        "q": "لماذا تقول مواقع أخرى إنها تحمّل بدقة 4K؟",
        "a": "لأنها تكبّر الملف صناعيًا. التكبير يكبّر الحجم ولا يضيف وضوحًا، ونحن لا نفعله."
      },
      {
        "q": "كيف أعرف دقة الملف قبل التحميل؟",
        "a": "تظهر الدقة في الإيصال بجانب كل ملف بعد لصق الرابط، فتعرف ما ستحصل عليه قبل الحفظ."
      },
      {
        "q": "هل يمكن تحميل خلفيات 4K من بنترست؟",
        "a": "فقط إذا نشرها بنترست بهذا الحجم، وهذا نادر. معظم الصور العامة عرضها 1200 بكسل أو أقل."
      },
      {
        "q": "لماذا يبدو الفيديو منخفض الجودة؟",
        "a": "لأن المصدر نفسه منخفض الدقة. لا توجد على بنترست نسخة أعلى مما ينشره للمنشور."
      },
      {
        "q": "هل يضغط PintDownload الملف أو يضيف علامة مائية؟",
        "a": "لا. تحصل على الملف الذي يقدمه بنترست كما هو، ولا نضيف أي علامة. الملف الوحيد الذي يُصنع عندك هو MP3، يصنعه متصفحك من صوت الفيديو."
      },
      {
        "q": "هل PintDownload تابع لبنترست؟",
        "a": "لا. PintDownload موقع مستقل وغير تابع لشركة Pinterest، ويعمل مع المنشورات العامة فقط."
      }
    ]
  },
  "related": {
    "title": "أدوات أخرى بأعلى دقة متاحة"
  },
  "schema": {
    "appName": "تحميل من بنترست بدقة عالية — PintDownload",
    "howToName": "طريقة تحميل منشور من بنترست بأعلى دقة متاحة",
    "howToDescription": "الصق رابط منشور عام، وراجع الدقة في الإيصال، واحفظ أكبر ملف ينشره بنترست له."
  },
  "datePublished": "2026-10-16",
  "dateModified": "2026-10-16",
  "review": {
    "writer": "writer-ar (agent), 2026-10-16"
  }
}
```

## Release decisions (release-integrator, 2026-10-16)

1. **4K page H1: applied (fallback, matrix change).** Matrix `h1` changed to `تحميل من بنترست بدقة عالية: هل يوجد 4K؟`, so the explainer's H1 asks like the other five (user decision 2). The check was not narrowed; `؟` (U+061F) was added to its question class. File saved with the new H1; `/ar/pinterest-4k-downloader` is live (screenshots `release/ar-4k-390*.png`).
2. **404 serial: applied.** `src/pages/[locale]/404.astro` prints the catalog's `ticket.serial` (`رقم 404`, `№ 404`, `Nº 404`, …) instead of the hard-coded `No. 404`. ZIP list separator `،`: deferred (needs a new catalog key everywhere). Server pin titles `Pin 783444`: deferred to the extractor owner. Default board example: applied. Step pictures: deferred.
**ar release:** all 13 ar pages pass `i18n:check --strict` and the build checks, so ar ships live with the other locales (the user spot-checks ar, th and ru after launch).
