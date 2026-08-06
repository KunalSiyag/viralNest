/** Shared JSON-LD builders + sitemap route registry for intent-specific tool pages */

import { absoluteUrl } from './urls';

export function softwareAppSchema(opts: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
}) {
  // Do NOT include fake aggregateRating — Google may ignore or penalize fabricated reviews.
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    operatingSystem: 'Web, iOS, Android, Windows, macOS',
    applicationCategory: opts.applicationCategory || 'MultimediaApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

export function howToSchema(opts: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

export function webPageSchema(opts: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'PintDownload',
      url: absoluteUrl('/'),
    },
  };
}

export const TOOL_LINKS = [
  {
    href: '/pinterest-pin-downloader',
    title: 'Pin Downloader',
    blurb: 'One pin URL → HD image, video, GIF, or full carousel.',
    badge: 'Pin',
  },
  {
    href: '/pinterest-video-downloader',
    title: 'Video Downloader',
    blurb: 'Save public Pinterest videos as MP4 (HD streams).',
    badge: 'MP4',
  },
  {
    href: '/pinterest-image-downloader',
    title: 'Image Downloader',
    blurb: 'Original-resolution photos and artwork from pin links.',
    badge: 'HD',
  },
  {
    href: '/pinterest-board-downloader',
    title: 'Board Downloader',
    blurb: 'Paste a board URL and download public pins as a ZIP.',
    badge: 'ZIP',
  },
  {
    href: '/pinterest-profile-downloader',
    title: 'Profile Downloader',
    blurb: 'Pack visible public pins from a profile into a ZIP.',
    badge: 'ZIP',
  },
  {
    href: '/pinterest-gif-downloader',
    title: 'GIF Downloader',
    blurb: 'Download animated GIF pins without quality loss.',
    badge: 'GIF',
  },
  {
    href: '/download-pinterest-videos-iphone-android',
    title: 'iPhone & Android Gallery Saver',
    blurb: 'Save Pinterest videos directly to your phone camera roll.',
    badge: 'Mobile',
  },
  {
    href: '/pinterest-carousel-downloader',
    title: 'Carousel Downloader',
    blurb: 'Download all photos and slides from multi-image pins.',
    badge: 'Slides',
  },
  {
    href: '/pinterest-video-downloader-chrome',
    title: 'Chrome Extension Tool',
    blurb: '1-click browser download tool for Chrome, Safari, and Edge.',
    badge: 'Chrome',
  },
  {
    href: '/how-to-download-pinterest-video-in-gallery',
    title: 'Gallery Video Saver',
    blurb: 'Step-by-step guide to saving Pinterest videos in phone gallery.',
    badge: 'Gallery',
  },
  {
    href: '/how-to-download-pinterest-video-on-laptop',
    title: 'Laptop & PC Downloader',
    blurb: 'Download 1080p HD Pinterest videos on Mac, Windows, & PC.',
    badge: 'PC',
  },
  {
    href: '/pinterest-profile-picture-downloader',
    title: 'Profile Picture Downloader',
    blurb: 'Extract full HD profile pictures & avatar icons.',
    badge: 'PFP',
  },
] as const;

/** Static marketing / tool routes included in the XML sitemap (priority 0–1). */
export type SitemapRoute = {
  path: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
};

/**
 * Money + support pages only. Legal pages stay crawlable but low priority.
 * Do not list /rss.xml, /api/*, embed, or 404/500 here.
 */
export const SITEMAP_ROUTES: SitemapRoute[] = [
  { path: '/', changefreq: 'daily', priority: 1.0 },
  // Core money tools (highest priority)
  { path: '/pinterest-video-downloader', changefreq: 'weekly', priority: 0.98 },
  { path: '/pinterest-profile-picture-downloader', changefreq: 'weekly', priority: 0.97 },
  { path: '/pinterest-pin-downloader', changefreq: 'weekly', priority: 0.96 },
  { path: '/pinterest-board-downloader', changefreq: 'weekly', priority: 0.96 },
  { path: '/pinterest-image-downloader', changefreq: 'weekly', priority: 0.95 },
  { path: '/pinterest-profile-downloader', changefreq: 'weekly', priority: 0.94 },
  { path: '/pinterest-gif-downloader', changefreq: 'weekly', priority: 0.9 },
  { path: '/pinterest-to-mp4', changefreq: 'weekly', priority: 0.9 },
  { path: '/pinterest-carousel-downloader', changefreq: 'weekly', priority: 0.9 },
  { path: '/download-pinterest-videos-iphone-android', changefreq: 'weekly', priority: 0.9 },
  { path: '/pinterest-video-downloader-chrome', changefreq: 'weekly', priority: 0.88 },
  { path: '/how-to-download-pinterest-video-in-gallery', changefreq: 'weekly', priority: 0.88 },
  { path: '/how-to-download-pinterest-video-on-laptop', changefreq: 'weekly', priority: 0.88 },
  { path: '/pinterest-4k-downloader', changefreq: 'weekly', priority: 0.85 },
  { path: '/pinterest-story-downloader', changefreq: 'weekly', priority: 0.85 },
  { path: '/pinterest-audio-downloader', changefreq: 'weekly', priority: 0.82 },
  { path: '/pinterest-seo-title-generator', changefreq: 'weekly', priority: 0.75 },
  { path: '/how-to-download-pinterest-videos', changefreq: 'monthly', priority: 0.8 },
  { path: '/blog', changefreq: 'weekly', priority: 0.85 },
  { path: '/about', changefreq: 'monthly', priority: 0.4 },
  { path: '/contact', changefreq: 'monthly', priority: 0.4 },
  { path: '/privacy-policy', changefreq: 'yearly', priority: 0.2 },
  { path: '/terms-of-service', changefreq: 'yearly', priority: 0.2 },
];
