"""Merge 12 locale research files + architecture decisions into i18n-plan.json, and validate.

Usage: python3 -I build_plan.py <research_dir> <repo_dir>
Writes <research_dir>/i18n-plan.json and prints a validation report.
"""
import json, os, re, sys, unicodedata, statistics
from collections import Counter, defaultdict

RES, REPO = sys.argv[1], sys.argv[2]
LOCALES = ['es', 'pt', 'fr', 'de', 'it', 'nl', 'id', 'tr', 'vi', 'ru', 'th', 'ar']

PAGE_IDS = [
    'home', 'pinterest-pin-downloader', 'pinterest-video-downloader', 'pinterest-image-downloader',
    'pinterest-gif-downloader', 'pinterest-board-downloader', 'pinterest-profile-downloader',
    'pinterest-profile-picture-downloader', 'pinterest-carousel-downloader', 'pinterest-story-downloader',
    'pinterest-audio-downloader', 'pinterest-4k-downloader', 'pinterest-to-mp4',
    'pinterest-video-downloader-chrome', 'pinterest-seo-title-generator',
    'how-to-download-pinterest-videos', 'how-to-download-pinterest-video-in-gallery',
    'how-to-download-pinterest-video-on-laptop', 'download-pinterest-videos-iphone-android',
]
TEMPLATE = {p: ('home' if p == 'home' else 'guide' if p.startswith('how-to') or p == 'download-pinterest-videos-iphone-android' else 'tool') for p in PAGE_IDS}

LOCALE_META = {
    #       hreflang htmlLang  ogLocale dir   endonym              homeLabel       script        register / voice                             release
    'es': ('es', 'es',    'es_LA', 'ltr', 'Español',           'Inicio',        'latin',      'tú; neutral Latin American; "video" not "vídeo"', 'A'),
    'pt': ('pt', 'pt-BR', 'pt_BR', 'ltr', 'Português',         'Início',        'latin',      'você; Brazilian; pt-PT UI labels in parentheses only where the screen differs', 'A'),
    'fr': ('fr', 'fr',    'fr_FR', 'ltr', 'Français',          'Accueil',       'latin',      'vous; U+00A0 before : ; ? !', 'A'),
    'de': ('de', 'de',    'de_DE', 'ltr', 'Deutsch',           'Startseite',    'latin',      'du; sentence case; hyphenated brand compounds; never ẞ', 'A'),
    'it': ('it', 'it',    'it_IT', 'ltr', 'Italiano',          'Home',          'latin',      'tu; imperative "Scarica" in H1/buttons, infinitive "Scaricare" at title start', 'A'),
    'nl': ('nl', 'nl',    'nl_NL', 'ltr', 'Nederlands',        'Home',          'latin',      'je/jij; sentence case; hyphenate long compounds', 'A'),
    'id': ('id', 'id',    'id_ID', 'ltr', 'Bahasa Indonesia',  'Beranda',       'latin',      'kamu (never mixed with Anda); "download" as the search verb, "unduh" in body/buttons', 'A'),
    'tr': ('tr', 'tr',    'tr_TR', 'ltr', 'Türkçe',            'Ana Sayfa',     'latin-ext',  'polite plural imperatives in body ("indirin"), bare imperatives in titles/buttons', 'A'),
    'vi': ('vi', 'vi',    'vi_VN', 'ltr', 'Tiếng Việt',        'Trang chủ',     'vietnamese', 'bạn; sentence case; store text NFC', 'A'),
    'ru': ('ru', 'ru',    'ru_RU', 'ltr', 'Русский',           'Главная',       'cyrillic',   'вы; titles use declined "Пинтереста", H1/body use Latin "Pinterest"; never mention VPNs', 'B'),
    'th': ('th', 'th',    'th_TH', 'ltr', 'ไทย',               'หน้าแรก',        'thai',       'friendly-neutral, no ครับ/ค่ะ, pronoun usually dropped; show "pintdownload.app" near the brand', 'B'),
    'ar': ('ar', 'ar',    'ar_AR', 'rtl', 'العربية',            'الرئيسية',       'arabic',     'MSA; spell the brand "بنترست"; "تحميل" for the search verb, "تنزيل" only when quoting app buttons; Western digits', 'C'),
}
FONT = {
    'latin': ('Big Shoulders Display latin (current)', '1.0 + padding-top .08em (accented capitals reach 0.98em)'),
    'latin-ext': ('Big Shoulders Display latin + latin-ext via unicode-range (Ğ ğ İ Ş ş)', '1.0 + padding-top .08em (İ dot)'),
    'vietnamese': ('Big Shoulders Display latin + vietnamese via unicode-range', '1.12 + padding-top .12em (stacked marks Ấ Ầ Ẩ)'),
    'cyrillic': ('Sofia Sans Extra Condensed 800/900 for the whole headline (latin + cyrillic + №)', '1.0'),
    'thai': ('Noto Sans Thai instanced to condensed wdth, wght 900; Latin words stay Big Shoulders', '1.3; letter-spacing 0; never word-break: keep-all'),
    'arabic': ('Noto Sans Arabic instanced to wdth 75, wght 900 (Noto Kufi Arabic is the visual-QA alternative); Latin words stay Big Shoulders', '1.3; letter-spacing 0'),
}

