/**
 * Chrome strings, Turkish. Same keys and {tokens} as en.ts.
 * Register (plan §1): polite plural imperatives in body copy ("yapıştırın",
 * "indirin"), bare imperatives on buttons and links ("İndir", "Ana sayfaya dön").
 * Vocabulary from docs/i18n/research/tr.json glossary: link (not "URL"),
 * pano (never "board"), Pin with suffixes and no apostrophe (Pinin, Pinler),
 * paylaş simgesi › Bağlantıyı kopyala, yer işareti aracı for the bookmarklet,
 * emanet fişi for the claim ticket. Typographic ’ before suffixes
 * (Pinterest’te, Mac’te). No → in display strings: use ›.
 * "Pano" also means clipboard on Windows, so the clipboard is never called that.
 */
import type { UiStrings } from './en';

export const UI: UiStrings = {
  skipToContent: 'İçeriğe geç',
  homeAria: 'PintDownload ana sayfa',
  logoAlt: 'PintDownload logosu',
  header: {
    mainNavAria: 'Ana menü',
    mobileNavAria: 'Araçlar',
    guides: 'Rehberler',
    themeToggle: 'Açık ve koyu tema arasında geç',
    menuOpen: 'Menüyü aç',
    menuClose: 'Menüyü kapat',
  },
  languageMenu: {
    label: 'Dil',
    buttonAria: 'Dil: {current}',
    homeFallbackHint: 'ana sayfa',
  },
  footer: {
    blurb: 'Herkese açık Pinterest videolarını, fotoğraflarını, panolarını ve profillerini indirin. Ücretsiz ve üyeliksiz; biz filigran eklemeyiz.',
    tools: 'Araçlar',
    learn: 'Rehberler',
    company: 'Kurumsal',
    blog: 'Blog',
    about: 'Hakkımızda',
    contact: 'İletişim',
    privacy: 'Gizlilik',
    terms: 'Kullanım koşulları',
    englishMarker: '(İngilizce)',
    copyright: '© {year} {brand} · {domain}',
    credit: 'Başkasının içeriğini yeniden paylaşırken içerik üreticisini kaynak gösterin. Bağımsız bir araçtır: PintDownload’un Pinterest Inc. ile bir bağlantısı yoktur.',
  },
  matrix: {
    heading: 'Tüm PintDownload araçları ve rehberleri',
    devices: 'Telefon, PC ve tarayıcı',
    formats: 'Formatlar ve kalite',
    batch: 'Pano, profil ve Pinler',
    guides: 'Rehberler',
  },
  howTo: {
    exampleLabel: 'Örnek link',
    stepPrefix: '{n}. adım: ',
  },
  faq: {
    title: 'Sıkça sorulan sorular',
  },
  related: {
    title: 'Diğer Pinterest araçları',
    intro: 'Her araç tek tür link alır. Elinizdeki linke uyanı seçin, ilk denemede doğru indiriciye ulaşın.',
  },
  compare: {
    title: 'Pin, pano ya da profil: hangi araç?',
    intro: 'Linkinizin türüne uyan aracı kullanın. İndirmenin başarısız olmasının en sık nedeni yanlış türde link yapıştırmaktır.',
    feature: 'Karşılaştırma',
    pin: 'Pin',
    board: 'Pano ZIP',
    profile: 'Profil ZIP',
    rows: {
      url: { feature: 'Link örneği', pin: 'pinterest.com/pin/123…', board: 'pinterest.com/kullanici/pano/', profile: 'pinterest.com/kullanici/' },
      what: { feature: 'Ne alırsınız', pin: '1 dosya ya da karuselin tüm kartları', board: 'Pinler tek ZIP’te', profile: 'Görünen Pinler tek ZIP’te' },
      best: { feature: 'En uygun olduğu iş', pin: 'Tek bir fikir ya da video', board: 'Moodboard ve koleksiyonlar', profile: 'Bir hesabın toplu yedeği' },
      carousel: { feature: 'Karusel kartları', pin: 'Evet, hepsi', board: 'Pin başına kapak*', profile: 'Pin başına kapak*' },
      private: { feature: 'Gizli içerik', pin: 'Desteklenmez', board: 'Desteklenmez', profile: 'Desteklenmez' },
    },
    footnoteBefore: '* Pano ya da profil ZIP’indeki bir karusel Pinin bütün kartlarını almak için o Pini',
    footnoteLink: 'Pin indiricide',
    footnoteAfter: ' açın.',
  },
  bookmarklet: {
    title: 'Tek tıkla yer işareti aracı',
    body: 'Bilgisayarda Pinterest’te gezinirken videoları, fotoğrafları ve panoları indirin. Herhangi bir Pinde yer işaretine tıklayın; PintDownload o linkle açılır.',
    button: 'Yer işaretleri çubuğuna sürükleyin',
    dragAlert: 'Kurmak için bu düğmeyi tarayıcınızın yer işaretleri çubuğuna sürükleyin.',
    dragTitle: 'Beni yer işaretleri çubuğuna sürükleyin',
    notPinterest: 'Önce bir Pinterest sayfası açın.',
    chromeTitle: 'Chrome / Edge',
    chromeBodyHtml: 'Yer işaretleri çubuğunu göstermek için `Ctrl+Shift+B` (Mac’te Cmd+Shift+B) tuşlarına basın, sonra düğmeyi çubuğa sürükleyin.',
    safariTitle: 'Safari',
    safariBody: 'Favoriler çubuğuna sürükleyin. iPhone ya da iPad’de herhangi bir sayfayı yer işaretlerine ekleyin, adresini düzenleyin ve yer işareti aracının kodunu yapıştırın.',
    useTitle: 'Kullanım',
    useBodyHtml: 'Bir Pinde ya da panoda **PintDownload** yer işaretine tıklayın. Link yapıştırılmış olarak açılır.',
    imageAlt:
      'Chrome’da PintDownload’u yer işaretlerine ekleme: menüyü açın, yer işaretleri bölümünde bu sekmeyi yer işaretlerine ekleyin ve yer işaretleri çubuğuna kaydedin',
  },
  ad: {
    label: 'Reklam',
  },
  notFound: {
    title: 'Sayfa bulunamadı — {brand}',
    description: '{domain} üzerinde böyle bir sayfa yok. Ana sayfaya dönün ya da bir Pinterest indirici deneyin.',
    h1: 'Bu Pin bu panoda yok.',
    lede: 'Link eski, hatalı yazılmış ya da kaldırılmış olabilir. İndiriciyi deneyin, bir rehbere göz atın veya aşağıdan bir araç seçin.',
    ticketLabel: 'Emanet fişi · herkese açık link',
    stamp: 'Sayfa bulunamadı',
    home: 'Ana sayfaya dön',
    blog: 'Blogu oku',
    contact: 'İletişim',
    toolsAria: 'Pinterest indirme araçları',
    bug: 'Bir hata olduğunu mu düşünüyorsunuz?',
    videoBlurb: 'Herkese açık video Pinlerini indirin',
    pinBlurb: 'Fotoğraf, GIF ve karusel',
    boardBlurb: 'Herkese açık panolar tek ZIP’te',
    guideBlurb: 'Telefon ve PC adımları',
    guideBadge: 'Rehber',
  },
};
