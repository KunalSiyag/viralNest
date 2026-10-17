#!/usr/bin/env python3
"""
Build the per-script headline fonts in public/fonts/.

Body text stays system-ui. Only the display voice (Big Shoulders Display, the
ticket's printing gothic) needs web fonts, and Big Shoulders covers Latin,
Latin Extended and Vietnamese only. This script produces every headline face
the localized pages use (docs/i18n/architecture.md section 12):

  * Big Shoulders Display latin-ext and vietnamese, 800 and 900: copied from
    @fontsource/big-shoulders-display (the latin files are already in the repo).
  * Sofia Sans Extra Condensed 900, cyrillic + latin: copied from the
    @fontsource/sofia-sans-extra-condensed devDependency. One weight, declared
    for 800-900 in ticket.css, keeps /ru inside its budget.
  * Noto Sans Thai and Noto Sans Arabic: the Google Fonts variable TTFs (pinned
    commit, checked by SHA-256) instanced to a condensed width at weight 900 and
    subset to their script. One file each, declared for 800-900.
  * The OFL-1.1 licence of each family, in public/fonts/licenses/.

The outputs are committed. The site build never runs this script and never
downloads fonts.

Usage (fontTools and brotli are needed only here, not in the site build):

  python3 -m venv /tmp/fontvenv && /tmp/fontvenv/bin/pip install fonttools brotli
  /tmp/fontvenv/bin/python scripts/fonts/build_script_fonts.py           # build
  /tmp/fontvenv/bin/python scripts/fonts/build_script_fonts.py --check   # verify only

Options:
  --cache DIR   where the downloaded TTFs go (default: a temp dir, deleted after)
  --check       write nothing; verify that the committed files exist, cover the
                letters each locale needs, and fit the per-locale byte budgets
"""

from __future__ import annotations

import argparse
import hashlib
import io
import shutil
import sys
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'fonts'
LICENSES = OUT / 'licenses'
NODE = ROOT / 'node_modules' / '@fontsource'

# github.com/google/fonts, pinned so a rebuild is byte-for-byte reproducible.
GF_COMMIT = '8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5'
GF_RAW = f'https://raw.githubusercontent.com/google/fonts/{GF_COMMIT}/ofl'

DOWNLOADS = {
    'thai': (
        f'{GF_RAW}/notosansthai/NotoSansThai%5Bwdth,wght%5D.ttf',
        '5a1c559bb539583c8a1fd99d1c5b9491e5e14478c9cd2bd0970d5c3096cc9ef8',
    ),
    'arabic': (
        f'{GF_RAW}/notosansarabic/NotoSansArabic%5Bwdth,wght%5D.ttf',
        '63111b5b2e074dd48cc67692e0a2726d86ee94c1c37fe8598257b7b4e87e869e',
    ),
}

LICENSE_FILES = {
    'OFL-BigShouldersDisplay.txt': (
        f'{GF_RAW}/bigshouldersdisplay/OFL.txt',
        '338f9c050f19daeda1d597243faf79f3a3d437c338af58cb7047617d0ce08771',
    ),
    'OFL-SofiaSansExtraCondensed.txt': (
        f'{GF_RAW}/sofiasansextracondensed/OFL.txt',
        '3e824d5099202de2c98cbd8e5ecba54da7d220c1ad851330726e65f3e60842d1',
    ),
    'OFL-NotoSansThai.txt': (
        f'{GF_RAW}/notosansthai/OFL.txt',
        '2e98fd23a52d253db8612cd5942c8f2ff4111b21d2367050fdca91d8ccc374a0',
    ),
    'OFL-NotoSansArabic.txt': (
        f'{GF_RAW}/notosansarabic/OFL.txt',
        '07fc70bfeb985cc1a87a8587d0a0c80bab11c86c9dc3fd95b6f0cb332f983e96',
    ),
}

# (package, file in its files/ dir) -> name in public/fonts/
COPIES = [
    ('big-shoulders-display', 'big-shoulders-display-latin-ext-800-normal.woff2'),
    ('big-shoulders-display', 'big-shoulders-display-latin-ext-900-normal.woff2'),
    ('big-shoulders-display', 'big-shoulders-display-vietnamese-800-normal.woff2'),
    ('big-shoulders-display', 'big-shoulders-display-vietnamese-900-normal.woff2'),
    ('sofia-sans-extra-condensed', 'sofia-sans-extra-condensed-cyrillic-900-normal.woff2'),
    ('sofia-sans-extra-condensed', 'sofia-sans-extra-condensed-latin-900-normal.woff2'),
]


