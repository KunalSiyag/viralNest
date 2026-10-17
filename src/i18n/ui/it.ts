/**
 * Chrome strings, Italian (tu; sentence case; typographic apostrophe ’).
 * Same keys and {tokens} as en.ts. Vocabulary from docs/i18n/research/it.json
 * glossary: Condividi › Copia link, bacheca/bacheche, il Pin/i Pin, Galleria
 * (Android) and Foto (iPhone), cartella Download, preferiti (Chrome's
 * "barra dei preferiti"), Maiusc for Shift on Italian keyboards.
 * Never "Scaricatore" (glossary) and no → in display strings: use ›.
 */
import type { UiStrings } from './en';

export const UI: UiStrings = {
  skipToContent: 'Vai al contenuto',
  homeAria: 'PintDownload, pagina principale',
  logoAlt: 'Logo di PintDownload',
  header: {
    mainNavAria: 'Navigazione principale',
    mobileNavAria: 'Strumenti',
    guides: 'Guide',
    themeToggle: 'Alterna tema chiaro e scuro',
    menuOpen: 'Apri il menu',
    menuClose: 'Chiudi il menu',
  },
  languageMenu: {
    label: 'Lingua',
    buttonAria: 'Lingua: {current}',
    homeFallbackHint: 'pagina principale',
  },
  footer: {
    blurb: 'Scarica video, foto, GIF e bacheche pubbliche di Pinterest. Gratis, senza account e senza filigrane aggiunte da noi.',
    tools: 'Strumenti',
    learn: 'Guide',
    company: 'Informazioni',
    blog: 'Blog',
    about: 'Chi siamo',
    contact: 'Contatti',
    privacy: 'Informativa sulla privacy',
    terms: 'Termini di servizio',
    englishMarker: '(in inglese)',
    copyright: '© {year} {brand} · {domain}',
    credit: 'Cita sempre chi ha creato il contenuto quando lo riutilizzi. Strumento indipendente: PintDownload non è affiliato a Pinterest, Inc.',
  },
  matrix: {
    heading: 'Tutti gli strumenti e le guide di PintDownload',
    devices: 'Telefono, PC e guide',
    formats: 'Formati',
    batch: 'Bacheche e Pin',
    guides: 'Guide',
  },
  howTo: {
    exampleLabel: 'Link di esempio',
    stepPrefix: 'Passo {n}: ',
  },
  faq: {
    title: 'Domande frequenti',
  },
  related: {
    title: 'Altri strumenti per Pinterest',
    intro: 'Ogni strumento accetta un tipo di link. Scegli quello che corrisponde al tuo e arrivi subito alla pagina giusta.',
  },
  compare: {
    title: 'Pin, bacheca o profilo: quale strumento?',
    intro: 'Usa lo strumento adatto al tuo link. Incollare il tipo di link sbagliato è il motivo più comune per cui un download non va a buon fine.',
    feature: 'Confronto',
    pin: 'Pin',
    board: 'Bacheca ZIP',
    profile: 'Profilo ZIP',
    rows: {
      url: { feature: 'Esempio di link', pin: 'pinterest.it/pin/123…', board: 'pinterest.it/nomeutente/bacheca/', profile: 'pinterest.it/nomeutente/' },
      what: { feature: 'Cosa ottieni', pin: '1 file o tutto il carosello', board: 'Tanti Pin in uno ZIP', profile: 'I Pin visibili in uno ZIP' },
      best: { feature: 'Ideale per', pin: 'Salvare un’idea o un video', board: 'Moodboard e raccolte', profile: 'Backup di un account' },
      carousel: { feature: 'Slide dei caroselli', pin: 'Sì, tutte', board: 'La copertina di ogni Pin*', profile: 'La copertina di ogni Pin*' },
      private: { feature: 'Contenuti privati o segreti', pin: 'Non supportati', board: 'Non supportati', profile: 'Non supportati' },
    },
    footnoteBefore: '* Per avere tutte le slide di un carosello che sta in una bacheca o in un profilo, apri quel Pin con lo strumento',
    footnoteLink: 'per scaricare i Pin',
    footnoteAfter: '.',
  },
  bookmarklet: {
    title: 'Bookmarklet in un clic',
    body: 'Salva video, foto e bacheche di Pinterest mentre navighi dal computer. Clicca il preferito su qualsiasi Pin e PintDownload si apre con quel link già pronto.',
    button: 'Trascinalo nella barra dei preferiti',
    dragAlert: 'Trascina questo pulsante nella barra dei preferiti del browser per installarlo.',
    dragTitle: 'Trascinami nella barra dei preferiti',
    notPinterest: 'Apri prima una pagina di Pinterest.',
    chromeTitle: 'Chrome / Edge',
    chromeBodyHtml: 'Premi `Ctrl+Maiusc+B` (Cmd+Maiusc+B su Mac) per mostrare la barra dei preferiti, poi trascinaci sopra il pulsante.',
    safariTitle: 'Safari',
    safariBody: 'Trascinalo nei Preferiti. Su iPhone o iPad aggiungi una pagina qualsiasi ai preferiti, modificane l’indirizzo e incolla il codice del bookmarklet.',
    useTitle: 'Usalo',
    useBodyHtml: 'Su un Pin o una bacheca, clicca il preferito **PintDownload**: si apre con il link già incollato.',
    imageAlt:
      'Come aggiungere PintDownload ai preferiti in Chrome: apri il menu, vai su Preferiti, scegli Aggiungi scheda ai preferiti e salvalo nella barra dei preferiti',
  },
  ad: {
    label: 'Pubblicità',
  },
  notFound: {
    title: 'Pagina non trovata — {brand}',
    description: 'Questa pagina non esiste su {domain}. Torna alla pagina principale o prova uno strumento per scaricare da Pinterest.',
    h1: 'Questo Pin non è nella bacheca.',
    lede: 'Il link potrebbe essere vecchio, scritto male o rimosso. Prova il modulo per scaricare, leggi una guida o scegli uno strumento qui sotto.',
    ticketLabel: 'Ingresso singolo · link pubblico',
    stamp: 'Pagina non trovata',
    home: 'Torna alla home',
    blog: 'Leggi il blog',
    contact: 'Contatti',
    toolsAria: 'Strumenti per scaricare da Pinterest',
    bug: 'Pensi che sia un errore?',
    videoBlurb: 'Salva i Pin video pubblici',
    pinBlurb: 'Immagini, GIF e caroselli',
    boardBlurb: 'Bacheche pubbliche in ZIP',
    guideBlurb: 'Passi per telefono e PC',
    guideBadge: 'Guida',
  },
};
