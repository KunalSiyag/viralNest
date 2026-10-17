"""Add architecture / workflow / questions to i18n-plan.json and render i18n-plan.md.

Usage: python3 -I sections.py <research_dir>
"""
import json, os, sys
from collections import Counter, defaultdict

RES = sys.argv[1]
PLAN = os.path.join(RES, 'i18n-plan.json')
plan = json.load(open(PLAN, encoding='utf-8'))
LOCALES = [l['code'] for l in plan['locales']]

ARCH = {
    'basis': 'architecture.md (sections 1–16) is adopted as the build spec. The items below are the merged decisions plus planner amendments (marked AMEND).',
    'urls': 'English stays at the root. Locale prefix + native ASCII slugs, no trailing slash: /es, /es/descargar-videos-pinterest. th and ar keep the English slugs under their prefix (research: romanised Thai and Arabic-script slugs match nothing people type and encode badly when shared). de keeps the English slug for the Chrome page on purpose.',
    'hreflang': 'Language-only codes (es pt fr de it nl id tr vi ru th ar) plus en; x-default = English URL of the same pageId. <html lang> may be more specific (pt-BR). One generator, alternatesFor(pageId), feeds HTML <link> tags and sitemap xhtml:link; a test asserts they are equal. Only live (pageId, locale) pairs appear; gated and unreleased pages are absent from every cluster.',
    'routing': 'No Astro i18n config. src/i18n/routes.ts is the single source (PAGES, SLUGS, pathFor, routeForPath, alternatesFor, localeHome, localePagesOf). Three prerendered routes: src/pages/[locale]/index.astro, [locale]/[slug].astro, [locale]/404.astro (renamed to <loc>/404.html by an astro:build:done hook so Cloudflare serves it with status 404).',
    'routeStatus': 'AMEND: SLUGS entries carry a status (live | gated-audio | gated-4k) and LOCALE_META carries live: boolean. getStaticPaths, alternates, sitemap, nav, footer and the language menu use only live pages of live locales. This lets Releases A/B/C and the Q1/Q2 gates ship from one codebase without branches. Content JSON for gated pages may exist; it is simply not routed.',
    'contentModel': 'One JSON per (locale, pageId) in src/content/i18n/<loc>/<pageId>.json, validated by the zod schema in architecture.md §6.2 (title 40–62, description 120–158, H1 ≤ 60, no raw HTML, [[pageId|text]] internal links that fail the build when the target is not live in that locale, external links allowlisted to pinterest.com/help.pinterest.com). AMEND: schema adds .refine(s => s === s.normalize("NFC")) on every string (vi research: decomposed text breaks the length rule).',
    'breadcrumb': 'AMEND: localized breadcrumbs and BreadcrumbList JSON-LD use content nav.label, not title.split("—"). Titles are therefore free to use ":" or "|" as the research wrote them; no locale needs to force an em dash. English pages keep today’s behaviour.',
    'jsonLd': 'src/i18n/jsonld.ts: WebPage, SoftwareApplication (price 0, never aggregateRating), HowTo, FAQPage (only when visible), BreadcrumbList rooted at the locale home with LOCALE_META.homeLabel, Article with real datePublished/dateModified on guides; inLanguage = htmlLang on every entity; Organization @id shared with English; no WebSite/SearchAction on localized pages.',
    'sitemap': 'One sitemap.xml with xmlns:xhtml; every live localized URL once with the full alternate set; lastmod from content dateModified (never build date). indexnow.mjs reads the same entries. robots.txt unchanged.',
    'templates': 'HomePage.astro, ToolPage.astro, GuidePage.astro under src/components/i18n/. Shared components (TicketHero, HowToSteps, FaqSection, CompareTable, RelatedTools, BookmarkletGuide, FooterKeywordMatrix, AdSlot) gain optional ui/locale props whose defaults keep English HTML byte-identical apart from the head alternates and language menu. English .astro pages are not rewritten.',
    'islands': 'Typed catalogs src/i18n/island/<loc>.ts imported only by server templates; each page passes pickIsland(locale, variant) as a prop (≈12–23 KB of JSON, 4–5 KB brotli; budget in §8). English defaults stay inline, so the English bundle does not grow and no locale string enters dist/_astro/*.js (post-build check). Plurals via Intl.PluralRules maps (ru one/few/many/other, ar zero…other). Route notices and StickyPasteBar resolve targets through a routes prop of the current locale. /api/extract gains an additive error code field only after mcp-server merges (parity fixtures updated in the same commit); until then localized pages show a localized generic error with the English server text as detail.',
    'languageSelector': 'Server-rendered LanguageMenu.astro (<details>, real <a hreflang lang> links, endonyms, no flags). Links go to the current page’s live alternate, else that locale’s home (no hreflang attribute then). No redirect or banner by IP, Accept-Language or cookie. src/lib/i18n.ts, i18n-client.ts, LanguageSelector.tsx and DownloaderForm’s preferred_lang code are deleted (their strings overclaim 1080p and contain errors flagged by de/it/ar/id/nl research). English blog/legal pages: the menu links to locale homes.',
    'rtl': 'Before any i18n work, one mechanical sweep converts physical Tailwind/CSS direction properties to logical ones, verified by zero pixel diff on 6 pages at 390/1440 light/dark. Then dir="rtl" on /ar, mirrored stub tear and stamp angle, rtl:-scale-x-100 on directional icons, swapped arrow-key handlers in carousels, <bdi>/dir="ltr" for URLs, code, pin.it, MP4, serial numbers; letter-spacing 0 for ar and th; Western digits (Intl.NumberFormat("ar",{numberingSystem:"latn"})). The URL input stays LTR; caret behaviour after paste is a QA item. Step illustrations with English text are replaced or captioned per locale.',
    'fonts': {
        'principle': 'All headline faces self-hosted, subset, loaded only on their locale, one custom property --font-display switched by :lang(). Body text stays system-ui.',
        'perScript': {l['code']: {'face': l['headlineFont'], 'displayLineHeight': l['displayLineHeight']} for l in plan['locales']},
        'budgetKB': {'latin locales': 28.6, 'tr': 54, 'vi': 38, 'ru': '25–51', 'th': 43, 'ar': 59},
        'glyphRules': 'No → (U+2192) in any display string: use ›. de never types ẞ; fr uses U+00A0 (not U+202F) before : ; ? !; tr keeps brand names in <span lang="en"> so uppercase does not print PİNTEREST.',
    },
    'tests': [
        'tests/seo-invariants.entry.ts: route-map rules (slug format, reserved words, uniqueness, no collision with English routes/redirect sources/public files, pathFor round-trip, no trailing slash); alternates identical across a cluster, include self + en + x-default, absolute URLs; content file ↔ SLUGS parity; schema parse; unique title/description per locale; internal links live in-locale; honesty regexes (4K outside the explainer, "original size" equivalents, unconditional 1080p/Full HD, MP3 while Q1 is open); catalog key-tree and {token} parity; plural categories complete; wrangler run_worker_first covers the deepest localized depth; hostRedirectUrl strips /es/ and /ar/x/.',
        'scripts/verify_seo_build_artifacts.py: expected hreflang set read from dist/.i18n-routes.json instead of the hard-coded {en, x-default}; localized money pages join the existing canonical/noindex/JSON-LD/aggregateRating checks.',
        'scripts/verify_i18n_build.py (new): <html lang>/dir, self canonical, reciprocal hreflang with identical sets, no alternate pointing at noindex/redirect/404, og:locale, JSON-LD inLanguage, in-locale internal links, English-leftover detector, per-locale 404.html present, sitemap == HTML alternates, island bundle isolation.',
        'scripts/seo_health_check.py: add errors for missing <html lang>, indexable page without self hreflang, and template markers in <title>.',
        'Live table (architecture.md §13.5): /es/ → 301 /es; /es/missing → 404 Spanish body; / with Accept-Language es-MX or CF-IPCountry MX is byte-identical English, no Vary; www → apex; sitemap validates.',
        'The planner validator (viralnest-i18n-research/tools/build_plan.py) is the seed of the content tests; its rules are listed under validation.rules.',
    ],
}

