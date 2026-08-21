// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://pintdownload.app',
  // Canonical form: no trailing slash (except homepage).
  trailingSlash: 'never',
  // Static by default; API routes set `export const prerender = false`.
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile',
    workerEntryPoint: {
      path: 'src/worker.ts',
    },
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [tailwind(), react()],
  // React 19 SSR defaults to server.browser which uses MessageChannel (missing on Workers).
  // Always use the edge build so Cloudflare Worker startup succeeds.
  vite: {
    resolve: {
      alias: {
        'react-dom/server': 'react-dom/server.edge',
      },
    },
  },
  redirects: {
    // Ranking vanity aliases for the profile-picture cluster
    '/pinterest-pfp-downloader': '/pinterest-profile-picture-downloader',
    '/pinterest-dp-downloader': '/pinterest-profile-picture-downloader',
    '/pinterest-profile-pic-downloader': '/pinterest-profile-picture-downloader',
    '/pinterest-avatar-downloader': '/pinterest-profile-picture-downloader',
    '/pinterest-profile-photo-downloader': '/pinterest-profile-picture-downloader',
    // Legacy blog URLs
    '/blog/why-pinterest-downloader-is-not-working':
      '/blog/troubleshooting-pinterest-downloads',
    '/blog/how-to-download-pinterest-content-on-phone-android-iphone':
      '/blog/using-pintdownload-on-phone-android-ios',
    '/blog/using-viralnest-on-phone-android-ios':
      '/blog/using-pintdownload-on-phone-android-ios',
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
