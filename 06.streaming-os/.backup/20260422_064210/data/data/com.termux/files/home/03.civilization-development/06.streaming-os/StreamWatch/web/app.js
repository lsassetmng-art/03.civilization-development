(function () {
  const app = document.getElementById('app');
  const bridge = window.CommonOSBridge || {
    getPreferredSurfaceIds: () => [],
    getLocalStreamingSurfaceIds: () => []
  };

  const commonSurfaces = bridge.getPreferredSurfaceIds();
  const localSurfaces = bridge.getLocalStreamingSurfaceIds();

  app.innerHTML = `
    <main class="page">
      <section class="header-card">
        <div class="header-row">
          <div class="title-block">
            <h1>StreamWatch</h1>
            <p>Viewer home surface with common UI adoption and local playback ownership.</p>
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
          <button class="btn btn-primary">Resume Watching</button>
          <button class="btn btn-secondary">Open Library</button>
          <button class="btn btn-ghost">TV Handoff</button>
        </div>
      </section>

      <section class="section-card">
        <h2>Watch Surfaces</h2>
        <div class="card-grid">
          <div class="card">
            <h3>Continue Watching</h3>
            <p>Projection-based resume list starter.</p>
          </div>
          <div class="card">
            <h3>Membership</h3>
            <p>Membership and entitlement entry surface placeholder.</p>
          </div>
          <div class="card">
            <h3>Notification</h3>
            <p>Shared list/detail shell with local streaming meaning.</p>
          </div>
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
    </main>
  `;
})();
