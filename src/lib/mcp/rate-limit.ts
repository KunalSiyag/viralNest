/**
 * Workers Rate Limiting bindings for /mcp (wrangler.jsonc `ratelimits`).
 * A missing binding (astro dev, a plan without the feature) means "allowed".
 */

export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export const RETRY_AFTER_SECONDS = 60;

/**
 * Rate-limit key for the caller: CF-Connecting-IP, IPv6 cut to its /48.
 * Home ISPs hand out a /56 and hosting providers a /48, so a /64 key would let
 * one customer rotate through 256–65,536 fresh limits.
 */
export function clientKey(request: Request): string {
  const ip = (request.headers.get('cf-connecting-ip') || '').trim();
  if (!ip) return 'unknown';
  if (!ip.includes(':')) return ip;
  const [head] = ip.split('%');
  const halves = head.split('::');
  const left = halves[0] ? halves[0].split(':') : [];
  const right = halves.length > 1 && halves[1] ? halves[1].split(':') : [];
  const fill = halves.length > 1 ? Array(Math.max(0, 8 - left.length - right.length)).fill('0') : [];
  const groups = [...left, ...fill, ...right].slice(0, 3).map((g) => (g || '0').toLowerCase().replace(/^0+(?=.)/, ''));
  while (groups.length < 3) groups.push('0');
  return `${groups.join(':')}::/48`;
}

const warned = new Set<string>();

function isBinding(value: unknown): value is RateLimitBinding {
  return Boolean(value && typeof (value as RateLimitBinding).limit === 'function');
}

/** True when the request may proceed. Missing bindings and limiter errors allow it. */
export async function allow(binding: unknown, name: string, key: string): Promise<boolean> {
  if (!isBinding(binding)) {
    if (!warned.has(name)) {
      warned.add(name);
      console.warn(JSON.stringify({ evt: 'mcp_rate_limit_missing', binding: name }));
    }
    return true;
  }
  try {
    const { success } = await binding.limit({ key });
    return success;
  } catch (e) {
    console.warn(JSON.stringify({ evt: 'mcp_rate_limit_error', binding: name, message: String(e) }));
    return true;
  }
}