CROSS_FINDINGS = [
    {'id': 'F1', 'severity': 'blocker for audio pages', 'what': 'The "MP3" is the MP4 video saved under a .mp3 name (DownloaderForm.tsx ~966 in the ZIP pack, ~1898 single-pin row); the trimmer exports WAV. Affects English too.', 'action': 'Q1. Until resolved, all 9 localized audio pages stay gated and the English ZIP should stop writing a fake .mp3.'},
    {'id': 'F2', 'severity': 'high, all markets', 'what': 'The /api/extract host allowlist (main: src/pages/api/extract.ts:1104; being moved on mcp-server) only allows www/in/uk/br/id/jp/de/fr/es/it/ca/au subdomains. Desktop links from tr., nl., ru., pt., mx., at., ch., pl., se., ar. … .pinterest.com are rejected as invalid (verified in node). The client regex in DownloaderForm.tsx:431 is already permissive.', 'action': 'Phase 0b: after mcp-server merges, accept any two-letter country subdomain (^(www\\.|[a-z]{2}\\.)?pinterest\\.[a-z.]+) in the shared extractor, with tests and a parity-fixture note (only previously rejected inputs change).'},
    {'id': 'F3', 'severity': 'honesty', 'what': 'English pinterest-4k-downloader promises "4K ultra quality" / "original uncompressed"; the image page and form hint say "original resolution", but pin-media serves the 1200px public copy and 720p/1080p video. These are the x-default/en twins of localized pages.', 'action': 'Q2 (English 4K page). The "original resolution" wording on the image page is a small copy fix recommended regardless.'},
    {'id': 'F4', 'severity': 'build prerequisite', 'what': 'BaseLayout hard-codes lang="en", og:locale en_US, en-only alternates, the "Home" breadcrumb, nav/footer strings and latin-only font preloads; verify_seo_build_artifacts.py fails on any hreflang besides en/x-default.', 'action': 'Phase 2 infra builder (architecture.md §7, §13.2).'},
    {'id': 'F5', 'severity': 'font', 'what': 'Big Shoulders latin subset lacks Ğ ğ İ Ş ş (tr), 102 of 146 Vietnamese letters, all Cyrillic/Thai/Arabic and →. Display line-height 0.88–0.9 clips accents (es pt fr de it), Vietnamese stacked marks, Thai and Arabic marks.', 'action': 'Phase 2 fonts builder; visual QA asserts no clipped marks.'},
    {'id': 'F6', 'severity': 'market risk (ru)', 'what': 'Russian ISPs have throttled Cloudflare-fronted sites to ~16 KB per response since June 2025; no source says it ended. Big Shoulders has no Cyrillic.', 'action': 'ru ships in Release B anyway (Kazakhstan/Belarus unaffected, cost is low); after deploy, check with Yandex Webmaster’s server-response tool. Never mention VPNs in ru copy.'},
    {'id': 'F7', 'severity': 'compliance (later)', 'what': 'German pages bring Impressum/privacy/consent expectations once ads run; vi forbids gambling ads.', 'action': 'Q4 for de. When an ad network is added, block gambling categories on /vi.'},
    {'id': 'F8', 'severity': 'content quality', 'what': 'Existing client-side strings in src/lib/i18n.ts overclaim ("Full HD 1080p", "1080p HD") and contain errors (de "Pinwände" and Sie; ar "أنقش" for paste, "بوردات"; it "Scaricatore"; nl "HD-media uitpakken"; id "Mengekstrak").', 'action': 'Deleted with the old switcher; new catalogs are written from the research glossaries.'},
    {'id': 'F9', 'severity': 'copy', 'what': 'DownloaderForm shows the "Download MP4" CTA label on non-video variants in nl (research); island catalogs must key CTA labels by variant.', 'action': 'Phase 2 islands builder.'},
]