def ranges(spec: str) -> list[int]:
    """'U+0E01-0E5B,U+25CC' -> code points (the same syntax as CSS unicode-range)."""
    out: list[int] = []
    for part in spec.replace(' ', '').split(','):
        part = part.upper().removeprefix('U+')
        lo, _, hi = part.partition('-')
        out.extend(range(int(lo, 16), int(hi or lo, 16) + 1))
    return out


# Keep these equal to the unicode-range descriptors in src/styles/ticket.css.
THAI_RANGE = 'U+0E01-0E5B,U+200C-200D,U+25CC'
# Arabic: the letters, marks and punctuation of Modern Standard Arabic plus the
# few extended letters used for loanwords (peh, tcheh, veh, keheh, gaf, Farsi
# yeh). Arabic-Indic digits are left out on purpose (the ar pages print Western
# digits), as are the presentation-form blocks (13 KB instead of 38 KB); any
# such character falls back to the system Arabic face.
ARABIC_RANGE = ('U+0600-065F,U+066A-066D,U+0670-0671,U+067E,U+0686,U+06A4,U+06A9,'
                'U+06AF,U+06CC,U+200C-200F,U+2010-2011,U+204F,U+2E41')

# Width picked in visual QA next to Big Shoulders (the test page at /dev/fonts):
# 75 keeps Thai loops and Arabic counters open at the stub's 1.625rem.
GENERATED = [
    {
        'name': 'noto-sans-thai-cond-900.woff2',
        'source': 'thai',
        'axes': {'wdth': 75, 'wght': 900},
        'unicodes': THAI_RANGE,
    },
    {
        'name': 'noto-sans-arabic-cond-900.woff2',
        'source': 'arabic',
        'axes': {'wdth': 75, 'wght': 900},
        'unicodes': ARABIC_RANGE,
    },
]

LATIN = [
    'big-shoulders-display-latin-800-normal.woff2',
    'big-shoulders-display-latin-900-normal.woff2',
]

# Every headline font a page of that locale can download (both weights where
# the page uses both). Budgets in KB (1000 bytes) from i18n-plan.md section 6.
BUDGETS = {
    'latin': (LATIN, 28.6),
    'tr': (LATIN + [
        'big-shoulders-display-latin-ext-800-normal.woff2',
        'big-shoulders-display-latin-ext-900-normal.woff2',
    ], 54),
    'vi': (LATIN + [
        'big-shoulders-display-vietnamese-800-normal.woff2',
        'big-shoulders-display-vietnamese-900-normal.woff2',
    ], 38),
    # The brand mark in the header stays Big Shoulders 900 (lang="en").
    'ru': ([
        'sofia-sans-extra-condensed-cyrillic-900-normal.woff2',
        'sofia-sans-extra-condensed-latin-900-normal.woff2',
        'big-shoulders-display-latin-900-normal.woff2',
    ], 51),
    'th': (LATIN + ['noto-sans-thai-cond-900.woff2'], 43),
    'ar': (LATIN + ['noto-sans-arabic-cond-900.woff2'], 59),
}

# Letters each locale's headlines need, checked against the file that serves them.
VI_LETTERS = (
    'ĂÂĐÊÔƠƯăâđêôơư'
    'ÀÁẢÃẠẰẮẲẴẶẦẤẨẪẬÈÉẺẼẸỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌỒỐỔỖỘỜỚỞỠỢÙÚỦŨỤỪỨỬỮỰỲÝỶỸỴ'
    'àáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ'
)
COVERAGE = [
    # (file, letters that must be in it)
    ('big-shoulders-display-latin-900-normal.woff2', 'ÁÉÍÓÚÑÜÇÀÈÌÒÙÂÊÎÔÛÄËÏÖÃÕÆŒßÿıÇçÖöÜü«»—–…’“”'),
    ('big-shoulders-display-latin-ext-900-normal.woff2', 'ĞğİŞş'),
    ('big-shoulders-display-latin-ext-800-normal.woff2', 'ĞğİŞş'),
    ('big-shoulders-display-vietnamese-900-normal.woff2', ''.join(
        ch for ch in VI_LETTERS if ord(ch) > 0xFF)),
    ('big-shoulders-display-vietnamese-800-normal.woff2', ''.join(
        ch for ch in VI_LETTERS if ord(ch) > 0xFF)),
    ('sofia-sans-extra-condensed-cyrillic-900-normal.woff2',
     'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя№'),
    ('sofia-sans-extra-condensed-latin-900-normal.woff2', 'PINTERESTGIFMP40123456789«»—–…'),
    ('noto-sans-thai-cond-900.woff2', 'กขคงจฉชซญดตถทธนบปผพฟภมยรลวศสหอฮะัาำิีึืุูเแโใไ็่้๊๋์ฯๆ'),
    ('noto-sans-arabic-cond-900.woff2', 'ابتثجحخدذرزسشصضطظعغفقكلمنهويءآأإؤئةى،؛؟ـ'),
]


