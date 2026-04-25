const state = {
  projects: [
    {
      creator_project_id: "prj-demo-001",
      project_code: "SS-001",
      project_title: "Demo Creator Project",
      project_status: "draft",
      owner_creator_ref: "creator_demo_owner",
      default_language: "en",
      updated_at: new Date().toISOString()
    }
  ],
  uploads: [
    {
      creator_upload_job_id: "upl-demo-001",
      creator_project_id: "prj-demo-001",
      source_filename: "pilot-episode.mp4",
      ingest_status: "session_created",
      file_size_bytes: 104857600,
      updated_at: new Date().toISOString()
    }
  ],
  drafts: [
    {
      creator_video_draft_id: "drf-demo-001",
      creator_project_id: "prj-demo-001",
      draft_title: "Pilot Episode Draft",
      draft_status: "editing"
    }
  ],
  publishHistory: [],
  notifications: [
    "Upload queue starter is active.",
    "Publish runtime registration is starter-only.",
    "Marketplace and membership are intentionally out of phase 1."
  ]
};

function byId(id) {
  return document.getElementById(id);
}

function setScreen(screenId, label, subtitle) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach((el) => el.classList.remove("active"));
  byId(screenId).classList.add("active");
  document.querySelector(`[data-screen="${screenId}"]`).classList.add("active");
  byId("screen-title").textContent = label;
  byId("screen-subtitle").textContent = subtitle;
}

function renderMetrics() {
  byId("metric-projects").textContent = String(state.projects.length);
  byId("metric-uploads").textContent = String(state.uploads.length);
  byId("metric-drafts").textContent = String(state.drafts.length);
  byId("metric-publish").textContent = String(state.publishHistory.length);
}

function renderRecentActivity() {
  const lines = [
    `${state.projects.length} project(s) available`,
    `${state.uploads.length} upload job(s) in queue`,
    `${state.drafts.length} draft(s) tracked`,
    `${state.publishHistory.length} publish history item(s)`
  ];
  byId("recent-activity").innerHTML = lines.map((v) => `<li>${v}</li>`).join("");
}

function renderProjects() {
  byId("projects-body").innerHTML = state.projects.map((project) => `
    <tr>
      <td>${project.project_code}</td>
      <td>${project.project_title}</td>
      <td>${project.project_status}</td>
      <td>${project.owner_creator_ref}</td>
      <td>${project.default_language}</td>
      <td>${new Date(project.updated_at).toLocaleString()}</td>
    </tr>
  `).join("");
}

function renderUploads() {
  byId("uploads-body").innerHTML = state.uploads.map((upload) => `
    <tr>
      <td>${upload.creator_upload_job_id}</td>
      <td>${upload.creator_project_id}</td>
      <td>${upload.source_filename}</td>
      <td>${upload.ingest_status}</td>
      <td>${upload.file_size_bytes.toLocaleString()}</td>
      <td>${new Date(upload.updated_at).toLocaleString()}</td>
    </tr>
  `).join("");
}

function renderNotifications() {
  byId("notification-list").innerHTML = state.notifications.map((n) => `<li>${n}</li>`).join("");
}

function refreshAll() {
  renderMetrics();
  renderRecentActivity();
  renderProjects();
  renderUploads();
  renderNotifications();
}

document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const screen = btn.dataset.screen;
    const map = {
      home: ["Home Dashboard", "Phase1 starter implementation for creator workflow base."],
      projects: ["Projects", "Create, list, and update creator projects."],
      upload: ["Upload Queue", "Upload intake and retry starter surface."],
      publish: ["Publish", "Publish-base starter including validation and scheduling."],
      notifications: ["Notifications", "Starter inbox and quick-action placeholder."]
    };
    setScreen(screen, map[screen][0], map[screen][1]);
  });
});

byId("create-project-btn").addEventListener("click", () => {
  const title = byId("project-title-input").value.trim() || "Untitled Project";
  const next = String(state.projects.length + 1).padStart(3, "0");
  state.projects.unshift({
    creator_project_id: `prj-demo-${next}`,
    project_code: `SS-${next}`,
    project_title: title,
    project_status: "draft",
    owner_creator_ref: "creator_demo_owner",
    default_language: "en",
    updated_at: new Date().toISOString()
  });
  byId("project-title-input").value = "";
  refreshAll();
});

byId("quick-create-btn").addEventListener("click", () => {
  setScreen("projects", "Projects", "Create, list, and update creator projects.");
  byId("project-title-input").focus();
});

byId("start-upload-btn").addEventListener("click", () => {
  const next = String(state.uploads.length + 1).padStart(3, "0");
  state.uploads.unshift({
    creator_upload_job_id: `upl-demo-${next}`,
    creator_project_id: state.projects[0]?.creator_project_id || "prj-demo-001",
    source_filename: `new-upload-${next}.mp4`,
    ingest_status: "session_created",
    file_size_bytes: 52428800,
    updated_at: new Date().toISOString()
  });
  refreshAll();
});

byId("save-publish-btn").addEventListener("click", () => {
  const payload = {
    publish_ref: byId("publish-ref-input").value,
    visibility_code: byId("visibility-input").value,
    destination_ref: byId("destination-input").value,
    scheduled_at: byId("schedule-at-input").value || null
  };
  byId("publish-result").textContent = JSON.stringify({
    ok: true,
    data: {
      publish_setting: payload
    },
    meta: {
      request_id: `req-${Date.now()}`
    }
  }, null, 2);
});

byId("validate-publish-btn").addEventListener("click", () => {
  const result = {
    ok: true,
    data: {
      readiness: {
        readiness_status: "ready",
        blockers: []
      }
    },
    meta: {
      request_id: `req-${Date.now()}`
    }
  };
  byId("publish-result").textContent = JSON.stringify(result, null, 2);
});

byId("schedule-publish-btn").addEventListener("click", () => {
  const executeAfter = byId("schedule-at-input").value || new Date(Date.now() + 3600_000).toISOString();
  const item = {
    creator_publish_request_id: `pubreq-${Date.now()}`,
    request_status: "scheduled",
    execute_after: executeAfter
  };
  state.publishHistory.unshift(item);
  byId("publish-result").textContent = JSON.stringify({
    ok: true,
    data: {
      publish_request: item
    },
    meta: {
      request_id: `req-${Date.now()}`
    }
  }, null, 2);
  refreshAll();
});

refreshAll();
