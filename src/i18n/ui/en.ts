/**
 * Chrome strings (layout, shared components, 404) — the UiStrings contract.
 *
 * `EN_UI` holds today's English text verbatim: every component falls back to
 * it, so English HTML does not change. Writers copy this file to
 * src/i18n/ui/<locale>.ts, export `UI: UiStrings`, and translate the values
 * natively (same keys, same {tokens}). `npm run i18n:check` compares the key
 * trees and tokens.
 *
 * Values are plain text (escaped on output) unless the key says Html, in which
 * case only the inline mini-markup of src/i18n/inline.ts is allowed.
 * {tokens} are replaced at render time: never translate the token names.
 */

export interface UiStrings {
  /** Skip link, first focusable element. */
  skipToContent: string;
  /** aria-label of the logo link. */
  homeAria: string;
  /** alt of the logo image. */
  logoAlt: string;
  header: {
    /** aria-label of the desktop nav. */
    mainNavAria: string;
    /** aria-label of the mobile nav panel. */
    mobileNavAria: string;
    /** Desktop header slot for the how-to guide (localized pages). */
    guides: string;
    themeToggle: string;
    menuOpen: string;
    menuClose: string;
  };
  languageMenu: {
    /** Visible label (mobile panel) and accessible name of the menu button. */
    label: string;
    /** Button accessible name: "Language: {current}". */
    buttonAria: string;
    /** Shown after links that go to a locale home because this page has no version there. */
    homeFallbackHint: string;
  };
  footer: {
    /** Brand blurb under the logo (localized footers; English prints BRAND.tagline before it). */
    blurb: string;
    tools: string;
    learn: string;
    company: string;
    /** Learn column: link to the English blog. */
    blog: string;
    about: string;
    contact: string;
    privacy: string;
    terms: string;
    /** Marker after links to English-only pages, e.g. "(English)". Empty on English. */
    englishMarker: string;
    /** "© {year} {brand} · {domain}" */
    copyright: string;
    /** Credit-creators line + "not affiliated with Pinterest Inc." */
    credit: string;
  };
  /** Footer link matrix (FooterKeywordMatrix). */
  matrix: {
    /** sr-only heading. */
    heading: string;
    devices: string;
    formats: string;
    batch: string;
    guides: string;
  };
  howTo: {
    /** Fallback label before the example URL. */
    exampleLabel: string;
    /** sr-only prefix of each step title: "Step {n}: ". */
    stepPrefix: string;
  };
  faq: {
    /** Default FAQ heading. */
    title: string;
  };
  related: {
    title: string;
    intro: string;
  };
  compare: {
    title: string;
    intro: string;
    feature: string;
    pin: string;
    board: string;
    profile: string;
    rows: {
      url: { feature: string; pin: string; board: string; profile: string };
      what: { feature: string; pin: string; board: string; profile: string };
      best: { feature: string; pin: string; board: string; profile: string };
      carousel: { feature: string; pin: string; board: string; profile: string };
      private: { feature: string; pin: string; board: string; profile: string };
    };
    /** Text before the Pin page link in the footnote. */
    footnoteBefore: string;
    /** Link text of the footnote (the localized pin page). */
    footnoteLink: string;
    /** Text after the link. */
    footnoteAfter: string;
  };
  bookmarklet: {
    title: string;
    body: string;
    button: string;
    /** alert() when the button is clicked instead of dragged. */
    dragAlert: string;
    /** title attribute of the button. */
    dragTitle: string;
    /** alert() inside the bookmarklet when the tab is not on Pinterest. */
    notPinterest: string;
    chromeTitle: string;
    /** Html: may contain **bold** and `code` mini-markup. */
    chromeBodyHtml: string;
    safariTitle: string;
    safariBody: string;
    useTitle: string;
    /** Html: may contain **bold** mini-markup. */
    useBodyHtml: string;
    imageAlt: string;
  };
  ad: {
    label: string;
  };
  notFound: {
    /** <title> (noindex page; length rules do not apply). */
    title: string;
    description: string;
    h1: string;
    lede: string;
    ticketLabel: string;
    stamp: string;
    home: string;
    blog: string;
    contact: string;
    toolsAria: string;
    bug: string;
    /** Badges/blurbs of the four tool cards (labels come from the pages' nav.label). */
    videoBlurb: string;
    pinBlurb: string;
    boardBlurb: string;
    guideBlurb: string;
    guideBadge: string;
  };
}

