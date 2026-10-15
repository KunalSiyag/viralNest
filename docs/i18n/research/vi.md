# Vietnamese (vi) SEO research: PintDownload

Market: Vietnam. Researched 14–15 October 2026. `vi.json` holds the machine-readable plan with every raw autocomplete result: 285 seeds, `gl=vn`, `hl=vi`, spaced 1.2 s apart.

## Decisions at a glance

- **hreflang:** `vi` (language only), with `<html lang="vi">` and `og:locale` set to `vi_VN`.
  - Vietnam is the only real market. Diaspora searchers use the same words, and no content differs by region.
  - SavePin and KlickPin also use `vi`.
  - Every vi page lists `vi`, its `en` twin and `x-default` (en).
- **URLs:** `/vi` and `/vi/<slug>`. Slugs drop all diacritics (đ becomes d) and use lowercase ASCII with hyphens, the same convention as dienmayxanh, gearvn and cellphones. No downloader competitor uses Vietnamese slugs (KlickPin `/vi/pin-board-downloader`, SavePin `/pinterest-downloader/vi/…`), so this is an easy relevance edge.
- **Voice:** address the reader as *bạn*, as Pinterest's Vietnamese help does. Use sentence case. Competitors Title-Case every syllable and read as machine-translated.
- **Pages:** publish 16. Skip 3: carousel, story / Idea Pin, and the SEO title generator.
- **Checks:** every title and description passes the repo rules. I ran the repo's own `seo_health_check.check_html_file` on a mock page head for each page: 0 errors, 0 warnings. Titles are 47–56 chars and descriptions 144–158. Strings are NFC and slugs are unique ASCII.

## Page plan

| EN page | vi path | Primary keyword | Title (chars) | Priority |
|---|---|---|---|---|
| index | `/vi` | pinterest downloader | Pinterest Downloader: tải video, ảnh, GIF \| PintDownload (56) | P1 |
| pin | `/vi/tai-ghim-pinterest` | tải ghim pinterest | Tải Ghim Pinterest bằng link: ảnh, video, GIF miễn phí (54) | P2 |
| video | `/vi/tai-video-pinterest` | tải video pinterest | Tải video Pinterest không logo, MP4 HD miễn phí (47) | P1 |
| image | `/vi/tai-anh-pinterest` | tải ảnh pinterest | Tải ảnh Pinterest chất lượng cao, không bị mờ, miễn phí (55) | P1 |
| gif | `/vi/tai-gif-pinterest` | tải gif pinterest | Tải GIF Pinterest: lưu ảnh động, giữ nguyên chuyển động (55) | P2 |
| board | `/vi/tai-bang-pinterest` | tải bảng pinterest | Tải bảng Pinterest: toàn bộ ảnh, video về một file ZIP (54) | P2 |
| profile | `/vi/tai-ho-so-pinterest` | tải hồ sơ pinterest | Tải hồ sơ Pinterest: lưu Ghim công khai về file ZIP (51) | P3 |
| profile picture | `/vi/tai-avatar-pinterest` | tải avatar pinterest | Tải avatar Pinterest: xem, lưu ảnh đại diện cỡ lớn nhất (55) | P2 |
| audio | `/vi/tai-nhac-pinterest` | tải nhạc pinterest | Tải nhạc Pinterest: tách âm thanh từ video ra MP3 (49) | P2 |
| 4k | `/vi/tai-video-pinterest-4k` | tải video pinterest 4k | Tải video Pinterest 4K được không? Chất lượng thật (50) | P3 |
| to-mp4 | `/vi/chuyen-video-pinterest-sang-mp4` | chuyển video pinterest sang mp4 | Chuyển video Pinterest sang MP4 online, miễn phí (48) | P3 |
| chrome | `/vi/tai-video-pinterest-tren-chrome` | tải video pinterest trên chrome | Tải video Pinterest trên Chrome, không cần cài tiện ích (55) | P3 |
| guide: videos | `/vi/cach-tai-video-pinterest` | cách tải video trên pinterest | Cách tải video trên Pinterest: 3 bước, không cần cài app (56) | P1 |
| guide: gallery | `/vi/luu-video-pinterest-vao-thu-vien-anh` | lưu video pinterest vào thư viện ảnh | Lưu video Pinterest vào thư viện ảnh, album điện thoại (54) | P2 |
| guide: laptop | `/vi/tai-video-pinterest-ve-may-tinh` | tải video pinterest về máy tính | Tải video Pinterest về máy tính, laptop, MacBook (48) | P1 |
| guide: phone | `/vi/tai-video-pinterest-ve-dien-thoai` | tải video pinterest về điện thoại | Tải video Pinterest về điện thoại iPhone, Android (49) | P1 |

