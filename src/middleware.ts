import { defineMiddleware } from 'astro:middleware';
import { hostRedirectUrl } from './lib/host-redirect';

/**
 * Backup host/protocol/slash 301s for SSR/API routes that go through Astro.
 * Prerendered HTML is redirected in `src/worker.ts` (this middleware never
 * runs for static assets — the adapter serves them before `app.render`).
 */
export const onRequest = defineMiddleware((context, next) => {
  // Skip build-time prerender so `/about/` file output is not 301'd away.
  if (context.isPrerendered) return next();
  const location = hostRedirectUrl(context.request.url);
  if (location) {
    return context.redirect(location, 301);
  }
  return next();
});
