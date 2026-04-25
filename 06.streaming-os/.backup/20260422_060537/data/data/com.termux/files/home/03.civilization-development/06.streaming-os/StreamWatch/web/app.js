const state = {
  activeScreen: 'home',
  activeProfileId: 'profile-main',
  profiles: [
    { id: 'profile-main', name: 'Boss', restriction: 'standard' },
    { id: 'profile-kid', name: 'Kid', restriction: 'family_safe' }
  ],
  feed: {
    featured: [
      { title: 'Featured Live Concert', reason: 'promoted', cta: 'watch_live' },
      { title: 'Premium Archive Movie', reason: 'ranking_highlight', cta: 'buy_now' }
    ],
    continueWatching: [
      { title: 'Series Episode 8', reason: 'continue_watching', progress: '742 / 1800 sec', cta: 'resume' }
    ],
    liveNow: [
      { title: 'Gaming Championship', reason: 'live_now', cta: 'watch_live' }
    ],
    recommendations: [
      { title: 'Creator Spotlight', reason: 'personalized', cta: 'play_now' }
    ]
  },
  categoryNodes: [
    { id: 'cat-ent', label: 'Entertainment', depth: 0 },
    { id: 'cat-movie', label: 'Movies', depth: 1 },
    { id: 'cat-live', label: 'Live Events', depth: 1 },
    { id: 'cat-edu', label: 'Education', depth: 0 }
  ],
  library: {
    favorites: [
      { title: 'Archived Special Event', note: 'protected playlist interpretation' }
    ],
    watchLater: [
      { title: 'Science Documentary', note: 'protected playlist interpretation' }
    ],
    history: [
      { title: 'Travel Clip', note: 'history fact' }
    ],
    entitled: [
      { title: 'Membership Live Show', note: 'membership_entitled / watch_live' }
    ]
  },
  following: [
    { title: 'Creator Alpha', note: 'live notifications on' },
    { title: 'Channel Beta', note: 'membership available' }
  ]
};

function renderList(id, items, formatter) {
  const root = document.getElementById(id);
  root.innerHTML = '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = formatter(item);
    root.appendChild(div);
  });
}

function renderProfiles() {
  const select = document.getElementById('profileSelect');
  select.innerHTML = state.profiles.map(p => `<option value="${p.id}">${p.name} (${p.restriction})</option>`).join('');
  select.value = state.activeProfileId;
  select.onchange = () => {
    state.activeProfileId = select.value;
    const current = state.profiles.find(p => p.id === state.activeProfileId);
    document.getElementById('tvConnectBox').innerHTML = `<div class="item"><strong>Profile switched</strong><div class="meta">active profile: ${current.name} / restriction: ${current.restriction}</div></div>`;
  };
}

function renderHome() {
  renderList('featuredList', state.feed.featured, item => `<strong>${item.title}</strong><div class="meta">reason: ${item.reason} / cta: ${item.cta}</div>`);
  renderList('continueList', state.feed.continueWatching, item => `<strong>${item.title}</strong><div class="meta">${item.reason} / ${item.progress} / cta: ${item.cta}</div>`);
  renderList('liveList', state.feed.liveNow, item => `<strong>${item.title}</strong><div class="meta">${item.reason} / cta: ${item.cta}</div>`);
  renderList('recommendList', state.feed.recommendations, item => `<strong>${item.title}</strong><div class="meta">${item.reason} / cta: ${item.cta}</div>`);
}

function renderCategory() {
  renderList('categoryTree', state.categoryNodes, item => `<strong>${'&nbsp;'.repeat(item.depth * 4)}${item.label}</strong><div class="meta">node_id: ${item.id}</div>`);
  document.getElementById('categoryResult').innerHTML = `<div class="item"><strong>Selected branch result</strong><div class="meta">remembered branch return / breadcrumb / sibling move are phase1 UI requirements</div></div>`;
}

function renderLibrary() {
  renderList('favoritesList', state.library.favorites, item => `<strong>${item.title}</strong><div class="meta">${item.note}</div>`);
  renderList('watchLaterList', state.library.watchLater, item => `<strong>${item.title}</strong><div class="meta">${item.note}</div>`);
  renderList('historyList', state.library.history, item => `<strong>${item.title}</strong><div class="meta">${item.note}</div>`);
  renderList('entitledList', state.library.entitled, item => `<strong>${item.title}</strong><div class="meta">${item.note}</div>`);
  document.getElementById('tvConnectBox').innerHTML = `<div class="item"><strong>TV Connect Sheet</strong><div class="meta">route handoff must remain distinct from same-device large-screen mode</div></div>`;
}

function renderFollowing() {
  renderList('followingList', state.following, item => `<strong>${item.title}</strong><div class="meta">${item.note}</div>`);
}

function bindNavigation() {
  document.querySelectorAll('.nav').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.screen').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.screen).classList.add('active');
    });
  });
}

function bindSearch() {
  const input = document.getElementById('searchInput');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    const pool = [
      ...state.feed.featured,
      ...state.feed.continueWatching,
      ...state.feed.liveNow,
      ...state.feed.recommendations,
      ...state.library.favorites,
      ...state.library.watchLater,
      ...state.library.history
    ];
    const matched = pool.filter(item => item.title.toLowerCase().includes(q));
    const root = document.getElementById('searchResult');
    root.innerHTML = matched.length
      ? matched.map(item => `<div class="item"><strong>${item.title}</strong><div class="meta">phase1 local search mock</div></div>`).join('')
      : `<div class="item"><strong>No result</strong><div class="meta">type movie / live / series / creator</div></div>`;
  });
}

renderProfiles();
renderHome();
renderCategory();
renderLibrary();
renderFollowing();
bindNavigation();
bindSearch();
