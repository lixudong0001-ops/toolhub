# -*- coding: utf-8 -*-
"""Chrome Web Store 搜索与详情解析。"""
from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Optional

from discovery_config import REQUEST_DELAY, USER_AGENT


@dataclass
class ExtensionInfo:
    ext_id: str
    name: str
    description: str
    icon: str
    rating: float
    rating_count: int
    users_text: str
    store_url: str
    developer: str = ""


def _fetch(url: str, timeout: int = 20) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="ignore")


def search_extension_ids(query: str, limit: int = 12) -> list[str]:
    """从 Chrome 商店搜索结果页提取扩展 ID。"""
    q = urllib.parse.quote(query)
    url = f"https://chromewebstore.google.com/search/{q}?hl=en"
    try:
        html = _fetch(url)
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"  [CWS] 搜索失败 '{query}': {exc}")
        return []

    ids = re.findall(r"/detail/[^/\"']+/([a-z]{32})", html)
    seen: list[str] = []
    for ext_id in ids:
        if ext_id not in seen:
            seen.append(ext_id)
        if len(seen) >= limit:
            break
    return seen


def parse_user_count(text: str) -> int:
    if not text:
        return 0
    s = text.replace(",", "").strip().lower()
    m = re.search(r"([\d.]+)", s)
    if not m:
        return 0
    val = float(m.group(1))
    if "万" in s:
        return int(val * 10_000)
    if "m" in s or "million" in s:
        return int(val * 1_000_000)
    if "k" in s:
        return int(val * 1_000)
    return int(val)


def format_count(n: int) -> str:
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 10_000:
        return f"{n / 10_000:.1f}万"
    if n >= 1_000:
        return f"{n / 1_000:.1f}k"
    return str(n)


def fetch_extension(ext_id: str) -> Optional[ExtensionInfo]:
    """抓取单个扩展详情（JSON-LD + meta 回退）。"""
    url = f"https://chromewebstore.google.com/detail/_/{ext_id}?hl=en"
    try:
        html = _fetch(url)
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"  [CWS] 详情失败 {ext_id}: {exc}")
        return None

    name = ""
    description = ""
    rating = 0.0
    rating_count = 0
    icon = ""
    users_text = ""
    developer = ""

    json_ld = re.search(
        r'<script type="application/ld\+json"[^>]*>([\s\S]*?)</script>',
        html,
        re.I,
    )
    if json_ld:
        try:
            data = json.loads(json_ld.group(1))
            name = data.get("name") or name
            description = data.get("description") or description
            agg = data.get("aggregateRating") or {}
            rating = float(agg.get("ratingValue") or 0)
            rating_count = int(agg.get("ratingCount") or 0)
        except (json.JSONDecodeError, ValueError, TypeError):
            pass

    og_image = re.search(r'<meta property="og:image" content="([^"]+)"', html)
    if og_image:
        icon = og_image.group(1)

    og_desc = re.search(
        r'<meta (?:name="description"|property="og:description") content="([^"]+)"',
        html,
        re.I,
    )
    if og_desc and not description:
        description = og_desc.group(1)

    users_match = re.search(r"(\d[\d,]+\+?\s*(?:users?|用户))", html, re.I)
    if users_match:
        users_text = users_match.group(1)

    author_match = re.search(r'"author"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"', html)
    if author_match:
        developer = author_match.group(1)

    if not name:
        title_match = re.search(r"<title>([^<]+)</title>", html)
        if title_match:
            name = title_match.group(1).split(" - ")[0].strip()

    if not name:
        return None

    return ExtensionInfo(
        ext_id=ext_id,
        name=name,
        description=description.strip(),
        icon=icon,
        rating=rating,
        rating_count=rating_count,
        users_text=users_text,
        store_url=url.replace("/_/", f"/{slugify(name)}/"),
        developer=developer,
    )


def slugify(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:60] or "extension"


def discover_extensions(
    queries: list[str],
    known_ids: set[str],
    per_query_limit: int = 12,
) -> list[ExtensionInfo]:
    """按搜索词发现新扩展，跳过已知 ID。"""
    found: dict[str, ExtensionInfo] = {}
    for query in queries:
        print(f"  [CWS] 搜索: {query}")
        ids = search_extension_ids(query, limit=per_query_limit)
        for ext_id in ids:
            if ext_id in known_ids or ext_id in found:
                continue
            info = fetch_extension(ext_id)
            time.sleep(REQUEST_DELAY)
            if info:
                found[ext_id] = info
        time.sleep(REQUEST_DELAY)
    return list(found.values())
