# th: requests for infra (titles, H1, templates)

Writer: writer-th (agent), 2026-10-16. **No slug changes requested.** 11 of the 13 Thai pages are in `src/content/i18n/th/` and pass `npm run i18n:check -- th` with 0 errors. Two pages cannot go in the tree yet, because a fixed value from the plan matrix breaks a content rule. Putting either file in the tree would make `npm test` (seo-invariants "i18n content files") fail for every writer, so both are held here, ready to save.

## 1. HD page: the fixed H1 fails the 4K-page rule (blocking)

**Page:** `pinterest-4k-downloader` at `/th/pinterest-hd-downloader` (status `gated-4k`, gate open).

- Plan H1: `โหลดรูป Pinterest ให้ชัด` (a statement).
- `checkPageFile` in `src/i18n/content-rules.ts` requires the 4K explainer's H1 to ask (`/[?？]|ไหม|…/`), and user decision 2 publishes these pages as honest "is 4K possible?" pages.
- Result with the plan value: `ERROR hero.h1 4K page H1 must ask, not promise`.

**Request:** change the matrix row's `h1` to **`โหลดรูป Pinterest ให้ชัด ได้แค่ไหน?`** (“How sharp can a Pinterest image get?”, 35 code points). It keeps the primary keyword `โหลดรูป pinterest ให้ชัด` intact at the start, asks instead of promising, and matches the English H1 “Pinterest in 4K? The real quality”. Title and description stay as planned.

