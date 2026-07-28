/**
 * background.js — Service Worker
 * 职责：
 * 1. 扩展安装/启动时，首次拉取 Chrome 应用商店数据
 * 2. 通过 chrome.alarms 每24小时自动刷新一次
 * 3. 解析 Chrome Web Store 页面中的 JSON-LD 结构化数据
 * 4. 将结果缓存到 chrome.storage.local
 * 5. 向 popup.js 广播更新状态
 */

const ALARM_NAME = 'daily-refresh';
const REFRESH_INTERVAL_MINUTES = 60 * 24; // 每 24 小时
const STORAGE_KEY_DATA = 'extensionsData';
const STORAGE_KEY_UPDATED = 'lastUpdated';
const STORAGE_KEY_STATUS = 'fetchStatus';

// ============================================================
//  初始化：安装或 Service Worker 启动时触发
// ============================================================
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  console.log('[AI Nexus] Extension installed/updated:', reason);
  // 注册定时刷新任务
  await chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: 1,
    periodInMinutes: REFRESH_INTERVAL_MINUTES,
  });
  // 首次安装立即拉取数据
  await fetchAndCacheAllExtensions();
});

// Service Worker 重新激活时，确保 alarm 存在
chrome.runtime.onStartup.addListener(async () => {
  const alarm = await chrome.alarms.get(ALARM_NAME);
  if (!alarm) {
    await chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: 1,
      periodInMinutes: REFRESH_INTERVAL_MINUTES,
    });
  }
});

// ============================================================
//  ★ 点击插件图标 → 打开完整网页标签页
// ============================================================
chrome.action.onClicked.addListener(async (tab) => {
  // 检查是否已有 AI Nexus 标签页，有则激活，没有则新开
  const extensionPageUrl = chrome.runtime.getURL('index.html');
  const existingTabs = await chrome.tabs.query({ url: extensionPageUrl });

  if (existingTabs.length > 0) {
    // 已打开：激活并聚焦到已有标签
    await chrome.tabs.update(existingTabs[0].id, { active: true });
    await chrome.windows.update(existingTabs[0].windowId, { focused: true });
  } else {
    // 未打开：新建标签页
    await chrome.tabs.create({ url: extensionPageUrl });
  }
});

// ============================================================
//  定时任务触发器
// ============================================================
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    console.log('[AI Nexus] Alarm triggered, refreshing data...');
    await fetchAndCacheAllExtensions();
  }
});

// ============================================================
//  监听来自 popup 的手动刷新请求
// ============================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'manualRefresh') {
    console.log('[AI Nexus] Manual refresh requested');
    fetchAndCacheAllExtensions().then(() => {
      sendResponse({ success: true, timestamp: Date.now() });
    });
    return true; // 保持消息通道开放，等待异步响应
  }
});

// ============================================================
//  核心：读取配置 → 遍历爬取 → 缓存结果
// ============================================================
async function fetchAndCacheAllExtensions() {
  // 标记正在刷新
  await chrome.storage.local.set({ [STORAGE_KEY_STATUS]: 'loading' });

  try {
    // 1. 读取精选插件配置文件
    const configUrl = chrome.runtime.getURL('data/ai-tools.json');
    const configResp = await fetch(configUrl);
    const config = await configResp.json();

    // 2. 读取已缓存数据（用于合并，保留旧数据以防网络失败）
    const stored = await chrome.storage.local.get(STORAGE_KEY_DATA);
    const existingData = stored[STORAGE_KEY_DATA] || {};

    // 3. 并发拉取所有插件数据（最多 3 个并发避免触发限速）
    const results = {};
    const chunks = chunkArray(config.extensions, 3);
    
    for (const chunk of chunks) {
      const promises = chunk.map(ext => fetchExtensionData(ext));
      const chunkResults = await Promise.allSettled(promises);
      
      chunkResults.forEach((result, i) => {
        const ext = chunk[i];
        if (result.status === 'fulfilled' && result.value) {
          results[ext.id] = result.value;
        } else {
          // 网络失败时保留旧缓存或使用 fallback
          console.warn(`[AI Nexus] Failed to fetch ${ext.name}:`, result.reason);
          results[ext.id] = existingData[ext.id] || buildFallback(ext);
        }
      });

      // 每批次之间等待 500ms，避免请求过于频繁
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await sleep(500);
      }
    }

    // 4. 完整缓存包括配置元数据
    const cachePayload = {
      categories: config.categories,
      extensions: config.extensions.map(e => ({ ...results[e.id], ...e })),
    };

    await chrome.storage.local.set({
      [STORAGE_KEY_DATA]: cachePayload,
      [STORAGE_KEY_UPDATED]: Date.now(),
      [STORAGE_KEY_STATUS]: 'success',
    });

    console.log('[AI Nexus] Data refreshed successfully');
    
    // 5. 通知所有打开的 popup
    notifyPopup({ action: 'dataUpdated', timestamp: Date.now() });

  } catch (error) {
    console.error('[AI Nexus] Fatal error during refresh:', error);
    await chrome.storage.local.set({ [STORAGE_KEY_STATUS]: 'error' });
  }
}

