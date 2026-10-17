#!/usr/bin/env python3
"""
Post-build checks for the localized pages (docs/i18n/architecture.md §13.3).

Reads dist/.i18n-routes.json (written by the pintdownload-i18n integration in
astro.config.mjs from src/i18n/routes.ts) so nothing here re-implements the
route map. Run after `npm run build` (wired into `npm run test:seo-build`).

Checks, for every routed page and every localized HTML file:
  1  <html lang> = LOCALE_META.htmlLang; dir="rtl" iff the path is under /ar
  2  canonical is self; hreflang <link>s equal the route map cluster
  3  reciprocity: each alternate exists, is indexable and lists the same set
  4  no alternate points at noindex, a redirect source or a missing page
  5  og:locale (+ og:locale:alternate), JSON-LD inLanguage, breadcrumb root
  6  internal links stay in-locale (or are marked hreflang="en", or assets)
  7  English leftovers in visible text (errors for released locales, else warnings)
  8  dist/<loc>/404.html exists, noindex, right language; dist/<loc>/404/ absent
  9  sitemap: xhtml namespace, each localized URL once, xhtml set = HTML set,
     lastmod = content dateModified
 10  island bundle isolation: no locale catalog string in dist/_astro/*.js
 11  /de pages render no ad slot or ad script (user decision 4)
Exit 1 on any error.
"""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist"
SITE = "https://pintdownload.app"

errors: list[str] = []
warnings: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)


def warn(msg: str) -> None:
    warnings.append(msg)


class Page(HTMLParser):
    """Collects head links/meta, JSON-LD, anchors and visible text (with exclusions)."""

    SKIP_TAGS = {"script", "style", "code", "kbd", "bdi", "noscript", "template", "svg"}
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.html_lang = None
        self.html_dir = None
        self.canonical = None
        self.alternates: list[tuple[str, str]] = []
        self.og_locale = None
        self.og_alternates: list[str] = []
        self.robots = ""
        self.title = ""
        self._in_title = False
        self.jsonld: list[str] = []
        self._in_jsonld = False
        self._buf = ""
        self.anchors: list[dict] = []
        self.text: list[str] = []
        self._stack: list[tuple[str, bool]] = []  # (tag, skip)
        self.ad = False

    def _skipping(self) -> bool:
        return any(skip for _, skip in self._stack)

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        if tag == "html":
            self.html_lang = a.get("lang")
            self.html_dir = a.get("dir")
        elif tag == "link":
            rel = a.get("rel", "").lower()
            if rel == "canonical":
                self.canonical = a.get("href")
            elif rel == "alternate" and a.get("hreflang"):
                self.alternates.append((a["hreflang"], a.get("href", "")))
        elif tag == "meta":
            prop = a.get("property", "")
            if prop == "og:locale":
                self.og_locale = a.get("content")
            elif prop == "og:locale:alternate":
                self.og_alternates.append(a.get("content", ""))
            if a.get("name", "").lower() == "robots":
                self.robots = a.get("content", "").lower()
        elif tag == "title":
            self._in_title = True
        elif tag == "script" and a.get("type") == "application/ld+json":
            self._in_jsonld = True
            self._buf = ""
        elif tag == "a":
            self.anchors.append(a)
        if "adsbygoogle" in a.get("class", "") or "googlesyndication" in a.get("src", ""):
            self.ad = True
        if tag in self.VOID:
            return
        skip = (
            tag in self.SKIP_TAGS
            or a.get("translate") == "no"
            or (a.get("lang", "").startswith("en"))
            or "data-lang-menu" in a
            or "sr-only" in a.get("class", "").split()
            or tag == "astro-island"  # islands: checked through their catalogs
        )
        self._stack.append((tag, skip))

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        if tag == "script" and self._in_jsonld:
            self.jsonld.append(self._buf)
            self._in_jsonld = False
        for i in range(len(self._stack) - 1, -1, -1):
            if self._stack[i][0] == tag:
                del self._stack[i:]
                break

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_jsonld:
            self._buf += data
            return
        if not self._skipping() and data.strip():
            self.text.append(data.strip())


def parse(fp: Path) -> Page:
    p = Page()
    p.feed(fp.read_text(encoding="utf-8"))
    return p


def html_for(path: str) -> Path:
    return OUT / "index.html" if path == "/" else OUT / path.lstrip("/") / "index.html"


