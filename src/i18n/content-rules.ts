/**
 * Content QA rules beyond the zod schema: honesty (PRODUCT.md), glossary,
 * plan-matrix agreement, uniqueness, links, catalog parity. Shared by
 * `npm run i18n:check` (scripts/i18n-check.mjs) and tests/seo-invariants.
 * Seeded from docs/i18n/tools/build_plan.py (validation.rules in the plan).
 *
 * Every finding is { level, file, path, message }. 'error' blocks; 'warn' is
 * for the native reviewer.
 */
import { LOCALES, LOCALE_META, isLocale, type Locale } from './locales';
import { GATE_OPEN, PAGES, PAGE_IDS, SLUGS, isGateOpen, isPageId, type PageId } from './routes';
import { PageContent, cpLen, type PageContentData } from './schema';
import { InlineMarkupError, inlineLinks, isAllowedExternal, renderInline } from './inline';

export type Level = 'error' | 'warn';
export interface Finding {
  level: Level;
  file: string;
  path?: string;
  message: string;
}

/** Plan matrix row (docs/i18n/i18n-plan.json → matrix[]). */
export interface MatrixRow {
  locale: string;
  pageId: string;
  title: string;
  description: string;
  h1: string;
  primaryKeyword: string;
  slug: string;
  status: string;
}

/** Fields shown in search results or as the page's promise. */
const HEADLINE_PATHS = /^(meta\.(title|description)|hero\.(h1|lede)|nav\.)/;