WORKFLOW = {
    'phases': [
        {'phase': '0', 'name': 'Gates', 'owner': 'orchestrator', 'steps': [
            'mcp-server is merged to main; branch i18n from that main (it touches wrangler.jsonc, llms.txt, seo-invariants, the extractor and /api/extract parity).',
            'Answers to the open questions recorded in i18n-plan.json (openQuestions[].answer).',
            'Phase 0b (one agent, separate small PR): F2 host allowlist; if Q1 = "make it real", the audio extraction change; English honesty copy fixes per Q2/F3.']},
        {'phase': '1', 'name': 'Logical-property sweep', 'owner': '1 agent', 'owns': ['class and CSS direction edits across src/**', 'src/styles/*.css direction properties'],
         'done': 'npm run build passes; zero pixel diff on 6 pages × 390/1440 × light/dark.'},
        {'phase': '2', 'name': 'Three parallel builders (exclusive file ownership)', 'builders': [
            {'name': 'infra-routing', 'owns': ['src/i18n/{locales,routes,schema,inline,jsonld}.ts', 'src/i18n/ui/en.ts (+ UiStrings type)', 'src/content.config.ts', 'src/pages/[locale]/*', 'src/components/i18n/*', 'src/components/LanguageMenu.astro', 'src/layouts/BaseLayout.astro', 'src/components/TicketHero.astro (props only)', 'src/components/seo/*', 'FooterKeywordMatrix.astro', 'AdSlot.astro', 'RelatedTools.astro', 'HowToSteps/FaqSection/CompareTable/BookmarkletGuide (optional props only)', 'src/lib/seo.ts', 'src/pages/sitemap.xml.ts', 'astro.config.mjs (404 rename + .i18n-routes.json)', 'scripts/indexnow.mjs', 'public/llms.txt (Languages section)', 'tests/seo-invariants.entry.ts (i18n block)', 'scripts/verify_seo_build_artifacts.py', 'scripts/verify_i18n_build.py', 'scripts/seo_health_check.py', 'delete src/lib/i18n.ts, i18n-client.ts, LanguageSelector.tsx'],
             'delivers': 'routes.ts SLUGS pre-filled from i18n-plan.json matrix (with status), LOCALE_META from locales[], the es pilot (home, video, board, gallery guide) with the es writer, English HTML snapshot diff limited to head alternates + language menu.'},
            {'name': 'islands-strings', 'owns': ['src/components/DownloaderForm.tsx', 'src/components/results/*', 'AudioTrimmer.tsx', 'ImageCropperModal.tsx', 'StickyPasteBar.tsx', 'TitleGenerator.tsx (remove i18n imports only)', 'src/lib/pinterest-route.ts', 'src/i18n/island/en.ts + IslandMessages type + fmt/plural helpers', '/api/extract additive code field + parity fixtures (only after mcp-server merge)'],
             'delivers': 'English behaviour and HTML identical; islands accept messages + routes props; per-variant CTA labels; bundle-isolation check green.'},
            {'name': 'fonts-rtl', 'owns': ['src/styles/ticket.css, results.css (font-face, :lang rules, RTL transforms)', 'tailwind.config.mjs (fontFamily.display → var(--font-display))', 'public/fonts/** + licenses', 'scripts/fonts/build_script_fonts.py', 'src/i18n/fonts.ts', 'package.json devDependency @fontsource/sofia-sans-extra-condensed'],
             'delivers': 'Committed subset fonts; fontAssetsFor(locale) per the agreed stub signature; a test page showing Latin, tr, vi, ru, th, ar headlines at 390 and 1440.'},
        ], 'contracts': ['PageContent zod schema (architecture.md §6.2 + NFC refine)', 'UiStrings / IslandMessages key trees (en files published first)', 'fontAssetsFor(locale): { preload: string[] }', 'routes prop: Partial<Record<PageId,string>> & { home: string }', 'route status vocabulary: live | gated-audio | gated-4k']},
        {'phase': '3', 'name': 'Content writers (12 in parallel)', 'owner': 'one writer per locale', 'owns': ['src/content/i18n/<loc>/*.json', 'src/i18n/ui/<loc>.ts', 'src/i18n/island/<loc>.ts'],
         'inputs': ['i18n-plan.json matrix rows for the locale (title, description, H1, keywords are fixed; changing them is a slug/meta change request)', '<loc>.json/.md research (faqTopics, evidence, glossary, formats, typography)', 'English page sources for facts only', 'architecture.md §6.3 writing rules', 'the es pilot as the reference'],
         'order': 'Write P1 pages first, then P2, then P3; gated pages last (content exists, route stays gated).',
         'rules': ['Native copy, never sentence-by-sentence translation; at least 3 FAQ answers grounded in local intent traps from the research', 'Honesty: public only; no numbers about users/downloads/ratings; "largest size Pinterest publishes", never "original"; quality as "usually 720p, 1080p when the pin has it"; "no watermark" means we add none; credit-creators line; "Independent tool, not affiliated with Pinterest Inc."', 'Use the research’s Pinterest UI labels and flag unverified phone labels in review.nativeReviewer notes', 'Fix the lede warnings listed in validation.warnings', 'Run npm test and npm run build before handing off; slug/title changes go to viralnest-i18n-research/<loc>-slug-requests.md for infra']},
        {'phase': '4', 'name': 'QA (parallel)', 'steps': [
            'Automated: npm test, npm run build (postbuild health check), npm run test:seo-build, verify_i18n_build.py.',
            'Native review ×12 by a different agent than the writer (fluency, register, search vocabulary, Pinterest UI labels against help.pinterest.com/<lang>, honesty, no English leftovers, no calques); human proofreaders where Q3 provides them.',
            'Visual QA per script group (Latin; tr+vi; ru; th; ar RTL) with Playwright at 390×844 and 1440×900, light and dark: home, video, board, longest-H1 page, 404, DownloaderForm states with /api/extract mocked from tests/fixtures. Assert no horizontal scroll, H1 not clipped, script font loaded, stub label on one line, language menu keyboard-reachable, RTL mirroring correct.',
            'SEO crawl against wrangler dev: architecture.md §13.5 table + full link crawl (no 4xx, no redirect chains, every localized page within 2 clicks of its locale home).',
            'Perf: Lighthouse mobile on /, /es, /ru, /th, /ar and one deep page each; font bytes within budget; CLS 0; island props within the restated budget: each `messages` prop < 24 KB UTF-8 and < 5.5 KB brotli (tests/islands.entry.ts; the first "< 8 KB raw" could not hold the island strings — English alone is ≈12 KB).']},
        {'phase': '5', 'name': 'Close-out and release', 'steps': [
            'Skeptic agent challenges every QA finding; one fix batch; one confirm round.',
            'Release A (es pt fr de it nl id tr vi) → Release B (ru th) → Release C (ar), each flipping LOCALE_META.live once its script-group QA is green.',
            'Per release: submit sitemap in Search Console, Bing Webmaster (and Yandex Webmaster for ru); IndexNow the new URLs; URL Inspection on one page per locale.',
            'Two weeks after each release: GSC performance filtered by prefix, plus the "Alternate page with proper canonical" and "Duplicate" buckets; merge or 301 any pair of pages Google treats as one (watch list below).']},
    ],
    'cannibalisationWatch': {
        'es': ['pinterest-video-downloader vs how-to-download-pinterest-videos vs pinterest-to-mp4', 'download-pinterest-videos-iphone-android ("celular") vs how-to-download-pinterest-video-in-gallery'],
        'pt': ['download-pinterest-videos-iphone-android vs gallery guide (research: merge with 301 if not clearly device-specific)'],
        'fr': ['six video pages: tool, MP4, how-to, galerie, iPhone, PC'],
        'it': ['video tool vs how-to vs MP4 converter; gallery guide vs iPhone/Android guide'],
        'ru': ['four video pages (keyword map in ru.md)'],
        'vi': ['home vs video vs MP4 vs video guide (vi.json keywordOwnership)'],
        'tr': ['home targets "pinterest indirici", video page "pinterest video indir"'],
        'id': ['video tool vs cara-download guide vs di-hp guide'],
    },
}

