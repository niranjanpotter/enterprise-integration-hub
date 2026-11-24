#!/usr/bin/env python3
"""
Automatically scans D:/enterprise-integration-hub for all public .html pages,
regenerates sitemap.xml with today's <lastmod> date, commits & pushes to GitHub/Cloudflare
if changed, verifies HTTP 200 status for all URLs, and submits all URLs to IndexNow.
"""
import datetime
import glob
import json
import os
import subprocess
import urllib.error
import urllib.request

REPO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_URL = "https://niranjanpotter.dpdns.org"
INDEXNOW_KEY = "e7a9c4b2f1d84e6093a5b7c8d1e2f3a4"
TODAY = datetime.date.today().isoformat()


def discover_html_pages():
    pages = []
    for path in sorted(glob.glob(os.path.join(REPO_DIR, "*.html"))):
        fname = os.path.basename(path)
        if fname.startswith("backup-") or fname.startswith("404"):
            continue
        if fname == "index.html":
            continue
        pages.append(fname)
    return pages


def build_sitemap_xml(pages):
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        "  <url>",
        f"    <loc>{BASE_URL}/</loc>",
        f"    <lastmod>{TODAY}</lastmod>",
        "    <changefreq>daily</changefreq>",
        "    <priority>1.0</priority>",
        "  </url>",
    ]
    for fname in pages:
        prio = "0.95" if "auto-json-to-dataweave" in fname else "0.9"
        lines.extend([
            "  <url>",
            f"    <loc>{BASE_URL}/{fname}</loc>",
            f"    <lastmod>{TODAY}</lastmod>",
            "    <changefreq>weekly</changefreq>",
            f"    <priority>{prio}</priority>",
            "  </url>",
        ])
    lines.append("</urlset>\n")
    return "\n".join(lines)


def git_commit_and_push_if_changed():
    subprocess.run(["git", "add", "sitemap.xml"], cwd=REPO_DIR, check=False)
    diff = subprocess.run(["git", " status", "--porcelain", "sitemap.xml"], cwd=REPO_DIR, capture_output=True, text=True)
    status = subprocess.run(["git", "status", "--porcelain", "sitemap.xml"], cwd=REPO_DIR, capture_output=True, text=True)
    if status.stdout.strip():
        subprocess.run(["git", "commit", "-m", f"chore(sitemap): auto-update sitemap.xml ({TODAY})"], cwd=REPO_DIR, check=False)
        subprocess.run(["git", "push", "origin", "main"], cwd=REPO_DIR, check=False)
        print(f"[GIT] Committed and pushed updated sitemap.xml ({TODAY})")
    else:
        print(f"[GIT] sitemap.xml already up to date for {TODAY}")


def submit_indexnow(url_list):
    payload = {
        "host": "niranjanpotter.dpdns.org",
        "key": INDEXNOW_KEY,
        "keyLocation": f"{BASE_URL}/{INDEXNOW_KEY}.txt",
        "urlList": url_list,
    }
    data = json.dumps(payload).encode("utf-8")
    for endpoint in ["https://api.indexnow.org/IndexNow", "https://www.bing.com/indexnow", "https://yandex.com/indexnow"]:
        try:
            req = urllib.request.Request(
                endpoint,
                data=data,
                headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": "EnterpriseIntegrationHub-AutoSitemap/1.0"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=15) as r:
                print(f"[INDEXNOW] {endpoint} -> HTTP {r.status}")
        except urllib.error.HTTPError as he:
            print(f"[INDEXNOW] {endpoint} -> HTTP {he.code}")
        except Exception as ex:
            print(f"[INDEXNOW] {endpoint} -> ERR {ex}")


def verify_live_urls(url_list):
    ok = 0
    for u in url_list:
        try:
            req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10) as r:
                if r.status == 200:
                    ok += 1
        except Exception as ex:
            print(f"[VERIFY] FAIL {u}: {ex}")
    print(f"[VERIFY] {ok}/{len(url_list)} URLs returned HTTP 200 live")


def main():
    pages = discover_html_pages()
    xml_content = build_sitemap_xml(pages)
    sitemap_path = os.path.join(REPO_DIR, "sitemap.xml")
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write(xml_content)
    url_list = [f"{BASE_URL}/"] + [f"{BASE_URL}/{p}" for p in pages]
    print(f"[SITEMAP] Generated {len(url_list)} URLs in sitemap.xml with lastmod={TODAY}")
    git_commit_and_push_if_changed()
    verify_live_urls(url_list)
    submit_indexnow(url_list)


if __name__ == "__main__":
    main()
