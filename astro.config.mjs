// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://viralnest.com',
  output: 'static',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [tailwind(), react()],
  redirects: {
    // Preserve old blog URLs → new SEO posts
    '/blog/why-pinterest-downloader-is-not-working':
      '/blog/troubleshooting-pinterest-downloads',
    '/blog/how-to-download-pinterest-content-on-phone-android-iphone':
      '/blog/using-viralnest-on-phone-android-ios',
    '/blog/how-to-save-and-organize-pinterest-ideas':
      '/blog/tips-to-organize-downloaded-pinterest-videos',
    '/blog/why-pinterest-does-not-always-let-you-download-videos-directly':
      '/blog/pinterest-downloader-what-it-is-how-it-works',
    '/blog/how-to-use-pinterest-to-find-video-ideas-for-reels-tiktok-shorts':
      '/blog/study-smarter-with-pinterest-videos',
    '/blog/how-to-find-original-source-of-pinterest-image':
      '/blog/understanding-file-formats-mp4-webm-gif-jpg-png',
  },
});

