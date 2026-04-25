(function (global) {
  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function mapProfile(profileResponse) {
    const viewer = profileResponse && profileResponse.viewer_profile ? profileResponse.viewer_profile : {};
    return {
      viewerName: viewer.display_name || 'Unknown Viewer',
      subtitle: 'Viewer starter wired through OS-level mapper reflection.'
    };
  }

  function mapHome(homeResponse) {
    const continueWatching = safeArray(homeResponse && homeResponse.continue_watching).map(function (item) {
      const ratio = Math.round(Number(item.resume_ratio || 0) * 100);
      return {
        cardId: item.content_id || 'cw_unknown',
        title: item.title || item.content_id || 'Untitled',
        meta: 'Resume ratio: ' + ratio + '%',
        surfaceType: 'continue_watching'
      };
    });

    const featured = safeArray(homeResponse && homeResponse.featured).map(function (item) {
      return {
        cardId: item.content_id || 'ft_unknown',
        title: item.title || item.content_id || 'Untitled',
        meta: 'Access state: ' + (item.access_state || 'unknown'),
        surfaceType: 'featured'
      };
    });

    return {
      cards: continueWatching.concat(featured)
    };
  }

  function mapLibrary(libraryResponse) {
    const historyPreview = safeArray(libraryResponse && libraryResponse.history_preview).map(function (item) {
      return {
        cardId: item.content_id || 'hist_unknown',
        title: item.title || item.content_id || 'Untitled',
        meta: 'Last position seconds: ' + String(item.last_position_seconds || 0),
        surfaceType: 'history_preview'
      };
    });

    return {
      cards: historyPreview
    };
  }

  function describeMappingScope() {
    return 'profile_bootstrap -> header_model, home -> home_card_model, library -> library_card_model';
  }

  global.StreamWatchDisplayModelMapper = {
    mapProfile: mapProfile,
    mapHome: mapHome,
    mapLibrary: mapLibrary,
    describeMappingScope: describeMappingScope
  };
})(window);