QUESTIONS = [
    {'id': 'Q1', 'topic': 'Audio pages and the fake MP3',
     'question': 'The "MP3" button saves the MP4 video under a .mp3 name. Should we make real audio extraction (lazy-loaded in-browser MP3 encoder for the video’s audio track; it also fixes the English audio page), or keep the 9 localized audio pages unpublished and only stop the fake .mp3 file?',
     'recommendation': 'Build real MP3 extraction in Phase 0b. Every market searches "mp3"; the pages are already researched and validated. Until it ships, the pages stay gated.',
     'affects': ['es pinterest-a-mp3', 'pt baixar-som-pinterest', 'fr telecharger-mp3-pinterest', 'de pinterest-audio-herunterladen', 'it scaricare-audio-da-pinterest', 'id download-mp3-pinterest', 'tr pinterest-mp3-donusturucu (fallback /tr/pinterest-video-sesi-indir ready)', 'vi tai-nhac-pinterest', 'th pinterest-audio-downloader'],
     'answer': None},
    {'id': 'Q2', 'topic': '4K explainer pages and the English 4K page',
     'question': 'Six locales researched an honest "Is 4K possible? Here is the real quality" page (pt, fr, tr, vi, th, ar; titles now ask instead of promising). Their hreflang twin, the English 4K page, still promises "4K ultra quality" and "original uncompressed". Publish the six and rewrite the English 4K page to the same honest angle?',
     'recommendation': 'Yes to both. If the English 4K page must stay untouched (it may hold rankings), skip the six; es, de, it, nl, ru and id already fold 4K into a video-page FAQ.',
     'affects': ['pt baixar-video-pinterest-full-hd', 'fr telecharger-pinterest-4k', 'tr pinterest-4k-video-indir', 'vi tai-video-pinterest-4k', 'th pinterest-hd-downloader', 'ar pinterest-4k-downloader', 'en /pinterest-4k-downloader'],
     'answer': None},
    {'id': 'Q3', 'topic': 'Human proofreading',
     'question': 'Are human native speakers available to proofread any locale before it goes live? Otherwise launch on agent writer + separate agent reviewer only.',
     'recommendation': 'Agent review is enough to launch es/pt/fr/de/it/nl/id; ask for humans first on ar, th and ru, where agent errors are hardest to spot and the research flagged the most unverified UI labels.',
     'answer': None},
    {'id': 'Q4', 'topic': 'German legal pages',
     'question': 'Once ads run on /de, German visitors expect an Impressum with a real name and postal address, plus a German privacy notice and ad consent. Do you want to publish these before ads go on /de (needs your details), or keep /de ad-free?',
     'recommendation': 'Launch /de now (no ad network is wired up), and decide before monetising. Not legal advice.',
     'answer': None},
]