def tier(v):
    if v is None:
        return None
    s = str(v).lower()
    if s in ('high', '1', 'p1'):
        return 'P1'
    if s in ('medium', '2', 'p2', 'low-medium'):
        return 'P2'
    if s in ('low', '3', 'p3'):
        return 'P3'
    return None

# ---------------------------------------------------------------- decisions (overlay on research)
# Status vocabulary:
#   ship        build + publish in the locale's release
#   gated-audio build, publish only after the product writes a real audio file (Q1)
#   gated-4k    honest "is 4K possible?" explainer; build, publish only if Q2 is approved
STATUS_OVERRIDES = {
    ('id', 'pinterest-story-downloader'): ('skip', 'Planner decision: skipped like the other 11 locales. Pinterest folded Idea Pins into regular Pins, the English twin is 38 lines, and part of "story pinterest" demand means Instagram story templates. The id video and pin pages get a "Story / Pin Ide" FAQ instead.'),
}
for loc in LOCALES:
    STATUS_OVERRIDES.setdefault((loc, 'pinterest-audio-downloader'), ('gated-audio', None))
    STATUS_OVERRIDES.setdefault((loc, 'pinterest-4k-downloader'), ('gated-4k', None))

# Copy fixes. Each is (field, old_substring_or_None_for_full_replace, new, reason).
FIXES = {
    ('fr', 'pinterest-image-downloader'): [
        ('title', None, 'Télécharger une photo Pinterest en HD — grand format', 'honesty: images are served at the 1200px public size, not "taille originale"'),
        ('description', None, 'Enregistrez une photo ou une image Pinterest en grand format, pas en miniature. Collez le lien de l’épingle : gratuit et sans compte Pinterest.', 'honesty: "résolution d’origine" is false (1200px public copy)'),
    ],
    ('fr', 'pinterest-4k-downloader'): [
        ('description', 'et les photos en taille d’origine', 'et les photos en grand format public', 'honesty: not the original size'),
    ],
    ('it', 'pinterest-image-downloader'): [
        ('description', 'nella risoluzione originale disponibile', 'nella massima risoluzione disponibile', 'honesty: not the original resolution'),
    ],
    ('ru', 'pinterest-image-downloader'): [
        ('description', 'в исходном размере', 'в максимальном размере', 'honesty: not the original size'),
    ],
    ('id', 'pinterest-image-downloader'): [
        ('title', None, 'Download Foto Pinterest HD — Ukuran Terbesar, Gratis', 'honesty: "ukuran asli" (original size) is false; images are the 1200px public copy'),
        ('description', None, 'Download foto dan gambar Pinterest dalam ukuran terbesar yang tersedia, bukan thumbnail yang pecah. Cocok untuk wallpaper. Gratis, tanpa login.', 'honesty: "ukuran asli" (original size) is false'),
    ],
    ('th', 'home'): [
        ('description', 'รูปขนาดเต็ม', 'รูปขนาดใหญ่สุด', 'honesty: "full size" -> "largest size"'),
    ],
    ('th', 'pinterest-pin-downloader'): [
        ('description', 'รูปขนาดเต็ม', 'รูปขนาดใหญ่สุด', 'honesty: "full size" -> "largest size"'),
    ],
    ('th', 'pinterest-image-downloader'): [
        ('title', None, 'โหลดรูป Pinterest ฟรี เซฟรูปขนาดใหญ่สุด ไม่ใช่รูปย่อ', 'honesty: "full size" -> "largest size"'),
        ('description', 'ขนาดเต็มตามที่ผู้โพสต์อัปโหลดไว้', 'ขนาดใหญ่สุดที่ Pinterest เปิดให้โหลด', 'honesty: "full size as the poster uploaded it" is false (1200px public copy)'),
    ],
    ('tr', 'pinterest-4k-downloader'): [
        ('title', None, "Pinterest'te 4K Video Var mı? Gerçek Kalitede MP4 İndir", 'honesty: old title/H1 promised 4K; the extractor serves 720p/1080p. Native review (tr-1): locative "Kalitede", not "Kaliteyi … İndir" ("lower the quality")'),
        ('description', None, "Pinterest videoları çoğunlukla 720p, bazen 1080p yayınlanır; 4K nadirdir. Pinin sunduğu en yüksek kaliteyi MP4 olarak indirin, sahte 4K üretmeyiz.", 'honesty: old text claimed "4K yüklendiyse 4K", which the extractor never returns'),
        ('h1', None, "Pinterest'te 4K Var mı?", 'honesty: H1 must not promise 4K'),
    ],
    ('pt', 'pinterest-4k-downloader'): [
        ('title', None, 'Vídeo do Pinterest em Full HD ou 4K? A Qualidade Real', 'honesty: "Baixar em Full HD" promised 1080p for every pin; most are 720p'),
        ('h1', None, 'Full HD ou 4K? A qualidade real', 'honesty: H1 must not promise Full HD'),
    ],
    ('vi', 'pinterest-4k-downloader'): [
        ('h1', None, 'Tải video Pinterest 4K được không?', 'honesty: H1 must ask, not promise 4K'),
    ],
    # i18n fixer, 2026-10-17 (native reviews and honesty checks after the build)
    ('es', 'pinterest-audio-downloader'): [
        ('description', 'usa solo audio que puedas conservar.', 'usa el audio solo con permiso.', 'native review (review-es-5): calque of "only keep audio you may"'),
    ],
    ('vi', 'pinterest-4k-downloader'): [
        ('description', 'khoảng 1200px.', 'khoảng 1.200 px.', 'native review (vi-1): same number format as the page body'),
    ],
    ('vi', 'pinterest-image-downloader'): [
        ('description', 'hợp lưu hình nền', 'hợp làm hình nền', 'native review (vi-2): "hợp lưu" reads as the noun "confluence"'),
    ],
    ('ru', 'pinterest-board-downloader'): [
        ('title', None, 'Скачать доску Пинтерест — публичные пины одним ZIP-архивом', 'honesty (R4): boards are capped at 250 pins; "целиком — все пины" promised every pin'),
        ('description', 'доску Pinterest полностью:', 'доску Pinterest:', 'honesty (R4): "полностью" promised the whole board past the cap'),
    ],
    ('fr', 'pinterest-profile-picture-downloader'): [
        ('title', None, 'Photo de profil Pinterest en grand — voir et télécharger', 'honesty: most avatars Pinterest serves are 280–1000 px, not HD'),
        ('h1', None, 'Photo de profil Pinterest en grand', 'honesty: H1 must not promise HD'),
    ],
    ('pt', 'how-to-download-pinterest-videos'): [
        ('title', None, 'Como Baixar Vídeo do Pinterest no Celular e no PC, sem App', 'hard-coded "(2026)" goes stale'),
    ],
}

