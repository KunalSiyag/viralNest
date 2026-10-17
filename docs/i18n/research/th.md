# Thai (th) localization research: PintDownload

Market: Thailand. hreflang `th`. Full data, including raw autocomplete for 292 seeds, is in `th.json`.

## Decisions at a glance

- **hreflang `th`, not `th-TH`.** Thai is a single-country language, so the region adds nothing. Competitors are split: klickpin, savepin and pindown use `th`, dlpanda uses `th-TH`, and pinterestdownloader.io uses the invalid `th-04`. Set `<html lang="th">` and `og:locale th_TH`.
- **URLs are `/th/<english-slug>`, with the homepage at `/th`.** Thai script is ruled out by the ASCII rule, and romanized Thai ("lot-witdio") is something nobody reads or types. The Latin words Thai users actually type (pinterest, video, gif, iphone, android, chrome) are already in the English slugs.
  - One exception: the 4K page becomes `/th/pinterest-hd-downloader`, because its Thai copy is honest about resolution (see below).
- **13 pages kept, 6 skipped.** Every kept title and description passes `seo_health_check.check_html_file` with 0 errors and 0 warnings: titles are 49–61 characters, descriptions 131–154.

## Pages

| Pri | English page | Thai path | Primary keyword | Title (chars) | H1 |
|---|---|---|---|---|---|
| 1 | index | `/th` | ดาวน์โหลด pinterest | ดาวน์โหลด Pinterest ฟรี วิดีโอ รูป ไม่มีลายน้ำ \| PintDownload (61) | ดาวน์โหลด Pinterest |
| 1 | pinterest-video-downloader | `/th/pinterest-video-downloader` | โหลดวิดีโอ pinterest | โหลดวิดีโอ Pinterest ฟรี เป็น MP4 ไม่มีลายน้ำ ไม่ต้องลงแอป (58) | โหลดวิดีโอ Pinterest |
| 1 | pinterest-image-downloader | `/th/pinterest-image-downloader` | โหลดรูป pinterest | โหลดรูป Pinterest ฟรี เซฟรูปขนาดเต็ม ไม่ใช่รูปย่อ (49) | โหลดรูป Pinterest |
| 2 | pinterest-4k-downloader | `/th/pinterest-hd-downloader` | โหลดรูป pinterest ให้ชัด | โหลดรูป Pinterest ให้ชัด ได้ความละเอียดสูงสุดที่มีจริง (54) | โหลดรูป Pinterest ให้ชัด |
| 2 | pinterest-gif-downloader | `/th/pinterest-gif-downloader` | โหลด gif pinterest | โหลด GIF Pinterest ฟรี เซฟภาพเคลื่อนไหวให้ยังขยับ (49) | โหลด GIF Pinterest |
| 2 | pinterest-board-downloader | `/th/pinterest-board-downloader` | โหลดบอร์ด pinterest | โหลดบอร์ด Pinterest ทั้งบอร์ดเป็น ZIP ฟรี ไม่ต้องล็อกอิน (56) | โหลดบอร์ด Pinterest |
| 2 | how-to-download-pinterest-videos | `/th/how-to-download-pinterest-videos` | วิธีโหลดวิดีโอ pinterest | วิธีโหลดวิดีโอ Pinterest ทีละขั้นตอน บนมือถือและคอม ฟรี (55) | วิธีโหลดวิดีโอ Pinterest |
| 2 | download-pinterest-videos-iphone-android | `/th/download-pinterest-videos-iphone-android` | โหลดวิดีโอ pinterest iphone | โหลดวิดีโอ Pinterest ลง iPhone และ Android เข้าอัลบั้มได้เลย (60) | โหลดวิดีโอ Pinterest ลงมือถือ |
| 2 | how-to-download-pinterest-video-on-laptop | `/th/how-to-download-pinterest-video-on-laptop` | โหลดวิดีโอ pinterest ลงคอม | โหลดวิดีโอ Pinterest ลงคอม Windows และ Mac ฟรี ทีละขั้นตอน (58) | โหลดวิดีโอ Pinterest ลงคอม |
| 3 | pinterest-pin-downloader | `/th/pinterest-pin-downloader` | โหลดพิน pinterest | โหลดพิน Pinterest จากลิงก์ ได้ทั้งรูป วิดีโอ GIF ฟรี (52) | โหลดพิน Pinterest |
| 3 | pinterest-profile-picture-downloader | `/th/pinterest-profile-picture-downloader` | โหลดรูปโปรไฟล์ pinterest | โหลดรูปโปรไฟล์ Pinterest ขนาดเต็ม ดูรูปโปรไฟล์แบบเต็มรูป (56) | โหลดรูปโปรไฟล์ Pinterest |
| 3 | pinterest-audio-downloader | `/th/pinterest-audio-downloader` | โหลดเสียง pinterest | โหลดเสียง Pinterest ดึงเสียงจากวิดีโอพิน ฟรี ไม่ต้องล็อกอิน (59) | โหลดเสียง Pinterest |
| 3 | pinterest-video-downloader-chrome | `/th/pinterest-video-downloader-chrome` | ส่วนขยาย chrome โหลด pinterest | ส่วนขยาย Chrome โหลด Pinterest? ใช้บุ๊กมาร์กเล็ตแทน ฟรี (55) | โหลด Pinterest บน Chrome |