def main() -> int:
    routes_fp = OUT / ".i18n-routes.json"
    if not routes_fp.exists():
        print("❌ dist/.i18n-routes.json missing: run npm run build")
        return 1
    routes = json.loads(routes_fp.read_text(encoding="utf-8"))
    locales: dict = routes["locales"]
    pages: dict = routes["pages"]
    routed = [c for c, m in locales.items() if c != "en" and m["routed"]]
    redirect_sources = set()
    redirects_fp = OUT / "_redirects"
    if redirects_fp.exists():
        for line in redirects_fp.read_text(encoding="utf-8").splitlines():
            if line.strip() and not line.startswith("#"):
                redirect_sources.add(line.split()[0].rstrip("/"))

    parsed: dict[str, Page] = {}
    for path in pages:
        fp = html_for(path)
        if not fp.exists():
            err(f"{path}: routed page missing from dist")
            continue
        parsed[path] = parse(fp)

    english_sentences: dict[str, set[str]] = {}

    def sentences(texts: list[str]) -> set[str]:
        out = set()
        for t in texts:
            for s in re.split(r"(?<=[.!?])\s+", t):
                if len(s) >= 40:
                    out.add(s.strip())
        return out

    for path, info in pages.items():
        if info["locale"] == "en" and path in parsed:
            english_sentences[info["pageId"]] = sentences(parsed[path].text)

    ENGLISH_BIGRAMS = re.compile(
        r"\b(the|and|your|you can|click|download the|paste the|copy the|this page|how to|for free|"
        r"no login|works with|public pins?|board link|profile link|is not|does not|we do not|"
        r"save the|open the|tap the|of the|in the|to the|with the|from the)\b",
        re.I,
    )
    ALLOW = re.compile(
        r"Pinterest|PintDownload|MP4|MP3|GIF|ZIP|JPG|PNG|pin\.it|iPhone|iPad|Android|Chrome|Safari|Edge|"
        r"Windows|Mac|Chromebook|CapCut|Samsung Internet|Google Fotos|Google Photos|Reels|TikTok|YouTube|HD|"
        r"bookmarklet|Ctrl\+Shift\+B|Cmd\+Shift\+B|\d+p",
    )

    for path, info in pages.items():
        loc = info["locale"]
        page = parsed.get(path)
        if not page:
            continue
        meta = locales[loc]
        url = SITE + ("/" if path == "/" else path)
        tag = f"{path}"
        expected = [(a["hreflang"], a["href"]) for a in info["alternates"]]
        # 1
        if page.html_lang != meta["htmlLang"]:
            err(f"{tag}: <html lang={page.html_lang!r}> != {meta['htmlLang']!r}")
        is_ar = path == "/ar" or path.startswith("/ar/")
        if (page.html_dir == "rtl") != is_ar:
            err(f"{tag}: dir={page.html_dir!r} (rtl iff /ar)")
        # 2
        if page.canonical != url:
            err(f"{tag}: canonical {page.canonical!r} != self {url!r}")
        if page.alternates != expected:
            err(f"{tag}: hreflang links differ from the route map\n      have {page.alternates}\n      want {expected}")
        # 3 + 4
        for hl, href in expected:
            target = href.replace(SITE, "") or "/"
            target = target if target == "/" else target.rstrip("/")
            other = parsed.get(target)
            if target in redirect_sources:
                err(f"{tag}: alternate {hl} -> {href} is a redirect source")
            if not other:
                err(f"{tag}: alternate {hl} -> {href} has no page in dist")
                continue
            if "noindex" in other.robots:
                err(f"{tag}: alternate {hl} -> {href} is noindex")
            if other.alternates != expected:
                err(f"{tag}: alternate {href} lists a different cluster (not reciprocal)")
        if loc == "en":
            continue
        # 5
        if page.og_locale != meta["ogLocale"]:
            err(f"{tag}: og:locale {page.og_locale!r} != {meta['ogLocale']!r}")
        want_og = sorted(locales[h if h in locales else "en"]["ogLocale"] for h, _ in expected if h not in ("x-default", meta["hreflang"]))
        if sorted(page.og_alternates) != want_og:
            err(f"{tag}: og:locale:alternate {sorted(page.og_alternates)} != {want_og}")
        types_seen = set()
        for raw in page.jsonld:
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                err(f"{tag}: invalid JSON-LD")
                continue
            t = data.get("@type")
            types_seen.add(t)
            if t in ("WebPage", "SoftwareApplication", "HowTo", "FAQPage", "Article") and data.get("inLanguage") != meta["htmlLang"]:
                err(f"{tag}: JSON-LD {t} inLanguage {data.get('inLanguage')!r} != {meta['htmlLang']!r}")
            if t == "BreadcrumbList":
                root = data["itemListElement"][0]
                if root.get("item") != f"{SITE}/{loc}" or root.get("name") != meta["homeLabel"]:
                    err(f"{tag}: breadcrumb root {root} is not the locale home")
            if t == "WebSite":
                err(f"{tag}: WebSite/SearchAction on a localized page")
            if "aggregateRating" in raw:
                err(f"{tag}: aggregateRating in JSON-LD")
        for t in ("Organization", "BreadcrumbList", "WebPage", "SoftwareApplication", "HowTo", "FAQPage"):
            if t not in types_seen:
                err(f"{tag}: JSON-LD {t} missing")
        # 6
        for a in page.anchors:
            href = a.get("href", "")
            if not href.startswith("/") or href.startswith("//"):
                continue
            if re.match(r"^/(_astro|images|fonts|favicon|manifest\.json|opensearch\.xml|rss\.xml|sitemap\.xml)", href):
                continue
            first = href.split("/")[1].split("?")[0].split("#")[0]
            if first == loc or href == f"/{loc}":
                continue
            if a.get("hreflang") == "en" or a.get("lang", "").startswith("en"):
                continue
            if "lang" in a and a.get("lang") != meta["htmlLang"]:
                continue  # language menu: link to another language, marked with its lang
            err(f"{tag}: internal link {href!r} leaves the locale without hreflang=\"en\"")
        # 7
        leftovers = []
        for t in page.text:
            cleaned = ALLOW.sub(" ", t)
            if ENGLISH_BIGRAMS.search(cleaned) and not (loc == "id" and re.fullmatch(r"(?i).*\bdownload\b.*", t) and not re.search(r"(?i)\b(the|and|your)\b", cleaned)):
                leftovers.append(t)
        twin = english_sentences.get(info["pageId"], set())
        same = sentences(page.text) & twin
        level = err if locales[loc]["live"] else warn
        for t in leftovers[:5]:
            level(f"{tag}: English leftover? {t[:90]!r}")
        for s in list(same)[:5]:
            level(f"{tag}: sentence identical to the English page: {s[:90]!r}")
        # 11
        if loc == "de" and page.ad:
            err(f"{tag}: ad slot or ad script on a /de page")

    # 8
    for loc in routed:
        fp = OUT / loc / "404.html"
        if (OUT / loc / "404").exists():
            err(f"/{loc}/404/ directory still exists (rename hook did not run)")
        if not fp.exists():
            err(f"/{loc}/404.html missing")
            continue
        p = parse(fp)
        if "noindex" not in p.robots:
            err(f"/{loc}/404.html is not noindex")
        if p.html_lang != locales[loc]["htmlLang"]:
            err(f"/{loc}/404.html lang {p.html_lang!r}")
        if p.alternates or p.canonical:
            err(f"/{loc}/404.html carries canonical/hreflang")

    # 9
    sm_fp = OUT / "sitemap.xml"
    if not sm_fp.exists():
        err("sitemap.xml missing")
    else:
        sm = sm_fp.read_text(encoding="utf-8")
        if 'xmlns:xhtml="http://www.w3.org/1999/xhtml"' not in sm:
            err("sitemap.xml lacks the xhtml namespace")
        blocks = re.findall(r"<url>(.*?)</url>", sm, re.S)
        by_loc: dict[str, list[str]] = {}
        for b in blocks:
            m = re.search(r"<loc>([^<]+)</loc>", b)
            if m:
                by_loc.setdefault(m.group(1), []).append(b)
        for path, info in pages.items():
            url = SITE + ("/" if path == "/" else path)
            found = by_loc.get(url, [])
            if info["locale"] != "en" and len(found) != 1:
                err(f"sitemap: {url} listed {len(found)} times")
                continue
            if not found:
                continue
            links = re.findall(r'<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/>', found[0])
            want = [(a["hreflang"], a["href"]) for a in info["alternates"]]
            if len(want) > 2 or info["locale"] != "en":
                if links != want:
                    err(f"sitemap: {url} xhtml set differs from the HTML cluster")
            if info["locale"] != "en":
                content = ROOT / "src/content/i18n" / info["locale"] / f"{info['pageId']}.json"
                lastmod = re.search(r"<lastmod>([^<]+)</lastmod>", found[0])
                if content.exists():
                    dm = json.loads(content.read_text(encoding="utf-8")).get("dateModified")
                    if not lastmod or lastmod.group(1) != dm:
                        err(f"sitemap: {url} lastmod {lastmod and lastmod.group(1)!r} != content dateModified {dm!r}")

    # 10
    js = "\n".join(p.read_text(encoding="utf-8", errors="replace") for p in (OUT / "_astro").glob("*.js"))
    en_strings = set()
    en_text = ""
    for f in (ROOT / "src/i18n/ui/en.ts", ROOT / "src/i18n/island/en.ts"):
        if f.exists():
            en_text += f.read_text(encoding="utf-8")
            en_strings |= set(re.findall(r"'((?:[^'\\]|\\.){12,})'", en_text))
    checked = 0
    for kind in ("ui", "island"):
        for f in sorted((ROOT / "src/i18n" / kind).glob("[a-z][a-z].ts")):
            if f.stem == "en":
                continue
            for s in set(re.findall(r"'((?:[^'\\]|\\.){16,})'", f.read_text(encoding="utf-8"))) - en_strings:
                # Same text as (part of) an English value ships with English anyway:
                # 'pinterest.com/username/' sits inside the English placeholder.
                if s in en_text:
                    continue
                checked += 1
                if s in js:
                    err(f"bundle isolation: {f.relative_to(ROOT)} string {s[:50]!r} is in dist/_astro/*.js")

    for w in warnings:
        print(f"  ⚠️  {w}")
    if errors:
        print("i18n build verification FAILED:")
        for e in errors:
            print(f"  ❌ {e}")
        return 1
    n_local = sum(1 for i in pages.values() if i["locale"] != "en")
    print(f"✅ i18n build OK: {len(pages)} routed pages ({n_local} localized, locales routed: {', '.join(routed) or 'none'}), "
          f"{checked} catalog strings absent from client JS, {len(warnings)} warning(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
