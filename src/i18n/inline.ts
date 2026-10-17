/**
 * Inline mini-markup for localized content (architecture.md §6.2).
 *
 *   **bold**                 → <strong>
 *   `code`                   → <code dir="ltr" translate="no"> (URLs, pin.it, MP4 …)
 *   [[pageId|anchor]]        → in-locale link; throws when the page is not live there
 *   [[en:/path|anchor]]      → English-only page, hreflang="en" (the anchor text stays in the page language)
 *   [[en!:/path|anchor]]     → same, for an anchor left in English ("Profile Downloader"): adds lang="en"
 *                              so screen readers switch voice
 *   [text](https://…)        → external link, allowlisted hosts only, rel="noopener"
 *
 * Everything else is HTML-escaped first, so content can never inject markup.
 * Plain TypeScript (no Astro imports): tests and i18n:check use it too.
 */
import type { AnyLocale } from './locales';
import { isPageId, linkPathFor, rawPathFor, type PageId } from './routes';

export const EXTERNAL_HOSTS = ['pinterest.com', 'www.pinterest.com', 'help.pinterest.com'] as const;

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escaped display heading. Uppercased headings follow `<html lang>` casing, so
 * in Turkish "Pinterest" would print as "PİNTEREST": brand names go in
 * `<span lang="en">` there, with Turkish suffixes left outside
 * ("<span lang=\"en\">Pinterest</span>'ten"; research tr.json typography).
 */
const BRAND_NAMES = /\b(PintDownload|Pinterest|iPhone|iPad|Android|Chrome|Safari|Windows|Mac|Xiaomi|Samsung|Google|TikTok|Instagram|WhatsApp)\b/g;
export function headingHtml(s: string, locale: AnyLocale): string {
  const html = escapeHtml(s);
  return locale === 'tr' ? html.replace(BRAND_NAMES, '<span lang="en">$1</span>') : html;
}

type Token =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'bold'; inner: string }
  | { kind: 'page'; pageId: string; text: string }
  | { kind: 'en'; path: string; text: string; englishText?: boolean }
  | { kind: 'ext'; url: string; text: string };

const TOKEN_RE =
  /`([^`]+)`|\*\*(.+?)\*\*|\[\[([^\]|]+)\|([^\]]+)\]\]|\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g;

/** Leftover markup after tokenizing means a typo (unclosed ** or [[ …). */
const STRAY = /\*\*|\[\[|\]\]|`|\]\(/;

export class InlineMarkupError extends Error {}

export function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const m of src.matchAll(TOKEN_RE)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ kind: 'text', text: src.slice(last, at) });
    if (m[1] !== undefined) out.push({ kind: 'code', text: m[1] });
    else if (m[2] !== undefined) out.push({ kind: 'bold', inner: m[2] });
    else if (m[3] !== undefined) {
      const target = m[3].trim();
      if (target.startsWith('en:')) out.push({ kind: 'en', path: target.slice(3), text: m[4] });
      else if (target.startsWith('en!:')) out.push({ kind: 'en', path: target.slice(4), text: m[4], englishText: true });
      else out.push({ kind: 'page', pageId: target, text: m[4] });
    } else out.push({ kind: 'ext', url: m[6], text: m[5] });
    last = at + m[0].length;
  }
  if (last < src.length) out.push({ kind: 'text', text: src.slice(last) });
  for (const t of out) {
    if (t.kind === 'text' && STRAY.test(t.text)) {
      throw new InlineMarkupError(`unbalanced inline markup in: ${JSON.stringify(src)}`);
    }
  }
  return out;
}

export interface InlineLink {
  kind: 'page' | 'en' | 'ext';
  target: string;
}

/** Every link in a string (for checks), without rendering. */
export function inlineLinks(src: string): InlineLink[] {
  const links: InlineLink[] = [];
  const visit = (s: string) => {
    for (const t of tokenize(s)) {
      if (t.kind === 'page') links.push({ kind: 'page', target: t.pageId });
      else if (t.kind === 'en') links.push({ kind: 'en', target: t.path });
      else if (t.kind === 'ext') links.push({ kind: 'ext', target: t.url });
      else if (t.kind === 'bold') visit(t.inner);
    }
  };
  visit(src);
  return links;
}

export function isAllowedExternal(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && (EXTERNAL_HOSTS as readonly string[]).includes(u.hostname);
  } catch {
    return false;
  }
}

export interface RenderOptions {
  /**
   * 'live' (default): [[pageId|…]] must be routed in this build (preview builds:
   * exist behind an open gate), else throw.
   * 'any': resolve through SLUGS regardless of release state (i18n:check previews).
   */
  links?: 'live' | 'any';
}

/** Render mini-markup to safe HTML for `set:html`. */
export function renderInline(src: string, locale: AnyLocale, opts: RenderOptions = {}): string {
  const resolve = (pageId: PageId) =>
    opts.links === 'any' ? rawPathFor(pageId, locale) : linkPathFor(pageId, locale);
  const render = (s: string, inBold: boolean): string => {
    const tokens = tokenize(s);
    return tokens
      .map((t, i) => {
        switch (t.kind) {
          case 'text':
            return escapeHtml(t.text);
          case 'code': {
            // A suffix glued to the chip (de "`/pin/`-Links", or a comma)
            // would read as a separate word after the chip's padding.
            const next = tokens[i + 1];
            const glued = next?.kind === 'text' && /^[-‑,.;:!?)]/.test(next.text);
            return `<code dir="ltr" translate="no"${glued ? ' class="code-glued"' : ''}>${escapeHtml(t.text)}</code>`;
          }
          case 'bold':
            if (inBold) throw new InlineMarkupError(`nested **bold** in: ${JSON.stringify(src)}`);
            return `<strong>${render(t.inner, true)}</strong>`;
          case 'page': {
            if (!isPageId(t.pageId)) throw new InlineMarkupError(`unknown pageId "${t.pageId}" in: ${JSON.stringify(src)}`);
            const href = resolve(t.pageId);
            if (!href) {
              throw new InlineMarkupError(
                `[[${t.pageId}|…]] is not live in "${locale}" (link in: ${JSON.stringify(src)})`,
              );
            }
            return `<a href="${escapeHtml(href)}">${escapeHtml(t.text)}</a>`;
          }
          case 'en': {
            if (!/^\/[a-z0-9\-/]*$/.test(t.path) || /\/$/.test(t.path) && t.path !== '/') {
              throw new InlineMarkupError(`bad English path "${t.path}" in: ${JSON.stringify(src)}`);
            }
            return `<a href="${escapeHtml(t.path)}" hreflang="en"${t.englishText ? ' lang="en"' : ''}>${escapeHtml(t.text)}</a>`;
          }
          case 'ext': {
            if (!isAllowedExternal(t.url)) {
              throw new InlineMarkupError(`external link not allowlisted (${EXTERNAL_HOSTS.join(', ')}): ${t.url}`);
            }
            return `<a href="${escapeHtml(t.url)}" rel="noopener" target="_blank">${escapeHtml(t.text)}</a>`;
          }
        }
      })
      .join('');
  };
  return render(src, false);
}

/** Plain text of mini-markup (JSON-LD, alt text, meta). */
export function inlineToText(src: string): string {
  return tokenize(src)
    .map((t) => {
      switch (t.kind) {
        case 'text':
        case 'code':
          return t.text;
        case 'bold':
          return inlineToText(t.inner);
        default:
          return t.text;
      }
    })
    .join('');
}
