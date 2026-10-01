function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function option(value, label, selected = false) {
  return `<option value="${escapeHtml(value)}"${selected ? " selected" : ""}>${escapeHtml(label)}</option>`;
}

function statusPill(label, value) {
  return `
    <div class="status-pill">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value ?? "—")}</strong>
    </div>
  `;
}

export function createInitialState() {
  return {
    screen: "home",
    loading: true,
    bootstrap: null,
    project: null,
    selectedTemplateCode: null,
    error: null
  };
}

export function renderBuilderUi(state) {
  if (state.loading) {
    return `
      <main class="shell" data-testid="builder-loading">
        <header class="topbar">
          <div>
            <div class="eyebrow">GameOS</div>
            <h1>Game Builder</h1>
          </div>
        </header>
        <section class="panel skeleton-panel" aria-busy="true">
          <div class="skeleton wide"></div>
          <div class="skeleton"></div>
          <div class="skeleton"></div>
        </section>
      </main>
    `;
  }

  const error = state.error
    ? `
      <div class="error-banner" role="alert" data-testid="builder-error">
        <strong>${escapeHtml(state.error.errorCode || "GAME_BUILDER_ERROR")}</strong>
        <span>${escapeHtml(state.error.errorMessage || "Builder operation failed.")}</span>
      </div>
    `
    : "";

  if (state.screen === "templates") {
    return renderTemplates(state, error);
  }

  if (state.screen === "create") {
    return renderCreate(state, error);
  }

  if (state.screen === "overview") {
    return renderOverview(state, error);
  }

  return renderHome(state, error);
}

function renderHome(state, error) {
  const projects = state.bootstrap?.recentProjects || [];

  const projectMarkup = projects.length
    ? projects
        .map(
          (project) => `
            <article class="project-card" data-testid="project-card">
              <div>
                <div class="eyebrow">${escapeHtml(project.runtimeFamilyCode)}</div>
                <h3>${escapeHtml(project.projectName)}</h3>
                <p>${escapeHtml(project.projectCode)}</p>
              </div>
              <div class="card-status">
                <span>${escapeHtml(project.saveState || "draft")}</span>
                <span>${escapeHtml(project.latestRevisionRef || "no revision")}</span>
              </div>
              <button
                class="button secondary"
                data-action="open-project"
                data-project-code="${escapeHtml(project.projectCode)}"
              >Open project</button>
            </article>
          `
        )
        .join("")
    : `
      <div class="empty-state" data-testid="empty-projects">
        <h3>No projects yet</h3>
        <p>Create the first Builder project from a runtime/template-compatible basis.</p>
      </div>
    `;

  return `
    <main class="shell" data-testid="builder-home">
      <header class="topbar">
        <div>
          <div class="eyebrow">GameOS Home / Game Builder</div>
          <h1>Builder Home</h1>
          <p class="muted">Permission: ${escapeHtml(state.bootstrap?.permissionBasis || "Builder access")}</p>
        </div>
        <div class="top-actions">
          <button class="button secondary" data-action="open-templates">Template Gallery</button>
          <button class="button primary" data-action="open-create">Create project</button>
        </div>
      </header>

      ${error}

      <section class="metrics" aria-label="Builder status">
        ${statusPill("Drafts", state.bootstrap?.draftCount ?? projects.length)}
        ${statusPill("Validation pending", state.bootstrap?.validationPendingCount ?? 0)}
        ${statusPill("Submission pending", state.bootstrap?.submissionPendingCount ?? 0)}
      </section>

      <section class="section-block">
        <div class="section-heading">
          <div>
            <div class="eyebrow">Recent activity</div>
            <h2>Recent projects</h2>
          </div>
        </div>
        <div class="project-grid">${projectMarkup}</div>
      </section>
    </main>
  `;
}