export const EN_UI: UiStrings = {
  skipToContent: 'Skip to content',
  homeAria: 'PintDownload home',
  logoAlt: 'PintDownload logo',
  header: {
    mainNavAria: 'Main Navigation',
    mobileNavAria: 'Tools',
    guides: 'Guides',
    themeToggle: 'Toggle light and dark mode',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
  },
  languageMenu: {
    label: 'Language',
    buttonAria: 'Language: {current}',
    homeFallbackHint: 'home page',
  },
  footer: {
    blurb: 'Free public pin, video, board, and profile downloads — no account, no watermark from us.',
    tools: 'Tools',
    learn: 'Learn',
    company: 'Company',
    blog: 'Blog',
    about: 'About',
    contact: 'Contact',
    privacy: 'Privacy',
    terms: 'Terms',
    englishMarker: '',
    copyright: '© {year} {brand} · {domain}',
    credit: 'Credit original creators when you reuse clips. Independent tool — not affiliated with Pinterest Inc.',
  },
  matrix: {
    heading: 'All PintDownload tools and guides',
    devices: 'Device & Mobile Downloaders',
    formats: 'Format & Quality Downloaders',
    batch: 'Batch & Archive Downloaders',
    guides: 'Core Guides',
  },
  howTo: {
    exampleLabel: 'Example URL',
    stepPrefix: 'Step {n}: ',
  },
  faq: {
    title: 'Frequently asked questions',
  },
  related: {
    title: 'Related Pinterest download tools',
    intro: 'Each tool takes one kind of link. Pick the stock that matches yours and you land on the right downloader first time.',
  },
  compare: {
    title: 'Pin vs Board vs Profile — which tool?',
    intro: 'Use the tool that matches your link type. A wrong URL type is the most common reason a download fails.',
    feature: 'Feature',
    pin: 'Pin',
    board: 'Board ZIP',
    profile: 'Profile ZIP',
    rows: {
      url: { feature: 'URL example', pin: 'pinterest.com/pin/123…', board: 'pinterest.com/user/board/', profile: 'pinterest.com/user/' },
      what: { feature: 'What you get', pin: '1 file or full carousel', board: 'Many pins → ZIP', profile: 'Visible pins → ZIP' },
      best: { feature: 'Best for', pin: 'Saving one idea / video', board: 'Moodboards & collections', profile: 'Creator bulk backup' },
      carousel: { feature: 'Carousel slides', pin: 'Yes — every slide', board: 'Cover per pin*', profile: 'Cover per pin*' },
      private: { feature: 'Private / secret content', pin: 'Not supported', board: 'Not supported', profile: 'Not supported' },
    },
    footnoteBefore: '* For every carousel slide of a pin inside a board or profile pack, open that pin with the',
    footnoteLink: 'Pin Downloader',
    footnoteAfter: '.',
  },
  bookmarklet: {
    title: 'One-click bookmarklet',
    body: 'Save Pinterest videos, photos, and boards while you browse Pinterest on a computer. Click the bookmark on any pin and PintDownload opens with that link ready.',
    button: 'Drag to bookmarks bar',
    dragAlert: 'Drag this button to your browser Bookmarks Bar to install!',
    dragTitle: 'Drag me to your Bookmarks Bar',
    notPinterest: 'Please open a Pinterest page first!',
    chromeTitle: 'Chrome / Edge',
    chromeBodyHtml: 'Press `Ctrl+Shift+B` (Cmd+Shift+B on Mac) to show the bookmarks bar, then drag the button onto it.',
    safariTitle: 'Safari',
    safariBody: 'Drag to Favorites. On iPhone or iPad, bookmark any page, edit its URL, and paste the bookmarklet code.',
    useTitle: 'Use it',
    useBodyHtml: 'On a pin or board, click your **PintDownload** bookmark. We open with the link filled in.',
    imageAlt:
      'How to bookmark PintDownload in Chrome: open the menu, go to Bookmarks, choose Bookmark this tab, and save to the bookmarks bar',
  },
  ad: {
    label: 'Advertisement',
  },
  notFound: {
    title: 'Page not found — {brand}',
    description: 'This page does not exist on {domain}. Head home or try a Pinterest downloader tool.',
    h1: 'This pin isn’t on the board.',
    lede: 'The link may be old, mistyped, or removed. Try the downloader, browse guides, or jump to a tool below.',
    ticketLabel: 'Admit one · public link',
    stamp: 'Page not found',
    home: 'Go home',
    blog: 'Read the blog',
    contact: 'Contact',
    toolsAria: 'Pinterest downloader tools',
    bug: 'Think this is a bug?',
    videoBlurb: 'Save public video pins',
    pinBlurb: 'Images, GIFs, multi-slide',
    boardBlurb: 'Bulk public board packs',
    guideBlurb: 'Phone & desktop steps',
    guideBadge: 'Guide',
  },
};

/** Replace {token}s. Unknown tokens stay visible so tests catch them. */
export function fillUi(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
