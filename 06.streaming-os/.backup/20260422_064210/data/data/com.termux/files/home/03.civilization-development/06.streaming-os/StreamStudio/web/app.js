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
            <h1>StreamStudio</h1>
            <p>Creator home surface with shared UI adoption and local publishing ownership.</p>
          </div>
          <div class="badge">Persona / Background Switchable</div>
        </div>
      </section>

      <section class="section-card">
        <h2>Search</h2>
        <input class="search-input" type="search" placeholder="Search projects, uploads, publish jobs" />
      </section>

      <section class="section-card">
        <h2>Primary Actions</h2>
        <div class="action-row">
          <button class="btn btn-primary">Open Projects</button>
          <button class="btn btn-secondary">Publish Queue</button>
          <button class="btn btn-ghost">Sync Status</button>
        </div>
      </section>

      <section class="section-card">
        <h2>Studio Surfaces</h2>
        <div class="card-grid">
          <div class="card">
            <h3>Project Board</h3>
            <p>Shared shell with studio-local business meaning.</p>
          </div>
          <div class="card">
            <h3>Publish Pipeline</h3>
            <p>Publishing control remains in StreamingOS.</p>
          </div>
          <div class="card">
            <h3>Metadata Review</h3>
            <p>Common form and validation presentation entry point.</p>
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
