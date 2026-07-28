# -*- coding: utf-8 -*-
"""
Generate realistic reviews for all tools in ToolHub.
Output: reviews_seed.json — to be injected into localStorage as 'toolhub_reviews'.
"""
import json, random, os
from datetime import datetime, timedelta

random.seed(42)

# ── Load tool data ──────────────────────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, '..', 'data')

with open(os.path.join(DATA, 'ai-tools.json'), encoding='utf-8') as f:
    plugins = json.load(f)['extensions']

with open(os.path.join(DATA, 'ai-websites.json'), encoding='utf-8') as f:
    wb = json.load(f)
    websites = wb.get('websites', [])
    apps     = wb.get('apps', [])

all_tools = (
    [(e['id'], e.get('name',''), 'plugin') for e in plugins] +
    [(e['id'], e.get('name',''), 'website') for e in websites] +
    [(e['id'], e.get('name',''), 'app') for e in apps]
)

print(f"Total tools: {len(all_tools)}")

# ── Review templates per tool category/type ─────────────────────────────────
REVIEW_POOL = {
    'plugin': [
        ("装上之后效率直接翻倍，强烈推荐给所有程序员同学！", 5),
        ("界面简洁，操作流畅，完全免费，已经用了大半年了。", 5),
        ("对比过好几款同类插件，这个综合体验最好，更新也很积极。", 4),
        ("刚开始有点学习成本，熟悉之后真的很好用，值得花时间。", 4),
        ("翻译速度很快，准确率也高，替代了我之前用的付费工具。", 5),
        ("偶尔会有小 bug，但作者响应很快，基本都能解决。", 4),
        ("免费版功能已经很够用了，完全满足日常需求。", 4),
        ("用了两个月，稳定性不错，占用内存也不大。", 4),
        ("和其他 AI 工具配合使用效果更好，推荐搭配使用。", 5),
        ("UI 设计很用心，比同类产品好看很多，用起来心情都好。", 5),
        ("新手友好，安装即用，不需要什么配置直接上手。", 5),
        ("权限申请合理，没有乱读数据，安全感比较高。", 4),
        ("在公司电脑上也装了，主管看到之后也下载使用了哈哈。", 5),
        ("更新频率很高，功能持续迭代，开发者很用心。", 4),
        ("速度比我预期快很多，几乎感受不到延迟。", 5),
    ],
    'website': [
        ("网站速度快，内容质量高，已经成为我每天必刷的工具。", 5),
        ("免费额度够用，付费版也不贵，性价比很高。", 4),
        ("UI 设计非常专业，交互体验比同类产品好一个档次。", 5),
        ("注册流程简单，不用信用卡，适合先体验再决定。", 4),
        ("数据导出功能很实用，方便在多平台之间迁移。", 4),
        ("客服响应速度很快，遇到问题基本当天能解决。", 5),
        ("功能迭代速度很快，每次更新都能感受到诚意。", 5),
        ("多语言支持很好，中文体验完全不输英文版。", 4),
        ("API 接口文档清晰，开发者接入成本很低。", 4),
        ("团队协作功能做得很扎实，适合多人项目。", 4),
        ("深色模式很好看，长时间盯着屏幕眼睛也不累。", 5),
        ("支持导入从竞品导出的文件，迁移成本低。", 4),
        ("离线功能支持得很好，出差没网也能继续工作。", 5),
        ("隐私政策透明，数据不会被拿去训练模型，放心用。", 5),
        ("跨平台同步没有问题，手机电脑无缝切换。", 4),
    ],
    'app': [
        ("安装包小，启动速度快，不会拖慢电脑。", 5),
        ("系统托盘常驻，需要的时候随时唤出，很方便。", 4),
        ("支持快捷键配置，定制化程度相当高。", 5),
        ("跨平台体验一致，Windows 和 Mac 都用过没有差距。", 4),
        ("更新后没有强制重启应用，体验细节做得好。", 5),
        ("安装之后资源占用很低，常驻后台完全感知不到。", 5),
        ("无广告，无捆绑安装，干净清爽。", 5),
        ("数据全部本地存储，不用担心隐私问题。", 4),
        ("文件格式兼容性很好，啥都能打开。", 4),
        ("卸载干净，不留注册表垃圾，程序员好评。", 5),
        ("工具栏设计合理，常用功能都在顺手的位置。", 4),
        ("支持导入历史记录，换电脑不需要重新配置。", 5),
        ("错误提示很清晰，遇到问题能快速定位原因。", 4),
        ("新版 UI 大改之后好看了很多，现代感强。", 4),
        ("支持多窗口，可以同时比对两份文件。", 5),
    ],
}

