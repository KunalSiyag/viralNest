import type { APIRoute } from 'astro';
import { BLOCKED_USER_AGENTS, extractPinterest } from '../../lib/extract';

export const prerender = false;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. DMCA / Bot User-Agent Protection
    const ua = (request.headers.get('user-agent') || '').toLowerCase();
    if (BLOCKED_USER_AGENTS.some((bot) => ua.includes(bot))) {
      return jsonResponse({ error: 'Access denied.' }, 403);
    }

    // 2. Origin & Referer Verification (Protects against external API scraping)
    const referer = request.headers.get('referer') || '';
    const origin = request.headers.get('origin') || '';

    const isAllowedOrigin =
      !origin ||
      origin.includes('pintdownload.app') ||
      origin.includes('vercel.app') ||
      origin.includes('workers.dev') ||
      origin.includes('pages.dev') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      referer.includes('pintdownload.app') ||
      referer.includes('vercel.app') ||
      referer.includes('workers.dev') ||
      referer.includes('pages.dev') ||
      referer.includes('localhost');

    if (!isAllowedOrigin) {
      return jsonResponse({ error: 'Direct API scraping is unauthorized.' }, 403);
    }

    // 3. Extraction (src/lib/extract; shared with the MCP server)
    const body = await request.json().catch(() => ({}));
    const { url, intent } = body;
    const outcome = await extractPinterest({ url, intent });
    return outcome.ok
      ? jsonResponse(outcome.body)
      : jsonResponse({ error: outcome.error }, outcome.status);
  } catch (error: any) {
    console.error('Unhandled Pinterest Extraction error:', error);
    return jsonResponse(
      {
        error: 'Failed to process Pinterest link. Please ensure the link is a valid public Pin.',
      },
      400,
    );
  }
};