Checked with the real rules and a patched matrix row: 0 errors, 1 warning (the planned description says “ต้นฉบับ”; it reads as “if the source isn't 4K”, which is honest, so I left the fixed description alone).

## 2. Profile picture page: the fixed title makes a full-size claim (blocking)

**Page:** `pinterest-profile-picture-downloader` at `/th/pinterest-profile-picture-downloader` (live).

- Plan title: `โหลดรูปโปรไฟล์ Pinterest ขนาดเต็ม ดูรูปโปรไฟล์แบบเต็มรูป`.
- “ขนาดเต็ม” means “full size”. `ORIGINAL_CLAIM.th` rejects it, and the planner already replaced it with “ขนาดใหญ่สุด” on the home, image and pin rows; this row was missed. The avatar Pinterest publishes is usually about 600×600, so “full size” over-claims.
- Result with the plan value: `ERROR meta.title "original size/resolution/quality" claim`.

**Request:** change the matrix row's `title` to **`โหลดรูปโปรไฟล์ Pinterest ขนาดใหญ่สุด ดูรูปโปรไฟล์แบบเต็มรูป`** (59 code points, inside 40–62). “แบบเต็มรูป” (the whole picture, not the cropped circle) stays: it is the searched phrase (`ดูรูปโปรไฟล์ pinterest เต็มรูป`, research `th.json`) and makes no size claim. Checked with a patched row: 0 errors, 0 warnings.

## 3. After 1 and 2 land: links to add (writer or infra)

Internal links must point at pages in the tree, so these are not written yet:

- `pinterest-image-downloader.json`, section “รูปที่ได้ใหญ่แค่ไหน”, end of paragraph 2: append ` อ่านวิธีแก้รูปเบลอได้ที่[[pinterest-4k-downloader|หน้าโหลดรูปให้ชัด]]`.
- `home.json`, section 1 list, last item: replace “หรือเซฟแค่รูปโปรไฟล์” with “หรือเซฟแค่[[pinterest-profile-picture-downloader|รูปโปรไฟล์]]”.
- `home.json`, section 1 list, item 2: append ` ถ้ารูปที่เคยเซฟมาเบลอ ดู[[pinterest-4k-downloader|วิธีโหลดรูปให้ชัด]]`.

## 4. HD page form says “โหลดวิดีโอ” on an image-first page (minor)

`PAGES['pinterest-4k-downloader'].variant` is `video` for every locale. The Thai twin is about blurry **images** (research: the “ไม่ชัด” cluster), so its form placeholder and stub read “วางลิงก์พินวิดีโอ… / โหลดวิดีโอ”. An image pin still extracts correctly there; only the labels mismatch. Suggestion: a per-locale variant override (`pin` for th) in `routes.ts`, or accept it.

## 5. Route notice prints a Latin full stop (minor)

`DownloaderForm.tsx` renders the notice as `{message}.{' '}<a>{open}</a>`. Thai sentences take no full stop (research `formats.punctuation`), so Thai shows “…เปลี่ยนเป็นโหมดโหลดวิดีโอให้แล้ว. เปิดหน้าเครื่องมือนั้น”. Suggestion: move the separator into the catalog (for example `routeNotice.separator`: `'. '` in English, `' · '` in th).

## 6. Section headings uppercase the Latin words (minor, design)

The localized `h2`s are uppercased, so Thai headings print “EDGE, BRAVE, OPERA, FIREFOX และ SAFARI” and “บน CHROME มือถือใช้ได้ไหม”, while the H1 keeps “Pinterest”. The research typography note suggests `text-transform: none` for `:lang(th)` headings so brand names read as brands. Not blocking; screenshots in `viralnest-shots/i18n/writer-th/`.

## 7. Already reported by other writers, also true on /th

- Profile picture avatar URL `/1200x/` returns 403 (fr request 4). The Thai profile picture page will show a broken receipt image until `upgradeAvatarUrl()` falls back to a size that exists.
- The default board example link returns `collection_empty` (fr request 3). The Thai board page uses the default example.

## Unverified labels for the native reviewer

Research could not confirm these on a Thai-language device; each page's `review.writer` names the ones it uses:

- Pinterest app: **แชร์ › คัดลอกลิงก์** (Copy link). The ellipsis menu **ไอคอนจุดไข่ปลา › ดาวน์โหลดรูปภาพ** and **บันทึก** (save to board) come from help.pinterest.com/th and are verified.
- iOS: Files **ไฟล์ › ดาวน์โหลด**, share sheet **บันทึกวิดีโอ** / **บันทึกภาพ**, Photos album **ล่าสุด** and **ภาพเคลื่อนไหว**, Safari prompt **ดาวน์โหลด**, long-press **ดาวน์โหลดไฟล์ที่ลิงก์**.
- Android: Chrome long-press **ดาวน์โหลดลิงก์**, Samsung **ไฟล์ของฉัน**, Google Photos **คลังภาพ**, Files by Google “แตกไฟล์”.
- LINE: chat-room **อัลบั้ม**, and whether it accepts videos (the copy hedges).
- Chrome: “Chrome เว็บสโตร์”; Safari: “รายการโปรด”; ChromeOS Files: “ไฟล์ › ดาวน์โหลด”.

## Ready content: `src/content/i18n/th/pinterest-4k-downloader.json`

Carries the requested H1. Save as is once request 1 is applied.

```json
{
  "pageId": "pinterest-4k-downloader",
  "locale": "th",
  "meta": {
    "title": "โหลดรูป Pinterest ให้ชัด ได้ความละเอียดสูงสุดที่มีจริง",
    "description": "รูปจาก Pinterest ไม่ชัด? วางลิงก์พินแล้วรับไฟล์ใหญ่ที่สุดที่ Pinterest เก็บไว้ ทั้งรูปและวิดีโอ ไม่ใช่รูปย่อ ไม่บีบอัดซ้ำ และไม่อ้าง 4K ถ้าต้นฉบับไม่ใช่"
  },
  "keywords": {
    "primary": "โหลดรูป pinterest ให้ชัด",
    "secondary": [
      "pinterest รูปไม่ชัด",
      "โหลดวิดีโอ pinterest ให้ชัด",
      "pinterest ความละเอียดสูงสุด",
      "pinterest 4k",
      "pinterest hd downloader"
    ]
  },
  "nav": {
    "label": "โหลดรูปให้ชัด",
    "short": "ให้ชัด",
    "card": {
      "title": "โหลดรูปให้ชัด",
      "blurb": "รูปเบลอแก้ยังไง และไฟล์ที่ชัดที่สุดที่ Pinterest มีจริงคือขนาดไหน",
      "badge": "HD"
    }
  },
  "hero": {
    "h1": "โหลดรูป Pinterest ให้ชัด ได้แค่ไหน?",
    "lede": "รูปเบลอเพราะได้แค่รูปย่อหรือภาพแคปหน้าจอ วางลิงก์พินแล้วรับ**ไฟล์ใหญ่ที่สุดที่ Pinterest เผยแพร่** ทั้งรูปและวิดีโอ เราไม่ขยายภาพหลอกให้กลายเป็น 4K"
  },
  "intro": [
    "รูปจาก Pinterest ที่เซฟมาแล้วไม่ชัด ส่วนใหญ่ไม่ได้เสียที่ตัวรูป แต่เพราะสิ่งที่เซฟมาคือรูปย่อในฟีดหรือภาพแคปหน้าจอ หน้านี้อธิบายว่า Pinterest มีไฟล์ใหญ่แค่ไหนจริงๆ และวิธีเอาไฟล์ที่ชัดที่สุดของพินนั้นมาเก็บไว้",
    "สรุปสั้นๆ: รูปกว้างได้ถึง 1200 พิกเซล วิดีโอปกติ 720p และได้ 1080p ถ้าพินนั้นมี ส่วน 4K นั้น Pinterest แทบไม่เคยเผยแพร่"
  ],
  "features": [
    {
      "h": "ไม่มี 4K ปลอม",
      "p": "ถ้าพินมีแค่ 720p ก็ได้ 720p เราไม่ยืดไฟล์ให้ดูเหมือน 4K"
    },
    {
      "h": "เห็นความละเอียดจริง",
      "p": "ผลลัพธ์บอกความละเอียดของแต่ละไฟล์ให้เห็นก่อนกดเซฟ"
    },
    {
      "h": "ไม่บีบอัดซ้ำ",
      "p": "ได้ไฟล์เดียวกับที่ Pinterest ส่งมาทุกไบต์ และไม่มีลายน้ำจากเรา"
    }
  ],
  "sections": [
    {
      "h2": "ทำไมรูปที่เซฟจาก Pinterest ไม่ชัด",
      "paragraphs": [
        "รูปเบลอมักมาจากหนึ่งในสี่สาเหตุนี้:"
      ],
      "list": [
        "**เซฟรูปย่อจากฟีด** รูปในหน้าฟีดหลักและผลค้นหาเป็นไฟล์เล็กที่โหลดเร็ว กดค้างแล้วเซฟจากตรงนั้นจะได้รูปเล็กตาม",
        "**แคปหน้าจอ** ได้แค่ความละเอียดของจอ แถมติดขอบ ปุ่ม และการบีบอัดของแอปมาด้วย",
        "**ส่งต่อผ่านแอปแชต** แอปแชตหลายตัวรวมถึง LINE มักลดขนาดรูปตอนส่ง ถ้าจะส่งต่อ ให้ส่งเป็นไฟล์แทน",
        "**พินนั้นมีแค่รูปเล็ก** ถ้าผู้โพสต์อัปโหลดรูปเล็กมาตั้งแต่แรก ไม่มีเครื่องมือไหนทำให้ชัดขึ้นได้จริง"
      ]
    },
    {
      "h2": "ไฟล์ที่ได้จริงจาก Pinterest",
      "paragraphs": [
        "PintDownload เลือกไฟล์ใหญ่ที่สุดที่พินนั้นมีจริง และบอกขนาดให้รู้ก่อนเซฟ:"
      ],
      "list": [
        "**รูป (JPG, PNG หรือ WebP)**: กว้างได้ถึง 1200 พิกเซล ซึ่งเป็นขนาดใหญ่ที่สุดที่ Pinterest เผยแพร่",
        "**วิดีโอ (MP4)**: ปกติ 720p และได้ 1080p ถ้าพินนั้นมี รายการจะแสดงทุกขนาดที่พินมี",
        "**GIF**: ไฟล์ GIF ที่วนเล่นตามที่ Pinterest ส่งมา ไม่ใช่ภาพนิ่งเฟรมแรก",
        "**เสียง (MP3)**: 192 kbps ทำในเบราว์เซอร์จากเสียงของวิดีโอ ไม่มีการอัปโหลด"
      ]
    },
    {
      "h2": "ถ้าต้องการชัดกว่าที่ Pinterest มี",
      "paragraphs": [
        "งานพิมพ์ จอใหญ่ หรืองานลูกค้า ควรใช้ไฟล์จากแหล่งที่มา ไม่ใช่สำเนาจาก Pinterest เปิดลิงก์ที่มาของพิน หรือขอไฟล์จากเจ้าของผลงาน และซื้อสิทธิ์ใช้งานถ้าจะใช้เชิงพาณิชย์ ส่วนการเซฟทั่วไป [[pinterest-image-downloader|หน้าโหลดรูป]]และ[[pinterest-video-downloader|หน้าโหลดวิดีโอ]]ให้ไฟล์ที่ดีที่สุดชุดเดียวกับหน้านี้"
      ]
    }
  ],
  "steps": {
    "title": "วิธีเอาไฟล์ที่ชัดที่สุดของพิน",
    "intro": "ใช้ได้เฉพาะพินสาธารณะ ผลลัพธ์จะแสดงความละเอียดจริงก่อนเซฟ",
    "exampleLabel": "ตัวอย่างลิงก์พิน",
    "exampleUrl": "https://www.pinterest.com/pin/…",
    "items": [
      {
        "title": "คัดลอกลิงก์พิน",
        "body": "ในแอปแตะ**แชร์** › **คัดลอกลิงก์** บนเว็บคัดลอกที่อยู่ที่มี `/pin/` ลิงก์ `pin.it` ก็ใช้ได้"
      },
      {
        "title": "วางในช่องด้านบน",
        "body": "PintDownload จะอ่านไฟล์ทั้งหมดที่ Pinterest เผยแพร่สำหรับพินสาธารณะนั้น"
      },
      {
        "title": "เลือกขนาดใหญ่ที่สุด",
        "body": "พินวิดีโอจะแสดง 720p และ 1080p ถ้าพินนั้นมี ความละเอียดจริงอยู่ข้างไฟล์แต่ละตัว"
      },
      {
        "title": "เซฟไฟล์",
        "body": "เซฟ MP4 หรือรูปตามที่ได้มา ถ้าจะโพสต์ต่อ อย่าลืมให้เครดิตเจ้าของผลงาน"
      }
    ]
  },
  "faq": {
    "title": "คำถามที่พบบ่อยเรื่องความชัดและ 4K",
    "items": [
      {
        "q": "ทำไมรูปที่เซฟจาก Pinterest ไม่ชัด?",
        "a": "ส่วนใหญ่เพราะเซฟรูปย่อจากฟีด แคปหน้าจอ หรือส่งต่อผ่านแอปแชตที่ลดขนาดรูป วางลิงก์พินที่นี่จะได้ไฟล์ใหญ่ที่สุดที่ Pinterest เผยแพร่สำหรับพินนั้น"
      },
      {
        "q": "รูป Pinterest ไม่ชัด แก้ยังไง?",
        "a": "อย่าเซฟจากหน้าฟีดหรือแคปหน้าจอ ให้คัดลอกลิงก์ของพินแล้ววางที่นี่ ถ้าได้ไฟล์มาแล้วยังเบลอ แปลว่าพินนั้นมีแค่รูปเล็ก ต้องขอไฟล์จากเจ้าของผลงานแทน"
      },
      {
        "q": "โหลดรูปหรือวิดีโอ Pinterest เป็น 4K ได้ไหม?",
        "a": "แทบไม่ได้ Pinterest เข้ารหัสไฟล์ใหม่ทุกครั้งที่มีคนอัปโหลด วิดีโอสาธารณะปกติเป็น 720p หรือ 1080p ถ้าพินนั้นมี รูปกว้างได้ถึง 1200 พิกเซล เว็บที่ให้ 4K จากพินแค่ขยายไฟล์ ได้พิกเซลเพิ่มแต่รายละเอียดไม่เพิ่ม"
      },
      {
        "q": "วิดีโอได้ 720p หรือ 1080p?",
        "a": "ได้ตามที่ Pinterest เผยแพร่สำหรับพินนั้น หลายพินมีแค่ 720p ถ้ามี 1080p ด้วย รายการจะแสดงทั้งสองขนาดให้เลือก"
      },
      {
        "q": "ทำไมบางพินโหลดมาแล้วยังเบลออยู่ดี?",
        "a": "เพราะไฟล์ใหญ่ที่สุดของพินนั้นก็เล็กอยู่แล้ว ผู้โพสต์อาจอัปโหลดรูปเล็กหรือรูปที่ถูกบีบอัดมาก่อน เราไม่เติมรายละเอียดที่ไม่มีอยู่จริง"
      },
      {
        "q": "เซฟรูปให้ชัดบนไอแพดและ iPhone ยังไง?",
        "a": "อย่ากดค้างเซฟจากรูปในฟีด ให้คัดลอกลิงก์พิน เปิด pintdownload.app ใน Safari วางลิงก์แล้วเซฟ จากนั้นเปิดไฟล์ในแอปไฟล์ แตะแชร์ › **บันทึกภาพ** รูปจะเข้าแอปรูปภาพในขนาดที่โหลดมา"
      },
      {
        "q": "แอปอัปสเกลช่วยให้รูปชัดขึ้นไหม?",
        "a": "ทำให้ไฟล์ใหญ่ขึ้น แต่ไม่ได้ชัดขึ้นจริง แอปอัปสเกลเดารายละเอียดที่ขาดไป ผลมักดูเลอะหรือดูปลอม ถ้าต้องการไฟล์ชัดจริงสำหรับงานพิมพ์ ให้ขอไฟล์จากเจ้าของผลงาน"
      },
      {
        "q": "PintDownload บีบอัดไฟล์หรือใส่ลายน้ำไหม?",
        "a": "ไม่ ได้ไฟล์เดียวกับที่ Pinterest ส่งมาทุกไบต์ และไม่มีลายน้ำจากเรา ไฟล์เดียวที่ทำขึ้นในเครื่องคือ MP3 ซึ่งเบราว์เซอร์ทำจากเสียงของวิดีโอ"
      }
    ]
  },
  "related": {
    "title": "เครื่องมือ Pinterest อื่นๆ"
  },
  "schema": {
    "appName": "โหลดรูป Pinterest ให้ชัด — PintDownload",
    "howToName": "วิธีโหลดรูปและวิดีโอ Pinterest ในความละเอียดสูงสุดที่พินมี",
    "howToDescription": "วางลิงก์พินสาธารณะ ดูความละเอียดจริงของแต่ละไฟล์ แล้วเซฟไฟล์ใหญ่ที่สุดที่ Pinterest เผยแพร่"
  },
  "datePublished": "2026-10-16",
  "dateModified": "2026-10-16",
  "review": {
    "writer": "writer-th (agent), 2026-10-16. Honest HD explainer (user decision 2; slug pinterest-hd-downloader). H1 changed from the plan's “โหลดรูป Pinterest ให้ชัด” to a question so the 4K-page rule passes: see docs/i18n/research/th-slug-requests.md. For the native reviewer: verify แชร์ › คัดลอกลิงก์ and the iOS share-sheet label บันทึกภาพ."
  }
}
```

## Ready content: `src/content/i18n/th/pinterest-profile-picture-downloader.json`

Carries the requested title. Save as is once request 2 is applied.

```json
{
  "pageId": "pinterest-profile-picture-downloader",
  "locale": "th",
  "meta": {
    "title": "โหลดรูปโปรไฟล์ Pinterest ขนาดใหญ่สุด ดูรูปโปรไฟล์แบบเต็มรูป",
    "description": "ดูและโหลดรูปโปรไฟล์ของบัญชี Pinterest สาธารณะแบบเต็มรูป ขนาดใหญ่ที่สุดที่ Pinterest มี วางลิงก์โปรไฟล์แล้วเซฟได้เลย ฟรี ไม่ต้องล็อกอิน"
  },
  "keywords": {
    "primary": "โหลดรูปโปรไฟล์ pinterest",
    "secondary": [
      "ดูรูปโปรไฟล์ pinterest เต็มรูป",
      "ดาวน์โหลดโปรไฟล์ pinterest",
      "รูปโปรไฟล์ pinterest ชัดๆ",
      "pinterest profile picture downloader"
    ]
  },
  "nav": {
    "label": "โหลดรูปโปรไฟล์",
    "short": "รูปโปรไฟล์",
    "card": {
      "title": "โหลดรูปโปรไฟล์",
      "blurb": "ดูรูปโปรไฟล์ของบัญชีสาธารณะแบบเต็มรูป แล้วเซฟในขนาดใหญ่ที่สุดที่มี",
      "badge": "โปรไฟล์"
    }
  },
  "hero": {
    "h1": "โหลดรูปโปรไฟล์ Pinterest",
    "lede": "วางลิงก์โปรไฟล์สาธารณะ แล้วดูหรือเซฟรูปโปรไฟล์ใน**ขนาดใหญ่ที่สุดที่ Pinterest เผยแพร่** (ปกติราว 600×600 พิกเซล)"
  },
  "intro": [
    "อยากเห็นรูปโปรไฟล์ของบัญชีหนึ่งแบบเต็มรูป ไม่ใช่วงกลมเล็กๆ บนหน้าโปรไฟล์? วางลิงก์โปรไฟล์สาธารณะในช่องด้านบน แล้วเปิดดูหรือเซฟรูปในขนาดใหญ่ที่สุดที่ Pinterest เผยแพร่",
    "หน้านี้เซฟ**รูปโปรไฟล์ของบัญชี** ถ้ากำลังหาไอเดียรูปโปรไฟล์น่ารักๆ หรือเท่ๆ จาก Pinterest ไปตั้งเป็นรูปโปรไฟล์ของตัวเอง ให้ใช้[[pinterest-image-downloader|หน้าโหลดรูป]]แทน"
  ],
  "features": [
    {
      "h": "รูปโปรไฟล์อย่างเดียว",
      "p": "เซฟแค่รูปโปรไฟล์ของบัญชี ไม่ได้รวมพินในโปรไฟล์มาด้วย"
    },
    {
      "h": "ใหญ่ที่สุดเท่าที่มี",
      "p": "ได้ขนาดใหญ่ที่สุดที่ Pinterest เผยแพร่ ไม่ใช่รูปจิ๋วข้างชื่อ และเราไม่ขยายภาพเพิ่มเอง"
    },
    {
      "h": "ไม่ต้องล็อกอิน",
      "p": "ใช้ได้กับบัญชีสาธารณะ บนมือถือ ไอแพด และคอม ไม่ต้องลงแอป"
    }
  ],
  "sections": [
    {
      "h2": "ได้รูปขนาดเท่าไร",
      "paragraphs": [
        "Pinterest เผยแพร่รูปโปรไฟล์ไว้ไม่ใหญ่มาก ปกติราว 600×600 พิกเซล และบางบัญชีเล็กกว่านั้น PintDownload เลือกขนาดใหญ่ที่สุดที่มีให้ แต่จะไม่ขยายภาพหรือเติมพิกเซลขึ้นมาเอง รูปที่ได้จึงชัดกว่าวงกลมเล็กๆ บนหน้าโปรไฟล์ แต่ไม่ใช่ภาพความละเอียดสูงสำหรับงานพิมพ์"
      ]
    },
    {
      "h2": "หารูปโปรไฟล์สวยๆ จาก Pinterest",
      "paragraphs": [
        "คนส่วนใหญ่ที่ค้นคำว่า “รูปโปรไฟล์ pinterest” กำลังหารูปน่ารักๆ ไปตั้งเป็นรูปโปรไฟล์ LINE, IG หรือ Facebook ของตัวเอง ไม่ได้อยากได้รูปโปรไฟล์ของบัญชีอื่น ถ้าเป็นแบบนั้น เปิดพินรูปที่ชอบ แล้ววางลิงก์ที่[[pinterest-image-downloader|หน้าโหลดรูป]] จะได้รูปขนาดใหญ่ที่สุดที่ Pinterest เผยแพร่ ครอปเป็นสี่เหลี่ยมจัตุรัสได้ก่อนเซฟด้วย"
      ]
    },
    {
      "h2": "อยากได้พินทั้งโปรไฟล์",
      "paragraphs": [
        "หน้านี้ให้แค่รูปโปรไฟล์ ถ้าอยากได้พินสาธารณะที่เห็นบนโปรไฟล์ทั้งหมด ให้วางลิงก์โปรไฟล์ที่[[home|หน้าแรก]] ระบบจะรวมพินเป็นไฟล์ ZIP ให้ ส่วนบอร์ดเดียวใช้[[pinterest-board-downloader|หน้าโหลดบอร์ด]]"
      ]
    }
  ],
  "steps": {
    "title": "วิธีโหลดรูปโปรไฟล์ Pinterest",
    "intro": "ใช้ได้กับบัญชีสาธารณะเท่านั้น ไม่ต้องล็อกอิน",
    "exampleLabel": "ตัวอย่างลิงก์โปรไฟล์",
    "items": [
      {
        "title": "คัดลอกลิงก์โปรไฟล์",
        "body": "เปิดโปรไฟล์ในแอป แตะไอคอน**แชร์** › **คัดลอกลิงก์** หรือคัดลอก `pinterest.com/ชื่อผู้ใช้/` จากเบราว์เซอร์"
      },
      {
        "title": "วางแล้วกดดูรูปโปรไฟล์",
        "body": "วางลิงก์ในช่องด้านบน แล้วกด**ดูรูปโปรไฟล์**"
      },
      {
        "title": "เปิดดูหรือเซฟ",
        "body": "แตะ**เปิดดูขนาดใหญ่สุด** หรือเซฟไฟล์ลงมือถือ ไอแพด หรือคอม"
      }
    ]
  },
  "faq": {
    "title": "คำถามที่พบบ่อยเรื่องรูปโปรไฟล์",
    "items": [
      {
        "q": "ดูรูปโปรไฟล์ Pinterest แบบเต็มรูปได้ไหม?",
        "a": "ได้ วางลิงก์โปรไฟล์สาธารณะ แล้วรูปที่แสดงคือไฟล์ใหญ่ที่สุดที่ Pinterest เผยแพร่สำหรับบัญชีนั้น แตะเปิดดูขนาดใหญ่สุดเพื่อดูเต็มจอ"
      },
      {
        "q": "ได้รูปโปรไฟล์ความละเอียดเท่าไร?",
        "a": "ปกติไม่เกินราว 600×600 พิกเซล ตามที่ Pinterest เผยแพร่ บางบัญชีเล็กกว่านั้น เราไม่สัญญาว่าจะได้รูป HD และไม่ขยายภาพเพิ่มเอง"
      },
      {
        "q": "คัดลอกลิงก์โปรไฟล์จากแอปยังไง?",
        "a": "เปิดโปรไฟล์ที่ต้องการ แตะไอคอน**แชร์** แล้วเลือก**คัดลอกลิงก์** หรือบนเว็บคัดลอกที่อยู่แบบ `pinterest.com/ชื่อผู้ใช้/` จากแถบเบราว์เซอร์"
      },
      {
        "q": "อยากได้รูปสวยๆ จาก Pinterest ไปทำรูปโปรไฟล์ ต้องใช้หน้าไหน?",
        "a": "ใช้[[pinterest-image-downloader|หน้าโหลดรูป]] เปิดพินรูปที่ชอบ คัดลอกลิงก์ แล้ววางที่นั่น หน้านี้มีไว้เซฟรูปโปรไฟล์ของบัญชี Pinterest เท่านั้น"
      },
      {
        "q": "บัญชีส่วนตัวโหลดรูปโปรไฟล์ได้ไหม?",
        "a": "ไม่ได้ ใช้ได้เฉพาะบัญชีสาธารณะ บัญชีส่วนตัวหรือบัญชีที่ต้องล็อกอินก่อนถึงจะเห็น โหลดไม่ได้"
      },
      {
        "q": "ไฟล์รูปโปรไฟล์เป็น JPG หรือ PNG?",
        "a": "ส่วนใหญ่เป็น JPG ขึ้นกับไฟล์ที่ Pinterest เก็บไว้ ไฟล์ไม่มีลายน้ำหรือกรอบจาก PintDownload"
      },
      {
        "q": "เอารูปโปรไฟล์ของคนอื่นไปใช้ได้ไหม?",
        "a": "เก็บไว้ดูหรือใช้อ้างอิงได้ แต่อย่าเอาไปตั้งเป็นรูปโปรไฟล์เพื่อแอบอ้างเป็นคนอื่น และถ้าจะเผยแพร่ ควรขออนุญาตเจ้าของรูปก่อน"
      }
    ]
  },
  "related": {
    "title": "เครื่องมือสำหรับโปรไฟล์และรูป"
  },
  "schema": {
    "appName": "โหลดรูปโปรไฟล์ Pinterest — PintDownload",
    "howToName": "วิธีโหลดรูปโปรไฟล์ Pinterest",
    "howToDescription": "วางลิงก์โปรไฟล์สาธารณะ แล้วดูหรือเซฟรูปโปรไฟล์ในขนาดใหญ่ที่สุดที่ Pinterest เผยแพร่"
  },
  "datePublished": "2026-10-16",
  "dateModified": "2026-10-16",
  "review": {
    "writer": "writer-th (agent), 2026-10-16. Title changed from the plan's ขนาดเต็ม (full size, an original-size claim the check rejects) to ขนาดใหญ่สุด: see docs/i18n/research/th-slug-requests.md. For the native reviewer: verify แชร์ › คัดลอกลิงก์ on a profile in the Thai app."
  }
}
```

## Release decisions (release-integrator, 2026-10-16)

1. **HD page H1: applied.** Matrix `h1` changed to `โหลดรูป Pinterest ให้ชัด ได้แค่ไหน?` (`i18n-plan.json` row + `changes`, `.md` §3 and §4). File saved; `/th/pinterest-hd-downloader` is live.
2. **Profile picture title: applied.** Matrix `title` changed to `โหลดรูปโปรไฟล์ Pinterest ขนาดใหญ่สุด ดูรูปโปรไฟล์แบบเต็มรูป` (59 code points). File saved; `/th/pinterest-profile-picture-downloader` is live.
3. **Links: applied** exactly as listed (image page section "รูปที่ได้ใหญ่แค่ไหน" paragraph 2; home section 1 items 2 and 6).
4. **HD page form variant: deferred.** A per-locale variant override would touch the shared route contract for one page; the form still extracts image pins correctly there.
5. **Route notice full stop: deferred.** Needs a new catalog key in all 13 island catalogs.
6. **Uppercased Latin words in headings: applied.** The th/ar `text-transform: none` rule lost to the uppercase rule's `:not()` specificity; `src/styles/ticket.css` now sets it on the matching selectors. Built `/th/pinterest-video-downloader-chrome` shows "Edge, Brave, Opera, Firefox และ Safari" (screenshot `release/th-chrome-h2-1440.png`).
7. **Avatar 403 / board example:** board example applied; avatar 403 deferred to the extractor owner (see fr request 4 decision).
