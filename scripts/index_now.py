#!/usr/bin/env python3
"""
IndexNow API Instant Submitter
Pings Bing, Yandex, Naver, and Seznam with updated sitemap URLs instantly.

Usage:
  python3 scripts/index_now.py
"""

import os
import sys
import json
import xml.etree.ElementTree as ET
import urllib.request
import urllib.parse
import urllib.error

INDEXNOW_KEY = "43a9f021b38e4a99ab60a4f5c9e2b174"
HOST = "pintdownload.app"
INDEXNOW_ENDPOINTS = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
    "https://yandex.com/indexnow"
]

def get_sitemap_urls():
    sitemap_paths = [
        "dist/client/sitemap.xml",
        "dist/sitemap.xml",
        ".vercel/output/static/sitemap.xml",
        "public/sitemap.xml"
    ]
    
    sitemap_path = None
    for p in sitemap_paths:
        if os.path.exists(p):
            sitemap_path = p
            break
            
    if not sitemap_path:
        return ["https://pintdownload.app/"]
        
    urls = []
    try:
        tree = ET.parse(sitemap_path)
        root = tree.getroot()
        namespace = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        
        for url_elem in root.findall("ns:url", namespace):
            loc = url_elem.find("ns:loc", namespace)
            if loc is not None and loc.text:
                urls.append(loc.text.strip())
    except Exception as e:
        print(f"⚠️ Warning: Error parsing sitemap.xml: {e}")
        
    return urls or ["https://pintdownload.app/"]

def submit_index_now():
    urls = get_sitemap_urls()
    print(f"🚀 IndexNow API Pipeline: Submitting {len(urls)} URLs for domain {HOST}...")

    payload = {
        "host": HOST,
        "key": INDEXNOW_KEY,
        "keyLocation": f"https://{HOST}/indexnow-{INDEXNOW_KEY}.txt",
        "urlList": urls
    }

    json_payload = json.dumps(payload).encode("utf-8")
    headers = {"Content-Type": "application/json; charset=utf-8"}

    for endpoint in INDEXNOW_ENDPOINTS:
        try:
            req = urllib.request.Request(endpoint, data=json_payload, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=10) as resp:
                print(f"  ✅ IndexNow pinged {endpoint} successfully (HTTP {resp.status})")
        except urllib.error.HTTPError as e:
            print(f"  ⚠️ HTTP Error for {endpoint}: {e.code} - {e.reason}")
        except urllib.error.URLError as e:
            print(f"  ⚠️ URL Error for {endpoint}: {e.reason}")
        except Exception as e:
            print(f"  ⚠️ Error submitting to {endpoint}: {e}")

    print("🎉 IndexNow instant indexing process finished.")

if __name__ == "__main__":
    submit_index_now()
