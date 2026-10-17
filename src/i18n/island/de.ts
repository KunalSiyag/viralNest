/**
 * Island catalog, German (du, lowercase; sentence case; hyphenated brand
 * compounds: Pin-Link, Video-Pin, ZIP-Datei). Same keys, same {tokens} as
 * en.ts, every plural category Intl.PluralRules('de') lists (one, other).
 * Vocabulary: docs/i18n/research/de.json glossary (Pinnwand, Teilen ›
 * „Link kopieren“, Garderobenmarke metaphor: Link abgeben, Datei abholen;
 * EINLASS, Nr., ABHOLBEREIT, UNGÜLTIG). Percent signs take a no-break space
 * (50 %). No → in display strings: use ›. Never type ẞ.
 */
import type { IslandMessages } from './types';

export const ISLAND: IslandMessages = {
  lang: 'de',

  variants: {
    hub: {
      singleTab: 'Pin, Pinnwand oder Profil',
      placeholder: 'Link hier einfügen… z. B. https://pin.it/…',
      ariaLabel: 'Link zu einem Pinterest-Pin, einer Pinnwand oder einem Profil',
      submitLabel: 'Herunterladen',
      hint: 'Öffentliche Links zu Pins, Pinnwänden oder Profilen. Pinnwände und Profile kommen als ZIP.',
      expect: 'Wartet auf einen Link',
    },
    pin: {
      singleTab: 'Pin-Link',
      placeholder: 'Pin-Link einfügen… https://pinterest.com/pin/… oder pin.it/…',
      ariaLabel: 'Link zu einem Pinterest-Pin',
      submitLabel: 'Pin herunterladen',
      hint: 'Für Bild-, Video- und GIF-Pins sowie Karussells (alle Bilder).',
      expect: 'Für Pin-Links',
    },
    video: {
      singleTab: 'Link zum Video-Pin',
      placeholder: 'Video-Link einfügen… https://pinterest.com/pin/… oder pin.it/…',
      ariaLabel: 'Link zu einem Pinterest-Video-Pin',
      submitLabel: 'Video herunterladen',
      hint: 'Speichert das MP4 (meist 720p, 1080p, wenn der Pin es hat). Auf Wunsch macht dein Browser daraus auch ein MP3 mit dem Ton.',
      expect: 'Für Video-Pins',
    },
    image: {
      singleTab: 'Link zum Bild-Pin',
      placeholder: 'Bild-Link einfügen… https://pinterest.com/pin/…',
      ariaLabel: 'Link zu einem Pinterest-Bild-Pin',
      submitLabel: 'Bild herunterladen',
      hint: 'Speichert die größte Version, die Pinterest veröffentlicht (bis 1200 px breit). Bei Karussells alle Bilder.',
      expect: 'Für Bild-Pins',
    },
    gif: {
      singleTab: 'Link zum GIF-Pin',
      placeholder: 'GIF-Link einfügen… https://pinterest.com/pin/… oder pin.it/…',
      ariaLabel: 'Link zu einem Pinterest-GIF-Pin',
      submitLabel: 'GIF herunterladen',
      hint: 'Speichert das animierte GIF mit Loop, kein Standbild vom ersten Frame.',
      expect: 'Für GIF-Pins',
    },
    board: {
      singleTab: 'Pinnwand-Link',
      placeholder: 'Link einfügen… https://pinterest.com/nutzername/pinnwand-name/',
      ariaLabel: 'Link zu einer Pinterest-Pinnwand',
      submitLabel: 'Pinnwand abrufen',
      hint: 'Füge den Link einer öffentlichen Pinnwand ein, sieh dir die Pins an und lade dann alles als ZIP herunter.',
      expect: 'Für Pinnwand-Links',
    },
    profile: {
      singleTab: 'Profil-Link',
      placeholder: 'Link einfügen… https://pinterest.com/nutzername/',
      ariaLabel: 'Link zu einem Pinterest-Profil',
      submitLabel: 'Profil abrufen (ZIP)',
      hint: 'Lädt die öffentlichen Pins dieses Kontos als ZIP-Datei herunter.',
      expect: 'Für Profil-Links',
    },
    'profile-picture': {
      singleTab: 'Profil-Link',
      placeholder: 'Link einfügen… https://pinterest.com/nutzername/',
      ariaLabel: 'Link zu einem Pinterest-Profil für das Profilbild',
      submitLabel: 'Profilbild abrufen',
      hint: 'Speichert das größte Profilbild, das Pinterest für ein öffentliches Konto veröffentlicht.',
      expect: 'Für Profil-Links',
    },
  },

  ticket: {
    admitOne: 'Einlass · öffentlicher Link',
    serial: 'Nr. {serial}',
    serialEmpty: 'Nr. ——————',
    modeGroup: 'Link-Modus',
    oneLink: 'Ein Link',
    upToFive: 'Bis zu 5',
    hubLabel: 'Pinterest-Link',
    clearAria: 'Link löschen',
    pasteAria: 'Link aus der Zwischenablage einfügen',
    paste: 'Einfügen',
    batchLabel: 'Mehrere Pinterest-Links (bis zu 5, einer pro Zeile)',
    batchPlaceholder: 'Ein Link pro Zeile, bis zu 5…\nhttps://pinterest.com/pin/1234567/\nhttps://pin.it/abc1234',
    processing: 'Link wird gelesen…',
    batchProcessing: 'Links werden gelesen…',
    batchSubmit: 'Alle abrufen',
    toolsNav: 'Wähl das Tool für deinen Link',
    notPinterestHelp: 'Das ist kein Pinterest-Link. Tippe in der Pinterest-App auf Teilen › „Link kopieren“ und füge ihn hier ein.',
  },

  stamps: {
    notPinterest: 'Kein Pinterest',
    board: 'Pinnwand › ZIP',
    profileZip: 'Profil › ZIP',
    profileAvatar: 'Profil › Profilbild',
    pinShort: 'Pin · Kurzlink',
    pin: 'Pin',
  },

  marks: { void: 'Ungültig', partial: 'Teilweise', packed: 'Gepackt', done: 'Fertig' },

  chips: {
    pin: 'Pin',
    video: 'MP4-Video',
    image: 'Bild',
    gif: 'GIF',
    board: 'Pinnwand-ZIP',
    profile: 'Profil-ZIP',
    avatar: 'Profilbild',
  },

  routeNotice: {
    boardLink: 'Pinnwand-Link erkannt · zum Pinnwand-Tool gewechselt',
    profileLink: 'Profil-Link erkannt · zum Profil-Tool gewechselt',
    gif: 'Animiertes GIF erkannt · zum GIF-Tool gewechselt',
    video: 'Video-Pin erkannt · zum Video-Tool gewechselt',
    carousel: {
      one: 'Karussell mit {n} Bild erkannt · zum Karussell-Tool gewechselt',
      other: 'Karussell mit {n} Bildern erkannt · zum Karussell-Tool gewechselt',
    },
    board: 'Pinterest-Pinnwand erkannt · zum Pinnwand-Tool gewechselt',
    profile: 'Pinterest-Profil erkannt · zum Profil-Tool gewechselt',
    open: 'Dieses Tool öffnen',
  },

  progress: {
    reading: 'Ton des Videos wird gelesen…',
    making: 'MP3 wird erstellt… {pct} %',
    connecting: 'Verbindung zu Pinterest…',
    downloadingOf: 'Wird heruntergeladen… {loaded} von {total} ({pct} %)',
    downloading: 'Wird heruntergeladen… {loaded}',
  },

  bytes: { B: 'B', KB: 'KB', MB: 'MB', GB: 'GB' },

  live: {
    readingLink: 'Dein Link wird gelesen…',
    readingLinks: 'Deine Links werden gelesen…',
    packingZip: 'ZIP wird gepackt, {pct} % fertig',
    making: '{file} wird in deinem Browser erstellt…',
    makingPct: '{file} wird in deinem Browser erstellt, {pct} % fertig',
    downloading: '{file} wird heruntergeladen…',
    downloadingPct: '{file} wird heruntergeladen, {pct} % fertig',
    zipPacked: {
      one: 'ZIP mit {packed} von {total} Datei gepackt. Download gestartet.',
      other: 'ZIP mit {packed} von {total} Dateien gepackt. Download gestartet.',
    },
    started: 'Download gestartet: {file}',
    copied: 'In die Zwischenablage kopiert.',
  },

  kinds: {
    image: 'Bild-Pin',
    video: 'Video-Pin',
    gif: 'GIF-Pin',
    carousel: 'Karussell',
    board: 'Pinnwand',
    profile: 'Profil',
    avatar: 'Profilbild',
  },

  voidCopy: {
    validation: { title: 'Füge zuerst einen Link ein' },
    link: {
      title: 'Das ist kein Pinterest-Link',
      hint: 'Tippe in der Pinterest-App auf Teilen › „Link kopieren“ und füge den Link ins Ticket ein.',
    },
    private: {
      title: 'Nichts Öffentliches abzuholen',
      hint: 'Nur öffentliche Pins, Pinnwände und Profile lassen sich speichern. Geheime Pinnwände und private Konten bleiben privat.',
    },
    removed: { title: 'Dieser Pin wurde entfernt' },
    download: { title: 'Die Datei wurde nicht geladen', hint: 'Manchmal liefert Pinterest eine Datei nicht mehr aus. Versuch es mit dem Link noch einmal.' },
    other: { title: 'Dieser Link ließ sich nicht abholen', hint: 'Prüf, ob sich der Link auf Pinterest öffnen lässt, und versuch es dann noch einmal.' },
  },

  receipt: {
    ready: 'Abholbereit · {kind}',
    fetching: 'Wird bei Pinterest abgeholt…',
    another: 'Noch ein Link',
    tryAnother: 'Anderen Link versuchen',
    guide: 'Zur Schritt-für-Schritt-Anleitung',
    savesAs: 'Speichert als {file}',
    download: '{format} herunterladen',
    downloadShort: 'Speichern',
    itemAria: '{verb}:{item}',
    downloadProgressAria: 'Download-Fortschritt',
    zipProgressAria: 'Fortschritt beim Packen des ZIP',
    zipProgressText: {
      one: '{done} von {total} Datei gepackt',
      other: '{done} von {total} Dateien gepackt',
    },
    packing: {
      one: 'Wird gepackt: {done} von {total} Datei…',
      other: 'Wird gepackt: {done} von {total} Dateien…',
    },
    cancel: 'Abbrechen',
    cancelSr: ' (ZIP)',
    downloadZip: 'ZIP herunterladen ({n})',
    zipPartial: {
      one: '{name} enthält {packed} von {total} Datei. Nicht von Pinterest geladen: {missing}. Speichere fehlende Dateien einzeln.',
      other: '{name} enthält {packed} von {total} Dateien. Nicht von Pinterest geladen: {missing}. Speichere fehlende Dateien einzeln.',
    },
    zipAll: {
      one: '{name}: {total} Datei. Download gestartet.',
      other: '{name}: alle {total} Dateien. Download gestartet.',
    },
    noMp3: ' Kein MP3 in diesem ZIP. {reason}',
    started: 'Download gestartet: {file}',
    startedShort: 'Download gestartet',
    copyLink: 'Link kopieren',
    linkCopied: 'Link kopiert',
    // Tile buttons are 89–103 px on phones: the format alone, the icon is the
    // visible verb and screen readers hear it from tileSr (as fr and ru).
    save: '{format}',
    tileSr: ' speichern, {name}',
    tagVideo: 'Video',
    tagGif: 'GIF',
  },

  specs: {
    slides: 'Bilder',
    images: 'Bilder',
    videos: 'Videos',
    gifs: 'GIFs',
    pins: 'Pins',
    boards: 'Pinnwände',
    format: 'Format',
    crop: 'Zuschnitt',
    uncropped: 'Ohne Zuschnitt',
    resolution: 'Auflösung',
    plays: 'Wiedergabe',
    looping: 'Endlosschleife',
    quality: 'Qualität',
  },

  fallbacks: {
    pin: 'Pinterest-Pin',
    carousel: 'Pinterest-Karussell',
    board: 'Pinterest-Pinnwand',
    profile: 'Pinterest-Profil',
    user: 'Pinterest-Konto',
    slide: 'Bild {n}',
    pinN: 'Pin {n}',
    slideSr: 'Bild {n}',
    pinSr: 'Pin {n}',
  },

  carousel: { everySlide: 'Alle Bilder' },

  avatar: {
    alt: 'Profilbild von {name}',
    openFull: 'In voller Größe öffnen',
    newTabSr: ' (öffnet in neuem Tab)',
    promo: 'Du willst alle Pins dieses Profils? Nimm stattdessen den {link}.',
    profileLink: 'Profil-Download (ZIP)',
  },

  collection: {
    byUser: 'von @{user}',
    atUser: '@{user}',
    alsoOnProfile: 'Ebenfalls auf diesem Profil',
    profilePicture: 'Profilbild',
    largestSize: 'Die größte Version, die Pinterest veröffentlicht',
    profilePictureSr: ' Profilbild (JPG)',
    boardsHeading: 'Pinnwände ({n})',
    boardsHint: 'Öffne eine Pinnwand, um nur ihre Pins abzuholen.',
    boardPins: { one: '{n} Pin', other: '{n} Pins' },
    openBoard: 'Pinnwand öffnen',
    pinsHeading: 'Pins',
    showing: '{shown} von {total} angezeigt. Das ZIP enthält alle.',
    loadMore: '{n} weitere laden',
    showAll: 'Alle {n} anzeigen',
  },

  single: {
    previewAria: 'Vorschau: {title}',
    playPreview: 'Vorschau abspielen',
    freeze: 'Anhalten',
    playLoop: 'Endlos abspielen',
    alsoInPin: 'Ebenfalls in diesem Pin',
    videoName: 'Video',
    withSound: 'Mit Ton',
    videoSr: ' Video (MP4)',
    audioName: 'Audio, {kbps} kbps',
    audioNote: 'Im Browser aus dem Ton erstellt',
    audioSr: ' Audio (MP3)',
    coverName: 'Titelbild',
    coverNote: 'Das Standbild auf Pinterest',
    coverSr: ' Titelbild ({format})',
    packName: 'Alles',
    packCover: 'Titelbild',
    packSr: ' alles (ZIP)',
    sendToPhone: 'Aufs Handy',
    hideQr: 'QR-Code ausblenden',
    crop: 'Zuschneiden',
    trim: 'Ton kürzen',
    qrAltVideo: 'QR-Code mit dem Link zur Videodatei: scannen, um sie auf dem Handy zu öffnen',
    qrAltImage: 'QR-Code mit dem Link zur Bilddatei: scannen, um sie auf dem Handy zu öffnen',
    qrText:
      'Scanne den Code mit der Handykamera, um die Datei direkt zu öffnen. Dann lange drücken und in der Galerie oder in Fotos speichern. Ohne App, ohne Anmeldung.',
  },

  extras: {
    summary: 'Farben, Tags und Texte zum Teilen',
    palette: 'Farbpalette',
    paletteHint: 'Farbtöne der Hauptfarbe des Pins. Zum Kopieren antippen.',
    copied: 'Kopiert',
    tags: 'Tags',
    copyTags: 'Tags kopieren',
    repostCaption: 'Text zum Teilen',
    captionFor: 'Text für',
    copyCaption: 'Text und Tags kopieren',
    copiedCaption: 'Text kopiert',
    captionReels: '✨ {title}\n\nMarkier jemanden, der das sehen muss! 👇\n\n📌 Gespeichert mit PintDownload\n\n{tags} #reels #viral #aesthetic',
    captionTiktok: 'POV: {title} 🌿🔥\n\nFolg mir für mehr Pins und Inspiration jeden Tag!\n\n{tags} #fyp #viral #pinterest #fürdich',
    captionShorts: '🔥 {title} | Pinterest-Ästhetik\n\nLike und abonnier für mehr visuelle Ideen jeden Tag!\n\n{tags} #shorts #pintdownload #pinterest',
  },

  batch: {
    ready: { one: 'Abholbereit · {n} Pin', other: 'Abholbereit · {n} Pins' },
    heading: { one: '{n} Datei abgeholt', other: '{n} Dateien abgeholt' },
    downloadAll: 'Alle herunterladen ({n})',
    oneAfterAnother: 'Die Dateien werden nacheinander heruntergeladen.',
  },

  recent: { heading: 'Zuletzt verwendet' },

  errors: {
    emptyLink: 'Füge zuerst einen öffentlichen Pinterest-Link ein. In der App: Teilen › „Link kopieren“.',
    emptyBatch: 'Füge mindestens einen Pinterest-Link ein, einen pro Zeile.',
    batchInvalid: 'Gib gültige Pinterest-Links ein (z. B. https://pinterest.com/pin/… oder https://pin.it/…).',
    batchFailed: 'Die Links ließen sich nicht abrufen. Prüf, ob die Pinterest-Links öffentlich sind.',
    extractFailed: 'Die Inhalte ließen sich nicht von Pinterest abrufen.',
    unknown: 'Etwas ist schiefgelaufen. Prüf den Pinterest-Link und versuch es noch einmal.',
    qr: 'Der QR-Code ließ sich nicht erstellen. Kopiere stattdessen den Link.',
    copyLink: 'Der Link ließ sich nicht kopieren. Halte den Download-Button gedrückt, um ihn zu kopieren.',
    fileUnavailable:
      'Diese Datei ließ sich nicht herunterladen. Vielleicht ist der Pin privat, oder Pinterest liefert die Datei nicht mehr aus.',
    noBody: 'Der Server hat keine Antwort geschickt.',
    downloadFailed: 'Download fehlgeschlagen.',
    zipNothing: 'Keine Datei ließ sich ins ZIP packen. Die Dateien sind vielleicht nicht verfügbar.',
    zipFailed: 'Das ZIP ließ sich nicht erstellen.',
    zipPartial: {
      one: 'ZIP fertig mit {ok} von {total} Datei ({failed} fehlgeschlagen).',
      other: 'ZIP fertig mit {ok} von {total} Dateien ({failed} fehlgeschlagen).',
    },
    noMp3Video: 'Das Video ließ sich nicht von Pinterest laden.',
    noMp3Browser: 'Dieser Browser konnte das MP3 nicht erstellen.',
  },

  api: {
    invalid_input: 'Gib einen gültigen Pinterest-Link ein.',
    blocked: 'Dieser Inhalt wurde auf Wunsch der Person entfernt, die ihn erstellt hat.',
    not_pinterest:
      'Ungültiger Link. Gib einen gültigen Pinterest-Link ein (z. B. https://pinterest.com/pin/… oder https://pin.it/…).',
    left_pinterest: 'Dieser Link führt weg von Pinterest, deshalb gibt es nichts herunterzuladen.',
    removed_or_private:
      'Dieser Pin wurde entfernt oder ist jetzt privat, deshalb gibt es nichts herunterzuladen. Prüf, ob sich der Link auf Pinterest öffnen lässt.',
    avatar_not_found: 'Für dieses Pinterest-Konto wurde kein Profilbild gefunden. Vielleicht ist das Profil privat.',
    collection_empty_board: 'Auf dieser Pinnwand wurden keine öffentlichen Pins gefunden. Vielleicht ist sie geheim oder leer.',
    collection_empty_profile: 'Auf diesem Profil wurden keine öffentlichen Pins gefunden. Vielleicht ist es privat oder leer.',
    collection_unavailable: 'Pinterest hat die Pins dieser Pinnwand gerade nicht geliefert. Versuch es in einer Minute noch einmal.',
    no_media: 'Unter diesem Link wurde nichts zum Herunterladen gefunden. Prüf, ob der Pin öffentlich ist.',
    access_denied: 'Zugriff verweigert.',
    origin_denied: 'Die API darf nicht direkt verwendet werden.',
    server_error: 'Der Pinterest-Link ließ sich nicht verarbeiten. Prüf, ob es ein gültiger öffentlicher Pin ist.',
  },

  mp3: {
    no_audio: 'Dieses Video hat keinen Ton, der sich als MP3 speichern ließe. Lade stattdessen das MP4 herunter.',
    unsupported:
      'Dieser Browser kann den Ton des Videos nicht lesen und deshalb kein MP3 erstellen. Probier Chrome, Edge, Safari oder Firefox, oder lade das MP4 herunter.',
    failed: 'Das MP3 ließ sich nicht erstellen. Versuch es noch einmal oder lade das MP4 herunter, das den Ton enthält.',
    aborted: 'MP3 abgebrochen.',
  },

  trimmer: {
    title: 'Ton kürzen und speichern',
    reading: 'Ton des Videos wird gelesen…',
    loadFailed: 'Der Ton dieses Videos ließ sich nicht laden. Prüf deine Verbindung und versuch es noch einmal.',
    start: 'Start: {time}',
    end: 'Ende: {time}',
    seconds: '{n} s',
    startAria: 'Startzeit des Ausschnitts in Sekunden',
    endAria: 'Endzeit des Ausschnitts in Sekunden',
    length: 'Länge des Ausschnitts: {len}',
    lengthValue: '{n} s',
    pause: 'Pause',
    listen: 'Ausschnitt anhören',
    cancel: 'Abbrechen',
    wav: 'Ausschnitt als WAV',
    mp3: 'Ausschnitt als MP3 ({kbps} kbps)',
    exportFailed: 'Der {format}-Ausschnitt ließ sich nicht erstellen. Versuch es noch einmal.',
    making: 'MP3 wird erstellt… {pct} %',
    note: 'In deinem Browser aus dem Ton des Videos erstellt. Es wird nichts hochgeladen.',
  },

  cropper: {
    title: 'Zuschneiden und Größe ändern',
    pick: 'Seitenverhältnis für Social Media wählen',
    presets: {
      original: 'Unverändert',
      square: '1:1 Quadrat (IG-Post)',
      story: '9:16 Story/Reel (TikTok)',
      portrait: '4:5 Hochformat (IG)',
      landscape: '16:9 Querformat (YT)',
    },
    previewAlt: 'Vorschau des Zuschnitts',
    processing: 'Bild wird verarbeitet…',
    cancel: 'Abbrechen',
    download: 'Herunterladen ({ratio})',
  },

  sticky: {
    close: 'Einfügeleiste schließen',
    label: 'Pinterest-Link einfügen',
    placeholder: 'Link…',
    paste: 'Einfügen',
    save: 'Laden',
    top: 'Nach oben',
  },
};
