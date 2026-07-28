# -*- coding: utf-8 -*-
"""通过 Hacker News Algolia API 发现新网站工具。"""
from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Optional
from urllib.parse import urlparse

from discovery_config import REQUEST_DELAY, USER_AGENT

SKIP_DOMAINS = {
    "github.com", "github.io", "twitter.com", "x.com", "reddit.com", "youtube.com",
    "medium.com", "substack.com", "linkedin.com", "facebook.com", "fb.com",
    "chromewebstore.google.com", "chrome.google.com", "apps.apple.com",
    "play.google.com", "news.ycombinator.com", "google.com",
    "mozilla.org", "developer.mozilla.org", "wikipedia.org", "arxiv.org",
    "pathsensitive.com", "christianheilmann.com", "dev.to", "hackernoon.com",
}

# 路径含以下片段的 URL 视为文章而非工具产品
SKIP_PATH_FRAGMENTS = (
    "/blog", "/news", "/article", "/post", "/docs/", "/documentation",
    "/tutorial", "/guide", "/wiki", "/press", "/about",
)


@dataclass
class WebsiteCandidate:
    name: str
    url: str
    description: str
    points: int
    source: str = "hacker_news"


def _fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def is_product_url(url: str) -> bool:
    parsed = urlparse(url)
    host = parsed.netloc.lower().removeprefix("www.")
    path = (parsed.path or "/").lower()
    if host in SKIP_DOMAINS:
        return False
    if any(host.endswith("." + d) for d in SKIP_DOMAINS):
        return False
    if any(frag in path for frag in SKIP_PATH_FRAGMENTS):
        return False
    # 主页或极短路径更可能是产品站
    if path not in ("/", "") and path.count("/") > 2:
        return False
    return True


def extract_urls(text: str) -> list[str]:
    urls = re.findall(r"https?://[\w\-.]+(?:/[\w\-.~/?#%&+=]*)?", text or "")
    clean: list[str] = []
    for u in urls:
        if not is_product_url(u):
            continue
        base = f"{urlparse(u).scheme}://{urlparse(u).netloc}"
        if base not in clean:
            clean.append(base)
    return clean


def search_hn(query: str, min_points: int = 80) -> list[WebsiteCandidate]:
    """在 HN Show HN 发布中搜索新工具产品。"""
    q = urllib.parse.quote(query)
    url = (
        f"https://hn.algolia.com/api/v1/search?query={q}"
        f"&tags=show_hn&hitsPerPage=20"
        f"&numericFilters=points>{min_points}"
    )
    try:
        data = _fetch_json(url)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        print(f"  [HN] 搜索失败 '{query}': {exc}")
        return []

    results: list[WebsiteCandidate] = []
    for hit in data.get("hits", []):
        title = hit.get("title") or ""
        points = int(hit.get("points") or 0)
        story_url = hit.get("url") or ""
        text = hit.get("story_text") or ""
        comment = hit.get("comment_text") or ""

        candidates = []
        if story_url:
            candidates.extend(extract_urls(story_url))
        candidates.extend(extract_urls(text))
        candidates.extend(extract_urls(comment))

        for site_url in candidates[:1]:
            host = urlparse(site_url).netloc.removeprefix("www.")
            # 从 Show HN 标题提取产品名（通常格式 "Show HN: ProductName – tagline"）
            name = title
            show_hn = re.match(r"^Show HN:\s*(.+?)(?:\s*[-–—|:]|$)", title, re.I)
            if show_hn:
                name = show_hn.group(1).strip()
            elif len(title) > 50:
                name = host.split(".")[0].title()
            results.append(WebsiteCandidate(
                name=name,
                url=site_url,
                description=title[:200],
                points=points,
            ))
    return results


def discover_websites(queries: list[str], known_domains: set[str]) -> list[WebsiteCandidate]:
    found: dict[str, WebsiteCandidate] = {}
    for query in queries:
        print(f"  [HN] 搜索: {query}")
        for cand in search_hn(query):
            domain = urlparse(cand.url).netloc.lower().removeprefix("www.")
            if domain in known_domains or domain in found:
                continue
            found[domain] = cand
        time.sleep(REQUEST_DELAY)
    return sorted(found.values(), key=lambda c: c.points, reverse=True)


def slug_from_url(url: str) -> str:
    host = urlparse(url).netloc.lower().removeprefix("www.")
    slug = re.sub(r"[^a-z0-9]+", "_", host.split(".")[0])
    return slug or "site"


def candidate_to_record(cand: WebsiteCandidate, categories: list[str]) -> dict:
    domain = urlparse(cand.url).netloc.removeprefix("www.")
    return {
        "id": f"w_{slug_from_url(cand.url)}",
        "name": cand.name,
        "type": "website",
        "category": categories,
        "icon": f"https://www.google.com/s2/favicons?sz=128&domain={domain}",
        "desc": cand.description or f"{cand.name} — 社区热议工具（HN {cand.points} 分）",
        "rating": "4.5",
        "users": f"HN {cand.points}+",
        "review": "",
        "url": cand.url,
        "auto_added": True,
        "discovered_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).strftime("%Y-%m-%d"),
        "source": cand.source,
    }
