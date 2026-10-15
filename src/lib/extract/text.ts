/** Text helpers for Pinterest extraction (moved verbatim from src/pages/api/extract.ts). */

// Helper to generate 5 harmonious colors from a dominant hex color
export function generatePalette(baseHex?: string | null): string[] {
  let hex = (baseHex || '#C8281A').replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(hex)) hex = 'E11D48';

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const toHex = (num: number) =>
    Math.min(255, Math.max(0, Math.round(num))).toString(16).padStart(2, '0');

  const c1 = `#${hex.toUpperCase()}`;
  const c2 =
    `#${toHex(r + (255 - r) * 0.45)}${toHex(g + (255 - g) * 0.45)}${toHex(b + (255 - b) * 0.45)}`.toUpperCase();
  const c3 = `#${toHex(r * 0.55)}${toHex(g * 0.55)}${toHex(b * 0.55)}`.toUpperCase();
  const c4 =
    `#${toHex(255 - r * 0.75)}${toHex(255 - g * 0.75)}${toHex(255 - b * 0.75)}`.toUpperCase();
  const c5 = `#${toHex((r + 240) / 2)}${toHex((g + 240) / 2)}${toHex((b + 240) / 2)}`.toUpperCase();

  return [c1, c2, c3, c4, c5];
}

export function extractTagsFromText(text?: string | null): string[] {
  if (!text) return [];
  const found: string[] = [];

  const hashtagMatches = text.match(/#([a-zA-Z0-9_]+)/g);
  if (hashtagMatches) {
    hashtagMatches.forEach((tag) => found.push(tag.replace('#', '').toLowerCase()));
  }

  const words = text
    .replace(/[^\w\s]/gi, ' ')
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 3 &&
        ![
          'http',
          'https',
          'www',
          'pinterest',
          'com',
          'this',
          'that',
          'with',
          'from',
          'your',
          'have',
          'more',
          'about',
        ].includes(w.toLowerCase()),
    );

  words.forEach((w) => found.push(w.toLowerCase()));
  return Array.from(new Set(found)).slice(0, 10);
}

export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => {
      try {
        return String.fromCodePoint(Number(n));
      } catch {
        return _;
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => {
      try {
        return String.fromCodePoint(parseInt(h, 16));
      } catch {
        return _;
      }
    });
}

export function metaContent(html: string, prop: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      'i',
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
      'i',
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeHtmlEntities(m[1]);
  }
  return null;
}
