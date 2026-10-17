/**
 * Chrome strings, Thai. Friendly-neutral register: no ครับ/ค่ะ, no ท่าน,
 * pronoun usually dropped, no full stop at the end of a Thai sentence.
 * Same keys and {tokens} as en.ts.
 * Vocabulary from docs/i18n/research/th.json glossary: โหลด/ดาวน์โหลด, ลิงก์,
 * พิน, บอร์ด, บอร์ดส่วนตัว, รูปโปรไฟล์, คอม, ไอแพด, บุ๊กมาร์กเล็ต, ส่วนขยาย,
 * "หนึ่งลิงก์ หนึ่งสิทธิ์ · สาธารณะเท่านั้น" for the admit-one line (spelled out: a
 * small "1" in the label face reads as "l").
 * No → in display strings: use ›.
 */
import type { UiStrings } from './en';

export const UI: UiStrings = {
  skipToContent: 'ข้ามไปที่เนื้อหา',
  homeAria: 'หน้าแรก PintDownload',
  logoAlt: 'โลโก้ PintDownload',
  header: {
    mainNavAria: 'เมนูหลัก',
    mobileNavAria: 'เครื่องมือ',
    guides: 'คู่มือ',
    themeToggle: 'สลับโหมดสว่างและโหมดมืด',
    menuOpen: 'เปิดเมนู',
    menuClose: 'ปิดเมนู',
  },
  languageMenu: {
    label: 'ภาษา',
    buttonAria: 'ภาษา: {current}',
    homeFallbackHint: 'หน้าแรก',
  },
  footer: {
    blurb: 'pintdownload.app เว็บโหลดพิน วิดีโอ รูป และบอร์ดสาธารณะจาก Pinterest ฟรี ไม่ต้องล็อกอิน และเราไม่ใส่ลายน้ำ',
    tools: 'เครื่องมือ',
    learn: 'คู่มือ',
    company: 'ข้อมูล',
    blog: 'บล็อก',
    about: 'เกี่ยวกับเรา',
    contact: 'ติดต่อเรา',
    privacy: 'ความเป็นส่วนตัว',
    terms: 'ข้อกำหนดการใช้งาน',
    englishMarker: '(ภาษาอังกฤษ)',
    copyright: '© {year} {brand} · {domain}',
    credit: 'นำไปใช้ต่อเมื่อไร ให้เครดิตเจ้าของผลงานด้วย PintDownload เป็นเครื่องมืออิสระ ไม่มีส่วนเกี่ยวข้องกับ Pinterest Inc.',
  },
  matrix: {
    heading: 'เครื่องมือและคู่มือทั้งหมดของ PintDownload',
    devices: 'มือถือ คอม และเบราว์เซอร์',
    formats: 'ชนิดไฟล์และความชัด',
    batch: 'บอร์ด โปรไฟล์ และพิน',
    guides: 'คู่มือ',
  },
  howTo: {
    exampleLabel: 'ตัวอย่างลิงก์',
    stepPrefix: 'ขั้นที่ {n}: ',
  },
  faq: {
    title: 'คำถามที่พบบ่อย',
  },
  related: {
    title: 'เครื่องมืออื่นสำหรับ Pinterest',
    intro: 'แต่ละเครื่องมือรับลิงก์คนละแบบ เลือกใบที่ตรงกับลิงก์ที่มีอยู่ จะได้ไม่ต้องลองผิดลองถูก',
  },
  compare: {
    title: 'พิน บอร์ด หรือโปรไฟล์ ใช้เครื่องมือไหนดี?',
    intro: 'เลือกเครื่องมือให้ตรงกับชนิดลิงก์ การวางลิงก์ผิดชนิดคือสาเหตุที่โหลดไม่ได้บ่อยที่สุด',
    feature: 'หัวข้อ',
    pin: 'พิน',
    board: 'บอร์ด ZIP',
    profile: 'โปรไฟล์ ZIP',
    rows: {
      url: { feature: 'ตัวอย่างลิงก์', pin: 'pinterest.com/pin/123…', board: 'pinterest.com/ชื่อผู้ใช้/ชื่อบอร์ด/', profile: 'pinterest.com/ชื่อผู้ใช้/' },
      what: { feature: 'ได้อะไร', pin: '1 ไฟล์ หรือพินหลายรูปครบทุกรูป', board: 'หลายพินรวมเป็น ZIP', profile: 'พินที่เห็นบนโปรไฟล์รวมเป็น ZIP' },
      best: { feature: 'เหมาะกับ', pin: 'เก็บไอเดียหรือคลิปเดียว', board: 'มู้ดบอร์ดและคอลเลกชัน', profile: 'สำรองงานทั้งบัญชี' },
      carousel: { feature: 'พินหลายรูป', pin: 'ได้ครบทุกรูป', board: 'รูปปกของแต่ละพิน*', profile: 'รูปปกของแต่ละพิน*' },
      private: { feature: 'เนื้อหาส่วนตัว', pin: 'ไม่รองรับ', board: 'ไม่รองรับ', profile: 'ไม่รองรับ' },
    },
    footnoteBefore: '* อยากได้ทุกรูปของพินหลายรูปที่อยู่ในบอร์ดหรือโปรไฟล์ ให้เปิดพินนั้นด้วย',
    footnoteLink: 'เครื่องมือโหลดพิน',
    footnoteAfter: '',
  },
  bookmarklet: {
    title: 'บุ๊กมาร์กเล็ต กดครั้งเดียวจบ',
    body: 'โหลดวิดีโอ รูป และบอร์ดจาก Pinterest ระหว่างเลื่อนดูบนคอม กดบุ๊กมาร์กบนหน้าพินไหนก็ได้ แล้ว PintDownload จะเปิดขึ้นพร้อมลิงก์นั้นให้เลย',
    button: 'ลากไปที่แถบบุ๊กมาร์ก',
    dragAlert: 'ลากปุ่มนี้ไปวางที่แถบบุ๊กมาร์กของเบราว์เซอร์เพื่อติดตั้ง',
    dragTitle: 'ลากปุ่มนี้ไปไว้ที่แถบบุ๊กมาร์ก',
    notPinterest: 'เปิดหน้า Pinterest ก่อน แล้วค่อยกดบุ๊กมาร์กนี้',
    chromeTitle: 'Chrome / Edge',
    chromeBodyHtml: 'กด `Ctrl+Shift+B` (บน Mac กด `Cmd+Shift+B`) ให้แถบบุ๊กมาร์กแสดงขึ้นมา แล้วลากปุ่มไปวางบนแถบนั้น',
    safariTitle: 'Safari',
    safariBody: 'ลากไปไว้ที่รายการโปรด ส่วนบน iPhone หรือไอแพด ให้บุ๊กมาร์กหน้าไหนก็ได้ไว้ก่อน แล้วแก้ที่อยู่ของบุ๊กมาร์กนั้นเป็นโค้ดบุ๊กมาร์กเล็ต',
    useTitle: 'วิธีใช้',
    useBodyHtml: 'อยู่ที่หน้าพินหรือบอร์ดเมื่อไร กดบุ๊กมาร์ก **PintDownload** ได้เลย หน้าเว็บจะเปิดขึ้นพร้อมลิงก์ที่ใส่ไว้ให้แล้ว',
    imageAlt:
      'วิธีบุ๊กมาร์ก PintDownload ใน Chrome: เปิดเมนู ไปที่บุ๊กมาร์ก เลือกบุ๊กมาร์กแท็บนี้ แล้วเก็บไว้ที่แถบบุ๊กมาร์ก',
  },
  ad: {
    label: 'โฆษณา',
  },
  notFound: {
    title: 'ไม่พบหน้านี้ — {brand}',
    description: 'ไม่มีหน้านี้บน {domain} กลับไปหน้าแรก หรือลองใช้เครื่องมือโหลด Pinterest',
    h1: 'พินนี้ไม่ได้อยู่บนบอร์ด',
    lede: 'ลิงก์อาจเก่า พิมพ์ผิด หรือถูกลบไปแล้ว ลองวางลิงก์ในช่องโหลด อ่านคู่มือ หรือเลือกเครื่องมือด้านล่าง',
    ticketLabel: 'หนึ่งลิงก์ หนึ่งสิทธิ์ · สาธารณะเท่านั้น',
    stamp: 'ไม่พบหน้านี้',
    home: 'กลับหน้าแรก',
    blog: 'อ่านบล็อก',
    contact: 'ติดต่อเรา',
    toolsAria: 'เครื่องมือโหลด Pinterest',
    bug: 'คิดว่าเว็บมีปัญหา?',
    videoBlurb: 'เซฟพินวิดีโอสาธารณะ',
    pinBlurb: 'รูป GIF และพินหลายรูป',
    boardBlurb: 'ทั้งบอร์ดในไฟล์ ZIP',
    guideBlurb: 'ขั้นตอนบนมือถือและคอม',
    guideBadge: 'คู่มือ',
  },
};