/** "Original size/resolution/quality" claims: images are the 1200px public copy. */
const ORIGINAL_CLAIM: Record<Locale | 'en', RegExp> = {
  en: /original (size|resolution|quality)|full[- ]resolution|uncompressed/i,
  es: /(tamaño|resolución|calidad) original|sin compresión/i,
  pt: /(tamanho|resolução|qualidade) original|sem compressão/i,
  fr: /(taille|résolution|qualité) (d[’']origine|originale)|non compressé/i,
  de: /Original(größe|auflösung|qualität)|unkomprimiert/i,
  it: /(risoluzione|dimensione|qualità) original[ei]|non compress/i,
  nl: /originele (grootte|resolutie|kwaliteit)|ongecomprimeerd/i,
  id: /(ukuran|resolusi|kualitas) asli|tanpa kompresi/i,
  tr: /orijinal (boyut|çözünürlük|kalite)|sıkıştırılmamış/i,
  vi: /(kích thước|độ phân giải|chất lượng) gốc|không nén/i,
  ru: /(исходн|оригинальн)\S* (размер|разрешени|качеств)|без сжатия/i,
  th: /ขนาดเต็ม|ตามที่ผู้โพสต์อัปโหลด/,
  ar: /(الحجم|الدقة|الجودة) الأصلية?|بدون ضغط/,
};
/** Weaker signal: the word "original" anywhere (often fine: "the original GIF file"). */
const ORIGINAL_WORD = /\borigin(al|ale|ali|ele|eel)\b|d[’']origine|\basli\b|orijinal|\bgốc\b|исходн|оригинал|ต้นฉบับ|الأصلي/i;

/** Conditional wording that makes a 1080p mention honest ("1080p when the pin has it"). */
const CONDITIONAL_1080 = /720p|cuando|si el pin|quando|se o pin|lorsque|quand|si l[’']épingle|souvent|wenn|falls|meist|quando|se il|als de|wanneer|jika|kalau|biasanya|varsa|bazen|genellikle|nếu|khi|thường|если|обычно|ถ้า|ปกติ|إذا|عادة|حسب/i;

/** Glossary-banned variants (docs/i18n/research/<loc>.json glossary + plan validator). */
export const BANNED: Partial<Record<Locale, { rx: RegExp; why: string; headlineOnly?: boolean }[]>> = {
  de: [
    { rx: /Pinwände/, why: 'glossary: "Pinnwände" (double n)' },
    { rx: /\bSie\b|\bIhnen\b|\bIhr(e|en|er|em)?\b(?=\s+[A-ZÄÖÜ])/, why: 'register: du, never Sie', headlineOnly: false },
    { rx: /ẞ/, why: 'never type ẞ (missing from the headline font)' },
  ],
  pt: [
    // Unicode-aware boundary (\b treats "á" as a non-word character). A quoted
    // Portugal screen label (“álbum”) stays allowed, as plan §1 permits.
    { rx: /(?<![\p{L}“"«])álbum(?![\p{L}])/iu, why: 'glossary: Pinterest Brazil says "pasta", not "álbum"' },
    { rx: /\bdescarregar\b|\btransferir\b/i, why: 'glossary: Brazilian "baixar"' },
  ],
  es: [
    { rx: /vídeo/i, why: 'glossary: "video" without accent (what every market types)' },
    { rx: /downloadear/i, why: 'glossary: "descargar"' },
    { rx: /\busted\b|\bvosotros\b|\bvos\b/i, why: 'register: tú (no usted, vosotros or voseo)' },
  ],
  fr: [{ rx: /filigrane/i, why: 'glossary: "logo"/"marque" ("filigrane" reads as banknote watermark)' }],
  it: [{ rx: /[Ss]caricatore/, why: 'glossary: "downloader" / "scaricare"' }],
  nl: [{ rx: /\bpinnen\b/, why: 'glossary: plural "pins"' }],
  id: [
    { rx: /\bAnda\b/, why: 'register: kamu, never Anda' },
    { rx: /[Pp]engunduh/, why: 'glossary: "downloader"' },
  ],
  th: [
    { rx: /วีดีโอ/, why: 'glossary: วิดีโอ' },
    { rx: /แครูเซล|คารูเซล/, why: 'glossary: carousel term' },
  ],
  ar: [
    { rx: /بينترست|بينتريست|بنتريست|بينتيريست/, why: 'glossary: spell the brand بنترست' },
    { rx: /بوردات/, why: 'glossary: لوحات' },
    { rx: /[٠-٩]/, why: 'Western digits (0–9) in Arabic copy' },
  ],
  vi: [{ rx: /không liên kết với Pinterest/, why: 'glossary: affiliation line wording' }],
  ru: [{ rx: /VPN|впн|ВПН/, why: 'never mention VPNs' }],
};

/** The locale's board term must appear in the board page title or H1. */
export const BOARD_TERM: Record<Locale, string> = {
  es: 'tablero', pt: 'pasta', fr: 'tableau', de: 'pinnwand', it: 'bacheca', nl: 'bord',
  id: 'board', tr: 'pano', vi: 'bảng', ru: 'доск', th: 'บอร์ด', ar: 'لوح',
};

/** Invented counters and ratings (PRODUCT.md: no numbers about users, downloads or ratings). */
const VANITY =
  /\d[\d.,\s]*\s*(k|m|mil|millones|million|millions|mio\.?|juta|milyon|triệu|тыс\.?|млн|ล้าน|مليون|ألف)?\s*\+?\s*(users|usuarios|usuários|utilisateurs|nutzer|utenti|gebruikers|pengguna|kullanıcı|người dùng|пользовател|ผู้ใช้|مستخدم|downloads|descargas|downloads|téléchargements|unduhan|indirme|lượt tải|скачивани|ครั้ง|تنزيل)/i;
const RATING = /★|☆|\b[0-5][.,]\d\s*\/\s*5\b|\b(4|5) estrellas|\b(4|5) estrelas|\b(4|5) étoiles|\b(4|5) Sterne/i;

/** Values that may legitimately equal English in any catalog. */
export const SAME_AS_ENGLISH_OK = new Set([
  'MP4', 'MP3', 'GIF', 'ZIP', 'JPG', 'PNG', 'WAV', 'HD', 'PintDownload', 'Pinterest', 'pin.it', 'Pin', 'Chrome', 'Safari',
  'Chrome / Edge', 'iPhone', 'Android', 'Windows', 'Mac', '© {year} {brand} · {domain}', 'Home', 'Blog', 'OK', '', 'No. 404',
]);

/* ------------------------------------------------------------------ */

function walkStrings(v: unknown, path: string, out: { path: string; value: string }[]) {
  if (typeof v === 'string') out.push({ path, value: v });
  else if (Array.isArray(v)) v.forEach((x, i) => walkStrings(x, `${path}[${i}]`, out));
  else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      if (k === 'review' || k === 'keywords') continue; // provenance / QA only, never rendered
      walkStrings(x, path ? `${path}.${k}` : k, out);
    }
  }
}

/** Fields that carry inline mini-markup (rendered with renderInline). */
const INLINE_PATH =
  /^(hero\.lede|intro\[\d+\]|features\[\d+\]\.p|sections\[\d+\]\.(paragraphs|list)\[\d+\]|steps\.intro|steps\.items\[\d+\]\.body|faq\.items\[\d+\]\.a|guides\.intro|credit\.body)$/;

export interface CheckInput {
  file: string;
  /** Raw parsed JSON. */
  data: unknown;
  /** Locale and pageId from the file path. */
  dirLocale: string;
  filePageId: string;
}

/** Schema + per-file rules. Returns the parsed page when the schema passes. */
export function checkPageFile(input: CheckInput, matrix: MatrixRow[], enPaths: Set<string>): { findings: Finding[]; page?: PageContentData } {
  const findings: Finding[] = [];
  const f = (level: Level, message: string, path?: string) => findings.push({ level, file: input.file, path, message });
  if (!isLocale(input.dirLocale)) {
    f('error', `folder "${input.dirLocale}" is not a locale (${LOCALES.join(' ')})`);
    return { findings };
  }
  const locale = input.dirLocale;
  if (!isPageId(input.filePageId)) {
    f('error', `file name "${input.filePageId}" is not a pageId`);
    return { findings };
  }
  const pageId = input.filePageId;
  const parsed = PageContent.safeParse(input.data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) f('error', issue.message, issue.path.join('.'));
    return { findings };
  }
  const page = parsed.data;
  if (page.locale !== locale || page.pageId !== pageId) {
    f('error', `declares ${page.locale}/${page.pageId} but lives at ${locale}/${pageId}.json`);
  }
  const entry = SLUGS[locale][pageId];
  if (!entry) f('error', `no route: ${pageId} is not in SLUGS.${locale} (src/i18n/routes.ts); file a slug request instead`);
  else if (!isGateOpen(entry.status)) f('warn', `route status ${entry.status} is closed (GATE_OPEN): content is not published`);

  // Plan matrix: title, description, H1 and primary keyword are fixed (plan §8 Phase 3).
  const row = matrix.find((r) => r.locale === locale && r.pageId === pageId);
  if (row) {
    const fixed: [string, string, string][] = [
      ['meta.title', page.meta.title, row.title],
      ['meta.description', page.meta.description, row.description],
      ['hero.h1', page.hero.h1, row.h1],
      ['keywords.primary', page.keywords.primary, row.primaryKeyword],
    ];
    // U+00A0 folds to a space, so writers may bind short words the locale's
    // typography keeps together (ru «с\u00A0Pinterest», fr «\u00A0:»).
    const norm = (v: string) => v.normalize('NFC').replace(/\u00A0/g, ' ');
    for (const [path, have, want] of fixed) {
      if (norm(have) !== norm(want)) {
        f('error', `differs from the plan matrix (fixed; changes go to docs/i18n/research/${locale}-slug-requests.md): want ${JSON.stringify(want)}`, path);
      }
    }
  }

  const strings: { path: string; value: string }[] = [];
  walkStrings(page, '', strings);
  const isFourK = pageId === 'pinterest-4k-downloader';
  /** The 4K explainer asks instead of promising (user decision 2). */
  const ASKS = /[?？؟]|ไหม|แค่ไหน|هل|var mı|được không/;
  for (const { path, value } of strings) {
    const headline = HEADLINE_PATHS.test(path);
    // Inline markup and links
    if (INLINE_PATH.test(path)) {
      try {
        renderInline(value, locale, { links: 'any' });
      } catch (e) {
        f('error', e instanceof InlineMarkupError ? e.message : String(e), path);
        continue;
      }
      for (const link of inlineLinks(value)) {
        if (link.kind === 'page') {
          const target = link.target as PageId;
          const t = SLUGS[locale][target];
          if (!t) f('error', `[[${target}|…]] does not exist in ${locale}`, path);
          else if (!isGateOpen(t.status)) f('error', `[[${target}|…]] is ${t.status} (gate closed) in ${locale}`, path);
          else if (target === pageId) f('warn', 'links to itself', path);
        } else if (link.kind === 'en') {
          if (!enPaths.has(link.target)) f('error', `[[en:${link.target}|…]] is not an English page`, path);
        } else if (!isAllowedExternal(link.target)) {
          f('error', `external link not allowlisted: ${link.target}`, path);
        }
      }
    }
    // Honesty: 4K
    if (/\b4K\b/i.test(value)) {
      if (!isFourK && headline) f('error', '4K in a headline field outside the honest 4K page', path);
      else if (!isFourK) f('warn', '4K mentioned: make sure the sentence says Pinterest rarely publishes it and we never upscale', path);
    }
    // Honesty: original size
    if (ORIGINAL_CLAIM[locale].test(value)) {
      f('error', '"original size/resolution/quality" claim: say "the largest size Pinterest publishes"', path);
    } else if (ORIGINAL_WORD.test(value)) {
      f('warn', '"original" wording: fine for "the original GIF file" or "the creator", never for size/quality', path);
    }
    // Honesty: unconditional 1080p / Full HD
    // A headline on the 4K explainer that asks ("Full HD ou 4K?") promises nothing.
    if (/1080p|Full ?HD/i.test(value) && !CONDITIONAL_1080.test(value) && !(isFourK && ASKS.test(value))) {
      f(headline ? 'error' : 'warn', 'unconditional 1080p/Full HD: say "usually 720p, 1080p when the pin has it"', path);
    }
    // Vanity numbers / ratings
    if (VANITY.test(value)) f('error', 'number of users/downloads: PintDownload prints no vanity counters', path);
    if (RATING.test(value)) f('error', 'rating/stars: no ratings anywhere', path);
    // Glossary
    for (const b of BANNED[locale] ?? []) {
      if (b.rx.test(value)) f(b.headlineOnly && !headline ? 'warn' : 'error', `banned variant /${b.rx.source}/ (${b.why})`, path);
    }
    // English ellipsis and arrows in display text are schema errors; plain "..." caught there too.
  }
  if (isFourK && !ASKS.test(page.hero.h1)) {
    f('error', '4K page H1 must ask, not promise', 'hero.h1');
  }
  if (pageId === 'pinterest-board-downloader' && !(page.meta.title + ' ' + page.hero.h1).toLocaleLowerCase(LOCALE_META[locale].htmlLang).includes(BOARD_TERM[locale])) {
    f('error', `board page title/H1 lacks the glossary term "${BOARD_TERM[locale]}"`, 'meta.title');
  }
  const steps = page.steps.items.length;
  if (page.faq.items.length < 4) f('error', 'at least 4 FAQ items');
  if (steps < 3) f('error', 'at least 3 steps');
  // Length sanity mirrors seo_health_check (already enforced by the schema).
  if (cpLen(page.meta.title) > 62) f('error', 'title > 62 code points', 'meta.title');
  return { findings, page };
}

/** Cross-file rules for one locale: uniqueness, completeness. */
export function checkLocale(locale: Locale, pages: Map<PageId, { file: string; page: PageContentData }>, strict: boolean): Finding[] {
  const findings: Finding[] = [];
  const unique = (label: string, get: (p: PageContentData) => string) => {
    const seen = new Map<string, string>();
    for (const [, { file, page }] of pages) {
      const v = get(page).normalize('NFC').toLocaleLowerCase();
      const other = seen.get(v);
      if (other) findings.push({ level: 'error', file, message: `duplicate ${label} (also in ${other})` });
      else seen.set(v, file);
    }
  };
  unique('title', (p) => p.meta.title);
  unique('description', (p) => p.meta.description);
  unique('H1', (p) => p.hero.h1);
  unique('primary keyword', (p) => p.keywords.primary);
  unique('nav.label', (p) => p.nav.label);
  // Identical sentences across pages of a locale are a doorway signal.
  const sentences = new Map<string, string>();
  for (const [, { file, page }] of pages) {
    const all: { path: string; value: string }[] = [];
    walkStrings({ intro: page.intro, sections: page.sections, faq: page.faq.items.map((i) => i.a) }, '', all);
    for (const { value } of all) {
      for (const s of value.split(/(?<=[.!?。])\s+/)) {
        if (cpLen(s) < 60) continue;
        const key = s.normalize('NFC');
        const other = sentences.get(key);
        if (other && other !== file) findings.push({ level: 'warn', file, message: `sentence repeated from ${other}: ${s.slice(0, 80)}…` });
        else sentences.set(key, file);
      }
    }
  }
  // Completeness: every routed page needs content (errors for released locales or --strict).
  for (const pageId of PAGE_IDS) {
    const entry = SLUGS[locale][pageId];
    if (!entry || !isGateOpen(entry.status) || pages.has(pageId)) continue;
    findings.push({
      level: LOCALE_META[locale].live || strict ? 'error' : 'warn',
      file: `src/content/i18n/${locale}/${pageId}.json`,
      message: `missing content for ${entry.slug ? `/${locale}/${entry.slug}` : `/${locale}`} (status ${entry.status})`,
    });
  }
  return findings;
}

/* ---------------- catalogs (ui/<loc>.ts, island/<loc>.ts) ---------------- */

const PLURAL_KEYS = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);
const isPluralMap = (v: unknown): v is Record<string, string> =>
  !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0 &&
  Object.keys(v).every((k) => PLURAL_KEYS.has(k)) && 'other' in (v as object);
const tokens = (s: string) => new Set(Array.from(s.matchAll(/\{(\w+)\}/g), (m) => m[1]));

/** Same key tree and {tokens} as English; plural maps complete for the locale. */
export function checkCatalog(file: string, locale: Locale, en: unknown, loc: unknown): Finding[] {
  const findings: Finding[] = [];
  const f = (level: Level, message: string, path: string) => findings.push({ level, file, path, message });
  const categories = new Intl.PluralRules(LOCALE_META[locale].htmlLang).resolvedOptions().pluralCategories as string[];
  const walk = (a: unknown, b: unknown, path: string) => {
    if (isPluralMap(a)) {
      if (!isPluralMap(b)) return f('error', 'expected a plural map ({ one, other, … })', path);
      for (const c of categories) if (!(c in b)) f('error', `plural category "${c}" missing for ${locale}`, path);
      const want = tokens(a.other);
      for (const [k, v] of Object.entries(b)) {
        const have = tokens(v);
        for (const t of want) if (!have.has(t) && !(t === 'n' && k !== 'other')) f('error', `{${t}} missing in ${k}`, path);
        for (const t of have) if (!want.has(t)) f('error', `unknown token {${t}} in ${k}`, path);
      }
      return;
    }
    if (typeof a === 'string') {
      if (typeof b !== 'string') return f('error', 'expected a string', path);
      const want = tokens(a);
      const have = tokens(b);
      for (const t of want) if (!have.has(t)) f('error', `token {${t}} missing`, path);
      for (const t of have) if (!want.has(t)) f('error', `unknown token {${t}}`, path);
      if (b !== b.normalize('NFC')) f('error', 'not NFC-normalized', path);
      if (b === a && !SAME_AS_ENGLISH_OK.has(a) && a.length > 3) f('warn', 'same as English', path);
      return;
    }
    if (Array.isArray(a)) {
      if (!Array.isArray(b)) return f('error', 'expected an array', path);
      if (a.length !== b.length) f('warn', `array length ${b.length} (English ${a.length})`, path);
      a.forEach((x, i) => walk(x, b[i], `${path}[${i}]`));
      return;
    }
    if (a && typeof a === 'object') {
      if (!b || typeof b !== 'object') return f('error', 'expected an object', path);
      for (const k of Object.keys(a)) {
        if (!(k in (b as object))) f('error', 'missing key', path ? `${path}.${k}` : k);
        else walk((a as any)[k], (b as any)[k], path ? `${path}.${k}` : k);
      }
      for (const k of Object.keys(b)) if (!(k in (a as object))) f('error', 'extra key (not in English)', path ? `${path}.${k}` : k);
    }
  };
  walk(en, loc, '');
  return findings;
}

/** English paths content may link to with [[en:/path|…]]. */
export function englishPaths(blogSlugs: string[]): Set<string> {
  const paths = new Set<string>(Object.values(PAGES).map((p) => p.en));
  for (const p of ['/blog', '/about', '/contact', '/privacy-policy', '/terms-of-service', '/pinterest-mcp-server']) paths.add(p);
  for (const s of blogSlugs) paths.add(`/blog/${s}`);
  return paths;
}

export { GATE_OPEN };