`vi.json` has the H1, lede, 4–6 secondary keywords, autocomplete evidence and FAQ topics for every page.

**Keeping the pages apart:** the homepage owns *pinterest downloader*. The video tool owns *tải video pinterest* with *không logo* and *full hd*. The general guide owns *cách tải…* and the question forms. Three guides each own a destination: *về máy tính*, *về điện thoại*, and *thư viện ảnh / album / bộ sưu tập*. The MP4 page owns *chuyển … sang mp4*, and the 4K page owns *4k / 1080p*. `keywordOwnership` in the JSON maps all of them.

## Skipped pages

- **Carousel.** "băng chuyền pinterest" has no completions, and "tải ảnh băng chuyền pinterest" has a single long tail. Pinterest's own Vietnamese help says only business accounts can create carousels, in Ads Manager. Cover it with a "Ghim nhiều ảnh" FAQ on the pin page.
- **Story / Idea Pin.**
  - "tải story pinterest" has one long tail, and "ghim ý tưởng pinterest" has one.
  - "pinterest story" completions are Instagram story inspiration, not downloads.
  - The format has been retired.
  - Cover it with a "Ghim video nhiều trang" FAQ on the video page.
- **SEO title generator.** The demand has the wrong intent:
  - "tiêu đề pinterest" means decorative hand-lettered headings ("vẽ / font chữ tiêu đề pinterest").
  - "seo pinterest" completes to Korean names.
  - `/api/generate-seo` only writes English.

## What the evidence says

- **The verb is *tải*.** People rarely type "download". *lưu* is second ("lưu video pinterest"). The biggest modifiers are:
  - destination: *về máy tính*, *về điện thoại*
  - **không logo** (watermark-free, also *không dính logo*)
  - quality: *hd*, *full hd*, *4k*, *nét*, *không bị mờ/vỡ*
  - *miễn phí*, *bằng link*
  - device: iPhone, Android, Samsung, laptop, MacBook, iPad
- **Quality vs. honesty.** People search "tải ảnh pinterest **4k**", "**gốc**" and "avatar **full hd**". The code serves:
  - images up to about 1200px wide (`/originals/` returns 403)
  - video at 720p, or 1080p when listed
  - avatars at about 600×600

  The vi copy says "kích thước lớn nhất Pinterest cung cấp" and never "ảnh gốc", "Full HD", "2K" or "4K". The 4K page answers the question honestly, as fr and pt did. Do not translate the English 4K page: it claims "4K ultra" and "original uncompressed" and needs fixing too.
- **"không logo" is the strongest hook.** Claim only "không chèn logo", since logos already in the creator's video stay. Confirm the pinimg MP4 has no Pinterest end-card before putting it in titles.
- **Trust questions:** "tải video pinterest an toàn không", "klickpin safe", "web … uy tín". The one competitor with natural Vietnamese (pinterestdownloader.io/vi-02) links to gambling sites in its footer, and its canonical points to its English page. Online gambling ads are illegal in Vietnam, so block that ad category on /vi.
- **Legality:** "tải ảnh trên pinterest có bản quyền không", plus the copyright FAQs in the dienmayxanh and viettablet guides. Every core page needs a plain answer: personal use is fine, credit the creator (*ghi nguồn*), and ask before reposting.
- **Local habits:**
  - **Cốc Cốc:** a Vietnamese Chromium browser with a built-in video downloader. It appears in queries and in ranking guides.
  - **iPhone guides:** every ranking iPhone guide still routes through the third-party *Documents* app. Safari → Tệp → Tải về → Lưu video, with no app, is a simpler and correct differentiator.
  - **Samsung's Gallery is called *Bộ sưu tập*:** "cách lưu video trên pinterest về bộ sưu tập".
- **Avoid these queries:**
  - "tải pinterest về máy tính / mac / win 10" means installing the Pinterest app.
  - "avatar pinterest", "ảnh đại diện pinterest" and "gif pinterest" on their own want inspiration images.
