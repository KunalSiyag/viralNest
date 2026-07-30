#!/usr/bin/env python3
"""
SEO Health Check Script
Parses generated HTML files in build output (dist/client, dist, or .vercel/output/static)
and verifies SEO parameters per the Reusable Master SEO & Ranking Playbook.
"""

import sys
import os
import glob
from html.parser import HTMLParser

class SEOParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title_text = ""
        self.in_title = False
        self.meta_description = None
        self.meta_robots = None
        self.canonical_url = None
        self.json_ld_count = 0
        self.h1_count = 0
        self.in_script_json_ld = False
        self.imgs_without_alt = []
        self.imgs_total = 0

    def handle_starttag(self, tag, attrs):
        attrs_dict = {k.lower(): (v or "") for k, v in attrs}

        if tag == "title":
            self.in_title = True

        elif tag == "meta":
            name = attrs_dict.get("name", "").lower()
            if name == "description":
                self.meta_description = attrs_dict.get("content", "")
            elif name == "robots":
                self.meta_robots = attrs_dict.get("content", "")

        elif tag == "link":
            rel = attrs_dict.get("rel", "").lower()
            if rel == "canonical":
                self.canonical_url = attrs_dict.get("href", "")

        elif tag == "script":
            stype = attrs_dict.get("type", "").lower()
            if stype == "application/ld+json":
                self.json_ld_count += 1

        elif tag == "h1":
            self.h1_count += 1

        elif tag == "img":
            self.imgs_total += 1
            alt = attrs_dict.get("alt")
            src = attrs_dict.get("src", "unknown")
            if alt is None or alt.strip() == "":
                self.imgs_without_alt.append(src)

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title_text += data

def check_html_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    parser = SEOParser()
    parser.feed(content)

    title = parser.title_text.strip()
    description = (parser.meta_description or "").strip()
    robots = (parser.meta_robots or "").strip().lower()
    canonical = parser.canonical_url
    json_ld_count = parser.json_ld_count
    h1_count = parser.h1_count
    imgs_without_alt = parser.imgs_without_alt

    is_noindex = "noindex" in robots

    errors = []
    warnings = []

    # Utility pages (404, 500, embed) should have noindex
    filename = os.path.basename(file_path)
    rel_path = file_path

    # Check Title length
    # Length Constraint: 30 to 65 characters (Optimal: ~50–55 chars)
    t_len = len(title)
    if not title:
        errors.append("Missing <title> tag")
    elif not is_noindex:
        if t_len < 30 or t_len > 65:
            errors.append(f"Title length ({t_len} chars) out of range 30-65 chars: '{title}'")
        elif t_len < 40 or t_len > 62:
            warnings.append(f"Title length ({t_len} chars) outside optimal range 40-62 chars: '{title}'")

    # Check Meta Description
    # Length Constraint: 110 to 160 characters (Optimal: ~140–155 chars)
    d_len = len(description)
    if not description and not is_noindex:
        errors.append("Missing meta description")
    elif not is_noindex:
        if d_len < 110 or d_len > 160:
            errors.append(f"Description length ({d_len} chars) out of range 110-160 chars")
        elif d_len < 120 or d_len > 158:
            warnings.append(f"Description length ({d_len} chars) outside optimal range 120-158 chars")

    # Check Canonical Link
    if not canonical and not is_noindex:
        errors.append("Missing <link rel='canonical'>")

    # Check JSON-LD Structured Data
    if json_ld_count == 0 and not is_noindex:
        errors.append("Missing JSON-LD structured data script")

    # Check Heading Hierarchy (Exactly 1 <h1> for indexable pages)
    if not is_noindex:
        if h1_count == 0:
            errors.append("Missing <h1> tag on page")
        elif h1_count > 1:
            errors.append(f"Multiple ({h1_count}) <h1> tags found on page")

    # Check Image Alt attributes
    if imgs_without_alt:
        errors.append(f"{len(imgs_without_alt)} <img> tags missing non-empty alt text: {imgs_without_alt[:3]}")

    return errors, warnings

def main():
    search_dirs = ["dist/client", "dist", ".vercel/output/static"]
    target_dir = None

    for d in search_dirs:
        if os.path.exists(d) and os.path.isdir(d):
            target_dir = d
            break

    if not target_dir:
        print("❌ Error: Build output directory not found! Run 'npm run build' first.")
        sys.exit(1)

    print(f"🔍 Running SEO Health Check on output directory: {target_dir}")

    html_files = []
    for root, _, files in os.walk(target_dir):
        for file in files:
            if file.endswith(".html"):
                html_files.append(os.path.join(root, file))

    if not html_files:
        print("❌ Error: No HTML files found to audit.")
        sys.exit(1)

    total_files = len(html_files)
    total_errors = 0
    total_warnings = 0

    print(f"Found {total_files} HTML files to inspect...\n" + "-" * 60)

    for file_path in sorted(html_files):
        rel_path = os.path.relpath(file_path, target_dir)
        errors, warnings = check_html_file(file_path)

        if errors or warnings:
            print(f"📄 {rel_path}:")
            for err in errors:
                print(f"  ❌ ERROR: {err}")
                total_errors += 1
            for warn in warnings:
                print(f"  ⚠️  WARN:  {warn}")
                total_warnings += 1

    print("-" * 60)
    print(f"SEO Health Check Summary: {total_files} files scanned | {total_errors} Errors | {total_warnings} Warnings")

    if total_errors > 0:
        print("❌ SEO Health Check FAILED! Fix all errors above.")
        sys.exit(1)

    print("✅ SEO Health Check PASSED! 0 Errors.")
    sys.exit(0)

if __name__ == "__main__":
    main()
