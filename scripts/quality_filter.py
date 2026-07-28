# -*- coding: utf-8 -*-
"""自动发现内容的质量过滤规则。"""
from __future__ import annotations

import re
from urllib.parse import urlparse

from discovery_config import PROFESSION_KEYWORDS

# HN 热度门槛（Show HN）
MIN_HN_POINTS = 150

# 标题/描述含以下词 → 直接拒绝（游戏、个人项目、硬件、娱乐等）
REJECT_PHRASES = (
    "puzzle game", "logic puzzle", "2048", "doomscroll", "social media app",
    "only open for 3 hours", "personal blog", "frontpage for personal blogs",
    "my ai native resume", "native resume", "tech support time",
    "family and friends", "turned 10 this year", "new type of puzzle",
    "wikipedia as a", "google trends for hacker news",
    "indexing 18 years of comments", "ambient noise",
    "dub tool i made to watch", "7-year-old", "7 year old",
    "vr headset", "simula one", "open-source crm for families",
    "non-linear", "yamanote.fun", "dogbunnypuzzle", "figure.game",
    "play2048", "xikipedia", "seven39", "shop.simulavr",
    "hackernewstrends", "blogosphere", "grammable.me",
)

# 域名黑名单（个人站、Subdomain 工具站等）
REJECT_DOMAINS = {
    "dialup.net", "jakegaylor.com", "attejuvonen.fi", "blogosphere.app",
    "dogbunnypuzzle.com", "figure.game", "play2048.co", "xikipedia.org",
    "seven39.com", "yamanote.fun", "hackernewstrends.com", "text.blogosphere.app",
    "itsupport.grammable.me", "shop.simulavr.com",
}

# 拒绝的顶级域名
REJECT_TLD_SUFFIXES = (".fun", ".game")

# 工具型产品信号词（至少命中 1 个）
TOOL_SIGNALS = (
    "tool", "tools", "app", "apps", "platform", "software", "saas",
    "editor", "manager", "assistant", "workspace", "dashboard",
    "automation", "productivity", "analytics", "collaboration",
    "design", "writing", "translation", "note", "document", "database",
    "hosting", "deploy", "developer", "code", "api", "crm", "seo",
    "marketing", "research", "citation", "learning", "study",
    "meeting", "calendar", "workflow", "cloud", "ai", "gpt",
)

# 标题像「个人 side project」且缺少工具信号
PERSONAL_TITLE_RE = re.compile(
    r"^(show hn:\s*)?(i (built|made|spent|created|may have)|my )",
    re.I,
)

GENERIC_NAMES = {"gpt", "ai", "app", "tool", "refine", "bento"}


def _text_blob(*parts: str) -> str:
    return " ".join(p for p in parts if p).lower()


def clean_product_name(raw: str, url: str = "") -> str:
    """从 Show HN 标题提取可读产品名。"""
    name = raw.strip()
    name = re.sub(r"^Show HN:\s*", "", name, flags=re.I)
    # 截断 tagline
    for sep in (" – ", " — ", " - ", " | ", ": "):
        if sep in name and len(name.split(sep)[0]) >= 3:
            name = name.split(sep)[0].strip()
            break
    if PERSONAL_TITLE_RE.match(name) and url:
        host = urlparse(url).netloc.removeprefix("www.")
        brand = host.split(".")[0]
        if brand and brand not in ("www", "com", "io", "app"):
            name = brand.replace("-", " ").title()
    if len(name) > 55:
        name = name[:52].rstrip() + "…"
    return name or "Unknown"


def profession_match_score(text: str, profession: str) -> int:
    keywords = PROFESSION_KEYWORDS.get(profession, [])
    lower = text.lower()
    return sum(1 for kw in keywords if kw in lower)


def passes_website_candidate(
    name: str,
    url: str,
    description: str,
    points: int,
    profession: str,
) -> tuple[bool, str]:
    """判断 HN 候选是否值得入库。返回 (通过, 原因)。"""
    domain = urlparse(url).netloc.lower().removeprefix("www.")
    blob = _text_blob(name, description, url, domain)

    if points < MIN_HN_POINTS:
        return False, f"HN 分数不足 ({points} < {MIN_HN_POINTS})"

    if domain in REJECT_DOMAINS:
        return False, f"域名黑名单: {domain}"

    if any(domain.endswith(s) for s in REJECT_TLD_SUFFIXES):
        return False, f"娱乐类域名: {domain}"

    if any(p in blob for p in REJECT_PHRASES):
        return False, "命中拒绝关键词"

    prof_score = profession_match_score(blob, profession)
    tool_hits = sum(1 for s in TOOL_SIGNALS if s in blob)

    if prof_score == 0:
        return False, f"与「{profession}」领域不匹配"

    if tool_hits == 0 and prof_score < 2:
        return False, "缺少工具型产品特征"

    clean_name = clean_product_name(name, url)
    if clean_name.lower() in GENERIC_NAMES and prof_score < 2:
        return False, f"名称过于泛化: {clean_name}"

    if len(clean_name) < 2:
        return False, "名称无效"

    if PERSONAL_TITLE_RE.match(name) and tool_hits == 0 and points < 250:
        return False, "个人项目且热度/工具信号不足"

    return True, "ok"


def passes_website_record(record: dict, profession: str | None = None) -> tuple[bool, str]:
    """复核已入库的 auto_added 网站。"""
    if not record.get("auto_added"):
        return True, "manual"

    cats = record.get("category") or []
    prof = profession or (cats[0] if cats else "office")
    points = 0
    users = str(record.get("users", ""))
    m = re.search(r"(\d+)", users)
    if m:
        points = int(m.group(1))

    return passes_website_candidate(
        record.get("name", ""),
        record.get("url", ""),
        record.get("desc", ""),
        points,
        prof,
    )


def passes_extension_quality(name: str, description: str, rating: float,
                            users: int, rating_count: int) -> tuple[bool, str]:
    """插件额外质量校验（在基础门槛之上）。"""
    blob = _text_blob(name, description)
    spam_signals = ("free bitcoin", "coupon", "cashback only", "dating")
    if any(s in blob for s in spam_signals):
        return False, "疑似垃圾插件"

    if rating < 4.2 and users < 10_000 and rating_count < 200:
        return False, "评分/用户量综合偏低"

    return True, "ok"
