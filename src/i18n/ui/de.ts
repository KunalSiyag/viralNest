/**
 * Chrome strings, German (du, lowercase; German sentence case; hyphenated
 * brand compounds; never ẞ). Same keys and {tokens} as en.ts.
 * Vocabulary from docs/i18n/research/de.json glossary: Pinnwand (pl.
 * Pinnwände), Teilen › „Link kopieren“, Lesezeichen (Bookmarklet),
 * Lesezeichenleiste, Galerie / Fotos-App, Downloads-Ordner, Strg/Umschalt.
 */
import type { UiStrings } from './en';

export const UI: UiStrings = {
  skipToContent: 'Zum Inhalt springen',
  homeAria: 'Startseite von PintDownload',
  logoAlt: 'PintDownload-Logo',
  header: {
    mainNavAria: 'Hauptnavigation',
    mobileNavAria: 'Tool-Menü',
    // Header slot: 'Anleitungen' ran under the language button at 1024–1070 px.
    guides: 'Ratgeber',
    themeToggle: 'Zwischen hellem und dunklem Modus wechseln',
    menuOpen: 'Menü öffnen',
    menuClose: 'Menü schließen',
  },
  languageMenu: {
    label: 'Sprache',
    buttonAria: 'Sprache: {current}',
    homeFallbackHint: 'Startseite',
  },
  footer: {
    blurb: 'Öffentliche Pins, Videos, Pinnwände und Profile von Pinterest herunterladen. Kostenlos, ohne Konto, ohne Wasserzeichen von uns.',
    tools: 'Tools',
    learn: 'Anleitungen',
    company: 'Info',
    blog: 'Blog',
    about: 'Über uns',
    contact: 'Kontakt',
    privacy: 'Datenschutz',
    terms: 'Nutzungsbedingungen',
    englishMarker: '(auf Englisch)',
    copyright: '© {year} {brand} · {domain}',
    credit: 'Nenne die Creator, wenn du Inhalte weiterverwendest. Unabhängiges Tool: PintDownload steht in keiner Verbindung zu Pinterest Inc.',
  },
  matrix: {
    heading: 'Alle Tools und Anleitungen von PintDownload',
    devices: 'Handy, PC und Browser',
    formats: 'Formate',
    batch: 'Pinnwände, Profile und Pins',
    guides: 'Anleitungen',
  },
  howTo: {
    exampleLabel: 'Beispiel-Link',
    stepPrefix: 'Schritt {n}: ',
  },
  faq: {
    title: 'Häufige Fragen',
  },
  related: {
    title: 'Weitere Tools für Pinterest',
    intro: 'Jedes Tool ist für eine Art von Link gedacht. Wähl das passende, dann landest du gleich beim richtigen Downloader.',
  },
  compare: {
    title: 'Pin, Pinnwand oder Profil – welches Tool?',
    intro: 'Nimm das Tool, das zu deinem Link passt. Ein falscher Link-Typ ist der häufigste Grund, warum ein Download scheitert.',
    feature: 'Merkmal',
    pin: 'Pin',
    board: 'Pinnwand-ZIP',
    profile: 'Profil-ZIP',
    rows: {
      url: { feature: 'Beispiel-Link', pin: 'pinterest.de/pin/123…', board: 'pinterest.de/nutzer/pinnwand/', profile: 'pinterest.de/nutzer/' },
      what: { feature: 'Was du bekommst', pin: '1 Datei oder alle Karussell-Bilder', board: 'Viele Pins als ZIP', profile: 'Sichtbare Pins als ZIP' },
      best: { feature: 'Ideal für', pin: 'Eine Idee oder ein Video', board: 'Moodboards und Sammlungen', profile: 'Backup eines Kontos' },
      carousel: { feature: 'Karussell-Bilder', pin: 'Ja, alle', board: 'Titelbild pro Pin*', profile: 'Titelbild pro Pin*' },
      private: { feature: 'Private oder geheime Inhalte', pin: 'Nicht möglich', board: 'Nicht möglich', profile: 'Nicht möglich' },
    },
    footnoteBefore: '* Alle Karussell-Bilder eines Pins aus einem Pinnwand- oder Profil-ZIP bekommst du, wenn du den Pin im',
    footnoteLink: 'Pin-Download',
    footnoteAfter: ' öffnest.',
  },
  bookmarklet: {
    title: 'Lesezeichen mit einem Klick',
    body: 'Speichere Pinterest-Videos, Bilder und Pinnwände direkt beim Stöbern am Computer. Klick auf einem Pin auf das Lesezeichen, und PintDownload öffnet sich mit dem Link.',
    button: 'In die Lesezeichenleiste ziehen',
    dragAlert: 'Zieh diesen Button in die Lesezeichenleiste deines Browsers, um ihn einzurichten.',
    dragTitle: 'Zieh mich in die Lesezeichenleiste',
    notPinterest: 'Öffne zuerst eine Pinterest-Seite.',
    chromeTitle: 'Chrome / Edge',
    chromeBodyHtml: 'Drück `Strg+Umschalt+B` (Mac: `⌘+Umschalt+B`), um die Lesezeichenleiste einzublenden, und zieh den Button hinein.',
    safariTitle: 'Safari',
    safariBody: 'Zieh den Button in die Favoritenleiste. Auf iPhone oder iPad legst du ein beliebiges Lesezeichen an, bearbeitest seine Adresse und fügst dort den Code des Bookmarklets ein.',
    useTitle: 'So nutzt du es',
    useBodyHtml: 'Klick auf einem Pin oder einer Pinnwand auf das neue Lesezeichen. PintDownload öffnet sich mit dem Link schon eingefügt.',
    imageAlt:
      'PintDownload in Chrome als Lesezeichen anlegen: Menü öffnen, Lesezeichen wählen, den Tab als Lesezeichen speichern und in der Lesezeichenleiste ablegen',
  },
  ad: {
    label: 'Anzeige',
  },
  notFound: {
    title: 'Seite nicht gefunden – {brand}',
    description: 'Diese Seite gibt es auf {domain} nicht. Geh zur Startseite oder direkt zu einem Pinterest-Downloader.',
    h1: 'Dieser Pin hängt nicht an der Pinnwand.',
    lede: 'Der Link ist vielleicht veraltet oder vertippt, oder die Seite wurde entfernt. Probier den Downloader, lies eine Anleitung oder spring unten zu einem Tool.',
    ticketLabel: 'Einlass · öffentlicher Link',
    stamp: 'Seite nicht gefunden',
    home: 'Zur Startseite',
    blog: 'Zum Blog',
    contact: 'Kontakt',
    toolsAria: 'Pinterest-Downloader',
    bug: 'Hältst du das für einen Fehler?',
    videoBlurb: 'Öffentliche Video-Pins speichern',
    pinBlurb: 'Bilder, GIFs, Karussells',
    boardBlurb: 'Öffentliche Pinnwände als ZIP',
    guideBlurb: 'Schritte für Handy und PC',
    guideBadge: 'Anleitung',
  },
};
