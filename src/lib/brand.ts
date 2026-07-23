/** Site brand constants — pintdownload.app */

export const BRAND = {
  name: 'PintDownload',
  shortName: 'Pint',
  domain: 'pintdownload.app',
  url: 'https://pintdownload.app',
  tagline: 'Pinterest downloads, perfected',
  description:
    'Free Pinterest pin, video, board, and profile downloader. Save public MP4s, images, GIFs, and ZIP packs — no account required.',
  email: {
    support: 'support@pintdownload.app',
    dmca: 'dmca@pintdownload.app',
  },
  accent: '#E11D48',
  accentHover: '#BE123C',
  logo: '/images/logo.svg',
  logoPng: '/images/logo.png',
  ogImage: '/images/og-default.png',
} as const;

export const SITE_URL = BRAND.url;
