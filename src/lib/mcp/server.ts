/**
 * PintDownload MCP server identity, instructions and the per-request server
 * factory. Tool schemas are converted once per isolate (module scope); each
 * request gets a fresh McpServer, as the stateless transport requires.
 */
import { McpServer, fromJsonSchema } from '@modelcontextprotocol/server';
import { TOOLS, type ToolContext } from './tools';
import type { ToolCallResult } from './format';
import { INSTRUCTIONS, SERVER_INFO } from './info';

export { INSTRUCTIONS, SERVER_INFO };

const CACHE_HINTS = {
  'tools/list': { ttlMs: 3_600_000, cacheScope: 'public' as const },
  'server/discover': { ttlMs: 3_600_000, cacheScope: 'public' as const },
};

/** Standard Schema wrappers, built once per isolate. */
const COMPILED = TOOLS.map((tool) => ({
  tool,
  input: fromJsonSchema(tool.inputSchema as any),
  output: fromJsonSchema(tool.outputSchema as any),
}));

export interface ServerContext extends ToolContext {
  era: 'legacy' | 'modern';
}

/** One log line per tool call: no IPs, no URLs, no Pinterest text. */
function logToolCall(tool: string, era: string, started: number, result: ToolCallResult) {
  let code: string | null = null;
  if (result.isError) {
    try {
      code = JSON.parse(result.content[0]?.text ?? '{}')?.error?.code ?? null;
    } catch {
      code = null;
    }
  }
  const s = result.structuredContent as Record<string, unknown> | undefined;
  const items = Array.isArray(s?.items) ? s.items.length : Array.isArray(s?.pins) ? s.pins.length : s ? 1 : 0;
  console.log(
    JSON.stringify({ evt: 'mcp_tool', tool, era, ok: !result.isError, code, ms: Date.now() - started, items }),
  );
}

export function createPintdownloadServer(ctx: ServerContext): McpServer {
  // listChanged: false — the tool list never changes and this stateless server
  // cannot send notifications/tools/list_changed (the SDK defaults it to true).
  const server = new McpServer(SERVER_INFO, {
    instructions: INSTRUCTIONS,
    cacheHints: CACHE_HINTS,
    capabilities: { tools: { listChanged: false } },
  });
  for (const { tool, input, output } of COMPILED) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: input,
        outputSchema: output,
        annotations: tool.annotations,
      },
      (async (args: unknown) => {
        const started = Date.now();
        const result = await tool.run(args, ctx);
        logToolCall(tool.name, ctx.era, started, result);
        return result;
      }) as any,
    );
  }
  return server;
}