function renderTemplates(state, error) {
  const templates = state.bootstrap?.templates || [];

  const cards = templates.length
    ? templates
        .map(
          (template) => `
            <article
              class="template-card ${state.selectedTemplateCode === template.templateProfileCode ? "selected" : ""}"
              data-testid="template-card"
            >
              <div class="eyebrow">${escapeHtml(template.runtimeFamilyCode)}</div>
              <h3>${escapeHtml(template.templateName)}</h3>
              <p>${escapeHtml(template.templateProfileCode)}</p>
              <p class="muted">${escapeHtml(template.compatibilityNotes || "Runtime-compatible template")}</p>
              <div class="card-actions">
                <button
                  class="button secondary"
                  data-action="select-template"
                  data-template-code="${escapeHtml(template.templateProfileCode)}"
                >Select</button>
                <button
                  class="button primary"
                  data-action="create-with-template"
                  data-template-code="${escapeHtml(template.templateProfileCode)}"
                >Create from template</button>
              </div>
            </article>
          `
        )
        .join("")
    : `
      <div class="empty-state" data-testid="empty-templates">
        No templates matched the current Builder basis.
      </div>
    `;

  return `
    <main class="shell" data-testid="template-gallery">
      <header class="topbar">
        <div>
          <div class="eyebrow">Game Builder</div>
          <h1>Template Gallery</h1>
          <p class="muted">Choose a template compatible with the target runtime family.</p>
        </div>
        <button class="button secondary" data-action="back-home">Builder Home</button>
      </header>

      ${error}

      <section class="toolbar">
        <label>
          Search templates
          <input type="search" placeholder="Template name or code" disabled>
        </label>
        <label>
          Runtime family
          <select disabled>
            <option>All available runtime families</option>
          </select>
        </label>
      </section>

      <section class="template-grid">${cards}</section>
    </main>
  `;
}

function renderCreate(state, error) {
  const bootstrap = state.bootstrap || {};
  const workspaces = bootstrap.workspaces || [];
  const runtimeProfiles = bootstrap.runtimeProfiles || [];
  const templates = bootstrap.templates || [];

  const selectedTemplate = templates.find(
    (item) => item.templateProfileCode === state.selectedTemplateCode
  );

  const runtimeCode =
    selectedTemplate?.runtimeFamilyCode ||
    runtimeProfiles[0]?.runtimeFamilyCode ||
    "";

  const runtimeProfile =
    runtimeProfiles.find(
      (item) => item.runtimeFamilyCode === runtimeCode
    ) || runtimeProfiles[0];

  return `
    <main class="shell" data-testid="create-project-screen">
      <header class="topbar">
        <div>
          <div class="eyebrow">M01 Builder Foundation</div>
          <h1>Create project</h1>
          <p class="muted">Project and initial revision are created as one coherent operation.</p>
        </div>
        <button class="button secondary" data-action="back-home">Cancel</button>
      </header>

      ${error}

      <form id="create-project-form" class="panel form-grid" data-testid="create-project-form">
        <label>
          Workspace
          <select name="workspaceCode" required>
            ${workspaces
              .map((item, index) =>
                option(
                  item.workspaceCode,
                  `${item.workspaceName} (${item.workspaceCode})`,
                  index === 0
                )
              )
              .join("")}
          </select>
        </label>

        <label>
          Project code
          <input name="projectCode" required pattern="[A-Za-z0-9_\\-]+" placeholder="gpr_my_game">
        </label>

        <label class="span-2">
          Project name
          <input name="projectName" required maxlength="120" placeholder="My Game">
        </label>

        <label>
          Runtime profile
          <select name="runtimeProfileCode" required>
            ${runtimeProfiles
              .map((item) =>
                option(
                  item.runtimeProfileCode,
                  `${item.runtimeProfileName} (${item.runtimeFamilyCode})`,
                  item.runtimeProfileCode === runtimeProfile?.runtimeProfileCode
                )
              )
              .join("")}
          </select>
        </label>

        <label>
          Runtime family
          <input
            name="runtimeFamilyCode"
            readonly
            value="${escapeHtml(runtimeProfile?.runtimeFamilyCode || runtimeCode)}"
          >
        </label>

        <label>
          Template
          <select name="templateProfileCode">
            <option value="">No template</option>
            ${templates
              .map((item) =>
                option(
                  item.templateProfileCode,
                  `${item.templateName} (${item.runtimeFamilyCode})`,
                  item.templateProfileCode === state.selectedTemplateCode
                )
              )
              .join("")}
          </select>
        </label>

        <label>
          Template family
          <input
            name="templateFamilyCode"
            readonly
            value="${escapeHtml(selectedTemplate?.templateFamilyCode || "")}"
          >
        </label>

        <label>
          Default language
          <input
            name="defaultLanguageCode"
            required
            value="${escapeHtml(workspaces[0]?.defaultLanguageCode || "ja")}"
          >
        </label>

        <div class="form-actions span-2">
          <button class="button secondary" type="button" data-action="open-templates">Template Gallery</button>
          <button class="button primary" type="submit">Create project</button>
        </div>
      </form>
    </main>
  `;
}

