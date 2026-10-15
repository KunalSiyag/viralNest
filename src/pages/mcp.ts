import type { APIRoute } from 'astro';
import { handleMcpRequest } from '../lib/mcp/http';

/** Remote MCP server (Streamable HTTP). Docs: /pinterest-mcp-server */
export const prerender = false;

export const ALL: APIRoute = ({ request, locals }) =>
  handleMcpRequest(request, ((locals as any).runtime?.env ?? {}) as Record<string, unknown>);
