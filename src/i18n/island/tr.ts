/**
 * Island catalog, Turkish. Same keys and {tokens} as en.ts; plural maps carry
 * every category Intl.PluralRules('tr') lists (one, other). Turkish nouns stay
 * singular after a number ("5 dosya", "10 Pin"), so both forms usually match.
 * Vocabulary: docs/i18n/research/tr.json glossary (link, pano, Pin/Pini/Pinler,
 * karusel Pin + kart, paylaş simgesi › Bağlantıyı kopyala, emanet fişi,
 * GEÇERSİZ, "Dosya hazırlanıyor…"). Buttons use bare imperatives, sentences the
 * polite plural. Percent goes before the number (%{pct}). No suffix is ever
 * glued to a {token}: Turkish suffixes follow vowel harmony of the value.
 * "Pano" also means the Windows clipboard, so the clipboard is never named.
 * No → in display strings: use ›.
 */
import type { IslandMessages } from './types';

export const ISLAND: IslandMessages = {
  lang: 'tr',

  variants: {
    hub: {
      singleTab: 'Pin, pano ya da profil',
      placeholder: 'Pinterest linkini yapıştırın… örn. https://pin.it/…',
      ariaLabel: 'Pinterest Pin, pano ya da profil linki',
      submitLabel: 'İndir',
      hint: 'Herkese açık Pin, pano ya da profil linkleri. Panolar ve profiller ZIP olarak iner.',
      expect: 'Link bekleniyor',
    },
    pin: {
      singleTab: 'Pin linki',
      placeholder: 'Pin linkini yapıştırın… https://pinterest.com/pin/… ya da pin.it/…',
      ariaLabel: 'Pinterest Pin linki',
      submitLabel: 'Pini indir',
      hint: 'Fotoğraf, video ve GIF Pinlerinde çalışır; karusel Pinlerde bütün kartları verir.',
      expect: 'Pin linkiyle çalışır',
    },
    video: {
      singleTab: 'Video Pini linki',
      placeholder: 'Video linkini yapıştırın… https://pinterest.com/pin/… ya da pin.it/…',
      ariaLabel: 'Pinterest video Pini linki',
      submitLabel: 'Videoyu indir',
      hint: 'MP4’ü kaydeder (genellikle 720p, Pinde varsa 1080p); isterseniz sesinden tarayıcınızda MP3 de hazırlar.',
      expect: 'Video Piniyle çalışır',
    },
    image: {
      singleTab: 'Fotoğraf Pini linki',
      placeholder: 'Fotoğraf Pininin linkini yapıştırın… https://pinterest.com/pin/…',
      ariaLabel: 'Pinterest fotoğraf Pini linki',
      submitLabel: 'Fotoğrafı indir',
      hint: 'Pinterest’in yayınladığı en büyük boyutu kaydeder (en fazla 1200 px genişlik). Karusellerde bütün kartlar gelir.',
      expect: 'Fotoğraf Piniyle çalışır',
    },
    gif: {
      singleTab: 'GIF Pini linki',
      placeholder: 'GIF Pininin linkini yapıştırın… https://pinterest.com/pin/… ya da pin.it/…',
      ariaLabel: 'Pinterest GIF Pini linki',
      submitLabel: 'GIF’i indir',
      hint: 'Hareketli GIF’i döngüsüyle kaydeder; ilk karenin donuk bir fotoğrafını değil.',
      expect: 'GIF Piniyle çalışır',
    },
    board: {
      singleTab: 'Pano linki',
      placeholder: 'Pano linkini yapıştırın… https://pinterest.com/kullanici/pano-adi/',
      ariaLabel: 'Pinterest pano linki',
      submitLabel: 'Panodaki Pinleri getir',
      hint: 'Herkese açık bir pano linki yapıştırın, Pinleri listeleyin, sonra paketin tamamını ZIP olarak indirin.',
      expect: 'Pano linkiyle çalışır',
    },
    profile: {
      singleTab: 'Profil linki',
      placeholder: 'Profil linkini yapıştırın… https://pinterest.com/kullanici/',
      ariaLabel: 'Pinterest profil linki',
      submitLabel: 'Profili indir (ZIP)',
      hint: 'Bu hesabın profilinde görünen herkese açık Pinleri tek bir ZIP arşivinde indirir.',
      expect: 'Profil linkiyle çalışır',
    },
    'profile-picture': {
      singleTab: 'Profil linki',
      placeholder: 'Profil linkini yapıştırın… https://pinterest.com/kullanici/',
      ariaLabel: 'Profil fotoğrafı için Pinterest profil linki',
      submitLabel: 'Profil fotoğrafını al',
      hint: 'Herkese açık bir hesabın Pinterest’te yayınlanan en büyük profil fotoğrafını kaydeder.',
      expect: 'Profil linkiyle çalışır',
    },
  },

  ticket: {
    admitOne: 'Emanet fişi · herkese açık link',
    serial: 'No. {serial}',
    serialEmpty: 'No. ——————',
    modeGroup: 'Link modu',
    oneLink: 'Tek link',
    upToFive: 'En fazla 5',
    hubLabel: 'Pinterest linki',
    clearAria: 'Linki temizle',
    pasteAria: 'Kopyaladığınız linki yapıştırın',
    paste: 'Yapıştır',
    batchLabel: 'Toplu Pinterest linkleri (en fazla 5, her satıra bir link)',
    batchPlaceholder: 'Her satıra bir link, en fazla 5…\nhttps://pinterest.com/pin/1234567/\nhttps://pin.it/abc1234',
    processing: 'Dosya hazırlanıyor…',
    batchProcessing: 'Linkler okunuyor…',
    batchSubmit: 'Hepsini indir',
    toolsNav: 'Linkinize uygun aracı seçin',
    notPinterestHelp: 'Bu bir Pinterest linki değil. Pinterest uygulamasında paylaş simgesine, sonra Bağlantıyı kopyala’ya dokunup buraya yapıştırın.',
  },

  stamps: {
    notPinterest: 'Pinterest değil',
    board: 'Pano › ZIP',
    profileZip: 'Profil › ZIP',
    profileAvatar: 'Profil › PP',
    pinShort: 'Pin · kısa link',
    pin: 'Pin',
  },

  marks: { void: 'Geçersiz', partial: 'Kısmi', packed: 'Paketlendi', done: 'Tamam' },

  chips: {
    pin: 'Pin',
    video: 'Video MP4',
    image: 'Fotoğraf',
    gif: 'GIF',
    board: 'Pano ZIP',
    profile: 'Profil ZIP',
    avatar: 'Profil fotoğrafı',
  },

  routeNotice: {
    boardLink: 'Pano linki algılandı · pano indiriciye geçildi',
    profileLink: 'Profil linki algılandı · profil indiriciye geçildi',
    gif: 'Hareketli GIF algılandı · GIF indiriciye geçildi',
    video: 'Video Pini algılandı · video indiriciye geçildi',
    carousel: {
      one: 'Karusel Pin algılandı ({n} kart) · fotoğraf indiriciye geçildi',
      other: 'Karusel Pin algılandı ({n} kart) · fotoğraf indiriciye geçildi',
    },
    board: 'Pinterest panosu algılandı · pano indiriciye geçildi',
    profile: 'Pinterest profili algılandı · profil indiriciye geçildi',
    open: 'O aracı aç',
  },

  progress: {
    reading: 'Videonun sesi okunuyor…',
    making: 'MP3 hazırlanıyor… %{pct}',
    connecting: 'Pinterest’e bağlanılıyor…',
    downloadingOf: 'İndiriliyor… {loaded} / {total} (%{pct})',
    downloading: 'İndiriliyor… {loaded}',
  },

  bytes: { B: 'B', KB: 'KB', MB: 'MB', GB: 'GB' },

  live: {
    readingLink: 'Linkiniz okunuyor…',
    readingLinks: 'Linkleriniz okunuyor…',
    packingZip: 'ZIP paketleniyor, %{pct} tamamlandı',
    making: '{file} tarayıcınızda hazırlanıyor…',
    makingPct: '{file} tarayıcınızda hazırlanıyor, %{pct} tamamlandı',
    downloading: '{file} indiriliyor…',
    downloadingPct: '{file} indiriliyor, %{pct} tamamlandı',
    zipPacked: {
      one: 'ZIP paketlendi: {total} dosyadan {packed} tanesi içinde. İndirme başladı.',
      other: 'ZIP paketlendi: {total} dosyadan {packed} tanesi içinde. İndirme başladı.',
    },
    started: 'İndirme başladı: {file}',
    copied: 'Kopyalandı.',
  },

  kinds: {
    image: 'Fotoğraf Pini',
    video: 'Video Pini',
    gif: 'GIF Pini',
    carousel: 'Karusel Pin',
    board: 'Pano',
    profile: 'Profil',
    avatar: 'Profil fotoğrafı',
  },

  voidCopy: {
    validation: { title: 'Önce bir link yapıştırın' },
    link: {
      title: 'Bu bir Pinterest linki değil',
      hint: 'Pinterest uygulamasında paylaş simgesine, sonra Bağlantıyı kopyala’ya dokunun ve linki fişe yapıştırın.',
    },
    private: {
      title: 'Alınacak herkese açık bir şey yok',
      hint: 'Yalnızca herkese açık Pinler, panolar ve profiller indirilebilir. Gizli panolar ve gizli hesaplar gizli kalır.',
    },
    removed: { title: 'Bu Pin artık yayında değil' },
    download: { title: 'Dosya inmedi', hint: 'Pinterest bazen bir dosyayı sunmayı bırakır. Linki yeniden deneyin.' },
    other: { title: 'Bu link okunamadı', hint: 'Linkin Pinterest’te açıldığını kontrol edin, sonra yeniden deneyin.' },
  },

  receipt: {
    ready: 'Hazır · {kind}',
    fetching: 'Pinterest’ten alınıyor…',
    another: 'Başka bir tane indir',
    tryAnother: 'Başka bir link deneyin',
    guide: 'Adım adım rehberi okuyun',
    savesAs: 'Dosya adı: {file}',
    download: '{format} indir',
    downloadShort: 'İndir',
    itemAria: '{item} {verb}',
    downloadProgressAria: 'İndirme durumu',
    zipProgressAria: 'ZIP paketleme durumu',
    zipProgressText: {
      one: '{total} dosyadan {done} tanesi paketlendi',
      other: '{total} dosyadan {done} tanesi paketlendi',
    },
    packing: {
      one: '{total} dosyadan {done} tanesi paketleniyor…',
      other: '{total} dosyadan {done} tanesi paketleniyor…',
    },
    cancel: 'İptal',
    cancelSr: ' (ZIP)',
    downloadZip: 'ZIP indir ({n})',
    zipPartial: {
      one: '{name}: {total} dosyadan {packed} tanesi pakette. {missing} dosya Pinterest’ten alınamadı; onu ayrıca kaydedin.',
      other: '{name}: {total} dosyadan {packed} tanesi pakette. {missing} dosya Pinterest’ten alınamadı; onları tek tek kaydedin.',
    },
    zipAll: {
      one: '{name}: {total} dosya pakette. İndirme başladı.',
      other: '{name}: {total} dosyanın tamamı pakette. İndirme başladı.',
    },
    noMp3: ' Bu ZIP’te MP3 yok. {reason}',
    started: 'İndirme başladı: {file}',
    startedShort: 'İndirme başladı',
    copyLink: 'Dosya linkini kopyala',
    linkCopied: 'Link kopyalandı',
    save: '{format} kaydet',
    tileSr: ', {name}',
    tagVideo: 'Video',
    tagGif: 'GIF',
  },

  specs: {
    slides: 'Kartlar',
    images: 'Fotoğraflar',
    videos: 'Videolar',
    gifs: 'GIF’ler',
    pins: 'Pinler',
    boards: 'Panolar',
    format: 'Format',
    crop: 'Kırpma',
    uncropped: 'Kırpılmamış',
    resolution: 'Çözünürlük',
    plays: 'Oynatma',
    looping: 'Döngüde',
    quality: 'Kalite',
  },

  fallbacks: {
    pin: 'Pinterest Pini',
    carousel: 'Pinterest karuseli',
    board: 'Pinterest panosu',
    profile: 'Pinterest profili',
    user: 'Pinterest kullanıcısı',
    slide: 'Kart {n}',
    pinN: 'Pin {n}',
    slideSr: 'kart {n}',
    pinSr: 'Pin {n}',
  },

  carousel: { everySlide: 'Bütün kartlar' },

  avatar: {
    alt: '{name} adlı hesabın profil fotoğrafı',
    openFull: 'Tam boyutta aç',
    newTabSr: ' (yeni sekmede açılır)',
    promo: 'Bu profildeki bütün Pinleri mi istiyorsunuz? Bunun için {link} var.',
    profileLink: 'profil indirici (ZIP)',
  },

  collection: {
    byUser: '@{user} tarafından',
    atUser: '@{user}',
    alsoOnProfile: 'Bu profilde ayrıca',
    profilePicture: 'Profil fotoğrafı',
    largestSize: 'Pinterest’in yayınladığı en büyük boyut',
    profilePictureSr: 'Profil fotoğrafını (JPG)',
    boardsHeading: 'Panolar ({n})',
    boardsHint: 'Yalnızca bir panonun Pinlerini almak için o panoyu açın.',
    boardPins: { one: '{n} Pin', other: '{n} Pin' },
    openBoard: 'Panoyu aç',
    pinsHeading: 'Pinler',
    showing: 'Gösterilen: {shown} / {total}. ZIP’te hepsi var.',
    loadMore: '{n} tane daha yükle',
    showAll: 'Hepsini göster ({n})',
  },

  single: {
    previewAria: 'Önizleme: {title}',
    playPreview: 'Önizlemeyi oynat',
    freeze: 'Durdur',
    playLoop: 'Döngüyü oynat',
    alsoInPin: 'Bu Pinde ayrıca',
    videoName: 'Video',
    withSound: 'Sesli',
    videoSr: 'Videoyu (MP4)',
    audioName: 'Ses, {kbps} kbps',
    audioNote: 'Videonun sesinden tarayıcınızda hazırlanır',
    audioSr: 'Sesi (MP3)',
    coverName: 'Kapak görseli',
    coverNote: 'Pinterest’te görünen sabit kare',
    coverSr: 'Kapak görselini ({format})',
    packName: 'Hepsi',
    packCover: 'kapak görseli',
    packSr: 'Hepsini (ZIP)',
    sendToPhone: 'Telefona gönder',
    hideQr: 'QR kodu gizle',
    crop: 'Kırp / boyutlandır',
    trim: 'Sesi kırp',
    qrAltVideo: 'Video dosyasına giden QR kod: telefonunuzda açmak için kamerayla okutun',
    qrAltImage: 'Fotoğraf dosyasına giden QR kod: telefonunuzda açmak için kamerayla okutun',
    qrText:
      'Telefonunuzun kamerasıyla okutun, dosya hemen açılır; galeriye kaydetmek için üzerine basılı tutun. Uygulama ya da giriş gerekmez.',
  },

  extras: {
    summary: 'Renkler, etiketler ve paylaşım metinleri',
    palette: 'Palet',
    paletteHint: 'Pinin ana renginin tonları. Kopyalamak için birine dokunun.',
    copied: 'Kopyalandı',
    tags: 'Etiketler',
    copyTags: 'Etiketleri kopyala',
    repostCaption: 'Paylaşım metni',
    captionFor: 'Metnin platformu',
    copyCaption: 'Metni ve etiketleri kopyala',
    copiedCaption: 'Metin kopyalandı',
    captionReels: '✨ {title}\n\nBunu görmesi gereken birini etiketle! 👇\n\n📌 PintDownload ile kaydedildi\n\n{tags} #reels #viral #aesthetic',
    captionTiktok: 'POV: {title} 🌿🔥\n\nHer gün yeni Pinler ve ilham için takip et!\n\n{tags} #fyp #viral #pinterest #keşfet',
    captionShorts: '🔥 {title} | Pinterest estetiği\n\nDaha fazla görsel içerik için beğen ve abone ol!\n\n{tags} #shorts #pintdownload #pinterest',
  },

  batch: {
    ready: { one: 'Hazır · {n} Pin', other: 'Hazır · {n} Pin' },
    heading: { one: '{n} dosya hazır', other: '{n} dosya hazır' },
    downloadAll: 'Hepsini indir ({n})',
    oneAfterAnother: 'Dosyalar sırayla iner.',
  },

  recent: { heading: 'Son linkler' },

  errors: {
    emptyLink: 'Önce herkese açık bir Pinterest linki yapıştırın. Uygulamada: paylaş simgesi › Bağlantıyı kopyala.',
    emptyBatch: 'Her satıra bir tane olmak üzere en az bir Pinterest linki yapıştırın.',
    batchInvalid: 'Geçerli Pinterest linkleri girin (örn. https://pinterest.com/pin/… ya da https://pin.it/…)',
    batchFailed: 'Toplu linkler okunamadı. Pinterest linklerinin herkese açık olduğunu kontrol edin.',
    extractFailed: 'Pinterest’ten içerik alınamadı.',
    unknown: 'Bir şeyler ters gitti. Pinterest linkini kontrol edip yeniden deneyin.',
    qr: 'QR kod oluşturulamadı. Bunun yerine linki kopyalayın.',
    copyLink: 'Link kopyalanamadı. Kopyalamak için indirme düğmesine basılı tutun.',
    fileUnavailable:
      'Bu dosya indirilemedi. Pin gizli olabilir ya da Pinterest bu dosyayı artık sunmuyor olabilir.',
    noBody: 'Sunucu yanıt göndermedi',
    downloadFailed: 'İndirme başarısız oldu.',
    zipNothing: 'ZIP’e hiçbir dosya eklenemedi. Dosyalar artık sunulmuyor olabilir.',
    zipFailed: 'ZIP dosyası oluşturulamadı.',
    zipPartial: {
      one: 'ZIP hazır: {total} dosyadan {ok} tanesi ({failed} hatalı).',
      other: 'ZIP hazır: {total} dosyadan {ok} tanesi ({failed} hatalı).',
    },
    noMp3Video: 'Video Pinterest’ten alınamadı.',
    noMp3Browser: 'Bu tarayıcı MP3’ü hazırlayamadı.',
  },

  api: {
    invalid_input: 'Geçerli bir Pinterest linki girin.',
    blocked: 'Bu içerik, sahibinin isteğiyle kaldırıldı.',
    not_pinterest:
      'Geçersiz link. Geçerli bir Pinterest linki girin (örn. https://pinterest.com/pin/… ya da https://pin.it/…)',
    left_pinterest: 'Bu link Pinterest dışına çıkıyor, bu yüzden indirilecek bir şey yok.',
    removed_or_private:
      'Bu Pin kaldırılmış ya da gizlenmiş, bu yüzden indirilecek bir şey yok. Linkin Pinterest’te açıldığını kontrol edin.',
    avatar_not_found: 'Bu Pinterest hesabının profil fotoğrafı bulunamadı. Profil gizli olabilir.',
    collection_empty_board: 'Bu panoda herkese açık Pin bulunamadı. Pano gizli ya da boş olabilir.',
    collection_empty_profile: 'Bu profilde herkese açık Pin bulunamadı. Profil gizli ya da boş olabilir.',
    collection_unavailable: 'Pinterest bu panonun Pinlerini şu an göndermedi. Bir dakika sonra tekrar deneyin.',
    no_media: 'Bu linkte indirilecek bir şey bulunamadı. Pinin herkese açık olduğunu kontrol edin.',
    access_denied: 'Erişim reddedildi.',
    origin_denied: 'API’nin doğrudan kullanılmasına izin verilmiyor.',
    server_error: 'Pinterest linki işlenemedi. Linkin herkese açık ve geçerli bir Pin olduğundan emin olun.',
  },

  mp3: {
    no_audio: 'Bu videoda MP3 olarak kaydedilecek ses yok. Bunun yerine MP4’ü indirin.',
    unsupported:
      'Bu tarayıcı videonun sesini okuyamıyor, bu yüzden MP3 hazırlanamıyor. Chrome, Edge, Safari ya da Firefox deneyin veya MP4’ü indirin.',
    failed: 'MP3 hazırlanamadı. Yeniden deneyin ya da sesi de içeren MP4’ü indirin.',
    aborted: 'MP3 iptal edildi.',
  },

  trimmer: {
    title: 'Ses kırpıcı',
    reading: 'Videonun sesi okunuyor…',
    loadFailed: 'Bu videonun sesi yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.',
    start: 'Başlangıç: {time}',
    end: 'Bitiş: {time}',
    seconds: '{n} sn',
    startAria: 'Kırpma başlangıcı, saniye',
    endAria: 'Kırpma bitişi, saniye',
    length: 'Parça süresi: {len}',
    lengthValue: '{n} sn',
    pause: 'Duraklat',
    listen: 'Parçayı dinle',
    cancel: 'İptal',
    wav: 'Parçayı WAV olarak indir',
    mp3: 'Parçayı MP3 olarak indir ({kbps} kbps)',
    exportFailed: '{format} parçası hazırlanamadı. Yeniden deneyin.',
    making: 'MP3 hazırlanıyor… %{pct}',
    note: 'Videonun sesinden tarayıcınızda hazırlanır. Hiçbir şey yüklenmez.',
  },

  cropper: {
    title: 'Kırp ve boyutlandır',
    pick: 'Sosyal medya için en-boy oranı seçin',
    presets: {
      original: 'Kırpılmamış',
      square: '1:1 kare (IG gönderisi)',
      story: '9:16 hikâye/Reels (TikTok)',
      portrait: '4:5 dikey (IG)',
      landscape: '16:9 yatay (YT)',
    },
    previewAlt: 'Kırpılmış önizleme',
    processing: 'Görsel hazırlanıyor…',
    cancel: 'İptal',
    download: 'Kırpılmış hâlini indir ({ratio})',
  },

  sticky: {
    close: 'Yapıştırma çubuğunu kapat',
    label: 'Pinterest linkini yapıştırın',
    placeholder: 'Link…',
    paste: 'Yapıştır',
    save: 'İndir',
    top: 'Başa dön',
  },
};
