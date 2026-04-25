(function () {
  const app = document.getElementById('app');
  const bridge = window.CommonOSBridge || {
    getPreferredSurfaceIds: () => [],
    getLocalStreamingSurfaceIds: () => []
  };
  const consumerRef = window.StreamingOsCommonConsumerRef || {
    consumerRoot: '(missing)',
    adapter: '(missing)',
    bridge: '(missing)',
    mapper: '(missing)',
    presenter: '(missing)',
    theme: '(missing)',
    sync: '(missing)'
  };
  const mapper = window.StreamWatchDisplayModelMapper || {
    mapProfile: () => ({ viewerName: 'Unknown Viewer', subtitle: 'Mapper missing.' }),
    mapHome: () => ({ cards: [] }),
    mapLibrary: () => ({ cards: [] }),
    describeMappingScope: () => 'Mapper missing'
  };
  const bff = window.StreamWatchBffClient;

  async function render() {
    const commonSurfaces = bridge.getPreferredSurfaceIds();
    const localSurfaces = bridge.getLocalStreamingSurfaceIds();

    const profileRaw = bff ? await bff.profileBootstrap() : { ok: false };
    const homeRaw = bff ? await bff.loadHome() : { ok: false, continue_watching: [], featured: [] };
    const libraryRaw = bff ? await bff.loadLibrary() : { ok: false, history_preview: [] };

    const profile = mapper.mapProfile(profileRaw);
    const home = mapper.mapHome(homeRaw);
    const library = mapper.mapLibrary(libraryRaw);

    app.innerHTML = `
      <main class="page">
        <section class="header-card">
          <div class="header-row">
            <div class="title-block">
              <h1>StreamWatch</h1>
              <p>${profile.subtitle}</p>
              <p class="muted">Viewer Profile: ${profile.viewerName}</p>
            </div>
            <div class="badge">Persona / Background Switchable</div>
          </div>
        </section>

        <section class="section-card">
          <h2>Search</h2>
          <input class="search-input" type="search" placeholder="Search titles, channels, creators" />
        </section>

        <section class="section-card">
          <h2>Primary Actions</h2>
          <div class="action-row">
            <button id="resumeButton" class="btn btn-primary">Resume Watching</button>
            <button id="libraryButton" class="btn btn-secondary">Open Library</button>
            <button id="tvButton" class="btn btn-ghost">TV Handoff</button>
          </div>
        </section>

        <section class="section-card">
          <h2>Mapped Home Cards</h2>
          <div class="card-grid">
            ${(home.cards || []).map(item => `
              <div class="card">
                <h3>${item.title}</h3>
                <p>${item.meta}</p>
                <p class="muted">surfaceType: ${item.surfaceType}</p>
              </div>
            `).join('') || '<div class="card"><h3>No cards</h3><p>Mapped home card placeholder.</p></div>'}
          </div>
        </section>

        <section class="section-card">
          <h2>Mapped Library Cards</h2>
          <div class="card-grid">
            ${(library.cards || []).map(item => `
              <div class="card">
                <h3>${item.title}</h3>
                <p>${item.meta}</p>
                <p class="muted">surfaceType: ${item.surfaceType}</p>
              </div>
            `).join('') || '<div class="card"><h3>No cards</h3><p>Mapped library card placeholder.</p></div>'}
          </div>
        </section>

        <section class="sync-card">
          <h2>Common UI Surfaces</h2>
          <div class="status-row">
            ${commonSurfaces.map(id => `<span class="status-chip">${id}</span>`).join('')}
          </div>
        </section>

        <section class="local-card">
          <h2>Streaming Local Surfaces</h2>
          <div class="status-row">
            ${localSurfaces.map(id => `<span class="status-chip">${id}</span>`).join('')}
          </div>
        </section>

        <section class="section-card">
          <h2>Mapper Reflection</h2>
          <div class="card-grid">
            <div class="card">
              <h3>mapper contract</h3>
              <p>${consumerRef.mapper}</p>
            </div>
            <div class="card">
              <h3>mapping scope</h3>
              <p>${mapper.describeMappingScope()}</p>
            </div>
          </div>
        </section>
      </main>
    `;

    const subtitle = document.querySelector('.title-block .muted');

    document.getElementById('resumeButton').addEventListener('click', async function () {
      const result = await bff.upsertProgress({
        viewer_profile_id: 'vp_demo_primary',
        content_id: 'cw_001',
        progress_ratio: 0.43
      });
      subtitle.textContent = result.ok ? 'Progress upsert sent.' : 'Progress upsert fallback.';
    });

    document.getElementById('libraryButton').addEventListener('click', function () {
      subtitle.textContent = 'Library surface placeholder.';
    });

    document.getElementById('tvButton').addEventListener('click', async function () {
      const result = await bff.startTvHandoff({
        viewer_profile_id: 'vp_demo_primary',
        content_id: 'cw_001',
        target_device_route: 'living_room_tv'
      });
      subtitle.textContent = result.ok ? 'TV handoff start sent.' : 'TV handoff fallback.';
    });
  }

  render().catch(function (error) {
    app.innerHTML = '<main class="page"><section class="section-card"><h2>Error</h2><p>' + String(error) + '</p></section></main>';
  });
})();
