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
  const bff = window.StreamStudioBffClient;

  async function render() {
    const commonSurfaces = bridge.getPreferredSurfaceIds();
    const localSurfaces = bridge.getLocalStreamingSurfaceIds();

    const dashboard = bff ? await bff.loadDashboard() : { ok: false, summary: {} };
    const projects = bff ? await bff.loadProjects() : { ok: false, items: [] };
    const uploadQueue = bff ? await bff.loadUploadQueue() : { ok: false, items: [] };

    app.innerHTML = `
      <main class="page">
        <section class="header-card">
          <div class="header-row">
            <div class="title-block">
              <h1>StreamStudio</h1>
              <p>Creator starter wired to OS-level _commonos consumer while publishing ownership stays local.</p>
              <p class="muted">Drafts: ${dashboard.summary.draft_projects || 0} / Uploads: ${dashboard.summary.uploads_processing || 0}</p>
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
            <button id="projectsButton" class="btn btn-primary">Open Projects</button>
            <button id="publishButton" class="btn btn-secondary">Publish Queue</button>
            <button id="approvalButton" class="btn btn-ghost">Request Approval</button>
          </div>
        </section>

        <section class="section-card">
          <h2>Projects</h2>
          <div class="card-grid">
            ${(projects.items || []).map(item => `
              <div class="card">
                <h3>${item.project_title}</h3>
                <p>Status: ${item.project_status}</p>
              </div>
            `).join('') || '<div class="card"><h3>No projects</h3><p>Project list placeholder.</p></div>'}
          </div>
        </section>

        <section class="section-card">
          <h2>Upload Queue</h2>
          <div class="card-grid">
            ${(uploadQueue.items || []).map(item => `
              <div class="card">
                <h3>${item.creator_upload_job_id}</h3>
                <p>Target: ${item.upload_target_type}</p>
                <p>Status: ${item.upload_status}</p>
              </div>
            `).join('') || '<div class="card"><h3>No uploads</h3><p>Upload queue placeholder.</p></div>'}
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

    document.getElementById('projectsButton').addEventListener('click', async function () {
      const result = await bff.createProject({
        project_title: 'New Demo Project'
      });
      subtitle.textContent = result.ok ? 'Project create sent.' : 'Project create fallback.';
    });

    document.getElementById('publishButton').addEventListener('click', async function () {
      const result = await bff.requestPublish({
        creator_project_id: 'cp_001',
        publish_mode: 'publish_now'
      });
      subtitle.textContent = result.ok ? 'Publish request sent.' : 'Publish request fallback.';
    });

    document.getElementById('approvalButton').addEventListener('click', async function () {
      const result = await bff.requestApproval({
        creator_project_id: 'cp_001',
        approval_type: 'publish_gate'
      });
      subtitle.textContent = result.ok ? 'Approval request sent.' : 'Approval request fallback.';
    });
  }

  render().catch(function (error) {
    app.innerHTML = '<main class="page"><section class="section-card"><h2>Error</h2><p>' + String(error) + '</p></section></main>';
  });
})();
