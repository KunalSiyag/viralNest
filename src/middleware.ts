import { defineMiddleware } from 'astro:middleware';

const APEX_HOST = 'pintdownload.app';

/**
 * Host + protocol + slash consolidation for requests that hit the Worker
 * (API + any run_worker_first paths). Static HTML slash policy is owned by
 * wrangler `assets.html_handling = drop-trailing-slash`.
 */
export const onRequest = defineMiddleware((context, next) => {
  // Never rewrite during static prerender or on preview/dev hosts.
  if (context.isPrerendered) return next();

  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (host !== APEX_HOST && host !== `www.${APEX_HOST}`) return next();

  let changed = false;

  if (url.protocol === 'http:') {
    url.protocol = 'https:';
    changed = true;
  }

  if (host === `www.${APEX_HOST}`) {
    url.hostname = APEX_HOST;
    changed = true;
  }

  if (changed) {
    return context.redirect(url.toString(), 301);
  }

  return next();
});
