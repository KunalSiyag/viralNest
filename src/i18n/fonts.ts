/**
 * Headline font files per locale (docs/i18n/architecture.md §12).
 *
 * Body text is system-ui everywhere. Only the display voice (headlines, labels,
 * serials, stamps, the stub) uses web fonts, all self-hosted in public/fonts/
 * and built by scripts/fonts/build_script_fonts.py. The @font-face rules and
 * the `--font-display` switch per `:lang()` live in src/styles/ticket.css; this
 * module only says which files a page should preload so the first paint of the
 * H1 does not swap.
 *
 * Budgets (headline font bytes per page, plan §6): latin locales 28.6 KB,
 * tr 54, vi 38, ru 25–51, th 43, ar 59. `build_script_fonts.py --check`
 * verifies them.
 */
import { LOCALE_META, type AnyLocale, type Script } from './locales';

export interface FontAssets {
  /** Absolute paths for `<link rel="preload" as="font" type="font/woff2" crossorigin>`, in order. */
  preload: string[];
}

const F = '/fonts/';
const BIG_SHOULDERS_900 = `${F}big-shoulders-display-latin-900-normal.woff2`;
const BIG_SHOULDERS_800 = `${F}big-shoulders-display-latin-800-normal.woff2`;

/**
 * Preloads per script. English and the Latin locales keep today's two files.
 * tr and vi add the 900 file that carries their extra letters (the 800 file
 * still loads through unicode-range when a label needs it). ru sets the whole
 * headline in Sofia Sans Extra Condensed; Big Shoulders only prints the brand
 * mark there, so it is not preloaded. th and ar keep Big Shoulders first in the
 * stack for Latin words and digits and add their script face.
 */
const PRELOADS: Record<Script, string[]> = {
  latin: [BIG_SHOULDERS_900, BIG_SHOULDERS_800],
  'latin-ext': [BIG_SHOULDERS_900, `${F}big-shoulders-display-latin-ext-900-normal.woff2`, BIG_SHOULDERS_800],
  vietnamese: [BIG_SHOULDERS_900, `${F}big-shoulders-display-vietnamese-900-normal.woff2`, BIG_SHOULDERS_800],
  cyrillic: [
    `${F}sofia-sans-extra-condensed-cyrillic-900-normal.woff2`,
    `${F}sofia-sans-extra-condensed-latin-900-normal.woff2`,
  ],
  // The 800 file draws the ticket serial's space and dashes ('เลขที่ ——————'):
  // preloaded like the Latin locales, or the serial shifts when it swaps in.
  thai: [`${F}noto-sans-thai-cond-900.woff2`, BIG_SHOULDERS_900, BIG_SHOULDERS_800],
  arabic: [`${F}noto-sans-arabic-cond-900.woff2`, BIG_SHOULDERS_900, BIG_SHOULDERS_800],
};

export function fontAssetsFor(locale: AnyLocale): FontAssets {
  const script = LOCALE_META[locale]?.script ?? 'latin';
  return { preload: [...PRELOADS[script]] };
}
