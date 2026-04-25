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
  const bff = window.StreamWatchBffClient;

  async function render() {
    const commonSurfaces = bridge.getPreferredSurfaceIds();
    const localSurfaces = bridge.getLocalStreamingSurfaceIds();

    const profile = bff ? await bff.profileBootstrap() : { ok: false };
    const home = bff ? await bff.loadHome() : { ok: false, continue_watching: [], featured: [] };
    const library = bff ? await bff.loadLibrary() : { ok: false, history_preview: [] };

    const viewerName = profile && profile.viewer_profile ? profile.viewer_profile.display_name : 'Unknown Viewer';

    app.innerHTML = `
      <main class="page">
        <section class="header-card">
          <div class="header-row">
            <div class="title-block">
              <h1>StreamWatch</h1>
              <p>Viewer starter wired to shared UI surfaces while playback ownership stays local.</p>
              <p class="muted">Viewer Profile: ${viewerName}</p>
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
          <h2>Continue Watching</h2>
          <div class="card-grid">
            ${(home.continue_watching || []).map(item => `
              <div class="card">
                <h3>${item.title}</h3>
                <p>Resume ratio: ${Math.round((item.resume_ratio || 0) * 100)}%</p>
              </div>
            `).join('') || '<div class="card"><h3>No items</h3><p>No resume items available.</p></div>'}
          </div>
        </section>

        <section class="section-card">
          <h2>Featured</h2>
          <div class="card-grid">
            ${(home.featured || []).map(item => `
              <div class="card">
                <h3>${item.title}</h3>
                <p>Access state: ${item.access_state}</p>
              </div>
            `).join('') || '<div class="card"><h3>No featured items</h3><p>Featured list placeholder.</p></div>'}
          </div>
        </section>

        <section class="section-card">
          <h2>Library Preview</h2>
          <div class="card-grid">
            ${(library.history_preview || []).map(item => `
              <div class="card">
                <h3>${item.title}</h3>
                <p>Last position seconds: ${item.last_position_seconds}</p>
              </div>
            `).join('') || '<div class="card"><h3>No history</h3><p>History preview placeholder.</p></div>'}
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
          <h2>OS-level _commonos Consumer Ref</h2>
          <div class="card-grid">
            <div class="card">
              <h3>consumerRoot</h3>
              <p>${consumerRef.consumerRoot}</p>
            </div>
            <div class="card">
              <h3>adapter</h3>
              <p>${consumerRef.adapter}</p>
            </div>
            <div class="card">
              <h3>bridge</h3>
              <p>${consumerRef.bridge}</p>
            </div>
            <div class="card">
              <h3>mapper</h3>
              <p>${consumerRef.mapper}</p>
            </div>
            <div class="card">
              <h3>presenter</h3>
              <p>${consumerRef.presenter}</p>
            </div>
            <div class="card">
              <h3>theme / sync</h3>
              <p>${consumerRef.theme}</p>
              <p>${consumerRef.sync}</p>
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
