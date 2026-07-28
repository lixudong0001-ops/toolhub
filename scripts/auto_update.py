# -*- coding: utf-8 -*-
"""
ToolHub 自动更新流水线
- 按垂直领域搜索 Chrome 商店，自动发现新插件并入库
- 刷新已有插件的评分 / 用户数
- 生成 manifest.json 供前端拉取
"""
from __future__ import annotations

import json
import math
import os
import re
import sys
import time
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse

# 确保 scripts 目录在 path 中
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(SCRIPT_DIR, "..")
DATA_DIR = os.path.join(ROOT, "data")
sys.path.insert(0, SCRIPT_DIR)

from cws_client import (  # noqa: E402
    ExtensionInfo,
    discover_extensions,
    fetch_extension,
    format_count,
    parse_user_count,
)
from website_discovery import candidate_to_record, discover_websites  # noqa: E402
from discovery_config import (  # noqa: E402
    MAX_NEW_PER_PROFESSION,
    MAX_SEARCH_RESULTS,
    MIN_RATING,
    MIN_RATING_COUNT,
    MIN_USERS,
    PROFESSION_KEYWORDS,
    PROFESSION_QUERIES,
    REQUEST_DELAY,
)


def load_json(path: str) -> Any:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path: str, data: Any) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def score_extension(info: ExtensionInfo) -> float:
    users = parse_user_count(info.users_text)
    base = users or info.rating_count
    rating = info.rating or 0
    return math.log10(base + 1) * rating


def infer_categories(text: str, seed_profession: str | None = None) -> list[str]:
    """根据文本推断垂直领域标签。"""
    lower = text.lower()
    cats: list[str] = []
    for prof, keywords in PROFESSION_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            cats.append(prof)
    if seed_profession and seed_profession not in cats:
        cats.insert(0, seed_profession)
    return cats or ([seed_profession] if seed_profession else ["office"])


def passes_quality(info: ExtensionInfo) -> bool:
    users = parse_user_count(info.users_text)
    if info.rating < MIN_RATING:
        return False
    if users >= MIN_USERS:
        return True
    if info.rating_count >= MIN_RATING_COUNT:
        return True
    return False


def ext_to_record(info: ExtensionInfo, categories: list[str]) -> dict:
    users = parse_user_count(info.users_text)
    domain = ""
    # 尝试从描述中提取官网域名做 favicon
    url_match = re.search(r"https?://[\w.-]+", info.description)
    if url_match:
        domain = urlparse(url_match.group(0)).netloc
    icon = info.icon or (
        f"https://www.google.com/s2/favicons?sz=128&domain={domain or 'google.com'}"
    )
    short_desc = info.description[:180] + ("…" if len(info.description) > 180 else "")
    return {
        "id": info.ext_id,
        "name": info.name,
        "category": categories,
        "fallback_icon": icon,
        "fallback_desc": short_desc,
        "fallback_rating": f"{info.rating:.1f}" if info.rating else "—",
        "fallback_rating_count": format_count(info.rating_count),
        "fallback_users": info.users_text or format_count(users),
        "fallback_review": "",
        "store_url": info.store_url,
        "auto_added": True,
        "discovered_at": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source": "chrome_web_store",
    }


