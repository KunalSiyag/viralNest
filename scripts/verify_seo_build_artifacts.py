#!/usr/bin/env python3
"""
Verify built HTML/sitemap SEO invariants after `npm run build`.
Exits non-zero if money-page or sitewide SEO invariants fail.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEARCH_DIRS = [
    ROOT / "dist" / "client",
    ROOT / "dist",
    ROOT / ".vercel" / "output" / "static",
]

MONEY = {
    "home": ("index.html", "/"),
    "video": ("pinterest-video-downloader/index.html", "/pinterest-video-downloader"),
    "pin": ("pinterest-pin-downloader/index.html", "/pinterest-pin-downloader"),
    "image": ("pinterest-image-downloader/index.html", "/pinterest-image-downloader"),
    "board": ("pinterest-board-downloader/index.html", "/pinterest-board-downloader"),
    "profile": ("pinterest-profile-downloader/index.html", "/pinterest-profile-downloader"),
    "profile-picture": (
        "pinterest-profile-picture-downloader/index.html",
        "/pinterest-profile-picture-downloader",
    ),
}

INDEXABLE_BLOG = "blog/how-to-download-pinterest-videos-fast-and-easy/index.html"
WEAK_BLOG = "blog/pinterest-for-long-flights-and-layovers/index.html"


def find_out() -> Path:
    for d in SEARCH_DIRS:
        if d.is_dir() and (d / "index.html").exists():
            return d
    raise SystemExit("Build output not found. Run npm run build first.")


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def meta_content(html: str, name: str) -> str | None:
    m = re.search(
        rf'<meta\s+name="{re.escape(name)}"\s+content="([^"]*)"',
        html,
        re.I,
    )
    return m.group(1) if m else None


def title_text(html: str) -> str:
    m = re.search(r"<title>([^<]*)</title>", html, re.I)
    return (m.group(1) if m else "").strip()


def canonical(html: str) -> str | None:
    m = re.search(r'rel="canonical"\s+href="([^"]+)"', html, re.I)
    return m.group(1) if m else None


def hreflangs(html: str) -> set[str]:
    return set(re.findall(r'hreflang="([^"]+)"', html, re.I))


def main() -> int:
    out = find_out()
    errors: list[str] = []
    titles: dict[str, str] = {}
    descs: dict[str, str] = {}

    for key, (rel, path_suffix) in MONEY.items():
        fp = out / rel
        if not fp.exists():
            errors.append(f"missing money page HTML: {rel}")
            continue
        html = read(fp)
        t = title_text(html)
        d = meta_content(html, "description") or ""
        robots = (meta_content(html, "robots") or "").lower()
        can = canonical(html) or ""
        hl = hreflangs(html)

        titles[key] = t
        descs[key] = d

        if not t:
            errors.append(f"{key}: missing title")
        if not d:
            errors.append(f"{key}: missing description")
        if "noindex" in robots:
            errors.append(f"{key}: unexpected noindex ({robots})")
        if "aggregateRating" in html:
            errors.append(f"{key}: fabricated aggregateRating present")
        if re.search(r'name=["\']keywords["\']', html, re.I):
            errors.append(f"{key}: meta keywords present")
        if path_suffix == "/":
            if can.rstrip("/") != "https://pintdownload.app":
                errors.append(f"{key}: bad homepage canonical {can}")
        else:
            expected = f"https://pintdownload.app{path_suffix}"
            if can != expected:
                errors.append(f"{key}: canonical {can!r} != {expected!r}")
            if can.endswith("/") and can != "https://pintdownload.app/":
                errors.append(f"{key}: trailing slash on canonical")
        if hl - {"en", "x-default"}:
            errors.append(f"{key}: unexpected hreflang {hl}")
        if "en" not in hl or "x-default" not in hl:
            errors.append(f"{key}: missing en/x-default hreflang")
        if html.count("<h1") + html.count("<h1 ") < 1 and not re.search(r"<h1[\s>]", html, re.I):
            # soft check — BaseLayout pages should have one h1
            if not re.search(r"<h1[\s>]", html, re.I):
                errors.append(f"{key}: missing h1")
        if "application/ld+json" not in html:
            errors.append(f"{key}: missing JSON-LD")

    # Uniqueness of titles and descriptions across money pages
    title_vals = list(titles.values())
    if len(title_vals) != len(set(title_vals)):
        errors.append(f"duplicate money titles: {titles}")
    desc_vals = list(descs.values())
    if len(desc_vals) != len(set(desc_vals)):
        errors.append(f"duplicate money descriptions: {descs}")

    # Sitemap
    sm_path = out / "sitemap.xml"
    if not sm_path.exists():
        errors.append("sitemap.xml missing from build output")
    else:
        sm = read(sm_path)
        if "rss.xml" in sm:
            errors.append("sitemap must not list rss.xml")
        for _, path_suffix in MONEY.values():
            loc = (
                "https://pintdownload.app/"
                if path_suffix == "/"
                else f"https://pintdownload.app{path_suffix}"
            )
            if f"<loc>{loc}</loc>" not in sm and f"<loc>{loc.rstrip('/')}</loc>" not in sm:
                # homepage loc always with trailing slash in our generator
                if path_suffix == "/" and "<loc>https://pintdownload.app/</loc>" in sm:
                    pass
                else:
                    errors.append(f"sitemap missing {loc}")
        if "/blog/how-to-download-pinterest-videos-fast-and-easy" not in sm:
            errors.append("sitemap missing indexable blog post")
        if "/blog/how-to-download-pinterest-profile-picture" not in sm:
            errors.append("sitemap missing profile-picture guide")
        if "/blog/pinterest-for-long-flights-and-layovers" in sm:
            errors.append("sitemap must not list noindex weak blog post")
        if "/blog/pinterest-fashion-style-trends-guide-2026" in sm:
            errors.append("sitemap must not list noindex fashion post")

    # Blog robots policy
    idx_blog = out / INDEXABLE_BLOG
    weak_blog = out / WEAK_BLOG
    if idx_blog.exists():
        r = (meta_content(read(idx_blog), "robots") or "").lower()
        if "noindex" in r:
            errors.append(f"indexable blog has noindex: {r}")
    else:
        errors.append(f"missing indexable blog html {INDEXABLE_BLOG}")
    if weak_blog.exists():
        r = (meta_content(read(weak_blog), "robots") or "").lower()
        if "noindex" not in r:
            errors.append(f"weak blog missing noindex: {r}")
    else:
        errors.append(f"missing weak blog html {WEAK_BLOG}")

    # Sitewide forbidden meta in all HTML
    for html_file in out.rglob("*.html"):
        text = read(html_file)
        if re.search(r'name=["\']keywords["\']', text, re.I):
            errors.append(f"keywords meta in {html_file.relative_to(out)}")
        if "aggregateRating" in text:
            errors.append(f"aggregateRating in {html_file.relative_to(out)}")

    # Homepage internal links to core tools
    home = read(out / "index.html")
    for href in [
        "/pinterest-video-downloader",
        "/pinterest-pin-downloader",
        "/pinterest-image-downloader",
        "/pinterest-board-downloader",
        "/pinterest-profile-downloader",
        "/pinterest-profile-picture-downloader",
        "/pinterest-gif-downloader",
        "/pinterest-to-mp4",
    ]:
        if f'href="{href}"' not in home:
            errors.append(f"homepage missing crawlable link {href}")

    if errors:
        print("SEO build artifact verification FAILED:")
        for e in errors:
            print(f"  ❌ {e}")
        return 1

    print(f"✅ SEO build artifacts OK under {out}")
    print(f"   Money titles unique: {len(titles)}")
    print(f"   Sitemap + noindex policy verified")
    return 0


if __name__ == "__main__":
    sys.exit(main())