# ---------------------------------------------------------------- load
research = {}
for loc in LOCALES:
    with open(os.path.join(RES, f'{loc}.json'), encoding='utf-8') as f:
        research[loc] = json.load(f)

def clean(s):
    return s if s is None else unicodedata.normalize('NFC', s.strip())

rows, skipped, changes_log = [], [], []
raw_tiers = defaultdict(list)
for loc in LOCALES:
    for p in research[loc]['pages']:
        t = tier(p.get('priority', p.get('demand')))
        pid = 'home' if p['enSlug'] == 'index' else p['enSlug']
        if t and not p['skip']:
            raw_tiers[pid].append(t)

def default_tier(pid):
    ts = raw_tiers.get(pid) or ['P2']
    return Counter(ts).most_common(1)[0][0]

for loc in LOCALES:
    for p in research[loc]['pages']:
        pid = 'home' if p['enSlug'] == 'index' else p['enSlug']
        assert pid in PAGE_IDS, (loc, pid)
        status = 'skip' if p['skip'] else 'ship'
        planner_note = None
        if (loc, pid) in STATUS_OVERRIDES and status != 'skip':
            status, planner_note = STATUS_OVERRIDES[(loc, pid)]
        if status == 'skip':
            skipped.append({
                'locale': loc, 'pageId': pid,
                'reason': planner_note or p.get('skipReason') or '',
                'foldInto': p.get('mergeInto'),
                'source': 'planner' if planner_note else 'research',
                'deferredDraft': ({'slug': p.get('slug'), 'title': p.get('title'), 'description': p.get('description'), 'h1': p.get('h1')}
                                  if p.get('title') else None),
            })
            continue
        slug = (p.get('slug') or '').strip('/')
        if pid == 'home':
            if slug:
                changes_log.append({'locale': loc, 'pageId': pid, 'field': 'slug', 'old': slug, 'new': '', 'reason': 'locale home has an empty slug (path is /<loc>)'})
            slug = ''
        if slug.startswith(f'{loc}/'):
            slug = slug[len(loc) + 1:]
        path = f'/{loc}' + (f'/{slug}' if slug else '')
        if p.get('path') and p['path'] != path:
            changes_log.append({'locale': loc, 'pageId': pid, 'field': 'path', 'old': p['path'], 'new': path, 'reason': 'normalized'})
        if not p.get('path'):
            changes_log.append({'locale': loc, 'pageId': pid, 'field': 'path', 'old': None, 'new': path, 'reason': 'research gave a bare slug; prefixed with /<loc>'})
        row = {
            'locale': loc, 'pageId': pid, 'template': TEMPLATE[pid], 'status': status,
            'slug': slug, 'path': path, 'url': 'https://pintdownload.app' + path,
            'title': clean(p['title']), 'description': clean(p['description']), 'h1': clean(p['h1']),
            'primaryKeyword': clean(p.get('primaryKeyword')),
            'secondaryKeywords': [clean(k) for k in (p.get('secondaryKeywords') or [])],
            'priority': tier(p.get('priority', p.get('demand'))) or default_tier(pid),
            'priorityInferred': tier(p.get('priority', p.get('demand'))) is None,
            'release': LOCALE_META[loc][8],
            'lede': clean(p.get('lede')),
            'changes': [],
        }
        if not row['primaryKeyword']:
            raise SystemExit(f'missing primary keyword {loc} {pid}')
        for field, old, new, why in FIXES.get((loc, pid), []):
            before = row[field]
            if old is None:
                row[field] = new
            else:
                assert old in before, (loc, pid, field, old)
                row[field] = before.replace(old, new)
            row['changes'].append({'field': field, 'old': before, 'new': row[field], 'reason': why})
            changes_log.append({'locale': loc, 'pageId': pid, 'field': field, 'old': before, 'new': row[field], 'reason': why})
        rows.append(row)