# ── Specific reviews per well-known tool ────────────────────────────────────
SPECIFIC = {
    # Chrome plugins
    'difoiogjjojoaoomphldepapgpbgkhkb': [  # Sider
        ("Sider 是目前用过最全面的 AI 侧边栏，涵盖了翻译、写作、代码、总结，一个顶好几个。", 5),
        ("免费额度每天不少，对轻度用户来说完全够用，付费版价格也合理。", 4),
        ("网页全文总结功能特别好用，看长文章节省了大量时间。", 5),
    ],
    'ofpnmcalabcbjgholdjcjblkibolbppj': [  # Monica
        ("Monica 的 AI 对话质量非常高，接入了 GPT-4，回答专业度比很多付费工具都强。", 5),
        ("右键菜单集成很自然，选中文字直接解释翻译，完全融合到浏览习惯里了。", 5),
        ("每天免费 30 次查询对我来说够用，偶尔查超了就等第二天。", 4),
    ],
    'kbfnbcaeplbcioakkpcpgfkobkghlhch': [  # Grammarly
        ("Grammarly 在英文写作上几乎无可替代，发邮件前必用，避免了不少尴尬错误。", 5),
        ("浏览器版和本地客户端体验都很流畅，同步也稳定，用了三年没什么问题。", 5),
        ("免费版的建议已经很实用，高级版的风格优化和清晰度建议对进阶写作帮助很大。", 4),
    ],
    'cofdbpoegempjloogbagkncekinflcj': [  # DeepL
        ("DeepL 的翻译质量是我用过最接近人工的，尤其是中英之间的长句翻译。", 5),
        ("选中即翻译功能太方便了，看英文技术文档效率直接提升了一倍。", 5),
        ("和 Google 翻译对比过，DeepL 的措辞更自然，尤其是涉及专业词汇的时候。", 5),
    ],
    # Websites
    'w_chatgpt': [
        ("ChatGPT 改变了我的工作方式，每天靠它写代码注释、查错误、整理文档。", 5),
        ("GPT-4 的逻辑推理能力真的强，解决复杂问题时思路很清晰，比搜索引擎快多了。", 5),
        ("上下文记忆能力越来越强，一个长对话里能记住前面说过的细节，体验很流畅。", 4),
    ],
    'w_claude': [
        ("Claude 写长文的能力比 ChatGPT 稳，输出格式规范，适合写报告和方案。", 5),
        ("上下文窗口非常大，一次能喂进去整本书来分析，比其他模型强很多。", 5),
        ("在代码生成上表现很好，尤其是 Python 和 TypeScript，错误率低。", 4),
    ],
    'w_midjourney': [
        ("Midjourney V6 的图像质量已经达到商业插画水平，我项目封面全靠它。", 5),
        ("关键词调教有一定门槛，但熟悉之后能出很多惊喜作品，值得花时间研究。", 4),
        ("Discord 操作方式对新手不友好，希望尽快推出网页版独立入口。", 3),
    ],
    'w_notion': [
        ("Notion 是我用过组织信息最灵活的工具，数据库、看板、文档三合一。", 5),
        ("模板市场资源丰富，开箱即用，适合各种使用场景。", 4),
        ("AI 功能加入之后整理会议记录效率翻了三倍，写完自动总结太爽了。", 5),
    ],
    'w_figma': [
        ("Figma 是设计师标配，实时协作功能把设计流程从几天压缩到几小时。", 5),
        ("组件系统和变量功能成熟，设计系统管理起来比 Sketch 方便太多了。", 5),
        ("浏览器版流畅度出乎意料，不输桌面客户端，出差只带手机也能改稿。", 4),
    ],
    'w_github': [
        ("GitHub Copilot 已经成为我写代码不可或缺的伙伴，节省了 40% 以上的时间。", 5),
        ("Actions CI/CD 配置灵活，文档详细，自动化部署搭建起来很顺手。", 5),
        ("代码审查功能配合 PR 模板用起来非常规范，团队协作质量明显提升。", 4),
    ],
    # Apps
    'a_chatgpt_app': [
        ("移动端 ChatGPT 语音对话功能真的很惊艳，在开车时能用 AI 讨论想法。", 5),
        ("和网页版数据同步稳定，切换设备不用担心对话记录丢失。", 4),
        ("图片识别功能非常强大，拍一下数学题就能一步步解释过程。", 5),
    ],
    'a_notion': [
        ("移动端 Notion 记录想法很顺手，配合 AI 整理笔记比任何 app 都强。", 5),
        ("离线模式现在稳定多了，之前同步偶尔有问题，最近版本修好了。", 4),
        ("小组件功能加入之后方便多了，锁屏就能看到今日任务。", 5),
    ],
    'a_github': [
        ("GitHub 手机 app 审查 PR 很方便，出门在外也能跟上代码节奏。", 5),
        ("通知管理功能做得很精细，可以按仓库和类型过滤，不会被刷屏。", 4),
        ("代码浏览体验比我预期好，语法高亮和跳转定义都支持。", 4),
    ],
}

# ── Generate reviews ─────────────────────────────────────────────────────────
def random_date():
    days_ago = random.randint(3, 365)
    d = datetime.now() - timedelta(days=days_ago)
    return d.strftime('%Y/%m/%d')

output = {}

for tid, name, ttype in all_tools:
    reviews = []
    pool = REVIEW_POOL.get(ttype, REVIEW_POOL['plugin'])

    # Specific reviews first
    specific = SPECIFIC.get(tid, [])
    for i, (text, rating) in enumerate(specific):
        reviews.append({
            'id':     f's_{i}_{tid[:8]}',
            'text':   text,
            'rating': rating,
            'source': 'user',
            'date':   random_date(),
            'likes':  random.randint(0, 30),
        })

    # Fill up to at least 3 reviews with pool entries
    needed = max(0, 3 - len(reviews))
    sampled = random.sample(pool, min(len(pool), needed + 1))
    for i, (text, rating) in enumerate(sampled[:needed]):
        # Add slight rating variance
        adj_rating = max(3, min(5, rating + random.choice([-1,0,0,0,1])))
        reviews.append({
            'id':     f'g_{i}_{tid[:8]}',
            'text':   text,
            'rating': adj_rating,
            'source': 'user',
            'date':   random_date(),
            'likes':  random.randint(0, 15),
        })

    output[tid] = {
        'reviews':  reviews,
        'myLikes':  {},
    }
    print(f"✓ {name[:30]:32s} {len(reviews)} reviews")

# ── Write output ─────────────────────────────────────────────────────────────
out_path = os.path.join(BASE, '..', 'data', 'reviews_seed.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n✅ Written to: {out_path}")
print(f"   Total tools with reviews: {len(output)}")
