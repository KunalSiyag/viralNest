import type { SSRManifest } from 'astro';
import { App } from 'astro/app';
import { handle } from '@astrojs/cloudflare/handler';
import { hostRedirectUrl } from './lib/host-redirect';

/**
 * Runs before Astro's asset short-circuit so www/http/slash 301s apply to
 * prerendered HTML. Pair with wrangler `assets.run_worker_first`.
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
              'Strict-Transport-Security': 'max-age=2592000',
            },
          });
        }
        return handle(manifest, app, request, env, context);
      },
    },
  };
}