# Tie the tr audio fallback in, so the build has a ready no-MP3 variant.
for r in rows:
    if r['locale'] == 'tr' and r['pageId'] == 'pinterest-audio-downloader':
        fb = next(p for p in research['tr']['pages'] if p['enSlug'] == 'pinterest-audio-downloader')['fallbackIfNoRealMp3']
        r['fallbackIfNoRealAudio'] = {k: fb[k] for k in ('slug', 'title', 'description', 'h1')}

# ---------------------------------------------------------------- validation
errors, warnings = [], []
def err(msg): errors.append(msg)
def warn(msg): warnings.append(msg)

SLUG_RE = re.compile(r'^[a-z0-9]+(-[a-z0-9]+)*$')
RESERVED = {'404', '500', 'api', 'mcp', 'blog', 'fonts', 'images', '_astro', 'embed', 'rss.xml', 'sitemap.xml'}

# English routes + redirect sources + public files that a localized path must never equal
en_paths = set()
for fn in os.listdir(os.path.join(REPO, 'src/pages')):
    base = re.sub(r'\.(astro|ts)$', '', fn)
    en_paths.add('/' if base == 'index' else '/' + base)
with open(os.path.join(REPO, 'astro.config.mjs'), encoding='utf-8') as f:
    cfg = f.read()
