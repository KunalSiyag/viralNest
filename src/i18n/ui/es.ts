/**
 * Chrome strings, Spanish (neutral Latin American, tú, "video").
 * Reference pilot for the locale writers: same keys and {tokens} as en.ts.
 * Vocabulary from docs/i18n/research/es.json glossary (Compartir › Copiar
 * enlace, Galería/Fotos, Descargas, tablero, marcador).
 */
import type { UiStrings } from './en';

export const UI: UiStrings = {
  skipToContent: 'Ir al contenido',
  homeAria: 'Inicio de PintDownload',
  logoAlt: 'Logo de PintDownload',
  header: {
    mainNavAria: 'Navegación principal',
    mobileNavAria: 'Herramientas',
    guides: 'Guías',
    themeToggle: 'Cambiar entre modo claro y oscuro',
    menuOpen: 'Abrir menú',
    menuClose: 'Cerrar menú',
  },
  languageMenu: {
    label: 'Idioma',
    buttonAria: 'Idioma: {current}',
    homeFallbackHint: 'página de inicio',
  },
  footer: {
    blurb: 'Descarga videos, fotos, tableros y perfiles públicos de Pinterest. Gratis, sin cuenta y sin marca de agua añadida.',
    tools: 'Herramientas',
    learn: 'Guías',
    company: 'Información',
    blog: 'Blog',
    about: 'Quiénes somos',
    contact: 'Contacto',
    privacy: 'Privacidad',
    terms: 'Términos',
    englishMarker: '(en inglés)',
    copyright: '© {year} {brand} · {domain}',
    credit: 'Da crédito a quien creó el contenido cuando lo reutilices. Herramienta independiente: PintDownload no está afiliado a Pinterest, Inc.',
  },
  matrix: {
    heading: 'Todas las herramientas y guías de PintDownload',
    devices: 'Celular, PC y navegador',
    formats: 'Formatos',
    batch: 'Tableros, perfiles y pines',
    guides: 'Guías',
  },
  howTo: {
    exampleLabel: 'Enlace de ejemplo',
    stepPrefix: 'Paso {n}: ',
  },
  faq: {
    title: 'Preguntas frecuentes',
  },
  related: {
    title: 'Más herramientas para Pinterest',
    intro: 'Cada herramienta acepta un tipo de enlace. Elige la que coincide con el tuyo y llegarás al descargador correcto a la primera.',
  },
  compare: {
    title: 'Pin, tablero o perfil: ¿qué herramienta uso?',
    intro: 'Usa la herramienta que corresponde a tu enlace. Pegar un tipo de enlace equivocado es la causa más común de que una descarga falle.',
    feature: 'Qué comparas',
    pin: 'Pin',
    board: 'Tablero ZIP',
    profile: 'Perfil ZIP',
    rows: {
      url: { feature: 'Ejemplo de enlace', pin: 'pinterest.com/pin/123…', board: 'pinterest.com/usuario/tablero/', profile: 'pinterest.com/usuario/' },
      what: { feature: 'Qué obtienes', pin: '1 archivo o todo el carrusel', board: 'Varios pines en un ZIP', profile: 'Pines visibles en un ZIP' },
      best: { feature: 'Ideal para', pin: 'Guardar una idea o un video', board: 'Moodboards y colecciones', profile: 'Respaldo de una cuenta' },
      carousel: { feature: 'Fotos del carrusel', pin: 'Sí, todas', board: 'La portada de cada pin*', profile: 'La portada de cada pin*' },
      private: { feature: 'Contenido privado o secreto', pin: 'No compatible', board: 'No compatible', profile: 'No compatible' },
    },
    footnoteBefore: '* Para tener todas las fotos del carrusel de un pin que está en un tablero o perfil, abre ese pin con el',
    footnoteLink: 'descargador de pines',
    footnoteAfter: '.',
  },
  bookmarklet: {
    title: 'Marcador de un clic',
    body: 'Descarga videos, fotos y tableros de Pinterest mientras navegas en la computadora. Haz clic en el marcador sobre cualquier pin y PintDownload se abre con ese enlace listo.',
    button: 'Arrástralo a la barra de favoritos',
    dragAlert: 'Arrastra este botón a la barra de favoritos (o de marcadores) de tu navegador para agregarlo.',
    dragTitle: 'Arrástrame a la barra de favoritos',
    notPinterest: 'Primero abre una página de Pinterest.',
    chromeTitle: 'Chrome / Edge',
    chromeBodyHtml: 'Presiona `Ctrl+Shift+B` (Cmd+Shift+B en Mac) para mostrar la barra de favoritos (o de marcadores) y arrastra el botón hasta ella.',
    safariTitle: 'Safari',
    safariBody: 'Arrástralo a Favoritos. En iPhone o iPad, guarda cualquier página como marcador, edita su dirección y pega el código del bookmarklet.',
    useTitle: 'Úsalo',
    useBodyHtml: 'En un pin o un tablero, haz clic en tu marcador **PintDownload**. Se abre con el enlace ya pegado.',
    imageAlt:
      'Cómo guardar PintDownload en Chrome: abre el menú, ve a Favoritos (Marcadores en Chrome de España), elige agregar esta pestaña y guárdala en la barra de favoritos',
  },
  ad: {
    label: 'Publicidad',
  },
  notFound: {
    title: 'Página no encontrada — {brand}',
    description: 'Esta página no existe en {domain}. Vuelve al inicio o prueba un descargador de Pinterest.',
    h1: 'Este pin no está en el tablero.',
    lede: 'Puede que el enlace sea viejo, tenga un error o ya no exista. Prueba el descargador, lee una guía o elige una herramienta abajo.',
    ticketLabel: 'Pase · enlace público',
    stamp: 'Página no encontrada',
    home: 'Ir al inicio',
    blog: 'Leer el blog',
    contact: 'Contacto',
    toolsAria: 'Descargadores de Pinterest',
    bug: '¿Crees que es un error?',
    videoBlurb: 'Guarda pines de video públicos',
    pinBlurb: 'Imágenes, GIF y carruseles',
    boardBlurb: 'Tableros públicos en un ZIP',
    guideBlurb: 'Pasos en el celular y en la PC',
    guideBadge: 'Guía',
  },
};