Each page in `th.json` also has 4–6 secondary keywords, a meta description, a lede, FAQ topics tied to their autocomplete evidence, and notes on search intent.

### Skipped pages

- **pinterest-profile-downloader:** no Thai demand. Every "ดาวน์โหลดโปรไฟล์ pinterest" completion is about the profile picture. The board page and the `/th` hub accept profile links anyway.
- **pinterest-carousel-downloader:** Thai multi-image queries ("pinterest พินหลายรูป ได้ไหม") are about posting several images, not downloading them. The pin and image pages cover it in an FAQ.
- **pinterest-story-downloader:** "pinterest สตอรี่" returns nothing. Pinterest Thai has also folded Idea Pins (พินไอเดีย) into regular pins.
- **pinterest-to-mp4:** "แปลง pinterest เป็น mp4" returns nothing. MP4 and "แปลงลิงก์เป็นวิดีโอ" go on the video page instead.
- **pinterest-seo-title-generator:** there is real demand ("pinterest title generator ไทย"), but the tool only outputs English. Ship this page once `/api/generate-seo` supports `lang=th`; the draft fields are already in the JSON.
- **how-to-download-pinterest-video-in-gallery:** merged into the mobile page. In Thai, "ลงอัลบั้ม/แกลเลอรี่" (to the album/gallery) and "ลง iPhone/Android" (to iPhone/Android) are the same search intent.

## What the evidence says

Evidence comes from Google autocomplete with `hl=th&gl=th` (292 seeds) and from the Thai pages of competitors and of Pinterest's help center.

- **Verbs.** Thai searchers use four words for "download/save":
  - โหลด and ดาวน์โหลด are the main ones. Because "ดาวน์โหลด" contains "โหลด", one title can match both.
  - เซฟ (save) is colloquial and common.
  - บันทึก also means save, but it is ambiguous inside Pinterest (see the trap below).
  - The slang ดูด ("rip") is a real query: use it once in body copy at most.
