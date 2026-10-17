/**
 * Blog presentation helpers: heading anchors for the outline, dates for the
 * serial line, and the tool a post sends readers back to.
 */
import { STOCKS, INK_STOCK, type StockKey } from '../../lib/stocks';

/* ---------- Tools ---------- */

export interface BlogTool {
  href: string;
  title: string;
  blurb: string;
  badge: string;
}

/**
 * Same entries (href, title, blurb, badge) as ALL_TOOLS in
 * src/components/seo/RelatedTools.astro. Keep the two in sync.
 */
export const BLOG_TOOLS: BlogTool[] = [
  { href: '/pinterest-pin-downloader', title: 'Pin Downloader', blurb: 'One pin URL → HD image, video, GIF, or full carousel.', badge: 'Pin' },
  { href: '/pinterest-video-downloader', title: 'Video Downloader', blurb: 'Save public Pinterest videos as MP4 (HD streams).', badge: 'MP4' },
  { href: '/pinterest-image-downloader', title: 'Image Downloader', blurb: 'Photos and artwork in the largest size Pinterest publishes.', badge: 'HD' },
  { href: '/pinterest-board-downloader', title: 'Board Downloader', blurb: 'Paste a board URL and download public pins as a ZIP.', badge: 'ZIP' },
  { href: '/pinterest-profile-downloader', title: 'Profile Downloader', blurb: 'Pack visible public pins from a profile into a ZIP.', badge: 'ZIP' },
  { href: '/pinterest-gif-downloader', title: 'GIF Downloader', blurb: 'Download animated GIF pins without quality loss.', badge: 'GIF' },
  { href: '/download-pinterest-videos-iphone-android', title: 'iPhone & Android Gallery Saver', blurb: 'Save Pinterest videos directly to your phone camera roll.', badge: 'Mobile' },
  { href: '/pinterest-carousel-downloader', title: 'Carousel Downloader', blurb: 'Download all photos and slides from multi-image pins.', badge: 'Slides' },
  { href: '/pinterest-video-downloader-chrome', title: 'Chrome Extension Tool', blurb: '1-click browser download tool for Chrome, Safari, and Edge.', badge: 'Chrome' },
  { href: '/how-to-download-pinterest-video-in-gallery', title: 'Gallery Video Saver', blurb: 'Step-by-step guide to saving Pinterest videos in phone gallery.', badge: 'Gallery' },
  { href: '/how-to-download-pinterest-video-on-laptop', title: 'Laptop & PC Downloader', blurb: 'Download Pinterest videos as MP4 on Mac, Windows, & PC.', badge: 'PC' },
  { href: '/pinterest-profile-picture-downloader', title: 'Profile Picture Downloader', blurb: 'Save the largest profile photo Pinterest publishes.', badge: 'PFP' },
  { href: '/pinterest-to-mp4', title: 'Pinterest to MP4', blurb: 'Convert a Pinterest video link to a downloadable MP4.', badge: 'MP4' },
  { href: '/pinterest-audio-downloader', title: 'Audio / MP3 Extractor', blurb: 'An MP3 of a video pin\'s sound, made in your browser.', badge: 'MP3' },
];

/** URL-type stock per tool path (same mapping as RelatedTools). Others print on ink. */
const STOCK_BY_HREF: Record<string, StockKey> = {
  '/pinterest-pin-downloader': 'pin',
  '/pinterest-video-downloader': 'video',
  '/pinterest-to-mp4': 'video',
  '/pinterest-image-downloader': 'image',
  '/pinterest-carousel-downloader': 'image',
  '/pinterest-gif-downloader': 'gif',
  '/pinterest-board-downloader': 'board',
  '/pinterest-profile-downloader': 'profile',
  '/pinterest-profile-picture-downloader': 'avatar',
};

export function stockKeyFor(href: string): StockKey | undefined {
  return STOCK_BY_HREF[href];
}

export function stockFor(href: string): { color: string; onColor: string } {
  const key = STOCK_BY_HREF[href];
  return key ? STOCKS[key] : INK_STOCK;
}

/**
 * The tool a post is really about: the tool page its own copy links to most
 * (ties go to the earliest link). Falls back to the pin downloader.
 */
export function pickPostTool(html: string): BlogTool {
  const known = new Map(BLOG_TOOLS.map((t) => [t.href, t]));
  const counts = new Map<string, { n: number; first: number }>();
  let i = 0;
  for (const m of html.matchAll(/href="([^"#?]+)"/g)) {
    const href = m[1];
    if (known.has(href)) {
      const c = counts.get(href);
      if (c) c.n += 1;
      else counts.set(href, { n: 1, first: i });
    }
    i += 1;
  }
  const best = [...counts.entries()].sort((a, b) => b[1].n - a[1].n || a[1].first - b[1].first)[0];
  return known.get(best?.[0] ?? '/pinterest-pin-downloader')!;
}

/* ---------- Headings ---------- */

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

function decodeEntities(s: string): string {
  return s.replace(/&[a-z#0-9]+;/gi, (e) => ENTITIES[e.toLowerCase()] ?? ' ');
}

function slugify(text: string): string {
  return decodeEntities(text)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
    .replace(/-+$/g, '');
}

export interface OutlineItem {
  id: string;
  /** Heading inner text with tags stripped; entities left encoded (render with set:html). */
  html: string;
}

/**
 * Give every <h2> in an article an id so the outline can link to it.
 * Heading text and order are untouched; existing ids are kept.
 */
export function anchorHeadings(html: string): { html: string; outline: OutlineItem[] } {
  const used = new Set<string>();
  const outline: OutlineItem[] = [];
  const out = html.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (whole, attrs = '', inner: string) => {
    const text = inner.replace(/<[^>]+>/g, '').trim();
    if (!text) return whole;
    const existing = /\sid="([^"]+)"/i.exec(attrs);
    let id = existing?.[1] ?? (slugify(text) || 'section');
    if (!existing) {
      const base = id;
      let n = 2;
      while (used.has(id)) id = `${base}-${n++}`;
    }
    used.add(id);
    outline.push({ id, html: text });
    return existing ? whole : `<h2 id="${id}"${attrs}>${inner}</h2>`;
  });
  return { html: out, outline };
}

/* ---------- Dates ---------- */

const DATE_FMT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

/** 2026-08-18 → "Aug 18, 2026" (UTC, so the build machine's zone never shifts the day). */
export function formatPostDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : DATE_FMT.format(d);
}

/** Category → in-page anchor used by the blog index (and article breadcrumbs). */
export function categoryAnchor(category: string): string {
  return `cat-${category.replace(/\s+/g, '-').toLowerCase()}`;
}
