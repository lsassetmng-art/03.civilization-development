(function (global) {
  const routeCatalog = {
    profile_bootstrap: { method: 'GET', path: '/api/v1/streamwatch/profile/bootstrap' },
    home: { method: 'GET', path: '/api/v1/streamwatch/home' },
    category_tree: { method: 'GET', path: '/api/v1/streamwatch/category-tree' },
    library: { method: 'GET', path: '/api/v1/streamwatch/library' },
    progress_upsert: { method: 'POST', path: '/api/v1/streamwatch/progress/upsert' },
    tv_handoff_start: { method: 'POST', path: '/api/v1/streamwatch/tv-handoff/start' },
    membership_join: { method: 'POST', path: '/api/v1/streamwatch/membership/join' }
  };

  const fallbackData = {
    profile_bootstrap: {
      ok: true,
      viewer_profile: {
        viewer_profile_id: 'vp_demo_primary',
        display_name: 'Primary Viewer',
        restriction_level: 'standard'
      }
    },
    home: {
      ok: true,
      continue_watching: [
        { content_id: 'cw_001', title: 'Space Talk Episode 1', resume_ratio: 0.42 }
      ],
      featured: [
        { content_id: 'ft_001', title: 'Creator Spotlight Live', access_state: 'membership_cta' },
        { content_id: 'ft_002', title: 'Open Documentary', access_state: 'playable' }
      ]
    },
    library: {
      ok: true,
      history_preview: [
        { content_id: 'hist_001', title: 'Archive Concert', last_position_seconds: 932 }
      ],
      playlists: [],
      favorites: [],
      watch_later: []
    }
  };

  async function request(routeKey, body) {
    const route = routeCatalog[routeKey];
    if (!route) {
      throw new Error('Unknown route key: ' + routeKey);
    }

    try {
      const response = await fetch(route.path, {
        method: route.method,
        headers: { 'Content-Type': 'application/json' },
        body: route.method === 'GET' ? undefined : JSON.stringify(body || {})
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      return await response.json();
    } catch (error) {
      if (Object.prototype.hasOwnProperty.call(fallbackData, routeKey)) {
        return fallbackData[routeKey];
      }
      return { ok: false, error: String(error) };
    }
  }

  global.StreamWatchBffClient = {
    routeCatalog,
    profileBootstrap() {
      return request('profile_bootstrap');
    },
    loadHome() {
      return request('home');
    },
    loadLibrary() {
      return request('library');
    },
    upsertProgress(payload) {
      return request('progress_upsert', payload);
    },
    startTvHandoff(payload) {
      return request('tv_handoff_start', payload);
    },
    joinMembership(payload) {
      return request('membership_join', payload);
    }
  };
})(window);
