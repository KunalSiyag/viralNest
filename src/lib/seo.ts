/** Shared JSON-LD builders for intent-specific tool pages */

export function softwareAppSchema(opts: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
}) {
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '18450',
      bestRating: '5',
      worstRating: '1',
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
      url: 'https://pintdownload.app/',
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
] as const;
