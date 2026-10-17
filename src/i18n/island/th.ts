/**
 * Island catalog, Thai. Friendly-neutral register (no ครับ/ค่ะ, pronoun
 * dropped), no full stop at the end of a Thai sentence. Same keys and {tokens}
 * as en.ts. Thai has one plural category (Intl.PluralRules('th') → other), and
 * counts take classifiers: "{n} พิน", "{total} ไฟล์", "รูปที่ {n}".
 * Vocabulary: docs/i18n/research/th.json glossary (วางลิงก์, แชร์ › คัดลอกลิงก์,
 * พินรูป/พินวิดีโอ/พิน GIF, พินหลายรูป, บอร์ดส่วนตัว, อัลบั้ม/แกลเลอรี่,
 * ตั๋ว "หนึ่งลิงก์ หนึ่งสิทธิ์" (research: 1 ลิงก์ 1 สิทธิ์; spelled out because a
 * small "1" in the label face reads as "l"), stamp โมฆะ; never ใบเสร็จ or เคลม).
 * No → in display strings: use ›.
 */
import type { IslandMessages } from './types';

export const ISLAND: IslandMessages = {
  lang: 'th',

  variants: {
    hub: {
      singleTab: 'พิน บอร์ด หรือโปรไฟล์',
      placeholder: 'วางลิงก์ Pinterest… เช่น https://pin.it/…',
      ariaLabel: 'ลิงก์พิน บอร์ด หรือโปรไฟล์ Pinterest',
      submitLabel: 'โหลด',
      hint: 'ลิงก์พิน บอร์ด หรือโปรไฟล์ที่เป็นสาธารณะ ลิงก์บอร์ดและโปรไฟล์จะได้เป็นไฟล์ ZIP',
      expect: 'รอลิงก์อยู่',
    },
    pin: {
      singleTab: 'ลิงก์พิน',
      placeholder: 'วางลิงก์พิน… https://pinterest.com/pin/… หรือ pin.it/…',
      ariaLabel: 'ลิงก์พิน Pinterest',
      submitLabel: 'โหลดพิน',
      hint: 'ใช้ได้กับพินรูป พินวิดีโอ GIF และพินหลายรูป (ได้ครบทุกรูป)',
      expect: 'รับลิงก์พิน',
    },
    video: {
      singleTab: 'ลิงก์พินวิดีโอ',
      placeholder: 'วางลิงก์พินวิดีโอ… https://pinterest.com/pin/… หรือ pin.it/…',
      ariaLabel: 'ลิงก์พินวิดีโอ Pinterest',
      submitLabel: 'โหลดวิดีโอ',
      hint: 'ได้ไฟล์ MP4 (ปกติ 720p และ 1080p ถ้าพินนั้นมี) ทำ MP3 จากเสียงของคลิปในเบราว์เซอร์ได้ด้วย',
      expect: 'รับพินวิดีโอ',
    },
    image: {
      singleTab: 'ลิงก์พินรูป',
      placeholder: 'วางลิงก์พินรูป… https://pinterest.com/pin/…',
      ariaLabel: 'ลิงก์พินรูปภาพ Pinterest',
      submitLabel: 'โหลดรูป',
      hint: 'ได้รูปขนาดใหญ่ที่สุดที่ Pinterest เผยแพร่ (กว้างสูงสุด 1200 px) พินหลายรูปได้ครบทุกรูป',
      expect: 'รับพินรูป',
    },
    gif: {
      singleTab: 'ลิงก์พิน GIF',
      placeholder: 'วางลิงก์พิน GIF… https://pinterest.com/pin/… หรือ pin.it/…',
      ariaLabel: 'ลิงก์พิน GIF Pinterest',
      submitLabel: 'โหลด GIF',
      hint: 'ได้ GIF ที่ยังขยับวนเล่น ไม่ใช่ภาพนิ่ง JPG ของเฟรมแรก',
      expect: 'รับพิน GIF',
    },
    board: {
      singleTab: 'ลิงก์บอร์ด',
      placeholder: 'วางลิงก์บอร์ด… https://pinterest.com/ชื่อผู้ใช้/ชื่อบอร์ด/',
      ariaLabel: 'ลิงก์บอร์ด Pinterest',
      submitLabel: 'ดูพินในบอร์ด',
      hint: 'วางลิงก์บอร์ดสาธารณะเพื่อดูรายการพิน แล้วกดโหลด ZIP เพื่อรับทั้งชุด',
      expect: 'รับลิงก์บอร์ด',
    },
    profile: {
      singleTab: 'ลิงก์โปรไฟล์',
      placeholder: 'วางลิงก์โปรไฟล์… https://pinterest.com/ชื่อผู้ใช้/',
      ariaLabel: 'ลิงก์โปรไฟล์ Pinterest',
      submitLabel: 'โหลดพินในโปรไฟล์ (ZIP)',
      hint: 'รวมพินสาธารณะที่บัญชีนี้โพสต์ไว้เป็นไฟล์ ZIP ไฟล์เดียว',
      expect: 'รับลิงก์โปรไฟล์',
    },
    'profile-picture': {
      singleTab: 'ลิงก์โปรไฟล์',
      placeholder: 'วางลิงก์โปรไฟล์… https://pinterest.com/ชื่อผู้ใช้/',
      ariaLabel: 'ลิงก์โปรไฟล์ Pinterest สำหรับดูรูปโปรไฟล์',
      submitLabel: 'ดูรูปโปรไฟล์',
      hint: 'ได้รูปโปรไฟล์ขนาดใหญ่ที่สุดที่ Pinterest เผยแพร่ของบัญชีสาธารณะ',
      expect: 'รับลิงก์โปรไฟล์',
    },
  },

  ticket: {
    admitOne: 'ตั๋ว 1 ใบ · ลิงก์สาธารณะ',
    serial: 'เลขที่ {serial}',
    serialEmpty: 'เลขที่ ——————',
    modeGroup: 'จำนวนลิงก์',
    oneLink: 'ลิงก์เดียว',
    upToFive: 'สูงสุด 5',
    hubLabel: 'ลิงก์ Pinterest',
    clearAria: 'ล้างลิงก์',
    pasteAria: 'วางลิงก์จากคลิปบอร์ด',
    paste: 'วาง',
    batchLabel: 'ลิงก์ Pinterest หลายลิงก์ (สูงสุด 5 ลิงก์ บรรทัดละลิงก์)',
    batchPlaceholder: 'บรรทัดละลิงก์ สูงสุด 5 ลิงก์…\nhttps://pinterest.com/pin/1234567/\nhttps://pin.it/abc1234',
    processing: 'กำลังอ่านลิงก์…',
    batchProcessing: 'กำลังอ่านลิงก์ทั้งหมด…',
    batchSubmit: 'โหลดทั้งหมด',
    toolsNav: 'เลือกเครื่องมือให้ตรงกับลิงก์',
    notPinterestHelp: 'นี่ไม่ใช่ลิงก์ Pinterest ลองเปิดแอป Pinterest แตะแชร์ › คัดลอกลิงก์ แล้ว​กลับมาวางที่นี่',
  },

  stamps: {
    notPinterest: 'ไม่ใช่ Pinterest',
    board: 'บอร์ด › ZIP',
    profileZip: 'โปรไฟล์ › ZIP',
    profileAvatar: 'โปรไฟล์ › รูป',
    pinShort: 'พิน · ลิงก์สั้น',
    pin: 'พิน',
  },

  marks: { void: 'โมฆะ', partial: 'ได้บางส่วน', packed: 'แพ็กแล้ว', done: 'เสร็จแล้ว' },

  chips: {
    pin: 'พิน',
    video: 'วิดีโอ MP4',
    image: 'รูป',
    gif: 'GIF',
    board: 'บอร์ด ZIP',
    profile: 'โปรไฟล์ ZIP',
    avatar: 'รูปโปรไฟล์',
  },

  routeNotice: {
    boardLink: 'นี่คือลิงก์บอร์ด · เปลี่ยนเป็นโหมดโหลดบอร์ดให้แล้ว',
    profileLink: 'นี่คือลิงก์โปรไฟล์ · เปลี่ยนเป็นโหมดโหลดโปรไฟล์ให้แล้ว',
    gif: 'นี่คือ GIF ภาพเคลื่อนไหว · เปลี่ยนเป็นโหมดโหลด GIF ให้แล้ว',
    video: 'นี่คือพินวิดีโอ · เปลี่ยนเป็นโหมดโหลดวิดีโอให้แล้ว',
    carousel: {
      other: 'นี่คือพินหลายรูป ({n} รูป) · เปลี่ยนเป็นโหมดโหลดรูปให้แล้ว',
    },
    board: 'นี่คือบอร์ด Pinterest · เปลี่ยนเป็นโหมดโหลดบอร์ดให้แล้ว',
    profile: 'นี่คือโปรไฟล์ Pinterest · เปลี่ยนเป็นโหมดโหลดโปรไฟล์ให้แล้ว',
    open: 'เปิดหน้าเครื่องมือนั้น',
  },

  progress: {
    reading: 'กำลังอ่านเสียงของวิดีโอ…',
    making: 'กำลังทำ MP3… {pct}%',
    connecting: 'กำลังเชื่อมต่อ Pinterest…',
    downloadingOf: 'กำลังโหลด… {loaded} จาก {total} ({pct}%)',
    downloading: 'กำลังโหลด… {loaded}',
  },

  bytes: { B: 'B', KB: 'KB', MB: 'MB', GB: 'GB' },

  live: {
    readingLink: 'กำลังอ่านลิงก์…',
    readingLinks: 'กำลังอ่านลิงก์ทั้งหมด…',
    packingZip: 'กำลังรวมไฟล์ ZIP ({pct}%)',
    making: 'กำลังทำ {file} ในเบราว์เซอร์…',
    makingPct: 'กำลังทำ {file} ในเบราว์เซอร์ ({pct}%)',
    downloading: 'กำลังโหลด {file}…',
    downloadingPct: 'กำลังโหลด {file} ({pct}%)',
    zipPacked: {
      other: 'ไฟล์ ZIP พร้อมแล้ว มี {packed} จาก {total} ไฟล์ เริ่มดาวน์โหลดแล้ว',
    },
    started: 'เริ่มดาวน์โหลดแล้ว: {file}',
    copied: 'คัดลอกไปที่คลิปบอร์ดแล้ว',
  },

  kinds: {
    image: 'พินรูป',
    video: 'พินวิดีโอ',
    gif: 'พิน GIF',
    carousel: 'พินหลายรูป',
    board: 'บอร์ด',
    profile: 'โปรไฟล์',
    avatar: 'รูปโปรไฟล์',
  },

  voidCopy: {
    validation: { title: 'วางลิงก์ก่อนนะ' },
    link: {
      title: 'นี่ไม่ใช่ลิงก์ Pinterest',
      hint: 'ในแอป Pinterest แตะแชร์ › คัดลอกลิงก์ แล้ววางลงในตั๋วใบนี้',
    },
    private: {
      title: 'ไม่มีพินสาธารณะให้รับ',
      hint: 'โหลดได้เฉพาะพิน บอร์ด และโปรไฟล์ที่เป็นสาธารณะ เราไม่เข้าถึงบอร์ดส่วนตัวหรือบัญชีส่วนตัว',
    },
    removed: { title: 'พินนี้ไม่มีให้ดูแล้ว' },
    download: { title: 'โหลดไฟล์ไม่สำเร็จ', hint: 'บางครั้ง Pinterest ก็หยุดส่งไฟล์บางไฟล์ ลองวางลิงก์แล้วโหลดใหม่อีกครั้ง' },
    other: { title: 'อ่านลิงก์นี้ไม่ได้', hint: 'ลองเปิดลิงก์ใน Pinterest ดูก่อนว่าเปิดได้ แล้วค่อยลองใหม่' },
  },

  receipt: {
    ready: 'พร้อม · {kind}',
    fetching: 'กำลังดึงข้อมูลจาก Pinterest…',
    another: 'โหลดลิงก์อื่น',
    tryAnother: 'ลองลิงก์อื่น',
    guide: 'ดูวิธีทีละขั้นตอน',
    savesAs: 'จะได้ไฟล์ชื่อ {file}',
    download: 'โหลด {format}',
    downloadShort: 'โหลด',
    itemAria: '{verb}{item}',
    downloadProgressAria: 'ความคืบหน้าการโหลด',
    zipProgressAria: 'ความคืบหน้าของไฟล์ ZIP',
    zipProgressText: {
      other: 'รวมแล้ว {done} จาก {total} ไฟล์',
    },
    packing: {
      other: 'กำลังรวม {done} จาก {total} ไฟล์…',
    },
    cancel: 'ยกเลิก',
    cancelSr: ' การรวมไฟล์ ZIP',
    downloadZip: 'โหลด ZIP ({n})',
    zipPartial: {
      other: '{name} มี {packed} จาก {total} ไฟล์ อีก {missing} ไฟล์ดึงจาก Pinterest ไม่ได้ ให้โหลดแยกทีละไฟล์',
    },
    zipAll: {
      other: '{name}: ครบทั้ง {total} ไฟล์ เริ่มดาวน์โหลดแล้ว',
    },
    noMp3: ' ไฟล์ ZIP นี้ไม่มี MP3 {reason}',
    started: 'เริ่มดาวน์โหลดแล้ว: {file}',
    startedShort: 'เริ่มดาวน์โหลดแล้ว',
    copyLink: 'คัดลอกลิงก์',
    linkCopied: 'คัดลอกลิงก์แล้ว',
    save: 'เซฟ {format}',
    tileSr: ' {name}',
    tagVideo: 'วิดีโอ',
    tagGif: 'GIF',
  },

  specs: {
    slides: 'จำนวนรูป',
    images: 'รูปภาพ',
    videos: 'วิดีโอ',
    gifs: 'GIF',
    pins: 'พิน',
    boards: 'บอร์ด',
    format: 'ชนิดไฟล์',
    crop: 'การครอป',
    uncropped: 'ไม่ได้ครอป',
    resolution: 'ความละเอียด',
    plays: 'การเล่น',
    looping: 'เล่นวน',
    quality: 'คุณภาพ',
  },

  fallbacks: {
    pin: 'พินจาก Pinterest',
    carousel: 'พินหลายรูปจาก Pinterest',
    board: 'บอร์ด Pinterest',
    profile: 'โปรไฟล์ Pinterest',
    user: 'ผู้ใช้ Pinterest',
    slide: 'รูปที่ {n}',
    pinN: 'พินที่ {n}',
    slideSr: 'รูปที่ {n}',
    pinSr: 'พินที่ {n}',
  },

  carousel: { everySlide: 'ครบทุกรูป' },

  avatar: {
    alt: 'รูปโปรไฟล์ของ {name}',
    openFull: 'เปิดดูขนาดใหญ่สุด',
    newTabSr: ' (เปิดในแท็บใหม่)',
    promo: 'อยากได้ทุกพินของโปรไฟล์นี้? วางลิงก์โปรไฟล์ที่{link} แล้วรับเป็นไฟล์ ZIP',
    profileLink: 'หน้าแรก',
  },

  collection: {
    byUser: 'โดย @{user}',
    atUser: '@{user}',
    alsoOnProfile: 'มีในโปรไฟล์นี้ด้วย',
    profilePicture: 'รูปโปรไฟล์',
    largestSize: 'ขนาดใหญ่ที่สุดที่ Pinterest เผยแพร่',
    profilePictureSr: ' รูปโปรไฟล์ (JPG)',
    boardsHeading: 'บอร์ด ({n})',
    boardsHint: 'เปิดบอร์ดเพื่อรับเฉพาะพินในบอร์ดนั้น',
    boardPins: { other: '{n} พิน' },
    openBoard: 'เปิดบอร์ด',
    pinsHeading: 'พิน',
    showing: 'แสดง {shown} จาก {total} พิน ไฟล์ ZIP มีครบทุกพิน',
    loadMore: 'แสดงเพิ่มอีก {n}',
    showAll: 'แสดงทั้ง {n} พิน',
  },

  single: {
    previewAria: 'ตัวอย่าง: {title}',
    playPreview: 'เล่นตัวอย่าง',
    freeze: 'หยุด',
    playLoop: 'เล่นวน',
    alsoInPin: 'มีในพินนี้ด้วย',
    videoName: 'วิดีโอ',
    withSound: 'มีเสียง',
    videoSr: ' วิดีโอ (MP4)',
    audioName: 'เสียง {kbps} kbps',
    audioNote: 'ทำในเบราว์เซอร์จากเสียงของวิดีโอ',
    audioSr: ' เสียง (MP3)',
    coverName: 'รูปปก',
    coverNote: 'ภาพนิ่งที่ Pinterest แสดง',
    coverSr: ' รูปปก ({format})',
    packName: 'ทั้งหมด',
    packCover: 'รูปปก',
    packSr: ' ทั้งหมด (ZIP)',
    sendToPhone: 'ส่งไปมือถือ',
    hideQr: 'ซ่อนคิวอาร์โค้ด',
    crop: 'ครอปรูป',
    trim: 'ตัดเสียง',
    qrAltVideo: 'คิวอาร์โค้ดของลิงก์วิดีโอ สแกนเพื่อเปิดบนมือถือ',
    qrAltImage: 'คิวอาร์โค้ดของลิงก์รูป สแกนเพื่อเปิดบนมือถือ',
    qrText:
      'สแกนด้วยกล้องมือถือเพื่อเปิดไฟล์ แล้วกดค้างเพื่อเซฟลงอัลบั้มหรือแกลเลอรี่ ไม่ต้องลงแอป ไม่ต้องล็อกอิน',
  },

  extras: {
    summary: 'สี แท็ก และแคปชันสำหรับโพสต์ต่อ',
    palette: 'จานสี',
    paletteHint: 'โทนสีหลักของพิน แตะสีไหนก็คัดลอกได้',
    copied: 'คัดลอกแล้ว',
    tags: 'แท็ก',
    copyTags: 'คัดลอกแท็ก',
    repostCaption: 'แคปชันสำหรับโพสต์ต่อ',
    captionFor: 'แคปชันสำหรับ',
    copyCaption: 'คัดลอกแคปชันและแท็ก',
    copiedCaption: 'คัดลอกแคปชันแล้ว',
    captionReels: '✨ {title}\n\nแท็กเพื่อนที่ต้องเห็นอันนี้ 👇\n\n📌 เซฟด้วย PintDownload\n\n{tags} #reels #viral #aesthetic',
    captionTiktok: 'POV: {title} 🌿🔥\n\nกดติดตามไว้ มีไอเดียสวยๆ จาก Pinterest ทุกวัน\n\n{tags} #fyp #viral #pinterest #ฟีดดดシ',
    captionShorts: '🔥 {title} | สไตล์ Pinterest\n\nกดไลก์และกดติดตาม ได้คอนเทนต์สวยๆ ทุกวัน\n\n{tags} #shorts #pintdownload #pinterest',
  },

  batch: {
    ready: { other: 'พร้อม · {n} พิน' },
    heading: { other: 'ได้ไฟล์แล้ว {n} ไฟล์' },
    downloadAll: 'โหลดทั้งหมด ({n})',
    oneAfterAnother: 'ไฟล์จะโหลดต่อกันทีละไฟล์',
  },

  recent: { heading: 'ลิงก์ล่าสุด' },

  errors: {
    emptyLink: 'วางลิงก์ Pinterest สาธารณะก่อน (ในแอปแตะแชร์ › คัดลอกลิงก์)',
    emptyBatch: 'วางลิงก์ Pinterest อย่างน้อย 1 ลิงก์ บรรทัดละลิงก์',
    batchInvalid: 'ใส่ลิงก์ Pinterest ที่ถูกต้อง (เช่น https://pinterest.com/pin/… หรือ https://pin.it/…)',
    batchFailed: 'อ่านลิงก์ชุดนี้ไม่ได้ ตรวจดูว่าลิงก์ Pinterest ทุกลิงก์เป็นแบบสาธารณะ',
    extractFailed: 'ดึงข้อมูลจาก Pinterest ไม่สำเร็จ',
    unknown: 'มีบางอย่างผิดพลาด ตรวจลิงก์ Pinterest แล้วลองอีกครั้ง',
    qr: 'สร้างคิวอาร์โค้ดไม่ได้ คัดลอกลิงก์ไปใช้แทนได้เลย',
    copyLink: 'คัดลอกลิงก์ไม่ได้ กดค้างที่ปุ่มโหลดเพื่อคัดลอกแทน',
    fileUnavailable: 'โหลดไฟล์นี้ไม่ได้ พินอาจเป็นแบบส่วนตัว หรือ Pinterest ไม่ส่งไฟล์นี้แล้ว',
    noBody: 'เซิร์ฟเวอร์ไม่ได้ส่งข้อมูลกลับมา',
    downloadFailed: 'โหลดไม่สำเร็จ',
    zipNothing: 'ใส่ไฟล์ลงใน ZIP ไม่ได้เลยสักไฟล์ ไฟล์อาจไม่มีให้โหลดแล้ว',
    zipFailed: 'สร้างไฟล์ ZIP ไม่สำเร็จ',
    zipPartial: {
      other: 'ไฟล์ ZIP พร้อมแล้ว ได้ {ok} จาก {total} ไฟล์ (ผิดพลาด {failed} ไฟล์)',
    },
    noMp3Video: 'ดึงวิดีโอจาก Pinterest ไม่ได้',
    noMp3Browser: 'เบราว์เซอร์นี้ทำ MP3 ไม่ได้',
  },

  api: {
    invalid_input: 'ใส่ลิงก์ Pinterest ที่ถูกต้อง',
    blocked: 'เนื้อหานี้ถูกนำออกตามคำขอของเจ้าของผลงาน',
    not_pinterest:
      'ลิงก์ไม่ถูกต้อง ใส่ลิงก์ Pinterest ที่ถูกต้อง (เช่น https://pinterest.com/pin/… หรือ https://pin.it/…)',
    left_pinterest: 'ลิงก์นี้พาออกไปนอก Pinterest จึงไม่มีอะไรให้โหลด',
    removed_or_private:
      'พินนี้ถูกลบหรือเปลี่ยนเป็นส่วนตัวแล้ว จึงไม่มีอะไรให้โหลด ลองเปิดลิงก์ใน Pinterest ดูก่อน',
    avatar_not_found: 'ไม่พบรูปโปรไฟล์ของบัญชี Pinterest นี้ โปรไฟล์อาจเป็นแบบส่วนตัว',
    collection_empty_board: 'ไม่พบพินสาธารณะในบอร์ดนี้ อาจเป็นบอร์ดส่วนตัวหรือบอร์ดที่ยังว่างอยู่',
    collection_empty_profile: 'ไม่พบพินสาธารณะในโปรไฟล์นี้ โปรไฟล์อาจเป็นแบบส่วนตัวหรือยังไม่มีพิน',
    collection_unavailable: 'ตอนนี้ Pinterest ยังไม่ส่งพินของบอร์ดนี้มา ลองใหม่อีกครั้งในอีกสักครู่',
    no_media: 'ไม่พบไฟล์ให้โหลดจากลิงก์นี้ ตรวจดูว่าพินเป็นแบบสาธารณะ',
    access_denied: 'ไม่ได้รับอนุญาตให้เข้าถึง',
    origin_denied: 'ไม่อนุญาตให้เรียกใช้ API โดยตรง',
    server_error: 'ประมวลผลลิงก์ Pinterest ไม่สำเร็จ ตรวจดูว่าเป็นลิงก์พินสาธารณะที่ถูกต้อง',
  },

  mp3: {
    no_audio: 'วิดีโอนี้ไม่มีเสียงให้ทำเป็น MP3 โหลด MP4 แทนได้',
    unsupported:
      'เบราว์เซอร์นี้อ่านเสียงของวิดีโอไม่ได้ จึงทำ MP3 ไม่ได้ ลองใช้ Chrome, Edge, Safari หรือ Firefox หรือโหลด MP4 แทน',
    failed: 'ทำ MP3 ไม่สำเร็จ ลองใหม่อีกครั้ง หรือโหลด MP4 ซึ่งมีเสียงอยู่แล้ว',
    aborted: 'ยกเลิกการทำ MP3 แล้ว',
  },

  trimmer: {
    title: 'ตัดเสียง',
    reading: 'กำลังอ่านเสียงของวิดีโอ…',
    loadFailed: 'โหลดเสียงของวิดีโอนี้ไม่ได้ ตรวจการเชื่อมต่อแล้วลองใหม่',
    start: 'เริ่ม: {time}',
    end: 'จบ: {time}',
    seconds: '{n} วิ',
    startAria: 'จุดเริ่มตัดเสียง (วินาที)',
    endAria: 'จุดจบตัดเสียง (วินาที)',
    length: 'ความยาวท่อนนี้: {len}',
    lengthValue: '{n} วินาที',
    pause: 'หยุด',
    listen: 'ฟังท่อนนี้',
    cancel: 'ยกเลิก',
    wav: 'เซฟท่อนนี้เป็น WAV',
    mp3: 'เซฟท่อนนี้เป็น MP3 ({kbps} kbps)',
    exportFailed: 'ทำไฟล์ {format} ของท่อนนี้ไม่สำเร็จ ลองใหม่อีกครั้ง',
    making: 'กำลังทำ MP3… {pct}%',
    note: 'ทำในเบราว์เซอร์จากเสียงของวิดีโอ ไม่มีการอัปโหลดอะไรขึ้นไป',
  },

  cropper: {
    title: 'ครอปและปรับขนาด',
    pick: 'เลือกสัดส่วนสำหรับโซเชียล',
    presets: {
      original: 'ไม่ครอป',
      square: '1:1 จัตุรัส (โพสต์ IG)',
      story: '9:16 สตอรี่/รีล (TikTok)',
      portrait: '4:5 แนวตั้ง (IG)',
      landscape: '16:9 แนวนอน (YT)',
    },
    previewAlt: 'ตัวอย่างรูปที่ครอป',
    processing: 'กำลังประมวลผลรูป…',
    cancel: 'ยกเลิก',
    download: 'โหลดรูปที่ครอป ({ratio})',
  },

  sticky: {
    close: 'ปิดแถบวางลิงก์',
    label: 'วางลิงก์ Pinterest',
    placeholder: 'ลิงก์…',
    paste: 'วาง',
    save: 'โหลด',
    top: 'กลับขึ้นด้านบน',
  },
};