def need_fonttools():
    try:
        import fontTools  # noqa: F401
        import brotli  # noqa: F401
    except ImportError:
        sys.exit(
            'build_script_fonts.py needs fontTools and brotli:\n'
            '  python3 -m venv /tmp/fontvenv && /tmp/fontvenv/bin/pip install fonttools brotli\n'
            '  /tmp/fontvenv/bin/python scripts/fonts/build_script_fonts.py'
        )


def fetch(url: str, sha256: str, dest: Path) -> Path:
    if not dest.exists():
        print(f'  download {url}')
        with urllib.request.urlopen(url, timeout=60) as r:
            dest.write_bytes(r.read())
    digest = hashlib.sha256(dest.read_bytes()).hexdigest()
    if digest != sha256:
        sys.exit(f'{dest.name}: SHA-256 {digest} does not match the pinned {sha256}')
    return dest


def generate(spec: dict, source: Path) -> bytes:
    from fontTools import subset
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer

    font = TTFont(source)
    static = instancer.instantiateVariableFont(font, spec['axes'], updateFontNames=False)
    options = subset.Options()
    options.flavor = 'woff2'
    options.hinting = False  # display sizes only; saves bytes
    options.desubroutinize = True
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6]
    options.notdef_outline = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=ranges(spec['unicodes']))
    subsetter.subset(static)
    buf = io.BytesIO()
    static.flavor = 'woff2'
    static.save(buf)
    return buf.getvalue()


def build(cache: Path) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    LICENSES.mkdir(parents=True, exist_ok=True)

    for pkg, name in COPIES:
        src = NODE / pkg / 'files' / name
        if not src.exists():
            sys.exit(f'{src} is missing: run npm install first')
        shutil.copyfile(src, OUT / name)
        print(f'  copy     {name} ({src.stat().st_size:,} B)')

    sources = {key: fetch(url, sha, cache / f'{key}.ttf') for key, (url, sha) in DOWNLOADS.items()}
    for spec in GENERATED:
        data = generate(spec, sources[spec['source']])
        (OUT / spec['name']).write_bytes(data)
        print(f"  generate {spec['name']} ({len(data):,} B) axes={spec['axes']}")

    for name, (url, sha) in LICENSE_FILES.items():
        fetched = fetch(url, sha, cache / name)
        shutil.copyfile(fetched, LICENSES / name)
        print(f'  licence  {name}')


def check() -> bool:
    from fontTools.ttLib import TTFont

    ok = True
    for name in (LATIN + [n for _, n in COPIES] + [g['name'] for g in GENERATED]):
        if not (OUT / name).exists():
            print(f'MISSING  public/fonts/{name}')
            ok = False
    for name in LICENSE_FILES:
        if not (LICENSES / name).exists():
            print(f'MISSING  public/fonts/licenses/{name}')
            ok = False
    if not ok:
        return False

    for name, letters in COVERAGE:
        cmap = TTFont(OUT / name).getBestCmap()
        missing = [ch for ch in letters if ord(ch) not in cmap]
        status = 'ok  ' if not missing else 'FAIL'
        print(f'{status} coverage {name}: {len(letters) - len(missing)}/{len(letters)}'
              + (f" missing {''.join(missing)}" if missing else ''))
        ok &= not missing

    for loc, (files, budget) in BUDGETS.items():
        total = sum((OUT / f).stat().st_size for f in files) / 1000
        status = 'ok  ' if total <= budget + 0.05 else 'FAIL'
        print(f'{status} budget   {loc:<5} {total:5.1f} KB of {budget} KB')
        ok &= total <= budget + 0.05
    return ok


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--cache', type=Path, help='download directory (default: a temp dir)')
    parser.add_argument('--check', action='store_true', help='verify the committed files only')
    args = parser.parse_args()
    need_fonttools()

    if not args.check:
        if args.cache:
            args.cache.mkdir(parents=True, exist_ok=True)
            build(args.cache)
        else:
            with tempfile.TemporaryDirectory(prefix='pd-fonts-') as tmp:
                build(Path(tmp))
    sys.exit(0 if check() else 1)


if __name__ == '__main__':
    main()