def update_existing_metrics(extensions: list[dict], log: dict) -> int:
    """刷新已有插件的评分与用户数。"""
    updated = 0
    for ext in extensions:
        ext_id = ext.get("id", "")
        if not ext_id:
            continue
        info = fetch_extension(ext_id)
        time.sleep(REQUEST_DELAY)
        if not info:
            continue
        ext["fallback_rating"] = f"{info.rating:.1f}" if info.rating else ext.get("fallback_rating", "—")
        ext["fallback_rating_count"] = format_count(info.rating_count)
        if info.users_text:
            ext["fallback_users"] = info.users_text
        if info.description and not ext.get("fallback_desc"):
            ext["fallback_desc"] = info.description[:180]
        if info.icon:
            ext["fallback_icon"] = info.icon
        ext["last_synced"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        updated += 1
    log["metrics_updated"] = updated
    return updated


def discover_new_plugins(existing: list[dict], log: dict) -> list[dict]:
    known_ids = {e["id"] for e in existing if e.get("id")}
    added: list[dict] = []

    for profession, queries in PROFESSION_QUERIES.items():
        print(f"\n[发现] 垂直领域: {profession}")
        candidates = discover_extensions(
            queries,
            known_ids | {a["id"] for a in added},
            per_query_limit=MAX_SEARCH_RESULTS,
        )
        # 按综合分排序，取前 N
        ranked = sorted(candidates, key=score_extension, reverse=True)
        profession_added = 0
        for info in ranked:
            if profession_added >= MAX_NEW_PER_PROFESSION:
                break
            if not passes_quality(info):
                continue
            cats = infer_categories(
                f"{info.name} {info.description}",
                seed_profession=profession,
            )
            record = ext_to_record(info, cats)
            added.append(record)
            known_ids.add(info.ext_id)
            profession_added += 1
            print(f"  + 新增: {info.name} (评分 {info.rating}, 用户 {info.users_text or info.rating_count})")

        log.setdefault("added_by_profession", {})[profession] = profession_added

    log["new_plugins"] = [
        {"id": a["id"], "name": a["name"], "categories": a["category"]}
        for a in added
    ]
    return existing + added


def known_domains_from_data(websites: list[dict], apps: list[dict]) -> set[str]:
    domains: set[str] = set()
    for item in websites + apps:
        for key in ("url", "store_url"):
            u = item.get(key, "")
            if u:
                domains.add(urlparse(u).netloc.lower().removeprefix("www."))
    return domains


def discover_new_websites(existing: list[dict], apps: list[dict], log: dict) -> list[dict]:
    known_domains = known_domains_from_data(existing, apps)
    known_ids = {w.get("id") for w in existing if w.get("id")}
    added: list[dict] = []

    for profession, queries in PROFESSION_QUERIES.items():
        print(f"\n[发现网站] 垂直领域: {profession}")
        hn_queries = [f"{q}" for q in queries[:2]]
        candidates = discover_websites(
            hn_queries,
            known_domains | {urlparse(a["url"]).netloc.removeprefix("www.") for a in added if a.get("url")},
        )
        profession_added = 0
        for cand in candidates:
            if profession_added >= MAX_NEW_PER_PROFESSION:
                break
            domain = urlparse(cand.url).netloc.lower().removeprefix("www.")
            if domain in known_domains:
                continue
            cats = infer_categories(f"{cand.name} {cand.description}", seed_profession=profession)
            record = candidate_to_record(cand, cats)
            if record["id"] in known_ids:
                continue
            added.append(record)
            known_domains.add(domain)
            known_ids.add(record["id"])
            profession_added += 1
            print(f"  + 新增网站: {cand.name} ({cand.url})")

        log.setdefault("websites_added_by_profession", {})[profession] = profession_added

    log["new_websites"] = [{"id": a["id"], "name": a["name"], "url": a["url"]} for a in added]
    return existing + added


def write_manifest(tools_count: int, websites_count: int, apps_count: int, log: dict) -> None:
    manifest = {
        "version": datetime.now(timezone.utc).strftime("%Y.%m.%d.%H%M"),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "counts": {
            "plugins": tools_count,
            "websites": websites_count,
            "apps": apps_count,
            "total": tools_count + websites_count + apps_count,
        },
        "last_run": log,
    }
    save_json(os.path.join(DATA_DIR, "manifest.json"), manifest)


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(description="ToolHub 自动发现与指标更新")
    parser.add_argument(
        "--mode",
        choices=["full", "discover", "metrics"],
        default=os.environ.get("TOOLHUB_UPDATE_MODE", "full"),
    )
    parser.add_argument(
        "--profession",
        help="仅处理指定垂直领域（如 programmer）",
    )
    parser.add_argument(
        "--skip-metrics",
        action="store_true",
        help="跳过刷新已有插件指标（加快测试）",
    )
    args = parser.parse_args()

    global PROFESSION_QUERIES
    if args.profession:
        if args.profession not in PROFESSION_QUERIES:
            print(f"未知领域: {args.profession}")
            return 1
        PROFESSION_QUERIES = {args.profession: PROFESSION_QUERIES[args.profession]}

    tools_path = os.path.join(DATA_DIR, "ai-tools.json")
    websites_path = os.path.join(DATA_DIR, "ai-websites.json")

    tools_data = load_json(tools_path)
    websites_data = load_json(websites_path)
    extensions: list[dict] = tools_data.get("extensions", [])

    log: dict = {
        "started_at": datetime.now(timezone.utc).isoformat(),
        "mode": args.mode,
    }

    mode = args.mode
    print("=" * 60)
    print(f"ToolHub 自动更新 | 模式: {mode}")
    print(f"当前插件数: {len(extensions)}")
    print("=" * 60)

    before = len(extensions)

    if mode in ("full", "discover"):
        extensions = discover_new_plugins(extensions, log)
        log["plugins_before"] = before
        log["plugins_after"] = len(extensions)
        log["plugins_added"] = len(extensions) - before
        tools_data["extensions"] = extensions
        save_json(tools_path, tools_data)
        print(f"\n[完成] 新增插件 {log['plugins_added']} 个，合计 {len(extensions)} 个")

    if mode in ("full", "metrics") and not args.skip_metrics:
        print("\n[刷新] 更新已有插件指标...")
        update_existing_metrics(extensions, log)
        tools_data["extensions"] = extensions
        save_json(tools_path, tools_data)

    websites = websites_data.get("websites", [])
    apps = websites_data.get("apps", [])
    websites_before = len(websites)

    if mode in ("full", "discover"):
        websites = discover_new_websites(websites, apps, log)
        log["websites_before"] = websites_before
        log["websites_after"] = len(websites)
        log["websites_added"] = len(websites) - websites_before
        websites_data["websites"] = websites
        save_json(websites_path, websites_data)
        if log["websites_added"]:
            print(f"\n[完成] 新增网站 {log['websites_added']} 个，合计 {len(websites)} 个")

    write_manifest(len(extensions), len(websites), len(apps), log)
    save_json(os.path.join(DATA_DIR, "update_log.json"), log)

    print("\n[manifest] 已写入 data/manifest.json")
    print("[log] 已写入 data/update_log.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
