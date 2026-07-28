/**
 * popup.js — 弹窗交互逻辑
 * 职责：
 * 1. 从 chrome.storage.local 读取已缓存的扩展数据
 * 2. 渲染分类 Tab 和工具卡片
 * 3. 处理搜索、分类过滤、点赞交互
 * 4. 监听来自 background.js 的数据更新消息
 * 5. 提供手动刷新触发功能
 */

// ============================================================
//  全局状态
// ============================================================
let allExtensions = [];
let categories = [];
let activeCategory = 'all';
let searchQuery = '';
// 本地点赞状态（存储在 chrome.storage.local，避免刷新丢失）
let likedIds = new Set();

// ============================================================
//  初始化入口
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  await loadLikedState();
  await loadAndRender();
  setupEventListeners();
  listenForUpdates();
});

// ============================================================
//  从存储中加载数据并渲染
// ============================================================
async function loadAndRender() {
  const stored = await chrome.storage.local.get([
    'extensionsData',
    'lastUpdated',
    'fetchStatus',
  ]);

  const status = stored.fetchStatus;
  const data = stored.extensionsData;
  const lastUpdated = stored.lastUpdated;

  // 更新底部时间戳
  updateFooter(lastUpdated);

  if (!data) {
    // 数据还未加载（首次安装，background.js 尚未完成首次抓取）
    setSyncState('loading', '正在首次同步...');
    showSkeleton();
    return;
  }

  if (data.categories) {
    categories = data.categories;
    renderTabs();
  }

  if (data.extensions) {
    allExtensions = data.extensions;
    renderCards();
  }

  // 反映同步状态
  if (status === 'loading') {
    setSyncState('loading', '正在更新...');
  } else if (status === 'error') {
    setSyncState('error', '同步失败');
  } else {
    setSyncState('success', '已同步');
  }
}

// ============================================================
//  渲染分类 Tab
// ============================================================
function renderTabs() {
  const nav = document.getElementById('tabsNav');
  nav.innerHTML = '<button class="tab active" data-category="all">全部</button>';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.category = cat.id;
    btn.textContent = `${cat.icon} ${cat.name}`;
    nav.appendChild(btn);
  });
}