redirect_sources = set(re.findall(r"'(/[^']+)'\s*:", cfg))
public_top = {'/' + x for x in os.listdir(os.path.join(REPO, 'public'))}
taken = en_paths | redirect_sources | public_top
for loc in LOCALES:
    if f'/{loc}' in taken:
        err(f'locale prefix /{loc} collides with an existing route/file')

def ln(s):
    return len(s)  # code points, same as seo_health_check.py (after NFC)

by_loc = defaultdict(list)
for r in rows:
    by_loc[r['locale']].append(r)
    tag = f"{r['locale']}:{r['pageId']}"
    for field in ('title', 'description', 'h1', 'lede'):
        v = r.get(field)
        if v and unicodedata.normalize('NFC', v) != v:
            err(f'{tag} {field} not NFC')
    t, d = ln(r['title']), ln(r['description'])
    r['titleLength'], r['descriptionLength'], r['h1Length'] = t, d, ln(r['h1'])
    if not 40 <= t <= 62:
        err(f'{tag} title length {t} outside 40–62: {r["title"]}')
    if not 120 <= d <= 158:
        err(f'{tag} description length {d} outside 120–158')
    if r['h1Length'] > 60:
        err(f'{tag} h1 longer than schema max 60')
    if re.search(r'[<>]', r['title'] + r['description'] + r['h1']):
        err(f'{tag} raw < or > in copy')
    if r['pageId'] != 'home':
        if not SLUG_RE.match(r['slug']):
            err(f'{tag} slug "{r["slug"]}" is not lowercase ASCII kebab-case')
        if r['slug'] in RESERVED:
            err(f'{tag} slug is reserved')
    if r['path'] in taken:
        err(f'{tag} path {r["path"]} collides with an English route, redirect source or public file')
    # display-font glyph gaps (Big Shoulders): → U+2192, ẞ, Ÿ, narrow nbsp U+202F
    for ch, name in (('→', 'U+2192 arrow'), ('ẞ', 'capital sharp s'), ('Ÿ', 'Y diaeresis'), (' ', 'narrow nbsp')):
        if ch in r['h1']:
            err(f'{tag} H1 contains {name}, missing from the headline font')
    if r['h1'].strip() == '':
        err(f'{tag} empty H1')

for loc, rs in by_loc.items():
    for field in ('slug', 'path', 'title', 'description', 'h1', 'primaryKeyword'):
        c = Counter((r[field] or '').casefold() for r in rs)
        for v, n in c.items():
            if n > 1:
                err(f'{loc}: duplicate {field} "{v}" ×{n}')
    if not any(r['pageId'] == 'home' for r in rs):
        err(f'{loc}: no home page')

# Honesty rules (title, description, H1, lede). PRODUCT.md: public only, real quality, no fake 4K.
HONESTY = [
    # (regex, applies-to-pageIds or None, message)
    (r'\b(4K|4k)\b', None, '4K mentioned'),
    (r'origin(al|ale|e)\b|d’origine|d\'origine|taille originale|ukuran asli|исходн|оригинал|ต้นฉบับ|ตามที่ผู้โพสต์อัปโหลด|tamaño original|resolução original|Originalgröße|originele', None, '"original size/resolution" claim (images are the 1200px public copy)'),
    (r'1080p|Full HD|full hd', None, '1080p / Full HD mentioned'),
    (r'\bMP3\b|mp3', None, 'MP3 mentioned (today the "MP3" is the MP4 renamed)'),
]
honesty_hits = []
for r in rows:
    blob = ' | '.join(x for x in (r['title'], r['description'], r['h1'], r.get('lede') or '') if x)
    blob = re.sub(r'ถ้าต้นฉบับ|\(ถ้าต้นฉบับมีเสียง\)|video gốc|nếu video gốc', '', blob)
    for rx, _, msg in HONESTY:
        for m in re.finditer(rx, blob):
            honesty_hits.append((r, msg, m.group(0)))