- **Biggest Thai-specific opportunity: blur.** The words for blurry/sharp ("ไม่ชัด / ให้ชัด") appear under nearly every image seed: โหลดรูป pinterest ให้ชัด, pinterest รูปไม่ชัด แก้ยังไง, เซฟรูปจาก pinterest ไม่ชัด, and more. No competitor answers this honestly, so the old 4K page becomes this page, and it stays truthful (no fake 4K).
- **Devices are first-level completions of the head terms.** ios, android, iphone, pc, mac, ในคอม ("on the computer") and ลงไอแพด ("to the iPad") all appear. iPad shows up far more than in Western markets. Thais say "คอม" for computer, never "laptop".
- **FAQ topics people actually ask:**
  - Is it free? (ฟรีไหม)
  - Why can't I save? (โหลดรูปไม่ได้ / บันทึกไม่ได้)
  - No watermark (ไม่มีลายน้ำ)
  - Why is there no sound? (ทำไม pinterest ไม่มีเสียง)
  - Is it illegal or copyrighted? (โหลดรูป pinterest ผิดกฎหมายไหม, รูปมีลิขสิทธิ์ไหม)
  - Can I get a PNG? (png)
  - How do I put it in a LINE album? (ลงอัลบั้มในไลน์)
  - Why doesn't it show up in my album? (ไม่ขึ้นในอัลบั้ม)
- **The Pinterest "บันทึก" trap.** In Pinterest's Thai interface, "บันทึก" (the red Save button) saves a Pin to a board. "ดาวน์โหลดรูปภาพ" is the device download. Pinterest's own help article spells out the difference. Every how-to should warn about it.
- **Competitors are weak.** Most are machine-translated (klickpin, pindown, pinterestdownloader.io) and call themselves "โปรแกรมดาวน์โหลด" (downloader program). dlpanda has the most natural Thai. snapwc ranks #1 and has the best real-user FAQs ("no sound", "the video plays instead of saving", iOS). wikiHow TH, guru99 TH and tecnobits rank for the guide intent.

## Pinterest's own Thai wording (help.pinterest.com/th)

| Term | Thai |
|---|---|
| Pin | พิน |
| Image Pin / video Pin | พินรูปภาพ / พินวิดีโอ |
| Save (to a board) | บันทึก |
| Download image | ดาวน์โหลดรูปภาพ |
| Ellipsis menu | ไอคอนจุดไข่ปลา |
| Share / Send | แชร์ / ส่ง |
| Board / secret board / public board | บอร์ด / บอร์ดส่วนตัว (older: บอร์ดลับ) / บอร์ดสาธารณะ |
| Secret Pin | พินลับ |
| Profile / profile picture | โปรไฟล์ / รูปโปรไฟล์ |
| Idea Pin | พินไอเดีย |
| Home feed | หน้าฟีดหลัก |

"คัดลอกลิงก์" (Copy link) is **not yet verified on a device**. The live help article returns HTTP 406 to scripted requests, and the archived copies predate the option. Competitor tutorials use the same wording, but check it on a Thai-language phone before shipping the how-to steps.

## Glossary highlights