// ============================================================
//  从 Chrome Web Store 页面抓取单个插件数据
// ============================================================
async function fetchExtensionData(extConfig) {
  const storeUrl = extConfig.store_url || 
    `https://chromewebstore.google.com/detail/${extConfig.id}`;

  const response = await fetch(storeUrl, {
    headers: {
      // 模拟浏览器请求头，避免被识别为爬虫
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${extConfig.name}`);
  }

  const html = await response.text();
  return parseWebStoreHtml(html, extConfig);
}

// ============================================================
//  解析 Chrome Web Store HTML
//  方法：优先提取 JSON-LD 结构化数据；回退到 meta 标签
// ============================================================
function parseWebStoreHtml(html, extConfig) {
  // --- 方法一：JSON-LD 结构化数据（最可靠）---
  const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      const jsonLd = JSON.parse(jsonLdMatch[1]);
      const data = buildFallback(extConfig);

      if (jsonLd.name) data.name = jsonLd.name;
      if (jsonLd.description) data.description = jsonLd.description;

      // 评分
      if (jsonLd.aggregateRating) {
        data.rating = parseFloat(jsonLd.aggregateRating.ratingValue).toFixed(1);
        data.ratingCount = formatCount(parseInt(jsonLd.aggregateRating.ratingCount || 0));
        data.rawRatingCount = parseInt(jsonLd.aggregateRating.ratingCount || 0);
      }

      // 图标（og:image 通常更清晰）
      const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/);
      if (ogImage) data.icon = ogImage[1];

      // 用户数量（从页面文本提取，格式如 "10,000+ users"）
      const usersMatch = html.match(/(\d[\d,]+\+?\s*(?:users?|用户))/i);
      if (usersMatch) data.usersText = usersMatch[1];

      // 开发者
      const authorMatch = html.match(/"author"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"/);
      if (authorMatch) data.developer = authorMatch[1];

      // 尝试获取第一条评论（从HTML中的 itemprop="reviewBody" 或类似结构）
      const reviewMatch = html.match(/itemprop="reviewBody"[^>]*>([^<]{40,300})</);
      if (reviewMatch) data.topReview = reviewMatch[1].trim();

      return data;
    } catch (e) {
      console.warn('[AI Nexus] JSON-LD parse failed, using fallback:', e.message);
    }
  }

  // --- 方法二：OpenGraph meta 标签（备用）---
  const ogDesc = html.match(/<meta (?:name="description"|property="og:description") content="([^"]+)"/i);
  const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/);
  
  const data = buildFallback(extConfig);
  if (ogDesc) data.description = ogDesc[1];
  if (ogImage) data.icon = ogImage[1];
  
  return data;
}

// ============================================================
//  辅助：当网络失败时，用配置文件中的 fallback 数据
// ============================================================
function buildFallback(extConfig) {
  return {
    id: extConfig.id,
    name: extConfig.name,
    description: extConfig.fallback_desc || '暂无简介，点击查看插件详情。',
    icon: extConfig.fallback_icon || '',
    rating: '—',
    ratingCount: '—',
    rawRatingCount: 0,
    usersText: '',
    developer: '',
    topReview: '',
    category: extConfig.category || [],
    store_url: extConfig.store_url || `https://chromewebstore.google.com/detail/${extConfig.id}`,
    lastFetched: Date.now(),
    isFallback: true,
  };
}

// ============================================================
//  辅助函数
// ============================================================
function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function notifyPopup(message) {
  // 向所有扩展视图广播消息
  chrome.runtime.sendMessage(message).catch(() => {
    // popup 可能没有打开，忽略错误
  });
}
