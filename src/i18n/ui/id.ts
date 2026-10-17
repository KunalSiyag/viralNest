/**
 * Chrome strings, Indonesian (kamu, never Anda; imperative without a pronoun
 * where possible). Same keys and {tokens} as en.ts.
 * Vocabulary from docs/i18n/research/id.json glossary: "download" in search
 * phrases, "unduh" in UI, "tautan" in steps and buttons, "papan" for the app's
 * board, "board" where people search it, Bagikan › Salin tautan, HP, galeri.
 */
import type { UiStrings } from './en';

export const UI: UiStrings = {
  skipToContent: 'Langsung ke konten',
  homeAria: 'Beranda PintDownload',
  logoAlt: 'Logo PintDownload',
  header: {
    mainNavAria: 'Navigasi utama',
    mobileNavAria: 'Alat',
    guides: 'Panduan',
    themeToggle: 'Ganti mode terang atau gelap',
    menuOpen: 'Buka menu',
    menuClose: 'Tutup menu',
  },
  languageMenu: {
    label: 'Bahasa',
    buttonAria: 'Bahasa: {current}',
    homeFallbackHint: 'halaman beranda',
  },
  footer: {
    blurb: 'Download video, foto, board, dan profil publik Pinterest. Gratis, tanpa akun, dan kami tidak menambahkan watermark.',
    tools: 'Alat',
    learn: 'Panduan',
    company: 'Informasi',
    blog: 'Blog',
    about: 'Tentang kami',
    contact: 'Kontak',
    privacy: 'Privasi',
    terms: 'Ketentuan',
    englishMarker: '(bahasa Inggris)',
    copyright: '© {year} {brand} · {domain}',
    credit: 'Cantumkan nama kreatornya kalau kamu memakai ulang kontennya. Alat independen: PintDownload tidak berafiliasi dengan Pinterest Inc.',
  },
  matrix: {
    heading: 'Semua alat dan panduan PintDownload',
    devices: 'HP, laptop, dan browser',
    formats: 'Format file',
    batch: 'Board, profil, dan Pin',
    guides: 'Panduan',
  },
  howTo: {
    exampleLabel: 'Contoh link',
    stepPrefix: 'Langkah {n}: ',
  },
  faq: {
    title: 'Pertanyaan umum',
  },
  related: {
    title: 'Alat Pinterest lainnya',
    intro: 'Tiap alat menerima satu jenis link. Pilih yang cocok dengan link yang kamu punya, supaya langsung masuk ke alat yang tepat.',
  },
  compare: {
    title: 'Pin, board, atau profil: pakai alat yang mana?',
    intro: 'Pakai alat yang sesuai dengan jenis link-nya. Penyebab download gagal yang paling umum adalah jenis link yang salah.',
    feature: 'Yang dibandingkan',
    pin: 'Pin',
    board: 'Board ZIP',
    profile: 'Profil ZIP',
    rows: {
      url: { feature: 'Contoh link', pin: 'pinterest.com/pin/123…', board: 'pinterest.com/pengguna/papan/', profile: 'pinterest.com/pengguna/' },
      what: { feature: 'Yang kamu dapat', pin: '1 file atau semua slide carousel', board: 'Banyak Pin dalam satu ZIP', profile: 'Pin yang terlihat, dalam ZIP' },
      best: { feature: 'Cocok untuk', pin: 'Menyimpan satu ide atau video', board: 'Moodboard dan koleksi', profile: 'Cadangan satu akun' },
      carousel: { feature: 'Slide Pin carousel', pin: 'Ya, semua slide', board: 'Sampul tiap Pin*', profile: 'Sampul tiap Pin*' },
      private: { feature: 'Konten privat', pin: 'Tidak didukung', board: 'Tidak didukung', profile: 'Tidak didukung' },
    },
    footnoteBefore: '* Untuk semua slide Pin carousel yang ada di dalam board atau profil, buka Pin itu dengan alat',
    footnoteLink: 'Download Pin Pinterest',
    footnoteAfter: '.',
  },
  bookmarklet: {
    title: 'Bookmarklet satu klik',
    body: 'Simpan video, foto, dan papan Pinterest sambil browsing di komputer. Klik bookmark ini di Pin mana pun, dan PintDownload terbuka dengan link-nya sudah terisi.',
    button: 'Seret ke bilah bookmark',
    dragAlert: 'Seret tombol ini ke bilah bookmark browser untuk memasangnya.',
    dragTitle: 'Seret tombol ini ke bilah bookmark',
    notPinterest: 'Buka halaman Pinterest dulu.',
    chromeTitle: 'Chrome / Edge',
    chromeBodyHtml: 'Tekan `Ctrl+Shift+B` (Cmd+Shift+B di Mac) untuk menampilkan bilah bookmark, lalu seret tombolnya ke sana.',
    safariTitle: 'Safari',
    safariBody: 'Seret ke Favorit. Di iPhone atau iPad, buat bookmark untuk halaman apa saja, edit alamatnya, lalu tempel kode bookmarklet.',
    useTitle: 'Cara pakai',
    useBodyHtml: 'Di halaman Pin atau papan, klik bookmark **PintDownload**. PintDownload terbuka dengan tautan yang sudah terisi.',
    imageAlt:
      'Cara menyimpan PintDownload sebagai bookmark di Chrome: buka menu, pilih Bookmark, pilih Bookmark tab ini, lalu simpan di bilah bookmark',
  },
  ad: {
    label: 'Iklan',
  },
  notFound: {
    title: 'Halaman tidak ditemukan — {brand}',
    description: 'Halaman ini tidak ada di {domain}. Kembali ke beranda atau coba salah satu alat download Pinterest.',
    h1: 'Pin ini tidak ada di papan.',
    lede: 'Mungkin link-nya sudah lama, salah ketik, atau sudah dihapus. Mulai lagi dari beranda, baca panduan, atau pilih alat di bawah.',
    ticketLabel: 'Tiket · tautan publik',
    stamp: 'Halaman tidak ditemukan',
    home: 'Ke beranda',
    blog: 'Baca blog',
    contact: 'Kontak',
    toolsAria: 'Alat download Pinterest',
    bug: 'Menurutmu ini error?',
    videoBlurb: 'Simpan Pin video publik',
    pinBlurb: 'Foto, GIF, dan carousel',
    boardBlurb: 'Board publik dalam satu ZIP',
    guideBlurb: 'Langkah di HP dan laptop',
    guideBadge: 'Panduan',
  },
};
