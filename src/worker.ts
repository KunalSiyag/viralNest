import type { SSRManifest } from 'astro';
import { App } from 'astro/app';
import { handle } from '@astrojs/cloudflare/handler';
import { hostRedirectUrl } from './lib/host-redirect';

/**
 * Runs before Astro's asset short-circuit so www/http/slash 301s apply to
 * prerendered HTML. Pair with wrangler `assets.run_worker_first` (must include
 * `/api/*` — an array run_worker_first does not fall back to the Worker for
 * unmatched POST routes, which otherwise 405 against 404-page asset serving).
 */
export function createExports(manifest: SSRManifest) {
  const app = new App(manifest);
  return {
    default: {
      async fetch(
        request: Request,
        env: Record<string, unknown>,
        context: { waitUntil: (p: Promise<unknown>) => void },
      ) {
        const location = hostRedirectUrl(request.url);
        if (location) {
          return new Response(null, {
            status: 301,
            headers: {
              Location: location,
              'Cache-Control': 'public, max-age=31536000, immutable',
              'Strict-Transport-Security': 'max-age=2592000',
            },
          });
        }
        return handle(manifest, app, request, env, context);
      },
    },
  };
}