function renderOverview(state, error) {
  const project = state.project;

  if (!project) {
    return renderHome(
      {
        ...state,
        screen: "home"
      },
      error
    );
  }

  return `
    <main class="shell" data-testid="project-overview">
      <header class="topbar">
        <div>
          <div class="eyebrow">${escapeHtml(project.runtimeFamilyCode)} / ${escapeHtml(project.projectCode)}</div>
          <h1>${escapeHtml(project.projectName)}</h1>
          <p class="muted">Project Overview</p>
        </div>
        <div class="top-actions">
          <button class="button secondary" data-action="back-home">Builder Home</button>
          <button class="button primary" disabled title="Main Editor belongs to M02">Open editor</button>
        </div>
      </header>

      ${error}

      <section class="overview-grid">
        <article class="panel">
          <div class="eyebrow">Project basis</div>
          <dl class="definition-list">
            <div><dt>Workspace</dt><dd>${escapeHtml(project.workspaceCode)}</dd></div>
            <div><dt>Runtime</dt><dd>${escapeHtml(project.runtimeProfileCode)}</dd></div>
            <div><dt>Template</dt><dd>${escapeHtml(project.templateProfileCode || "None")}</dd></div>
          </dl>
        </article>

        <article class="panel" data-testid="revision-summary">
          <div class="eyebrow">Revision status</div>
          <h2>${escapeHtml(project.latestRevisionRef)}</h2>
          <p>Initial immutable revision is linked as the current project basis.</p>
        </article>

        <article class="panel">
          <div class="eyebrow">Readiness</div>
          <div class="metrics vertical">
            ${statusPill("Save", project.saveState)}
            ${statusPill("Validation", project.inlineValidationState)}
            ${statusPill("Export", project.exportReadinessState)}
            ${statusPill("Publish", project.publishReadinessState)}
          </div>
        </article>
      </section>
    </main>
  `;
}

export function createBuilderController(api, onChange = () => {}) {
  let state = createInitialState();

  const publish = (patch = {}) => {
    state = {
      ...state,
      ...patch
    };
    onChange(state);
    return state;
  };

  const controller = {
    get state() {
      return state;
    },

    async load() {
      publish({
        loading: true,
        error: null
      });

      try {
        const bootstrap = await api.loadBootstrap();

        publish({
          loading: false,
          bootstrap,
          screen: "home",
          error: null
        });
      } catch (error) {
        publish({
          loading: false,
          error: error.payload || {
            errorCode: "GAME_BUILDER_BOOTSTRAP_FAILED",
            errorMessage: error.message
          }
        });
      }

      return state;
    },

    openHome() {
      return publish({
        screen: "home",
        error: null
      });
    },

    openTemplates() {
      return publish({
        screen: "templates",
        error: null
      });
    },

    selectTemplate(templateCode) {
      return publish({
        screen: "templates",
        selectedTemplateCode: templateCode,
        error: null
      });
    },

    beginCreate(templateCode = state.selectedTemplateCode) {
      return publish({
        screen: "create",
        selectedTemplateCode: templateCode || null,
        error: null
      });
    },

    async openProject(projectCode) {
      publish({
        loading: true,
        error: null
      });

      try {
        const project = await api.getProject(projectCode);

        publish({
          loading: false,
          screen: "overview",
          project,
          error: null
        });
      } catch (error) {
        publish({
          loading: false,
          screen: "home",
          error: error.payload || {
            errorCode: "GAME_PROJECT_OPEN_FAILED",
            errorMessage: error.message
          }
        });
      }

      return state;
    },

    async createProject(input) {
      publish({
        loading: true,
        error: null
      });

      try {
        const project = await api.createProject(input);

        publish({
          loading: false,
          screen: "overview",
          project,
          error: null
        });
      } catch (error) {
        publish({
          loading: false,
          screen: "create",
          error: error.payload || {
            errorCode: "GAME_PROJECT_CREATE_FAILED",
            errorMessage: error.message
          }
        });
      }

      return state;
    }
  };

  return controller;
}