// ============================================================
//  渲染工具卡片（根据当前过滤条件）
// ============================================================
function renderCards() {
  const list = document.getElementById('toolsList');
  hideSkeleton();

  const filtered = filterExtensions();

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-magnifying-glass"></i>
        <p>未找到匹配的工具<br>试试其他关键词或分类</p>
      </div>`;
    return;
  }

  list.innerHTML = '';
  filtered.forEach(ext => {
    const card = createCard(ext);
    list.appendChild(card);
  });
}

// ============================================================
//  按分类 + 搜索关键词过滤
// ============================================================
function filterExtensions() {
  return allExtensions.filter(ext => {
    const matchesCategory =
      activeCategory === 'all' || (ext.category || []).includes(activeCategory);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      ext.name.toLowerCase().includes(q) ||
      (ext.description || '').toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });
}

// ============================================================
//  创建单张卡片 DOM
// ============================================================
function createCard(ext) {
  const card = document.createElement('div');
  card.className = 'tool-card';
  card.dataset.id = ext.id;

  const isLiked = likedIds.has(ext.id);
  const hasRating = ext.rating && ext.rating !== '—';
  const hasReview = ext.topReview && ext.topReview.length > 0;

  // 图标 HTML
  const iconHtml = ext.icon
    ? `<img class="card-icon" src="${escapeHtml(ext.icon)}" alt="${escapeHtml(ext.name)}" onerror="this.outerHTML='<div class=\\'card-icon-placeholder\\'>🤖</div>'">`
    : `<div class="card-icon-placeholder">🤖</div>`;

  // 评分徽章 HTML
  const ratingHtml = hasRating
    ? `<span class="card-rating"><i class="fa-solid fa-star"></i>${escapeHtml(ext.rating)}</span>
       <span class="card-rating-count">${escapeHtml(ext.ratingCount || '')} 评分</span>`
    : `<span class="card-rating-count">暂无评分</span>`;

  // 用户数
  const usersHtml = ext.usersText
    ? `<span class="card-users">${escapeHtml(ext.usersText)}</span>`
    : '';

  // 回退数据提示
  const fallbackBadge = ext.isFallback
    ? `<span class="fallback-badge">缓存</span>`
    : '';

  // 评论区
  const commentHtml = hasReview
    ? `<div class="card-comment has-review">
        <div class="comment-text">"${escapeHtml(ext.topReview)}"</div>
        <div class="comment-footer">
          <span class="comment-source">
            <i class="fa-brands fa-chrome"></i> Chrome 应用商店评论
            ${fallbackBadge}
          </span>
          <button class="upvote-btn ${isLiked ? 'active' : ''}" data-ext-id="${escapeHtml(ext.id)}">
            <i class="fa-solid fa-thumbs-up"></i>
            <span>${isLiked ? '已赞' : '有用'}</span>
          </button>
        </div>
      </div>`
    : `<div class="card-comment">
        <div class="comment-no-review">暂无来自应用商店的评论，下次同步时自动更新。</div>
        <div class="comment-footer">
          <span class="comment-source ${ext.isFallback ? '' : ''}">
            <i class="fa-brands fa-chrome"></i> Chrome 应用商店${fallbackBadge}
          </span>
        </div>
      </div>`;

  card.innerHTML = `
    <div class="card-header">
      ${iconHtml}
      <div class="card-title-group">
        <div class="card-name">${escapeHtml(ext.name)}</div>
        <div class="card-meta">
          ${ratingHtml}
          ${usersHtml}
        </div>
      </div>
    </div>
    <p class="card-desc">${escapeHtml(ext.description || ext.fallback_desc || '')}</p>
    ${commentHtml}
    <div class="card-actions">
      <a class="btn btn-store" href="${escapeHtml(ext.store_url)}" target="_blank">
        <i class="fa-brands fa-chrome"></i> 去安装
      </a>
      <button class="btn btn-detail" data-store-url="${escapeHtml(ext.store_url)}">
        查看详情
      </button>
    </div>
  `;

  return card;
}

// ============================================================
//  事件监听
// ============================================================
function setupEventListeners() {
  // 分类 Tab 切换（事件委托）
  document.getElementById('tabsNav').addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeCategory = tab.dataset.category;
    renderCards();
  });

  // 搜索框
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');

  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim();
    clearBtn.style.display = searchQuery ? 'block' : 'none';
    renderCards();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearBtn.style.display = 'none';
    searchInput.focus();
    renderCards();
  });

  // 工具列表事件委托（点赞 + 详情按钮）
  document.getElementById('toolsList').addEventListener('click', async (e) => {
    // 点赞
    const upvoteBtn = e.target.closest('.upvote-btn');
    if (upvoteBtn) {
      e.stopPropagation();
      await handleUpvote(upvoteBtn);
      return;
    }
    // 查看详情（在 Chrome 中打开商店页）
    const detailBtn = e.target.closest('.btn-detail');
    if (detailBtn && detailBtn.dataset.storeUrl) {
      chrome.tabs.create({ url: detailBtn.dataset.storeUrl });
      return;
    }
    // 安装按钮（a 标签自行处理，但 Chrome Extension 中需要 tabs 权限）
    const storeBtn = e.target.closest('.btn-store');
    if (storeBtn) {
      e.preventDefault();
      const url = storeBtn.getAttribute('href');
      if (url) chrome.tabs.create({ url });
      return;
    }
  });

  // 手动刷新按钮
  document.getElementById('refreshBtn').addEventListener('click', async () => {
    const btn = document.getElementById('refreshBtn');
    btn.classList.add('loading');
    setSyncState('loading', '正在刷新...');
    
    try {
      await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'manualRefresh' }, (resp) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve(resp);
        });
      });
    } catch (err) {
      console.error('Manual refresh failed:', err);
      setSyncState('error', '刷新失败');
    } finally {
      btn.classList.remove('loading');
    }
  });
}

// ============================================================
//  监听 background.js 发来的数据更新通知
// ============================================================
function listenForUpdates() {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'dataUpdated') {
      loadAndRender();
    }
  });
}

// ============================================================
//  点赞功能（持久化到 chrome.storage.local）
// ============================================================
async function handleUpvote(btn) {
  const extId = btn.dataset.extId;
  if (!extId) return;

  const isCurrentlyLiked = likedIds.has(extId);
  const textSpan = btn.querySelector('span');

  if (isCurrentlyLiked) {
    likedIds.delete(extId);
    btn.classList.remove('active');
    if (textSpan) textSpan.textContent = '有用';
  } else {
    likedIds.add(extId);
    btn.classList.add('active');
    if (textSpan) textSpan.textContent = '已赞';
    // 小动画
    btn.animate([
      { transform: 'scale(0.85)' },
      { transform: 'scale(1.08)' },
      { transform: 'scale(1)' },
    ], { duration: 250, easing: 'ease-out' });
  }

  await saveLikedState();
}

async function loadLikedState() {
  const stored = await chrome.storage.local.get('likedExtensions');
  likedIds = new Set(stored.likedExtensions || []);
}

async function saveLikedState() {
  await chrome.storage.local.set({ likedExtensions: [...likedIds] });
}

// ============================================================
//  UI 辅助函数
// ============================================================
function setSyncState(state, text) {
  const dot = document.getElementById('syncDot');
  const label = document.getElementById('syncText');
  dot.className = 'sync-dot';
  if (state === 'loading') dot.classList.add('loading');
  if (state === 'error') dot.classList.add('error');
  label.textContent = text;
}

function updateFooter(timestamp) {
  const el = document.getElementById('footerLastUpdated');
  if (!timestamp) {
    el.textContent = '尚未同步';
    return;
  }
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);

  if (diffMin < 1) el.textContent = '刚刚更新';
  else if (diffMin < 60) el.textContent = `${diffMin} 分钟前更新`;
  else if (diffH < 24) el.textContent = `${diffH} 小时前更新`;
  else el.textContent = `上次更新：${date.toLocaleDateString('zh-CN')}`;
}

function showSkeleton() {
  document.getElementById('skeletonList').style.display = 'flex';
  document.getElementById('skeletonList').style.flexDirection = 'column';
  document.getElementById('skeletonList').style.gap = '10px';
}

function hideSkeleton() {
  const el = document.getElementById('skeletonList');
  if (el) el.remove();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
