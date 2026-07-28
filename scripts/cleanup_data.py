# -*- coding: utf-8 -*-
"""清理工具集：去重、修复错误 ID、移除低质量 auto_added 条目。"""
from __future__ import annotations

import json
import os
import re
from urllib.parse import urlparse

ROOT = os.path.join(os.path.dirname(__file__), "..")
DATA = os.path.join(ROOT, "data")

# 网站与 App 同域名时，保留网站、删除 App
REMOVE_APP_IDS = {
    "a_slack_app", "a_zoom_app", "a_discord_app", "a_obsidian",
    "a_notion_app", "a_loom_app", "a_figma_app", "a_lf_app",
    "a_claude_app", "a_zotero_app", "a_bitwarden_app",
}

# 插件已覆盖，删除网站重复项
REMOVE_WEBSITE_IDS = {
    "w_grammarly",  # 插件 kbfnbcaeplbcioakkpcpgfkobkghlhen
    "w_deepl",      # 插件 cofdbpoegempjloogbagkncekinflcnj
}

# 误放在 apps 数组中的网站（将移至 websites）
MOVE_WEB_TO_SITES = {
    "w_biorender", "w_rawgraphs", "w_datawrapper", "w_figdraw",
    "w_flourish", "w_bioicons",
}


def domain(url: str) -> str:
    if not url:
        return ""
    return urlparse(url).netloc.lower().removeprefix("www.")


def load(path: str) -> dict | list:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save(path: str, data) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def fix_plugins(extensions: list[dict], log: list[str]) -> list[dict]:
    """修复 Honey 错误 ID（与 Privacy Badger 冲突）。"""
    for ext in extensions:
        if "Honey" in ext.get("name", ""):
            old = ext.get("id")
            ext["id"] = "bmnlcjabgnpnenekpadlanbbkooimhnj"
            if old != ext["id"]:
                log.append(f"修复插件 ID: Honey {old} → {ext['id']}")
    return extensions


def dedupe_by_id(items: list[dict], log: list[str], label: str) -> list[dict]:
    seen: set[str] = set()
    out: list[dict] = []
    for item in items:
        iid = item.get("id", "")
        if iid in seen:
            log.append(f"删除重复 {label} ID: {iid} ({item.get('name', '')})")
            continue
        seen.add(iid)
        out.append(item)
    return out


def cleanup_websites(websites: list[dict], log: list[str]) -> list[dict]:
    out: list[dict] = []
    for w in websites:
        wid = w.get("id", "")
        if wid in REMOVE_WEBSITE_IDS:
            log.append(f"删除重复网站: {wid} ({w.get('name', '')})")
            continue
        if w.get("auto_added"):
            log.append(f"删除低质量 auto_added: {wid} ({w.get('name', '')})")
            continue
        out.append(w)
    return out


def cleanup_apps(apps: list[dict], websites: list[dict], log: list[str]) -> list[dict]:
    web_domains = {domain(w.get("url", "")) for w in websites}
    out: list[dict] = []
    moved: list[dict] = []

    for a in apps:
        aid = a.get("id", "")
        # 误分类网站 → 移至 websites
        if aid in MOVE_WEB_TO_SITES:
            a["type"] = "website"
            moved.append(a)
            log.append(f"移出 apps → websites: {aid}")
            continue
        # apps 中的 overleaf 重复
        if aid == "w_overleaf":
            log.append(f"删除重复 App: {aid} (已在 websites)")
            continue
        if aid in REMOVE_APP_IDS:
            log.append(f"删除与网站重复 App: {aid} ({a.get('name', '')})")
            continue
        # 同域名网站已存在
        d = domain(a.get("url", ""))
        if d and d in web_domains:
            log.append(f"删除同域名 App: {aid} ({a.get('name', '')})")
            continue
        out.append(a)

    return out, moved


def main() -> None:
    log: list[str] = []

    tools_path = os.path.join(DATA, "ai-tools.json")
    sites_path = os.path.join(DATA, "ai-websites.json")

    tools = load(tools_path)
    sites_data = load(sites_path)

    extensions = tools.get("extensions", [])
    websites = sites_data.get("websites", [])
    apps = sites_data.get("apps", [])

    before = {
        "plugins": len(extensions),
        "websites": len(websites),
        "apps": len(apps),
    }

    extensions = fix_plugins(extensions, log)
    extensions = dedupe_by_id(extensions, log, "插件")

    websites = cleanup_websites(websites, log)
    websites = dedupe_by_id(websites, log, "网站")

    apps, moved = cleanup_apps(apps, websites, log)
    apps = dedupe_by_id(apps, log, "应用")

    # 合并移出的网站（去重）
    existing_ids = {w["id"] for w in websites}
    for w in moved:
        if w["id"] not in existing_ids:
            websites.append(w)
            existing_ids.add(w["id"])

    websites = dedupe_by_id(websites, log, "网站")

    tools["extensions"] = extensions
    sites_data["websites"] = websites
    sites_data["apps"] = apps

    save(tools_path, tools)
    save(sites_path, sites_data)

    after = {
        "plugins": len(extensions),
        "websites": len(websites),
        "apps": len(apps),
    }

    print("=" * 50)
    print("数据清理完成")
    print(f"插件: {before['plugins']} → {after['plugins']}")
    print(f"网站: {before['websites']} → {after['websites']}")
    print(f"应用: {before['apps']} → {after['apps']}")
    print(f"合计: {sum(before.values())} → {sum(after.values())}")
    print(f"共执行 {len(log)} 项操作:\n")
    for line in log:
        print(f"  - {line}")

    report = {
        "before": before,
        "after": after,
        "actions": log,
    }
    save(os.path.join(DATA, "cleanup_log.json"), report)


if __name__ == "__main__":
    main()
