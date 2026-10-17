/**
 * Message helpers for the islands: `{token}` interpolation, Intl.PluralRules
 * plurals, numbers with Western digits, and the English-default merge.
 * Plain TypeScript, no React, so node tests import it directly.
 */
import type { DeepPartial, PluralForms } from './types';

type Vars = Record<string, string | number>;

const TOKEN = /\{(\w+)\}/g;

/** Replace `{name}` tokens. Unknown tokens stay as written so a missing value is visible. */
export function fmt(msg: string, vars: Vars = {}): string {
  return msg.replace(TOKEN, (whole, key: string) => (key in vars ? String(vars[key]) : whole));
}

/**
 * Split a message at its tokens, keeping the values as they are (strings or
 * React nodes), so `{file}` can be printed bold without HTML in the catalog.
 * Empty text segments are dropped.
 */
export function fmtParts<T>(msg: string, vars: Record<string, T>): (string | T)[] {
  const parts: (string | T)[] = [];
  let last = 0;
  for (const m of msg.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (!(m[1] in vars)) continue;
    if (at > last) parts.push(msg.slice(last, at));
    parts.push(vars[m[1]]);
    last = at + m[0].length;
  }
  if (last < msg.length) parts.push(msg.slice(last));
  return parts;
}

const pluralRules = new Map<string, Intl.PluralRules>();

/**
 * Languages whose CLDR `one` covers 0 but whose readers expect the plural for
 * zero (pt: "0 pins", not "0 pin").
 */
const ZERO_IS_PLURAL = new Set(['pt']);

/** Intl.PluralRules category for `n` in `lang` ('en' when lang is unknown). */
export function pluralCategory(n: number, lang?: string): Intl.LDMLPluralRule {
  const key = lang || 'en';
  if (n === 0 && ZERO_IS_PLURAL.has(key.split('-')[0].toLowerCase())) return 'other';
  let rules = pluralRules.get(key);
  if (!rules) {
    try {
      rules = new Intl.PluralRules(key);
    } catch {
      rules = new Intl.PluralRules('en');
    }
    pluralRules.set(key, rules);
  }
  return rules.select(n);
}

/** Pick the plural form for `n` (falls back to `other`), then fill its tokens. */
export function plural(forms: PluralForms, n: number, vars: Vars = {}, lang?: string): string {
  const msg = forms[pluralCategory(n, lang)] ?? forms.other;
  return fmt(msg, vars);
}

/** Same as plural(), split at tokens like fmtParts(). */
export function pluralParts<T>(forms: PluralForms, n: number, vars: Record<string, T>, lang?: string): (string | T)[] {
  return fmtParts(forms[pluralCategory(n, lang)] ?? forms.other, vars);
}

/**
 * Number formatter for UI counts. `lang` undefined = the browser's default
 * locale (what the English islands always did). Localized pages pass the
 * catalog's `lang`; digits stay Western (0–9) everywhere, Arabic included.
 */
export function numberFormatter(lang?: string, options: Intl.NumberFormatOptions = {}): (n: number) => string {
  let f: Intl.NumberFormat;
  try {
    f = lang ? new Intl.NumberFormat(regionalNumberLocale(lang), { numberingSystem: 'latn', ...options }) : new Intl.NumberFormat(undefined, options);
  } catch {
    f = new Intl.NumberFormat(undefined, options);
  }
  return (n: number) => f.format(n);
}

/**
 * Catalogs written for a whole language region where the decimal mark differs
 * by country (es: Mexico and US Spanish write 3.3, Spain and Argentina 3,3).
 * For these the visitor's own browser locale picks the number format when it
 * is the same language (research es.json formats.decimal); plurals stay on
 * the catalog's lang.
 */
const REGIONAL_NUMBERS = new Set(['es']);

/** Locale for Intl.NumberFormat: the browser's when it refines a bare regional catalog lang. */
export function regionalNumberLocale(lang: string, browser?: string): string {
  if (!REGIONAL_NUMBERS.has(lang)) return lang;
  const nav = browser ?? (typeof navigator !== 'undefined' ? navigator.language : '');
  if (!nav || nav.split('-')[0].toLowerCase() !== lang) return lang;
  try {
    return Intl.NumberFormat.supportedLocalesOf([nav]).length ? nav : lang;
  } catch {
    return lang;
  }
}

/** Separator between list items in running text (Arabic script uses the Arabic comma). */
export function listSeparator(lang?: string): string {
  return /^(ar|fa|ur)\b/i.test(lang || '') ? '، ' : ', ';
}

/**
 * Between a notice and its link ("{message}. {open}"). Thai ends no sentence
 * with a full stop (research th formats.punctuation), so it gets a middle dot.
 */
export function noticeSeparator(lang?: string): string {
  return /^th\b/i.test(lang || '') ? ' · ' : '. ';
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

/**
 * English defaults with a partial catalog laid over them. A key missing from
 * `over` falls back to English (the tests make sure locale catalogs miss none).
 */
export function deepMerge<T>(base: T, over?: DeepPartial<T> | null): T {
  if (!over) return base;
  if (!isPlainObject(base) || !isPlainObject(over)) return (over as T) ?? base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
    if (v === undefined) continue;
    const b = out[k];
    out[k] = isPlainObject(b) && isPlainObject(v) ? deepMerge(b, v as DeepPartial<typeof b>) : v;
  }
  return out as T;
}
