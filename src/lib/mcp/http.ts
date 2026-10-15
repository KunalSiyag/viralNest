/**
 * HTTP face of the PintDownload MCP server (POST /mcp). Checks run in this
 * order: method (OPTIONS) → User-Agent → Origin → browser GET → body size →
 * per-IP rate limit → unknown MCP-Protocol-Version header → SDK (protocol
 * versions, headers, JSON-RPC).
 * See docs/mcp-design.md section 2.3.
 */
import {
  PROTOCOL_VERSION_META_KEY,
  SUPPORTED_PROTOCOL_VERSIONS,
  createMcpHandler,
  originValidationResponse,
} from '@modelcontextprotocol/server';
import { BLOCKED_USER_AGENTS } from '../extract';
import { createPintdownloadServer } from './server';
import { MAX_UPSTREAM_CALLS_PER_REQUEST } from './tools';
import { RETRY_AFTER_SECONDS, allow, clientKey } from './rate-limit';

export const ALLOWED_ORIGIN_HOSTNAMES = ['pintdownload.app', 'localhost', '127.0.0.1'];
export const MAX_BODY_BYTES = 64 * 1024;
export const DOCS_PATH = '/pinterest-mcp-server';

const CORS_ALLOW_HEADERS =
  'Content-Type, Accept, MCP-Protocol-Version, Mcp-Method, Mcp-Name, Mcp-Session-Id, Last-Event-ID';

/** Our own HTTP-level JSON-RPC codes sit outside the spec's reserved -32768..-32000 range. */
export const ACCESS_DENIED_CODE = -31403;
export const RATE_LIMITED_CODE = -31429;
/** The spec's UnsupportedProtocolVersion code (2026-07-28). */
export const UNSUPPORTED_PROTOCOL_VERSION_CODE = -32022;

/**
 * Modern-era revisions the pinned SDK serves (its SUPPORTED_MODERN_PROTOCOL_VERSIONS
 * is internal). tests/mcp.entry.ts checks this against server/discover.
 */
export const MODERN_PROTOCOL_VERSIONS = ['2026-07-28'];
export const ALL_PROTOCOL_VERSIONS = [...MODERN_PROTOCOL_VERSIONS, ...SUPPORTED_PROTOCOL_VERSIONS];

/** True when any message in the (possibly batched) JSON-RPC body names a protocol version in _meta. */
function bodyClaimsVersion(text: string): boolean {
  try {
    const parsed = JSON.parse(text);
    const messages = Array.isArray(parsed) ? parsed : [parsed];
    return messages.some((m) => m?.params?._meta && PROTOCOL_VERSION_META_KEY in m.params._meta);
  } catch {
    return false;
  }
}

/**
 * 400 -32022 for an MCP-Protocol-Version header no supported era knows, when
 * the body names no version itself (then the SDK's header/body checks apply).
 * Without it the SDK compares versions as strings, so "banana" or 9999-12-31
 * count as modern and get a misleading "missing _meta" error.
 */
async function unsupportedVersionResponse(request: Request): Promise<Response | null> {
  const requested = request.headers.get('mcp-protocol-version');
  if (requested === null || ALL_PROTOCOL_VERSIONS.includes(requested.trim())) return null;
  const text = await request.clone().text();
  if (text.length > MAX_BODY_BYTES || bodyClaimsVersion(text)) return null;
  return jsonRpcError(400, UNSUPPORTED_PROTOCOL_VERSION_CODE, `Unsupported protocol version: ${requested.slice(0, 64)}`, {
    data: { supported: ALL_PROTOCOL_VERSIONS, requested: requested.slice(0, 64) },
  });
}

function allowedOrigin(origin: string | null): string | null {
  if (!origin) return null;
  try {
    const { hostname } = new URL(origin);
    return ALLOWED_ORIGIN_HOSTNAMES.includes(hostname.toLowerCase()) ? origin : null;
  } catch {
    return null;
  }
}

function jsonRpcError(status: number, code: number, message: string, extra: { data?: unknown; headers?: Record<string, string> } = {}) {
  const error = extra.data === undefined ? { code, message } : { code, message, data: extra.data };
  return new Response(JSON.stringify({ jsonrpc: '2.0', error, id: null }), {
    status,
    headers: { 'Content-Type': 'application/json', ...(extra.headers ?? {}) },
  });
}

/** no-store, noindex, Vary: Origin, and CORS for allowed browser origins. */
function finalize(response: Response, origin: string | null): Response {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Robots-Tag', 'noindex');
  headers.append('Vary', 'Origin');
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Expose-Headers', 'MCP-Protocol-Version, Retry-After');
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export async function handleMcpRequest(request: Request, env: Record<string, unknown> = {}): Promise<Response> {
  const method = request.method.toUpperCase();
  const origin = allowedOrigin(request.headers.get('origin'));

  // CORS preflight: only for allowed browser origins.
  if (method === 'OPTIONS') {
    if (!origin) return finalize(jsonRpcError(403, ACCESS_DENIED_CODE, 'Origin not allowed.'), null);
    return finalize(
      new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': CORS_ALLOW_HEADERS,
          'Access-Control-Max-Age': '86400',
        },
      }),
      origin,
    );
  }

  // Same DMCA / brand-protection bot list as /api/extract.
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  if (BLOCKED_USER_AGENTS.some((bot) => ua.includes(bot))) {
    return finalize(jsonRpcError(403, ACCESS_DENIED_CODE, 'Access denied.'), null);
  }

  // Requests without Origin (apps, CLIs, server-side connectors) pass; browser
  // origins other than pintdownload.app / localhost get 403.
  const rejected = originValidationResponse(request, ALLOWED_ORIGIN_HOSTNAMES);
  if (rejected) return finalize(rejected, null);

  // A person opening /mcp in a browser gets the docs page.
  if (method === 'GET') {
    const accept = (request.headers.get('accept') || '').toLowerCase();
    if (accept.includes('text/html') && !accept.includes('text/event-stream')) {
      return finalize(new Response(null, { status: 302, headers: { Location: DOCS_PATH } }), origin);
    }
  }

  if (method === 'POST') {
    const length = Number(request.headers.get('content-length') || '0');
    if (length > MAX_BODY_BYTES) {
      return finalize(jsonRpcError(413, -32600, 'Request body too large.'), origin);
    }
    const key = clientKey(request);
    if (!(await allow(env.MCP_REQUEST_LIMITER, 'MCP_REQUEST_LIMITER', `req:${key}`))) {
      return finalize(
        jsonRpcError(429, RATE_LIMITED_CODE, `Too many requests. Retry after ${RETRY_AFTER_SECONDS} seconds.`, {
          data: { retryAfterSeconds: RETRY_AFTER_SECONDS },
          headers: { 'Retry-After': String(RETRY_AFTER_SECONDS) },
        }),
        origin,
      );
    }
    const unsupported = await unsupportedVersionResponse(request);
    if (unsupported) return finalize(unsupported, origin);
  }

  const toolCtx = {
    origin: new URL(request.url).origin,
    env,
    clientKey: clientKey(request),
    upstreamBudget: { remaining: MAX_UPSTREAM_CALLS_PER_REQUEST },
  };
  const handler = createMcpHandler((ctx) => createPintdownloadServer({ ...toolCtx, era: ctx.era }), {
    maxRequestBodySize: MAX_BODY_BYTES,
    onerror: (error) => console.warn(JSON.stringify({ evt: 'mcp_error', message: error.message })),
  });
  return finalize(await handler.fetch(request), origin);
}