RISKS = [
    'Doorway/scaled-content signals from ~150 similar pages: mitigated by research-driven partial page sets (62 page×locale pairs skipped), native copy with local intents, a reviewer per locale and the identical-sentence check.',
    'English ranking regression: English pages are not rewritten; snapshot diff of every English page allows only head alternates and the language menu.',
    'Broken hreflang clusters: one generator, unit tests, post-build reciprocity, sitemap == HTML, live crawl; gated/unreleased pages never appear in any cluster.',
    'Merge conflicts with mcp-server: Phase 0 gate; extractor changes (F2, error codes) land as separate commits with parity notes.',
    'Russia reachability (F6) and Pinterest being fined in Russia: ru is cheap to ship; verify after deploy.',
    'Unverified phone UI labels (it, nl, id, vi, th, tr, ar iOS menus): reviewer checklist item; wording kept generic where unconfirmed.',
    'Thin demand pages (es/pt/de/tr/vi profile, de carousel/Chrome, vi 4K/MP4/Chrome, it audio): P3, written last; GSC review at two weeks decides keep/merge.',
    'Autocomplete shows which queries exist, not how many: launch order is a hypothesis to check against Search Console.',
]

plan['architecture'] = ARCH
plan['crossLocaleFindings'] = CROSS_FINDINGS
plan['workflow'] = WORKFLOW
plan['openQuestions'] = QUESTIONS
plan['risks'] = RISKS
plan['decisionsTaken'] = [
    'Locales: es pt fr de it nl id tr vi ru th ar; one version per language; language-only hreflang; x-default = English twin.',
    'id story page skipped (like every other locale); its topic becomes an FAQ on the id video and pin pages.',
    'SEO title generator not localized anywhere (generator is English-only); de draft kept in skipped[].deferredDraft for later.',
    'Audio pages built but gated on Q1; 4K explainers built but gated on Q2.',
    'Copy fixes applied to research titles/descriptions for honesty and staleness (changesFromResearch[]).',
    'Breadcrumb names come from content nav.label, so titles do not need an em dash.',
    'Staged releases by script group: A (Latin incl. tr, vi), B (ru, th), C (ar).',
    'Arabic uses Western digits; Thai width and Arabic face (Noto Sans Arabic vs Noto Kufi Arabic) are picked in visual QA.',
    'Language menu on English-only pages links to locale homes. No auto-redirects or language banners.',
    'Blog posts, legal pages, /pinterest-mcp-server and /embed stay English-only in v1; localizing 1–2 guides per locale is a possible later phase (needs "/*/*/*/" in run_worker_first).',
]
json.dump(plan, open(PLAN, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

# ---------------------------------------------------------------- markdown
rows = plan['matrix']
by_loc = defaultdict(list)
for r in rows:
    by_loc[r['locale']].append(r)
PIDS = [p['pageId'] for p in plan['pageIds']]
SHORT = {'home': 'home', 'pinterest-pin-downloader': 'pin', 'pinterest-video-downloader': 'video', 'pinterest-image-downloader': 'image',
         'pinterest-gif-downloader': 'gif', 'pinterest-board-downloader': 'board', 'pinterest-profile-downloader': 'profile',
         'pinterest-profile-picture-downloader': 'profile-picture', 'pinterest-carousel-downloader': 'carousel',
         'pinterest-story-downloader': 'story', 'pinterest-audio-downloader': 'audio', 'pinterest-4k-downloader': '4k',
         'pinterest-to-mp4': 'to-mp4', 'pinterest-video-downloader-chrome': 'chrome', 'pinterest-seo-title-generator': 'seo-title',
         'how-to-download-pinterest-videos': 'how-to', 'how-to-download-pinterest-video-in-gallery': 'gallery',
         'how-to-download-pinterest-video-on-laptop': 'laptop', 'download-pinterest-videos-iphone-android': 'iphone-android'}
STATUS_MARK = {'ship': '', 'gated-audio': ' (gated Q1)', 'gated-4k': ' (gated Q2)'}
esc = lambda s: (s or '').replace('|', '\\|')

L = []
w = L.append
counts = {l: Counter(r['status'] for r in by_loc[l]) for l in LOCALES}
tot = Counter(r['status'] for r in rows)
w('# PintDownload i18n plan (build-ready)')
w('')
w('Merged from `architecture.md` and the 12 locale research files in this folder. The machine-readable twin is `i18n-plan.json` (same decisions; the matrix there also carries secondary keywords, ledes, lengths and every change made to the research). Validated by script: 0 errors across all ' + str(len(rows)) + ' page×locale rows.')
w('')
w(f'**Scope:** {len(rows)} localized pages across 12 locales: {tot["ship"]} to ship, {tot["gated-audio"]} audio pages gated on Q1, {tot["gated-4k"]} 4K explainers gated on Q2. {len(plan["skipped"])} page×locale pairs skipped for lack of local demand or honesty. English stays at the root and is not rewritten.')
w('')
w('## 1. Locales')
w('')
w('x-default is always the English URL of the same page. English keeps `hreflang="en"`, `og:locale en_US`.')
w('')
w('| Locale | hreflang | `<html lang>` | og:locale | dir | Home | Menu label | Register | Headline font | Release | Pages (ship / gated) |')
w('|---|---|---|---|---|---|---|---|---|---|---|')
for l in plan['locales']:
    c = counts[l['code']]
    w(f"| {l['code']} | `{l['hreflang']}` | `{l['htmlLang']}` | `{l['ogLocale']}` | {l['dir']} | `{l['home']}` | {l['endonym']} | {esc(l['register'])} | {esc(l['headlineFont'])} | {l['release']} | {c['ship']} / {c['gated-audio'] + c['gated-4k']} |")
w('')
w('Display line-height (today 0.88–0.9, which clips accents and marks): ' + '; '.join(f"{'Latin locales' if l['code']=='es' else l['code']}: {l['displayLineHeight']}" for l in plan['locales'] if l['code'] in ('es', 'tr', 'vi', 'ru', 'th', 'ar')) + '.')
w('')
w('## 2. Coverage grid')
w('')
w('Slug under `/<locale>/`. `—` = skipped. `(Q1)`/`(Q2)` = built but gated.')
w('')
w('| page | ' + ' | '.join(LOCALES) + ' |')
w('|---|' + '---|' * len(LOCALES))
for pid in PIDS:
    cells = []
    for l in LOCALES:
        r = next((x for x in by_loc[l] if x['pageId'] == pid), None)
        if not r:
            cells.append('—')
        else:
            cells.append(('(home)' if pid == 'home' else r['slug']) + {'ship': '', 'gated-audio': ' (Q1)', 'gated-4k': ' (Q2)'}[r['status']])
    w(f'| {SHORT[pid]} | ' + ' | '.join(cells) + ' |')
w('')
w('Totals: ' + ', '.join(f"{l} {sum(counts[l].values())}" for l in LOCALES) + f' = {len(rows)}.')
w('')
w('## 3. Page × locale matrix')
w('')
w('Title and description lengths are code points after NFC, the way `seo_health_check.py` counts them. P = priority (P1 first). Rows marked * were changed from the research (see §4).')
for l in LOCALES:
    meta = next(x for x in plan['locales'] if x['code'] == l)
    w('')
    w(f"### {l}: {meta['endonym']} (release {meta['release']})")
    w('')
    w('| page | path | P | primary keyword | title (len) | description (len) | H1 |')
    w('|---|---|---|---|---|---|---|')
    order = {'P1': 0, 'P2': 1, 'P3': 2}
    for r in sorted(by_loc[l], key=lambda r: (PIDS.index(r['pageId']))):
        star = '*' if r['changes'] else ''
        w(f"| {SHORT[r['pageId']]}{star}{STATUS_MARK[r['status']]} | `{r['path']}` | {r['priority']} | {esc(r['primaryKeyword'])} | {esc(r['title'])} ({r['titleLength']}) | {esc(r['description'])} ({r['descriptionLength']}) | {esc(r['h1'])} |")
w('')
w('## 4. Cross-check results and fixes')
w('')
w('Checked by `tools/build_plan.py` (re-run: `python3 -I tools/build_plan.py . ../viralnest && python3 -I tools/sections.py .` from this folder; rules in `i18n-plan.json` → `validation.rules`):')
w('')
for rule in plan['validation']['rules']:
    w(f'- {rule}')
w('')
w('**Result: 0 errors after fixes.** Problems found in the research rows (by the script or by review) and fixed in the table below: 8 pages claimed "original" or "full" image size although images are the 1200px public copy (fr image and 4K, it image, ru image, id image, th home, pin and image); 3 pages promised 4K or Full HD in the title or H1 (pt, tr, vi 4K pages; tr also claimed "4K if uploaded in 4K", which the extractor never returns); 1 title carried a hard-coded year (pt how-to); 1 home slug was malformed (de). No duplicate slugs, titles, descriptions, H1s or primary keywords within any locale. No slug collides with an English route, an astro redirect source or a `public/` file, and no locale prefix collides with anything. Every board page uses its glossary term, and no banned glossary variant appears. All 166 rows also pass the repo’s own `seo_health_check.check_html_file` on mock page heads (0 errors, 0 warnings).')
w('')
w('Changes made to the research:')
w('')
w('| locale | page | field | was | now | why |')
w('|---|---|---|---|---|---|')
for c in plan['changesFromResearch']:
    if c['field'] == 'path' and c['old'] is None:
        continue
    w(f"| {c['locale']} | {SHORT[c['pageId']]} | {c['field']} | {esc(c['old'])} | {esc(c['new'])} | {esc(c['reason'])} |")
w('')
w('Also normalized: the Italian research gave bare slugs, so every `it` path is now prefixed with `/it` (12 rows).')
w('')
w('Writer warnings (not in title/description/H1, so not blocking):')
w('')
for x in plan['validation']['warnings']:
    w(f'- {x}')
w('')
w('Planner decisions on page status: `id` story page skipped (format retired, English twin is 38 lines, the other 11 locales skip it); audio pages gated on Q1; 4K explainers gated on Q2. The tr audio row carries the researched no-MP3 fallback (`/tr/pinterest-video-sesi-indir`).')
w('')
w('## 5. Skipped pages')
w('')
skip_by_pid = defaultdict(list)
for s in plan['skipped']:
    skip_by_pid[s['pageId']].append(s['locale'])
w('| page | skipped in | main reason |')
w('|---|---|---|')
REASON = {
    'pinterest-seo-title-generator': '`/api/generate-seo` only writes English; local queries often mean something else (lettering, headboards, board names). de draft kept for later.',
    'pinterest-story-downloader': 'Pinterest folded Idea Pins into regular Pins; "story" queries mean Instagram templates. Becomes an FAQ on video/pin pages.',
    'pinterest-carousel-downloader': 'No local download demand (carousel queries are about making carousels). Folded into pin/image pages.',
    'pinterest-profile-downloader': 'Little or no demand; "profile" queries mostly want the profile picture. FAQ on the board page.',
    'pinterest-4k-downloader': 'No honest page possible or no local-language demand; quality FAQ on the video page.',
    'pinterest-video-downloader-chrome': 'Searchers want an installable extension (ours is a bookmarklet) or the term means something else; becomes a section of the PC guide.',
    'pinterest-audio-downloader': 'Thin or English-only demand, and the MP3 is not real yet.',
    'pinterest-to-mp4': 'Competes with the video page for the same query; MP4 becomes a section there.',
    'pinterest-profile-picture-downloader': 'Local query means profile-picture ideas, not downloading one.',
    'how-to-download-pinterest-video-on-laptop': 'No "laptop" demand; merged into the how-to guide.',
    'download-pinterest-videos-iphone-android': 'Searches do not split by phone; merged into the gallery guide.',
    'how-to-download-pinterest-video-in-gallery': 'Same search as the iPhone/Android page in Thai; merged there.',
}
for pid in PIDS:
    if skip_by_pid.get(pid):
        w(f"| {SHORT[pid]} | {', '.join(sorted(skip_by_pid[pid], key=LOCALES.index))} | {REASON.get(pid, '')} |")
w('')
w('Per-locale reasons are in `i18n-plan.json` → `skipped[]`.')
w('')
w('## 6. Architecture decisions')
w('')
w(ARCH['basis'])
w('')
for k in ('urls', 'hreflang', 'routing', 'routeStatus', 'contentModel', 'breadcrumb', 'jsonLd', 'sitemap', 'templates', 'islands', 'languageSelector', 'rtl'):
    w(f"- **{k}:** {ARCH[k]}")
w(f"- **fonts:** {ARCH['fonts']['principle']} Budgets (KB of headline font per page): " + ', '.join(f'{a} {b}' for a, b in ARCH['fonts']['budgetKB'].items()) + '. ' + ARCH['fonts']['glyphRules'])
w('')
w('**Tests:**')
w('')
for t in ARCH['tests']:
    w(f'- {t}')
w('')
w('## 7. Product issues found while cross-checking')
w('')
w('| id | severity | finding | action |')
w('|---|---|---|---|')
for f in CROSS_FINDINGS:
    w(f"| {f['id']} | {f['severity']} | {esc(f['what'])} | {esc(f['action'])} |")
w('')
w('## 8. Build workflow')
w('')
for ph in WORKFLOW['phases']:
    w(f"### Phase {ph['phase']}: {ph['name']}")
    w('')
    if ph.get('owner'):
        w(f"Owner: {ph['owner']}.")
        w('')
    if ph.get('owns'):
        w('Owns: ' + '; '.join(f'`{o}`' for o in ph['owns']) + '.')
        w('')
    if ph.get('builders'):
        w('| builder | owns | delivers |')
        w('|---|---|---|')
        for b in ph['builders']:
            w(f"| {b['name']} | {esc('; '.join(b['owns']))} | {esc(b['delivers'])} |")
        w('')
        w('Contracts fixed before the builders start: ' + '; '.join(ph['contracts']) + '.')
        w('')
    for key in ('inputs', 'rules', 'steps'):
        if ph.get(key):
            if key != 'steps':
                w(f'{key.capitalize()}:')
                w('')
            for s in ph[key]:
                w(f'- {s}')
            w('')
    if ph.get('order'):
        w(f"Order: {ph['order']}")
        w('')
    if ph.get('done'):
        w(f"Done when: {ph['done']}")
        w('')
w('**Cannibalisation watch list** (check in GSC two weeks after release):')
w('')
for l, items in WORKFLOW['cannibalisationWatch'].items():
    w(f"- {l}: " + '; '.join(items))
w('')
w('## 9. Decisions taken by the planner')
w('')
for d in plan['decisionsTaken']:
    w(f'- {d}')
w('')
w('## 10. Risks')
w('')
for r in RISKS:
    w(f'- {r}')
w('')
w('## 11. Open questions for you')
w('')
for q in QUESTIONS:
    w(f"**{q['id']}. {q['topic']}.** {q['question']}")
    w('')
    w(f"Recommendation: {q['recommendation']}")
    w('')
w('## 12. Headline keywords per locale')
w('')
w('| locale | home | video | image | board | how-to |')
w('|---|---|---|---|---|---|')
for l in LOCALES:
    get = lambda pid: next((r['primaryKeyword'] for r in by_loc[l] if r['pageId'] == pid), '—')
    w(f"| {l} | {esc(get('home'))} | {esc(get('pinterest-video-downloader'))} | {esc(get('pinterest-image-downloader'))} | {esc(get('pinterest-board-downloader'))} | {esc(get('how-to-download-pinterest-videos'))} |")
w('')
open(os.path.join(RES, 'i18n-plan.md'), 'w', encoding='utf-8').write('\n'.join(L))
print('md lines', len(L))