for r, msg, hit in honesty_hits:
    tag = f"{r['locale']}:{r['pageId']}"
    if msg.startswith('4K'):
        if r['pageId'] != 'pinterest-4k-downloader':
            err(f'{tag} {msg} outside the 4K explainer')
        elif re.search(r'(4K|4k)', r['h1']) and not re.search(r'[?？]|ไหม|هل|var mı|được không', r['h1']):
            err(f'{tag} 4K page H1 promises 4K instead of asking: {r["h1"]}')
    elif msg.startswith('"original'):
        if re.search(r'\.gif|GIF', r['description'] + r['title']) and r['pageId'] == 'pinterest-gif-downloader':
            warn(f'{tag} "original" refers to the original GIF file ({hit}): acceptable, writer keeps it about the file, not resolution')
        elif r.get('lede') and hit in (r.get('lede') or '') and hit not in re.sub(r'ถ้าต้นฉบับ|video gốc|nếu video gốc', '', r['title'] + r['description'] + r['h1']):
            warn(f'{tag} lede says "{hit}": writer must rephrase as "largest available size"')
        else:
            err(f'{tag} {msg}: "{hit}"')
    elif msg.startswith('1080p'):
        ctx = r['title'] + r['description'] + r['h1']
        if hit in ctx and not re.search(r'quando existe|jika tersedia|có khi|حسب المصدر|bazen|varsa|souvent|ou 4K|أو 1080p', ctx):
            err(f'{tag} unconditional {hit} claim')
    elif msg.startswith('MP3'):
        if r['pageId'] == 'pinterest-audio-downloader':
            pass  # handled by gated-audio status
        elif r['pageId'] == 'home':
            warn(f'{tag} mentions MP3 on the home page; remove unless Q1 ships real MP3')
        else:
            warn(f'{tag} mentions MP3')

# Glossary consistency: the locale's board term must appear on the board page; banned variants nowhere.
BOARD = {'es': 'tablero', 'pt': 'pasta', 'fr': 'tableau', 'de': 'pinnwand', 'it': 'bacheca', 'nl': 'bord',
         'id': 'board', 'tr': 'pano', 'vi': 'bảng', 'ru': 'доск', 'th': 'บอร์ด', 'ar': 'لوح'}
BANNED = {
    'de': [r'Pinwände', r'\bSie\b'],
    'pt': [r'álbum', r'descarregar', r'transferir'],
    'es': [r'vídeo', r'downloadear'],
    'fr': [r'filigrane'],
    'it': [r'[Ss]caricatore'],
    'nl': [r'pinnen\b'],
    'id': [r'\bAnda\b', r'[Pp]engunduh'],
    'th': [r'วีดีโอ', r'แครูเซล|คารูเซล'],
    'ar': [r'بينترست|بينتريست|بنتريست|بينتيريست', r'بوردات'],
    'vi': [r'không liên kết với Pinterest'],
    'ru': [r'VPN|впн|ВПН'],
    'tr': [],
}
for r in rows:
    loc, tag = r['locale'], f"{r['locale']}:{r['pageId']}"
    blob = ' '.join(x for x in (r['title'], r['description'], r['h1']) if x)
    if r['pageId'] == 'pinterest-board-downloader' and BOARD[loc] not in (r['title'] + r['h1']).casefold():
        err(f'{tag} board page title/H1 lacks the glossary term "{BOARD[loc]}"')
    for rx in BANNED.get(loc, []):
        if re.search(rx, blob):
            err(f'{tag} uses a glossary-banned term /{rx}/')
# Board term drift on other pages
DRIFT = {'id': r'\bpapan\b', 'de': r'\bBoards?\b', 'ar': r'بورد'}
for r in rows:
    rx = DRIFT.get(r['locale'])
    if rx and re.search(rx, r['title'] + ' ' + r['h1']):
        err(f"{r['locale']}:{r['pageId']} title/H1 uses /{rx}/ (glossary: keep it out of titles)")

# hreflang clusters
clusters = defaultdict(list)
for r in rows:
    clusters[r['pageId']].append(r['locale'])
for pid in PAGE_IDS:
    if pid not in clusters:
        continue
    if len(clusters[pid]) == 0:
        continue

