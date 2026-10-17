/**
 * Chrome strings, Vietnamese (bạn, sentence case, NFC).
 * Same keys and {tokens} as en.ts. Vocabulary from docs/i18n/research/vi.json
 * glossary: Ghim (always capitalised), bảng, hồ sơ, ảnh đại diện, "link" in
 * our copy and "liên kết" only when quoting Pinterest's UI (Sao chép liên
 * kết), thanh dấu trang, ghi nguồn. "Lưu" alone means save to a board on
 * Pinterest, so download actions say "Tải". Not-affiliated line avoids
 * "liên kết" (it also means "link").
 */
import type { UiStrings } from './en';

export const UI: UiStrings = {
  skipToContent: 'Chuyển đến nội dung chính',
  homeAria: 'Trang chủ PintDownload',
  logoAlt: 'Logo PintDownload',
  header: {
    mainNavAria: 'Điều hướng chính',
    mobileNavAria: 'Công cụ',
    guides: 'Hướng dẫn',
    themeToggle: 'Chuyển giữa giao diện sáng và tối',
    menuOpen: 'Mở menu',
    menuClose: 'Đóng menu',
  },
  languageMenu: {
    label: 'Ngôn ngữ',
    buttonAria: 'Ngôn ngữ: {current}',
    homeFallbackHint: 'trang chủ',
  },
  footer: {
    blurb: 'Tải video, ảnh, bảng và hồ sơ công khai trên Pinterest. Miễn phí, không cần tài khoản, không chèn logo.',
    tools: 'Công cụ',
    learn: 'Hướng dẫn',
    company: 'Thông tin',
    blog: 'Blog',
    about: 'Giới thiệu',
    contact: 'Liên hệ',
    privacy: 'Quyền riêng tư',
    terms: 'Điều khoản',
    englishMarker: '(tiếng Anh)',
    copyright: '© {year} {brand} · {domain}',
    credit: 'Nhớ ghi nguồn tác giả khi dùng lại nội dung. PintDownload là công cụ độc lập, không trực thuộc và không được Pinterest Inc. bảo trợ.',
  },
  matrix: {
    heading: 'Tất cả công cụ và hướng dẫn của PintDownload',
    devices: 'Điện thoại, máy tính, trình duyệt',
    formats: 'Định dạng và chất lượng',
    batch: 'Bảng, hồ sơ và Ghim',
    guides: 'Hướng dẫn',
  },
  howTo: {
    exampleLabel: 'Link ví dụ',
    stepPrefix: 'Bước {n}: ',
  },
  faq: {
    title: 'Câu hỏi thường gặp',
  },
  related: {
    title: 'Công cụ khác cho Pinterest',
    intro: 'Mỗi công cụ nhận một loại link. Chọn đúng loại với link bạn đang có là tải được ngay từ lần đầu.',
  },
  compare: {
    title: 'Ghim, bảng hay hồ sơ: dùng công cụ nào?',
    intro: 'Hãy dùng công cụ khớp với loại link của bạn. Dán nhầm loại link là lý do hay gặp nhất khiến file không tải được.',
    feature: 'Tiêu chí',
    pin: 'Ghim',
    board: 'Bảng (ZIP)',
    profile: 'Hồ sơ (ZIP)',
    rows: {
      url: { feature: 'Link mẫu', pin: 'pinterest.com/pin/123…', board: 'pinterest.com/tai-khoan/ten-bang/', profile: 'pinterest.com/tai-khoan/' },
      what: { feature: 'Bạn nhận được', pin: '1 file, hoặc mọi ảnh trong Ghim', board: 'Nhiều Ghim trong một ZIP', profile: 'Các Ghim đang hiển thị, trong một ZIP' },
      best: { feature: 'Phù hợp cho', pin: 'Lưu một ý tưởng, một video', board: 'Moodboard, bộ sưu tập', profile: 'Sao lưu Ghim của một tài khoản' },
      carousel: { feature: 'Ghim nhiều ảnh', pin: 'Có, đủ từng ảnh', board: 'Ảnh bìa của mỗi Ghim*', profile: 'Ảnh bìa của mỗi Ghim*' },
      private: { feature: 'Riêng tư, bí mật', pin: 'Không hỗ trợ', board: 'Không hỗ trợ', profile: 'Không hỗ trợ' },
    },
    footnoteBefore: '* Muốn lấy đủ từng ảnh của một Ghim nhiều ảnh nằm trong bảng hoặc hồ sơ, hãy mở riêng Ghim đó bằng công cụ',
    footnoteLink: 'Tải Ghim Pinterest',
    footnoteAfter: '.',
  },
  bookmarklet: {
    title: 'Bookmarklet một cú nhấp',
    body: 'Tải video, ảnh và bảng Pinterest ngay khi đang xem Pinterest trên máy tính. Bấm dấu trang khi đang mở một Ghim, PintDownload sẽ mở ra với link đã điền sẵn.',
    button: 'Kéo lên thanh dấu trang',
    dragAlert: 'Hãy kéo nút này lên thanh dấu trang của trình duyệt để thêm bookmarklet.',
    dragTitle: 'Kéo nút này lên thanh dấu trang',
    notPinterest: 'Hãy mở một trang Pinterest trước đã.',
    chromeTitle: 'Chrome / Edge',
    chromeBodyHtml: 'Nhấn `Ctrl+Shift+B` (trên Mac là Cmd+Shift+B) để hiện thanh dấu trang, rồi kéo nút lên thanh đó.',
    safariTitle: 'Safari',
    safariBody: 'Kéo nút vào Mục ưa thích. Trên iPhone hoặc iPad, hãy đánh dấu một trang bất kỳ, sửa địa chỉ của dấu trang đó và dán mã bookmarklet vào.',
    useTitle: 'Cách dùng',
    useBodyHtml: 'Khi đang mở một Ghim hoặc một bảng, bấm dấu trang **PintDownload**. Trang sẽ mở ra với link đã dán sẵn.',
    imageAlt:
      'Cách thêm PintDownload vào dấu trang trong Chrome: mở menu, vào Dấu trang, chọn thêm thẻ này vào dấu trang và lưu lên thanh dấu trang',
  },
  ad: {
    label: 'Quảng cáo',
  },
  notFound: {
    title: 'Không tìm thấy trang — {brand}',
    description: 'Trang này không có trên {domain}. Hãy về trang chủ hoặc thử một công cụ tải Pinterest.',
    h1: 'Ghim này không có trong bảng.',
    lede: 'Link có thể đã cũ, bị gõ sai hoặc không còn nữa. Hãy thử ô tải, đọc một bài hướng dẫn hoặc chọn công cụ bên dưới.',
    ticketLabel: 'Vé vào cửa · link công khai',
    stamp: 'Không tìm thấy trang',
    home: 'Về trang chủ',
    blog: 'Đọc blog',
    contact: 'Liên hệ',
    toolsAria: 'Công cụ tải Pinterest',
    bug: 'Bạn nghĩ đây là lỗi?',
    videoBlurb: 'Lưu Ghim video công khai',
    pinBlurb: 'Ảnh, GIF, Ghim nhiều ảnh',
    boardBlurb: 'Bảng công khai trong một ZIP',
    guideBlurb: 'Các bước trên điện thoại, máy tính',
    guideBadge: 'Hướng dẫn',
  },
};