- **Tone.** Friendly and neutral. No ครับ/ค่ะ (these polite endings mark the speaker's gender) and no ท่าน (an overly formal "you"). Use "ฟรี" (free) in every title. Avoid "โปรแกรม" (it suggests software to install), 4K, ratings and user counts.
- **Vocabulary choices.**
  - วิดีโอ is the correct spelling (not วีดีโอ); use คลิป as a casual synonym.
  - Use รูป (colloquial) and รูปภาพ (Pinterest's own label).
  - Gloss GIF as ภาพเคลื่อนไหว ("moving picture").
  - Carousel becomes พินหลายรูป ("multi-image pin").
  - Write ลิงก์ for "link", using the Royal Institute spelling.
  - Device save locations: แกลเลอรี่ (Android gallery), อัลบั้มรูป or แอปรูปภาพ (iPhone Photos), แอปไฟล์ (Files app).
  - Drop "PFP" and "DP"; Thais don't use them.
- **Claim-ticket metaphor:**
  - Ticket: ตั๋ว (colloquial "ticket").
  - "Admit one · public link" becomes **"1 ลิงก์ 1 สิทธิ์ · สาธารณะเท่านั้น"** ("one link, one claim · public only"). It echoes the familiar Thai slogan pattern "1 คน 1 สิทธิ์" ("one person, one entitlement").
  - Stub: ต้นขั้ว, the exact Thai word for a ticket stub. The button itself says "โหลด" (download) or "รับไฟล์" (get the file).
  - Avoid "เคลม" for claim: it means an insurance or warranty claim.
  - Avoid "ใบเสร็จ" for receipt: it implies payment.
  - Void stamp: "โมฆะ", plus a plain explanation.
  - Serial: keep "No." in the Latin font.

## Formats

- **Numbers:** Western digits (1,234.5). Space before Latin units ("12.4 MB"). Use classifiers when counting ("250 พิน", "รูปที่ 2 จาก 5"). Thai has no plural forms.
- **Dates:** Thai readers expect the Buddhist Era. `Intl.DateTimeFormat('th-TH')` gives "15 ต.ค. 2569" for 15 Oct 2026, which I checked in Node. Keep JSON-LD dates in ISO format.
- **Years in titles:** leave them out. Autocomplete shows both Buddhist Era (2566) and Gregorian (2024) years, so any year matches only half the searchers.
- **Time:** 24-hour, e.g. "14:30 น.".
- **Punctuation:** no full stop at the end of Thai sentences. "?" is fine in FAQ headings.

## Typography (condensed headline font)

- **Big Shoulders Display has no Thai glyphs** (I checked the Google Fonts API). Add **Noto Sans Thai** as the Thai face: it is variable, with width 62.5–100% and weight 100–900. Use it at about 75% width and weight 800–900, self-hosting only the Thai subset.
  - Keep Big Shoulders first in the font stack: Latin words like PINTEREST and MP4 stay in Big Shoulders, and Thai characters fall through to Noto.
- **Line height:** the display line-height of 0.88–0.9 will clip Thai tone and vowel marks, which stack above and below the letters. Use about 1.2–1.3 for headlines and about 1.7 for body text.
- **Letter-spacing:** set it to 0 for Thai on labels, serials and stamps.
- **Case:** uppercase only affects the Latin words. The visual punch has to come from weight and condensed width.
- **Line breaks:** never use `word-break: keep-all` on Thai, since Thai has no spaces between words and the text would overflow. Avoid `overflow-wrap: anywhere` on Thai text. Write H1s with natural spaces between phrases.
- **Length:** Thai renders shorter on screen than its character count, because vowel and tone marks count as characters but take no width. The repo's character limits are therefore conservative for Thai.
- **Encoding:** write the vowel "ำ" as U+0E33, not the two-character form Google's suggestions show. Keep zero-width spaces out of titles. The build script checks both.

## Risks and blockers

1. **The "MP3" download is not an MP3.** The form saves the video URL unchanged under a `.mp3` filename (`DownloaderForm.tsx` around L966 and L2072); only the trimmer exports real audio (WAV). The Thai audio page avoids promising MP3 until this is fixed, and the English audio page has the same problem.
2. **The English 4K page promises "4K ultra quality"**, which PRODUCT.md forbids. The Thai version is reframed and given a new slug.
3. **The current Thai i18n subtitle** promises "HD 1080p" for images and boards, which is not generally true.
4. **Brand confusion:** "pindownload.io" ranks in Thailand and is one letter off "PintDownload". Show "pintdownload.app" on the Thai pages.
5. **Cannibalization:**
   - The image page must not target "ให้ชัด" (sharp); that cluster belongs to the HD page.
   - The pin page takes the "from a link" angle, so it doesn't compete with `/th`.
   - The profile-picture page must not chase the big "aesthetic profile picture ideas" intent behind "รูปโปรไฟล์ pinterest".
6. **Limited SERP sampling:** only one Thai-region DuckDuckGo results page came back before rate-limiting. Re-check rankings from a Thai IP before launch.
7. **Native review:** a native Thai reader should check the final copy and the how-to steps against the Thai Pinterest app.
