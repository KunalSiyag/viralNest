// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import { existsSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LOCALES, LOCALE_META } from './src/i18n/locales.ts';
import { PAGE_IDS, alternatesFor, isLocaleLive, pathFor } from './src/i18n/routes.ts';

// `astro dev` (npm run dev) is the only command that renders in Node.
const isDevServer = process.argv.slice(2).includes('dev');

/**
 * Content index for the route map: `<locale>/<pageId>` keys that have a content
 * JSON. Only preview builds (PD_I18N_PREVIEW=es,pt|all) use it, to route an
 * unreleased locale page by page while its writer works; released locales
 * (LOCALE_META.live) route every live page and fail the build on missing
 * content. Read once per process: restart `astro dev` after adding a file.
 */
const I18N_CONTENT = fileURLToPath(new URL('./src/content/i18n/', import.meta.url));
process.env.PD_I18N_CONTENT_INDEX = existsSync(I18N_CONTENT)
  ? readdirSync(I18N_CONTENT, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .flatMap((d) =>
        readdirSync(new URL(`./src/content/i18n/${d.name}/`, import.meta.url))
          .filter((f) => f.endsWith('.json'))
          .map((f) => `${d.name}/${f.slice(0, -5)}`),
      )
      .join(',')
  : '';

/**
 * After the build:
 * 1. Rename dist/<locale>/404/index.html to dist/<locale>/404.html. Cloudflare's
 *    404-page mode serves the nearest 404.html up the tree, so /es/<missing>
 *    gets the Spanish 404 with status 404 (Astro only names /404 that way).
 * 2. Write dist/.i18n-routes.json: every routed page with its expected
 *    hreflang cluster, for scripts/verify_*.py (no Python re-implementation).
 */
/** @type {import('astro').AstroIntegration} */
const i18nBuild = {
  name: 'pintdownload-i18n',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      for (const loc of LOCALES) {
        const from = new URL(`${loc}/404/index.html`, dir);
        const to = new URL(`${loc}/404.html`, dir);
        if (existsSync(from)) {
          renameSync(from, to);
          rmSync(new URL(`${loc}/404/`, dir), { recursive: true, force: true });
          logger.info(`${loc}/404/index.html -> ${loc}/404.html`);
        }
      }
      /** @type {Record<string, { pageId: string; locale: string; alternates: { hreflang: string; href: string }[] }>} */
      const pages = {};
      /** @type {import('./src/i18n/locales.ts').AnyLocale[]} */
      const all = ['en', ...LOCALES];
      for (const pageId of PAGE_IDS) {
        const alternates = alternatesFor(pageId).map(({ hreflang, href }) => ({ hreflang, href }));
        for (const locale of all) {
          const path = pathFor(pageId, locale);
          if (path) pages[path] = { pageId, locale, alternates };
        }
      }
      const locales = Object.fromEntries(
        all.map((code) => [code, { ...LOCALE_META[code], routed: isLocaleLive(code) }]),
      );
      writeFileSync(
        new URL('.i18n-routes.json', dir),
        `${JSON.stringify({ site: 'https://pintdownload.app', locales, pages }, null, 2)}\n`,
      );
      // Keep the manifest out of the deployed assets (it is a build artefact for the checks).
      logger.info(`.i18n-routes.json: ${Object.keys(pages).length} routed pages`);
    },
  },
};

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
  integrations: [tailwind(), react(), i18nBuild],
  // React 19 SSR defaults to server.browser which uses MessageChannel (missing on Workers).
  // Use the edge build for the Worker bundle so Cloudflare Worker startup succeeds.
  // `astro dev` renders in Node, where the edge build fails ("require is not
  // defined"), so the alias applies to builds only.
  vite: {
    resolve: {
      alias: isDevServer
        ? {}
        : {
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
