# -*- coding: utf-8 -*-
"""垂直领域发现配置：搜索词、分类关键词、质量门槛。"""

# 每个垂直领域在 Chrome 商店 / 网站目录中的搜索词
PROFESSION_QUERIES = {
    "programmer": ["developer tools", "code assistant", "API testing", "git"],
    "designer": ["design tool", "figma", "color picker", "UI UX"],
    "writer": ["writing tool", "grammar", "translation", "note taking"],
    "researcher": ["research tool", "citation", "academic PDF", "literature"],
    "marketer": ["SEO tool", "social media", "email marketing", "analytics"],
    "student": ["study tool", "flashcard", "learning app", "homework"],
    "entrepreneur": ["productivity", "CRM", "startup tool", "project management"],
    "office": ["productivity", "meeting tool", "calendar", "AI assistant"],
}

# 用名称/描述二次打标（与 script.js SUBCATS 对齐）
PROFESSION_KEYWORDS = {
    "programmer": [
        "code", "git", "api", "debug", "developer", "programming", "javascript",
        "python", "docker", "vscode", "github", "terminal", "sql", "devops",
    ],
    "designer": [
        "design", "figma", "color", "ui", "ux", "prototype", "image", "photo",
        "illustration", "canva", "sketch",
    ],
    "writer": [
        "write", "grammar", "translate", "translation", "note", "markdown",
        "editor", "copywriting", "blog",
    ],
    "researcher": [
        "research", "citation", "academic", "paper", "literature", "zotero",
        "scholar", "pdf", "science",
    ],
    "marketer": [
        "seo", "marketing", "email", "social", "analytics", "ads", "campaign",
        "crm", "newsletter",
    ],
    "student": [
        "study", "learn", "flashcard", "quiz", "homework", "education", "course",
    ],
    "entrepreneur": [
        "startup", "crm", "sales", "business", "invoice", "stripe", "notion",
        "project",
    ],
    "office": [
        "productivity", "meeting", "calendar", "team", "collaboration", "slack",
        "zoom", "task", "workflow",
    ],
}

# 自动入库质量门槛
MIN_RATING = 4.0
MIN_RATING_COUNT = 80          # 评价数
MIN_USERS = 5_000              # 用户数（解析失败时退化为评价数）
MAX_NEW_PER_PROFESSION = 5     # 每次运行每个领域最多新增条数
MAX_SEARCH_RESULTS = 12        # 每个搜索词最多解析扩展数

# 请求节流（秒）
REQUEST_DELAY = 0.6

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