# Primary keyword overlap between pages in a locale (cannibalisation hint)
for loc, rs in by_loc.items():
    kws = {r['pageId']: r['primaryKeyword'].casefold() for r in rs}
    for a, ka in kws.items():
        for b, kb in kws.items():
            if a < b and (ka == kb):
                err(f'{loc}: {a} and {b} share primary keyword "{ka}"')

# ---------------------------------------------------------------- summary numbers
count_by_loc = {loc: Counter(r['status'] for r in by_loc[loc]) for loc in LOCALES}
coverage = {pid: {loc: next((r['slug'] or '(home)') for r in by_loc[loc] if r['pageId'] == pid) if any(r['pageId'] == pid for r in by_loc[loc]) else None
                  for loc in LOCALES} for pid in PAGE_IDS}

errors[:] = list(dict.fromkeys(errors)); warnings[:] = list(dict.fromkeys(warnings))
validation = {
    'checkedRows': len(rows),
    'errors': errors,
    'warnings': warnings,
    'rules': [
        'title 40–62 and description 120–158 code points after NFC (seo_health_check.py optimal band; zod schema will enforce the same)',
        'H1 ≤ 60 chars; no < or >; no glyphs missing from Big Shoulders (→ ẞ Ÿ U+202F)',
        'slug lowercase ASCII kebab-case, not reserved, unique per locale; full path never equals an English route, astro redirect source or public/ file; locale prefixes collide with nothing',
        'title, description, H1, slug and primary keyword unique within a locale',
        'honesty: no 4K outside the gated explainer (whose H1 must ask, not promise); no "original size/resolution"; no unconditional 1080p/Full HD; MP3 only on gated audio pages',
        'glossary: board term present on board page; banned variants (de Pinwände/Sie, ar misspellings, th วีดีโอ, id Anda, …) absent',
    ],
}

plan = {
    'version': 1,
    'generated': '2026-10-15',
    'sources': {
        'architecture': os.path.join(RES, 'architecture.md'),
        'research': {loc: os.path.join(RES, f'{loc}.json') for loc in LOCALES},
    },
    'xDefault': 'Always the English URL of the same pageId. Pages outside the route map (blog, legal, mcp, title generator) keep en + x-default self-references.',
    'english': {'hreflang': 'en', 'htmlLang': 'en', 'ogLocale': 'en_US', 'pathPrefix': ''},
    'locales': [
        {
            'code': loc, 'hreflang': m[0], 'htmlLang': m[1], 'ogLocale': m[2], 'dir': m[3], 'endonym': m[4],
            'homeLabel': m[5], 'script': m[6], 'register': m[7], 'release': m[8],
            'pathPrefix': f'/{loc}', 'home': f'/{loc}',
            'headlineFont': FONT[m[6]][0], 'displayLineHeight': FONT[m[6]][1],
            'pages': {k: v for k, v in count_by_loc[loc].items()},
        } for loc, m in LOCALE_META.items()
    ],
    'releases': {
        'A': {'locales': [l for l in LOCALES if LOCALE_META[l][8] == 'A'], 'gate': 'automated + native review + Latin/tr/vi visual QA pass'},
        'B': {'locales': ['ru', 'th'], 'gate': 'Cyrillic/Thai fonts pass visual QA; ru: Yandex Webmaster server-response check from inside Russia after deploy'},
        'C': {'locales': ['ar'], 'gate': 'logical-property sweep shipped with zero LTR diff; RTL visual QA pass'},
    },
    'pageIds': [{'pageId': p, 'template': TEMPLATE[p], 'en': '/' if p == 'home' else '/' + p,
                 'locales': [l for l in LOCALES if coverage[p][l] is not None]} for p in PAGE_IDS],
    'matrix': rows,
    'skipped': skipped,
    'changesFromResearch': changes_log,
    'validation': validation,
}
with open(os.path.join(RES, 'i18n-plan.json'), 'w', encoding='utf-8') as f:
    json.dump(plan, f, ensure_ascii=False, indent=2)

print('rows', len(rows), 'skipped', len(skipped))
for loc in LOCALES:
    print(loc, dict(count_by_loc[loc]), sum(count_by_loc[loc].values()))
errors[:] = list(dict.fromkeys(errors)); warnings[:] = list(dict.fromkeys(warnings))
print('ERRORS', len(errors))
for e in errors: print('  E', e)
print('WARNINGS', len(warnings))
for w in warnings: print('  W', w)
