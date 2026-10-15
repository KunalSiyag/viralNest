import type { SSRManifest } from 'astro';
import { App } from 'astro/app';
import { handle } from '@astrojs/cloudflare/handler';
import { hostRedirectUrl, redirectStatusFor } from './lib/host-redirect';

/**
 * Runs before Astro's asset short-circuit so www/http/slash 301s apply to
 * prerendered HTML. Pair with wrangler `assets.run_worker_first` (must include
 * `/api/*` — an array run_worker_first does not fall back to the Worker for
 * unmatched POST routes, which otherwise 405 against 404-page asset serving)
 * and `/mcp` for the same reason.
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
          // /mcp gets 308 (keeps POST + body for MCP clients); see redirectStatusFor.
          const status = redirectStatusFor(new URL(request.url).pathname);
          return new Response(null, {
            status,
            headers: {
              Location: location,
              'Cache-Control':
                status === 308 ? 'no-store' : 'public, max-age=31536000, immutable',
              'Strict-Transport-Security': 'max-age=2592000',
            },
          });
        }
        // Remote MCP server. Served here, not through Astro: Astro's checkOrigin
        // answers 403 to DELETE and to non-JSON POSTs before the MCP SDK can
        // answer 405/415, and /mcp applies its own Origin policy. The Astro
        // route src/pages/mcp.ts serves the same handler under `astro dev`.
        if (new URL(request.url).pathname === '/mcp') {
          const { handleMcpRequest } = await import('./lib/mcp/http');
          return handleMcpRequest(request, env);
        }
        return handle(manifest, app, request, env, context);
      },
    },
  };
}