- **Opportunity:** "tải ảnh ghép pinterest" (collage) has 7 completions. Test whether the extractor handles collage Pins before adding an FAQ.

## Pinterest's Vietnamese UI wording

From help.pinterest.com/vi. Copy must match it.

- **Ghim** (always capitalised), **Ghim video**, **Ghim băng chuyền**
- **bảng**, **bảng bí mật** ("Giữ bí mật bảng này")
- **hồ sơ**, **Ảnh hồ sơ** (users say *avatar* / *ảnh đại diện*), **Chỉnh sửa hồ sơ**
- **bảng tin nhà** (home feed)
- Share: **biểu tượng chia sẻ** → link icon → **Sao chép liên kết**; **Gửi** = send
- Download: ellipsis (*biểu tượng ba chấm*) → **Tải ảnh xuống** / **Tải xuống hình ảnh**; the share-sheet icon reads **Tải xuống**
- **Lưu** means save to a board. Pinterest's help separates it from downloading. Never label our download button "Lưu".
- Pinterest notes that "không phải tất cả các Ghim đều có thể tải xuống" (not every Pin can be downloaded).

## Glossary highlights

- **link** in our copy (people search "bằng link"); **liên kết** only when quoting Pinterest's UI. **Dán** = paste, **Tải xuống** = the download button, **file**, **file ZIP**, **miễn phí**, **không cần đăng nhập**, **không cần cài app**, **không chèn logo**.
- **Not affiliated:** "PintDownload là công cụ độc lập, không trực thuộc và không được Pinterest Inc. bảo trợ." Avoid "không liên kết", because *liên kết* also means "link".
- **Claim ticket:** every Vietnamese reader knows the motorbike parking ticket (*vé gửi xe*). Tagline: **"Gửi link, nhận file."** Ticket strings:
  - header: **VÉ VÀO CỬA · LINK CÔNG KHAI**
  - serial: **SỐ 1120271…**
  - stub: *cuống vé*; perforation "XÉ TẠI ĐÂY"
  - stub button: **TẢI XUỐNG**
  - collect: **NHẬN FILE**
  - void stamp: **KHÔNG HỢP LỆ**
  - receipt: **BIÊN NHẬN**
  - counter: **QUẦY**
- **Formats:**
  - numbers: `1.200`, `2,4 MB`
  - dates: `15/10/2026` or "ngày 15 tháng 10 năm 2026"
  - time: 24-hour
  - resolution: keep `720p` / `1080p` / `600×600`

## Typography: two required fixes

1. **The font is missing Vietnamese letters.** `ticket.css` self-hosts only the Big Shoulders **latin** subset. 102 of the 146 Vietnamese letters are not in it (checked with fontkitten at weights 800 and 900), so "TẢI" would mix fonts inside one word. Fix:
   - Ship `big-shoulders-display-vietnamese-{800,900}-normal.woff2` from `@fontsource/big-shoulders-display` (4.6 KB at 900).
   - Use the subset's `unicode-range`.
   - Preload it on /vi only.

   With that subset added, no letter is missing.
2. **Line height is too tight for stacked marks.** Stacked capitals (Ắ) reach 1.158 em above the baseline and dot-below reaches −0.139 em. At the display line-height of 0.88–0.9, line 2's marks overlap line 1's capitals by about 0.28 em (12 px at 46 px). 12 of the 16 vi H1s wrap at 375 px, and all 16 wrap at 320 px. Fix:
   - Set `:lang(vi)` line-height to **≥1.2** for display, headline and tool-body H2s.
   - Keep ≥0.4 em clear above the H1, because `.seam-hero` clips overflow and the marks stand about 16 px above the cap line.

**Also:**
- **Width is fine.** The longest word, "PINTEREST", is 173 px of the 343 px available. H1s take 1–3 lines.
- **Store all text as NFC.** NFD inflates `len()` in the SEO checker and depends on combining-mark positioning.
- **Labels may need to be larger.** Consider 0.9375 rem for vi labels so stacked marks stay legible.
- **Use one tone-mark style:** *hòa*, *thủy*, *kỹ*.
- **Fix `i18n.ts`.** Its current vi strings overclaim ("Full HD 1080p") and use Title Case ("Tải Bảng"). Replace them with the glossary terms.
