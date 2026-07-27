/** Site brand constants — pintdownload.app */

export const BRAND = {
  name: 'PintDownload',
  shortName: 'Pint',
  domain: 'pintdownload.app',
  url: 'https://pintdownload.app',
  tagline: 'Free Pinterest video, photo, GIF, board & profile downloader',
  description:
    'Free Pinterest downloader online. Save public videos as MP4, photos, GIFs, full boards, and profiles — no account required.',
  /**
   * Public @pintdownload.app addresses (forward privately to your ops inbox).
   * Never put the personal Gmail on the public site.
   */
  email: {
    support: 'support@pintdownload.app',
    feedback: 'feedback@pintdownload.app',
    privacy: 'privacy@pintdownload.app',
    dmca: 'dmca@pintdownload.app',
  },
  accent: '#E11D48',
  accentHover: '#BE123C',
  logo: '/images/logo.svg',
  logoPng: '/images/logo.png',
  logoSvg: '/images/logo.svg',
  ogImage: '/images/og-cover.png',
} as const;

export const SITE_URL = BRAND.url;

/** Contact channels shown on /contact and legal pages */
export const CONTACT_CHANNELS = [
  {
    key: 'support' as const,
    title: 'Product support',
    blurb: 'Download issues, bugs, and “how do I…?” questions.',
    address: BRAND.email.support,
  },
  {
    key: 'feedback' as const,
    title: 'Feedback & ideas',
    blurb: 'Feature requests, UX notes, and product suggestions.',
    address: BRAND.email.feedback,
  },
  {
    key: 'privacy' as const,
    title: 'Privacy',
    blurb: 'Privacy Policy questions and data requests.',
    address: BRAND.email.privacy,
  },
  {
    key: 'dmca' as const,
    title: 'DMCA & copyright',
    blurb: 'Rights holders and formal takedown notices.',
    address: BRAND.email.dmca,
  },
] as const;
