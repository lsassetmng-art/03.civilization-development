#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$HOME/03.civilization-development/06.streaming-os"
STUDIO="$ROOT/StreamStudio"
WATCH="$ROOT/StreamWatch"

echo "============================================================"
echo "STREAMING APP PHASE1 STARTER BOOTSTRAP"
echo "ROOT  : $ROOT"
echo "STUDIO: $STUDIO"
echo "WATCH : $WATCH"
echo "============================================================"

mkdir -p \
  "$ROOT" \
  "$STUDIO/web" \
  "$STUDIO/docs" \
  "$STUDIO/sql" \
  "$STUDIO/scripts" \
  "$STUDIO/supabase/functions/stream-studio-phase1" \
  "$WATCH/web" \
  "$WATCH/docs"

cat > "$ROOT/README_STREAMING_IMPLEMENTATION.md" <<'EOF'
# ============================================================
# STREAMING APP IMPLEMENTATION ROADMAP
# ============================================================

status: phase1-starter-generated
system: StreamingOS
owner: Boss
prepared_by: Zero

roadmap:
  phase_1:
    - StreamStudio project / upload / draft / publish-base starter implementation
    - StreamStudio phase1 schema starter
    - StreamStudio verification runner starter
    - StreamWatch viewer shell starter
    - StreamWatch boundary memo
  phase_2:
    - StreamStudio API exact payload hardening
    - StreamStudio DB-side exact migration alignment
    - StreamWatch exact screen and API freeze import
  phase_3:
    - StreamStudio real edge binding and UI integration
    - StreamWatch real playback, entitlement, and continuity runtime

current_position:
- StreamStudio: design-complete and starter implementation generated
- StreamWatch: integrated-canonical summary available, starter shell generated

done_condition_for_this_bundle:
- dedicated StreamingOS implementation root exists
- StreamStudio starter web / function / sql / scripts exist
- StreamWatch starter web / docs exist
- DB runner uses PERSONA_DATABASE_URL
EOF

cat > "$STUDIO/docs/000_STREAM_STUDIO_IMPLEMENTATION_BOUNDARY.md" <<'EOF'
# ============================================================
# STREAM STUDIO IMPLEMENTATION BOUNDARY
# ============================================================

status: implementation-boundary
system: StreamingOS
app: StreamStudio
phase: phase1
schema: streaming
db_target: PERSONA_DATABASE_URL

in_scope_phase1:
- project create / list / detail / update
- upload session create / complete / status / retry
- video draft create
- metadata update
- thumbnail assignment
- subtitle track add
- edit marker upsert
- publish setting upsert
- publish readiness validation
- publish request create
- publish request schedule
- publish history read

out_of_scope_phase1:
- marketplace execution
- membership execution
- split execution
- settlement execution
- external push execution
- production notification connector execution

fixed_stack_for_starter:
- web shell: html / css / javascript
- edge starter: typescript
- db runner: psql + PERSONA_DATABASE_URL

note:
This starter bundle intentionally begins with a minimal but real implementation root
instead of pretending that full production completion already exists.
EOF

cat > "$STUDIO/web/index.html" <<'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>StreamStudio Phase1 Starter</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">StreamStudio</div>
      <button class="nav-btn active" data-screen="home">Home</button>
      <button class="nav-btn" data-screen="projects">Projects</button>
      <button class="nav-btn" data-screen="upload">Upload Queue</button>
      <button class="nav-btn" data-screen="publish">Publish</button>
      <button class="nav-btn" data-screen="notifications">Notifications</button>
    </aside>

    <main class="main">
      <header class="topbar">
        <div>
          <h1 id="screen-title">Home Dashboard</h1>
          <p id="screen-subtitle">Phase1 starter implementation for creator workflow base.</p>
        </div>
        <button id="quick-create-btn">Quick Create Project</button>
      </header>

      <section id="home" class="screen active">
        <div class="grid">
          <div class="card">
            <h2>Projects</h2>
            <div class="metric" id="metric-projects">0</div>
          </div>
          <div class="card">
            <h2>Uploads In Queue</h2>
            <div class="metric" id="metric-uploads">0</div>
          </div>
          <div class="card">
            <h2>Drafts</h2>
            <div class="metric" id="metric-drafts">0</div>
          </div>
          <div class="card">
            <h2>Scheduled Publish</h2>
            <div class="metric" id="metric-publish">0</div>
          </div>
        </div>
        <div class="card">
          <h2>Recent Activity</h2>
          <ul id="recent-activity"></ul>
        </div>
      </section>

      <section id="projects" class="screen">
        <div class="card">
          <h2>Projects</h2>
          <div class="toolbar">
            <input id="project-title-input" placeholder="New project title" />
            <button id="create-project-btn">Create</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Language</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody id="projects-body"></tbody>
          </table>
        </div>
      </section>

      <section id="upload" class="screen">
        <div class="card">
          <h2>Upload Queue</h2>
          <div class="toolbar">
            <button id="start-upload-btn">Create Upload Session</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Upload Job</th>
                <th>Project</th>
                <th>Filename</th>
                <th>Status</th>
                <th>Size</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody id="uploads-body"></tbody>
          </table>
        </div>
      </section>

      <section id="publish" class="screen">
        <div class="card">
          <h2>Publish Base</h2>
          <div class="publish-grid">
            <div>
              <label>Publish Ref</label>
              <input id="publish-ref-input" value="pub-demo-001" />
            </div>
            <div>
              <label>Visibility</label>
              <select id="visibility-input">
                <option value="private">private</option>
                <option value="unlisted">unlisted</option>
                <option value="public">public</option>
              </select>
            </div>
            <div>
              <label>Destination</label>
              <input id="destination-input" value="streaming_internal" />
            </div>
            <div>
              <label>Schedule At</label>
              <input id="schedule-at-input" type="datetime-local" />
            </div>
          </div>
          <div class="toolbar">
            <button id="save-publish-btn">Save Setting</button>
            <button id="validate-publish-btn">Validate</button>
            <button id="schedule-publish-btn">Schedule Publish</button>
          </div>
          <pre id="publish-result"></pre>
        </div>
      </section>

      <section id="notifications" class="screen">
        <div class="card">
          <h2>Notifications</h2>
          <ul id="notification-list"></ul>
        </div>
      </section>
    </main>
  </div>

  <script src="./app.js"></script>
</body>
</html>
EOF

cat > "$STUDIO/web/app.css" <<'EOF'
:root {
  color-scheme: dark;
  --bg: #12161c;
  --panel: #1b222c;
  --panel-2: #232d3a;
  --line: #334154;
  --text: #edf3ff;
  --muted: #9fb0ca;
  --accent: #67b0ff;
  --danger: #ff7e7e;
  --ok: #77d6a3;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
}
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 240px 1fr;
}
.sidebar {
  background: var(--panel);
  border-right: 1px solid var(--line);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.brand {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 14px;
}
.nav-btn, button {
  border: 1px solid var(--line);
  background: var(--panel-2);
  color: var(--text);
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
}
.nav-btn.active {
  border-color: var(--accent);
  color: var(--accent);
}
.main {
  padding: 24px;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.screen { display: none; }
.screen.active { display: block; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(180px,1fr));
  gap: 14px;
  margin-bottom: 14px;
}
.card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 14px;
}
.metric {
  font-size: 34px;
  font-weight: 700;
  margin-top: 8px;
}
.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
input, select, textarea {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: #0f141a;
  color: var(--text);
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 10px;
  border-bottom: 1px solid var(--line);
  text-align: left;
}
.publish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
  gap: 12px;
  margin-bottom: 12px;
}
pre {
  background: #0f141a;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px;
  overflow: auto;
  white-space: pre-wrap;
}
ul {
  margin: 0;
  padding-left: 18px;
}
@media (max-width: 900px) {
  .app-shell {
    grid-template-columns: 1fr;
  }
  .sidebar {
    border-right: none;
    border-bottom: 1px solid var(--line);
  }
}
EOF

cat > "$STUDIO/web/app.js" <<'EOF'
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
EOF

cat > "$STUDIO/supabase/functions/stream-studio-phase1/index.ts" <<'EOF'
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type JsonRecord = Record<string, unknown>;

const projects: JsonRecord[] = [
  {
    creator_project_id: "prj-demo-001",
    project_code: "SS-001",
    project_title: "Demo Creator Project",
    project_summary: "Starter project created by StreamStudio phase1 edge stub.",
    project_status: "draft",
    owner_creator_ref: "creator_demo_owner",
    default_language: "en",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },
];

const uploads: JsonRecord[] = [];
const drafts: JsonRecord[] = [];
const publishSettings = new Map<string, JsonRecord>();
const publishHistory: JsonRecord[] = [];

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  });
}

function requestId() {
  return crypto.randomUUID();
}

function ok(data: JsonRecord) {
  return json({
    ok: true,
    data,
    meta: {
      request_id: requestId(),
    },
  });
}

function fail(status: number, code: string, message: string) {
  return json({
    ok: false,
    error: {
      code,
      message,
    },
    meta: {
      request_id: requestId(),
    },
  }, { status });
}

function pathSegments(url: URL) {
  return url.pathname.split("/").filter(Boolean);
}

serve(async (req) => {
  const url = new URL(req.url);
  const method = req.method.toUpperCase();
  const parts = pathSegments(url);

  if (url.pathname === "/stream-studio-phase1/health") {
    return ok({ status: "ok", service: "stream-studio-phase1" });
  }

  const base = ["stream-studio-phase1", "api", "stream-studio"];
  if (base.some((v, i) => parts[i] !== v)) {
    return fail(404, "not_found", "Route not found.");
  }

  const rest = parts.slice(base.length);

  if (method === "POST" && rest.length === 1 && rest[0] === "projects") {
    const body = await req.json();
    const nextNo = String(projects.length + 1).padStart(3, "0");
    const now = new Date().toISOString();
    const row = {
      creator_project_id: `prj-demo-${nextNo}`,
      project_code: `SS-${nextNo}`,
      project_title: body.project_title ?? "Untitled Project",
      project_status: "draft",
      owner_creator_ref: body.owner_creator_ref ?? "creator_demo_owner",
      default_language: body.default_language ?? "en",
      created_at: now,
      updated_at: now,
    };
    projects.unshift(row);
    return ok({ project: row });
  }

  if (method === "GET" && rest.length === 1 && rest[0] === "projects") {
    return ok({
      items: projects.map((row) => ({
        creator_project_id: row.creator_project_id,
        project_code: row.project_code,
        project_title: row.project_title,
        project_status: row.project_status,
        owner_creator_ref: row.owner_creator_ref,
        updated_at: row.updated_at,
      })),
      page: {
        next_cursor: null,
        limit: Number(url.searchParams.get("limit") || 20),
      },
    });
  }

  if (rest.length === 2 && rest[0] === "projects" && method === "GET") {
    const project = projects.find((row) => row.creator_project_id === rest[1]);
    if (!project) return fail(404, "project_not_found", "Project not found.");
    return ok({
      project,
      members_summary: {
        total_count: 1,
        active_count: 1,
      },
      readiness_summary: {
        has_primary_asset: drafts.some((row) => row.creator_project_id === rest[1]),
        has_publish_setting: Array.from(publishSettings.values()).some((row) => row.creator_project_id === rest[1]),
        has_blocker: false,
      },
    });
  }

  if (rest.length === 2 && rest[0] === "projects" && method === "PATCH") {
    const body = await req.json();
    const project = projects.find((row) => row.creator_project_id === rest[1]);
    if (!project) return fail(404, "project_not_found", "Project not found.");
    project.project_title = body.project_title ?? project.project_title;
    project.project_summary = body.project_summary ?? project.project_summary ?? null;
    project.default_language = body.default_language ?? project.default_language;
    project.updated_at = new Date().toISOString();
    project.version = Number(project.version || 1) + 1;
    return ok({
      project: {
        creator_project_id: project.creator_project_id,
        project_title: project.project_title,
        project_summary: project.project_summary ?? null,
        default_language: project.default_language,
        updated_at: project.updated_at,
        version: project.version,
      },
    });
  }

  if (method === "POST" && rest.length === 2 && rest[0] === "uploads" && rest[1] === "sessions") {
    const body = await req.json();
    const id = `upl-${crypto.randomUUID()}`;
    const row = {
      creator_upload_job_id: id,
      creator_project_id: body.creator_project_id,
      resumable_session_ref: `resumable-${crypto.randomUUID()}`,
      source_filename: body.source_filename ?? "unnamed.mp4",
      file_size_bytes: body.file_size_bytes ?? 0,
      ingest_status: "session_created",
      updated_at: new Date().toISOString(),
    };
    uploads.unshift(row);
    return ok({ upload_job: row });
  }

  if (rest.length === 2 && rest[0] === "uploads" && method === "GET") {
    const row = uploads.find((v) => v.creator_upload_job_id === rest[1]);
    if (!row) return fail(404, "upload_not_found", "Upload job not found.");
    return ok({ upload_job: row });
  }

  if (rest.length === 3 && rest[0] === "uploads" && rest[2] === "complete" && method === "POST") {
    const row = uploads.find((v) => v.creator_upload_job_id === rest[1]);
    if (!row) return fail(404, "upload_not_found", "Upload job not found.");
    row.ingest_status = "uploaded";
    row.updated_at = new Date().toISOString();
    return ok({ upload_job: row });
  }

  if (rest.length === 3 && rest[0] === "uploads" && rest[2] === "retry" && method === "POST") {
    const row = uploads.find((v) => v.creator_upload_job_id === rest[1]);
    if (!row) return fail(404, "upload_not_found", "Upload job not found.");
    row.ingest_status = "retry_requested";
    row.updated_at = new Date().toISOString();
    return ok({ upload_job: row });
  }

  if (method === "POST" && rest.length === 1 && rest[0] === "video-drafts") {
    const body = await req.json();
    const row = {
      creator_video_draft_id: `drf-${crypto.randomUUID()}`,
      creator_project_id: body.creator_project_id,
      asset_ref: body.asset_ref ?? `asset-${crypto.randomUUID()}`,
      draft_title: body.draft_title ?? "Untitled Draft",
      draft_summary: body.draft_summary ?? null,
      thumbnail_asset_ref: null,
      draft_status: "editing",
      version: 1,
      updated_at: new Date().toISOString(),
    };
    drafts.unshift(row);
    return ok({ video_draft: row });
  }

  if (rest.length === 3 && rest[0] === "video-drafts" && rest[2] === "metadata" && method === "PATCH") {
    const body = await req.json();
    const row = drafts.find((v) => v.creator_video_draft_id === rest[1]);
    if (!row) return fail(404, "draft_not_found", "Video draft not found.");
    row.draft_title = body.draft_title ?? row.draft_title;
    row.draft_summary = body.draft_summary ?? row.draft_summary;
    row.updated_at = new Date().toISOString();
    row.version = Number(row.version || 1) + 1;
    return ok({ video_draft: row });
  }

  if (rest.length === 3 && rest[0] === "video-drafts" && rest[2] === "thumbnail" && method === "PUT") {
    const body = await req.json();
    const row = drafts.find((v) => v.creator_video_draft_id === rest[1]);
    if (!row) return fail(404, "draft_not_found", "Video draft not found.");
    row.thumbnail_asset_ref = body.thumbnail_asset_ref ?? null;
    row.updated_at = new Date().toISOString();
    return ok({ video_draft: row });
  }

  if (rest.length === 3 && rest[0] === "video-drafts" && rest[2] === "subtitle-tracks" && method === "POST") {
    return ok({
      subtitle_track: {
        creator_subtitle_track_id: `sub-${crypto.randomUUID()}`,
        creator_video_draft_id: rest[1],
        language_code: "en",
        source_type: "upload",
      },
    });
  }

  if (rest.length === 5 && rest[0] === "video-drafts" && rest[2] === "edit-markers" && method === "PUT") {
    return ok({
      edit_marker: {
        creator_edit_marker_id: `mrk-${crypto.randomUUID()}`,
        creator_video_draft_id: rest[1],
        client_marker_key: rest[3],
        marker_label: "Intro",
      },
    });
  }

  if (rest.length === 2 && rest[0] === "publish-settings" && method === "PUT") {
    const body = await req.json();
    const row = {
      creator_publish_setting_id: `ps-${crypto.randomUUID()}`,
      publish_ref: rest[1],
      creator_project_id: body.creator_project_id ?? "prj-demo-001",
      visibility_code: body.visibility_code ?? "private",
      destination_ref: body.destination_ref ?? "streaming_internal",
      rights_check_status: "pending",
      readiness_status: "pending",
      updated_at: new Date().toISOString(),
    };
    publishSettings.set(rest[1], row);
    return ok({ publish_setting: row });
  }

  if (rest.length === 3 && rest[0] === "publish-settings" && rest[2] === "validate" && method === "POST") {
    return ok({
      readiness: {
        publish_ref: rest[1],
        readiness_status: "ready",
        blockers: [],
        checked_at: new Date().toISOString(),
      },
    });
  }

  if (method === "POST" && rest.length === 1 && rest[0] === "publish-requests") {
    const body = await req.json();
    const row = {
      creator_publish_request_id: `pubreq-${crypto.randomUUID()}`,
      publish_ref: body.publish_ref,
      request_channel: "publish_now",
      request_status: "registered",
      execute_after: null,
      created_at: new Date().toISOString(),
    };
    publishHistory.unshift(row);
    return ok({ publish_request: row });
  }

  if (method === "POST" && rest.length === 2 && rest[0] === "publish-requests" && rest[1] === "schedule") {
    const body = await req.json();
    const row = {
      creator_publish_request_id: `pubreq-${crypto.randomUUID()}`,
      publish_ref: body.publish_ref,
      request_channel: "schedule",
      request_status: "scheduled",
      execute_after: body.execute_after,
      created_at: new Date().toISOString(),
    };
    publishHistory.unshift(row);
    return ok({ publish_request: row });
  }

  if (method === "GET" && rest.length === 1 && rest[0] === "publish-history") {
    return ok({
      items: publishHistory,
      page: {
        next_cursor: null,
        limit: Number(url.searchParams.get("limit") || 20),
      },
    });
  }

  return fail(404, "not_found", "Route not found.");
});
EOF

cat > "$STUDIO/sql/001_stream_studio_phase1_core.sql" <<'EOF'
-- ============================================================
-- STREAM STUDIO PHASE1 CORE SQL STARTER
-- Reviewer: Sato (DB)
-- Target: PERSONA_DATABASE_URL
-- Schema: streaming
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS streaming;

CREATE TABLE IF NOT EXISTS streaming.creator_project (
  creator_project_id text PRIMARY KEY,
  workspace_id text NOT NULL,
  project_code text NOT NULL UNIQUE,
  project_title text NOT NULL,
  project_summary text NULL,
  project_status text NOT NULL DEFAULT 'draft',
  owner_creator_ref text NOT NULL,
  default_language text NOT NULL,
  initial_visibility_hint text NULL,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_project_project_status_chk
    CHECK (project_status IN ('draft','ready','blocked','archived')),
  CONSTRAINT creator_project_version_chk
    CHECK (version >= 1)
);

CREATE TABLE IF NOT EXISTS streaming.creator_upload_job (
  creator_upload_job_id text PRIMARY KEY,
  creator_project_id text NOT NULL REFERENCES streaming.creator_project(creator_project_id) ON DELETE CASCADE,
  resumable_session_ref text NOT NULL,
  source_filename text NOT NULL,
  file_size_bytes bigint NOT NULL DEFAULT 0,
  ingest_status text NOT NULL DEFAULT 'session_created',
  retry_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_upload_job_file_size_chk
    CHECK (file_size_bytes >= 0),
  CONSTRAINT creator_upload_job_ingest_status_chk
    CHECK (ingest_status IN ('session_created','uploading','uploaded','ingesting','ready','failed','retry_requested'))
);

CREATE TABLE IF NOT EXISTS streaming.creator_video_draft (
  creator_video_draft_id text PRIMARY KEY,
  creator_project_id text NOT NULL REFERENCES streaming.creator_project(creator_project_id) ON DELETE CASCADE,
  asset_ref text NOT NULL,
  draft_title text NOT NULL,
  draft_summary text NULL,
  thumbnail_asset_ref text NULL,
  draft_status text NOT NULL DEFAULT 'editing',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_video_draft_draft_status_chk
    CHECK (draft_status IN ('editing','review_pending','approved','blocked','published')),
  CONSTRAINT creator_video_draft_version_chk
    CHECK (version >= 1)
);

CREATE TABLE IF NOT EXISTS streaming.creator_subtitle_track (
  creator_subtitle_track_id text PRIMARY KEY,
  creator_video_draft_id text NOT NULL REFERENCES streaming.creator_video_draft(creator_video_draft_id) ON DELETE CASCADE,
  language_code text NOT NULL,
  source_type text NOT NULL DEFAULT 'upload',
  source_ref text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_subtitle_track_source_type_chk
    CHECK (source_type IN ('upload','manual','import'))
);

CREATE TABLE IF NOT EXISTS streaming.creator_edit_marker (
  creator_edit_marker_id text PRIMARY KEY,
  creator_video_draft_id text NOT NULL REFERENCES streaming.creator_video_draft(creator_video_draft_id) ON DELETE CASCADE,
  client_marker_key text NOT NULL,
  marker_label text NOT NULL,
  marker_type text NOT NULL DEFAULT 'chapter',
  start_ms bigint NOT NULL,
  end_ms bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_edit_marker_start_ms_chk CHECK (start_ms >= 0),
  CONSTRAINT creator_edit_marker_end_ms_chk CHECK (end_ms >= start_ms),
  CONSTRAINT creator_edit_marker_marker_type_chk CHECK (marker_type IN ('chapter','highlight','warning')),
  CONSTRAINT creator_edit_marker_draft UNIQUE (creator_video_draft_id, client_marker_key)
);

CREATE TABLE IF NOT EXISTS streaming.creator_publish_setting (
  creator_publish_setting_id text PRIMARY KEY,
  publish_ref text NOT NULL UNIQUE,
  creator_project_id text NOT NULL REFERENCES streaming.creator_project(creator_project_id) ON DELETE CASCADE,
  visibility_code text NOT NULL DEFAULT 'private',
  destination_ref text NOT NULL,
  rights_check_status text NOT NULL DEFAULT 'pending',
  readiness_status text NOT NULL DEFAULT 'pending',
  scheduled_at timestamptz NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_publish_setting_visibility_code_chk
    CHECK (visibility_code IN ('private','unlisted','public')),
  CONSTRAINT creator_publish_setting_rights_check_status_chk
    CHECK (rights_check_status IN ('pending','passed','failed')),
  CONSTRAINT creator_publish_setting_readiness_status_chk
    CHECK (readiness_status IN ('pending','ready','blocked'))
);

CREATE TABLE IF NOT EXISTS streaming.creator_publish_request (
  creator_publish_request_id text PRIMARY KEY,
  publish_ref text NOT NULL,
  request_channel text NOT NULL,
  request_status text NOT NULL DEFAULT 'registered',
  execute_after timestamptz NULL,
  idempotency_key text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_publish_request_request_channel_chk
    CHECK (request_channel IN ('publish_now','schedule')),
  CONSTRAINT creator_publish_request_request_status_chk
    CHECK (request_status IN ('registered','scheduled','running','succeeded','failed'))
);

CREATE TABLE IF NOT EXISTS streaming.creator_runtime_job (
  creator_runtime_job_id text PRIMARY KEY,
  job_type text NOT NULL,
  target_ref text NOT NULL,
  state text NOT NULL DEFAULT 'queued',
  priority_code text NOT NULL DEFAULT 'normal',
  attempt_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  next_retry_at timestamptz NULL,
  idempotency_key text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_runtime_job_state_chk
    CHECK (state IN ('queued','running','retry_wait','dead_letter','succeeded')),
  CONSTRAINT creator_runtime_job_priority_code_chk
    CHECK (priority_code IN ('low','normal','high')),
  CONSTRAINT creator_runtime_job_attempt_count_chk
    CHECK (attempt_count >= 0),
  CONSTRAINT creator_runtime_job_max_attempts_chk
    CHECK (max_attempts >= 1)
);

CREATE TABLE IF NOT EXISTS streaming.creator_dead_letter_entry (
  creator_dead_letter_entry_id text PRIMARY KEY,
  job_type text NOT NULL,
  target_ref text NOT NULL,
  operator_action text NOT NULL DEFAULT 'unreviewed',
  attempt_count integer NOT NULL DEFAULT 0,
  error_summary text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_dead_letter_entry_attempt_count_chk CHECK (attempt_count >= 0),
  CONSTRAINT creator_dead_letter_entry_operator_action_chk
    CHECK (operator_action IN ('unreviewed','retry_requested','dismissed'))
);

CREATE TABLE IF NOT EXISTS streaming.creator_audit_event (
  creator_audit_event_id text PRIMARY KEY,
  actor_ref text NOT NULL,
  actor_role_code text NOT NULL,
  action_code text NOT NULL,
  target_ref text NOT NULL,
  result_code text NOT NULL,
  event_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_audit_event_role_code_chk
    CHECK (actor_role_code IN ('owner','editor','reviewer','system')),
  CONSTRAINT creator_audit_event_result_code_chk
    CHECK (result_code IN ('accepted','rejected','error','queued'))
);

CREATE INDEX IF NOT EXISTS idx_creator_project_workspace_updated
  ON streaming.creator_project (workspace_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_creator_upload_job_project_updated
  ON streaming.creator_upload_job (creator_project_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_creator_video_draft_project_updated
  ON streaming.creator_video_draft (creator_project_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_creator_publish_request_publish_ref_created
  ON streaming.creator_publish_request (publish_ref, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_creator_runtime_job_state_next_retry
  ON streaming.creator_runtime_job (state, next_retry_at);

CREATE INDEX IF NOT EXISTS idx_creator_audit_event_target_ref_created
  ON streaming.creator_audit_event (target_ref, created_at DESC);
EOF

cat > "$STUDIO/sql/002_stream_studio_phase1_seed.sql" <<'EOF'
-- ============================================================
-- STREAM STUDIO PHASE1 SEED SQL
-- Reviewer: Sato (DB)
-- ============================================================

INSERT INTO streaming.creator_project (
  creator_project_id,
  workspace_id,
  project_code,
  project_title,
  project_summary,
  project_status,
  owner_creator_ref,
  default_language
) VALUES (
  'prj-demo-001',
  'ws-demo-001',
  'SS-001',
  'Demo Creator Project',
  'Starter seed project for StreamStudio phase1.',
  'draft',
  'creator_demo_owner',
  'en'
)
ON CONFLICT (creator_project_id) DO NOTHING;

INSERT INTO streaming.creator_upload_job (
  creator_upload_job_id,
  creator_project_id,
  resumable_session_ref,
  source_filename,
  file_size_bytes,
  ingest_status
) VALUES (
  'upl-demo-001',
  'prj-demo-001',
  'resumable-demo-001',
  'pilot-episode.mp4',
  104857600,
  'session_created'
)
ON CONFLICT (creator_upload_job_id) DO NOTHING;

INSERT INTO streaming.creator_video_draft (
  creator_video_draft_id,
  creator_project_id,
  asset_ref,
  draft_title,
  draft_summary,
  draft_status
) VALUES (
  'drf-demo-001',
  'prj-demo-001',
  'asset-demo-001',
  'Pilot Episode Draft',
  'Starter draft.',
  'editing'
)
ON CONFLICT (creator_video_draft_id) DO NOTHING;

INSERT INTO streaming.creator_publish_setting (
  creator_publish_setting_id,
  publish_ref,
  creator_project_id,
  visibility_code,
  destination_ref,
  rights_check_status,
  readiness_status
) VALUES (
  'ps-demo-001',
  'pub-demo-001',
  'prj-demo-001',
  'private',
  'streaming_internal',
  'pending',
  'pending'
)
ON CONFLICT (creator_publish_setting_id) DO NOTHING;

INSERT INTO streaming.creator_audit_event (
  creator_audit_event_id,
  actor_ref,
  actor_role_code,
  action_code,
  target_ref,
  result_code,
  event_payload
) VALUES (
  'aud-demo-001',
  'creator_demo_owner',
  'owner',
  'seed_created',
  'prj-demo-001',
  'accepted',
  '{"seed":"phase1"}'::jsonb
)
ON CONFLICT (creator_audit_event_id) DO NOTHING;
EOF

cat > "$STUDIO/sql/003_stream_studio_phase1_verify.sql" <<'EOF'
-- ============================================================
-- STREAM STUDIO PHASE1 VERIFY SQL
-- Reviewer: Sato (DB)
-- ============================================================

SELECT 'creator_project' AS table_name, count(*) AS row_count
FROM streaming.creator_project
UNION ALL
SELECT 'creator_upload_job', count(*) FROM streaming.creator_upload_job
UNION ALL
SELECT 'creator_video_draft', count(*) FROM streaming.creator_video_draft
UNION ALL
SELECT 'creator_publish_setting', count(*) FROM streaming.creator_publish_setting
UNION ALL
SELECT 'creator_publish_request', count(*) FROM streaming.creator_publish_request
UNION ALL
SELECT 'creator_runtime_job', count(*) FROM streaming.creator_runtime_job
UNION ALL
SELECT 'creator_dead_letter_entry', count(*) FROM streaming.creator_dead_letter_entry
UNION ALL
SELECT 'creator_audit_event', count(*) FROM streaming.creator_audit_event
ORDER BY table_name;
EOF

cat > "$STUDIO/scripts/010_apply_phase1_sql.sh" <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
set -eu

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SQL_DIR="$BASE_DIR/sql"

if [ -z "${PERSONA_DATABASE_URL:-}" ]; then
  echo "ERROR: PERSONA_DATABASE_URL is not exported"
  exit 1
fi

echo "============================================================"
echo "STREAM STUDIO PHASE1 APPLY"
echo "TARGET: PERSONA_DATABASE_URL"
echo "SQLDIR : $SQL_DIR"
echo "Reviewer: Sato (DB)"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
\i $SQL_DIR/001_stream_studio_phase1_core.sql
\i $SQL_DIR/002_stream_studio_phase1_seed.sql
SQL

echo "DONE"
EOF
chmod +x "$STUDIO/scripts/010_apply_phase1_sql.sh"

cat > "$STUDIO/scripts/020_verify_phase1_sql.sh" <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
set -eu

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SQL_DIR="$BASE_DIR/sql"

if [ -z "${PERSONA_DATABASE_URL:-}" ]; then
  echo "ERROR: PERSONA_DATABASE_URL is not exported"
  exit 1
fi

echo "============================================================"
echo "STREAM STUDIO PHASE1 VERIFY"
echo "TARGET: PERSONA_DATABASE_URL"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SQL_DIR/003_stream_studio_phase1_verify.sql"

echo "DONE"
EOF
chmod +x "$STUDIO/scripts/020_verify_phase1_sql.sh"

cat > "$WATCH/docs/000_STREAMWATCH_IMPLEMENTATION_BOUNDARY.md" <<'EOF'
# ============================================================
# STREAMWATCH IMPLEMENTATION BOUNDARY
# ============================================================

status: implementation-boundary
system: StreamingOS
app: StreamWatch
phase: shell-starter
schema: streaming

fixed_scope_in_this_bundle:
- profile-aware viewer shell
- fixed mobile primary navigation
- library semantics split
- category / home / search / library / following skeleton
- continue watching and entitlement summary placeholders
- tv handoff placeholder

not_done_in_this_bundle:
- real playback runtime
- real entitlement refresh
- real commerce execution
- real cast claim flow
- real restriction enforcement backend
- real profile persistence

reason:
Only the integrated canonical summary is present in this chat context.
This starter implementation keeps the viewer shell additive and safe
until the exact StreamWatch screen / API / runtime design set is loaded.
EOF

cat > "$WATCH/web/index.html" <<'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>StreamWatch Starter</title>
  <link rel="stylesheet" href="./app.css" />
</head>
<body>
  <div class="app">
    <header class="topbar">
      <div>
        <h1>StreamWatch</h1>
        <p>Viewer shell starter for StreamingOS.</p>
      </div>
      <button id="profile-btn">Viewer Profile: Main</button>
    </header>

    <nav class="nav">
      <button class="tab active" data-screen="home">Home</button>
      <button class="tab" data-screen="category">Category</button>
      <button class="tab" data-screen="search">Search</button>
      <button class="tab" data-screen="library">Library</button>
      <button class="tab" data-screen="following">Following</button>
    </nav>

    <main>
      <section id="home" class="screen active">
        <div class="hero">
          <h2>Continue Watching</h2>
          <div id="continue-list" class="card-list"></div>
        </div>
      </section>

      <section id="category" class="screen">
        <h2>Category Tree</h2>
        <ul id="category-list"></ul>
      </section>

      <section id="search" class="screen">
        <h2>Search</h2>
        <input id="search-input" placeholder="Search title or creator" />
        <div id="search-results" class="card-list"></div>
      </section>

      <section id="library" class="screen">
        <h2>Library</h2>
        <div class="library-grid">
          <div class="panel"><h3>Favorites</h3><ul id="favorites-list"></ul></div>
          <div class="panel"><h3>Watch Later</h3><ul id="watch-later-list"></ul></div>
          <div class="panel"><h3>History</h3><ul id="history-list"></ul></div>
          <div class="panel"><h3>Playlists</h3><ul id="playlist-list"></ul></div>
          <div class="panel"><h3>Entitled</h3><ul id="entitled-list"></ul></div>
        </div>
      </section>

      <section id="following" class="screen">
        <h2>Following</h2>
        <ul id="following-list"></ul>
      </section>
    </main>
  </div>

  <script src="./app.js"></script>
</body>
</html>
EOF

cat > "$WATCH/web/app.css" <<'EOF'
:root {
  color-scheme: dark;
  --bg: #0f1318;
  --panel: #18202a;
  --line: #2e3a49;
  --text: #edf4ff;
  --muted: #9fb1c6;
  --accent: #7cc4ff;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, sans-serif;
}
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px;
}
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.nav {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 18px 0;
}
button, input {
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--panel);
  color: var(--text);
  padding: 12px 14px;
}
.tab.active {
  color: var(--accent);
  border-color: var(--accent);
}
.screen { display: none; }
.screen.active { display: block; }
.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
  gap: 12px;
}
.card, .panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 16px;
}
.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
  gap: 12px;
}
ul {
  margin: 0;
  padding-left: 18px;
}
.hero {
  margin-top: 12px;
}
EOF

cat > "$WATCH/web/app.js" <<'EOF'
const data = {
  continueWatching: [
    { title: "Pilot Live Archive", progress: "68%", kind: "archive" },
    { title: "Studio Behind The Scenes", progress: "24%", kind: "clip" },
    { title: "Member Q&A", progress: "92%", kind: "live archive" }
  ],
  categories: [
    "Live",
    "Series",
    "Clips",
    "Gaming",
    "Music",
    "Education",
    "Membership"
  ],
  favorites: ["Pilot Live Archive", "Top Creator Clips"],
  watchLater: ["New Series Episode 2", "Collab Highlight Reel"],
  history: ["Pilot Live Archive", "Weekly Creator Update", "Highlights Pack"],
  playlists: ["Weekend Watchlist", "Learning Track"],
  entitled: ["Member Q&A Archive", "Paid Concert Replay"],
  following: ["Creator Alpha", "Studio Delta", "Channel Neon"]
};

function renderCards(id, items) {
  document.getElementById(id).innerHTML = items.map((item) => `
    <div class="card">
      <strong>${item.title}</strong>
      <div>Kind: ${item.kind}</div>
      <div>Progress: ${item.progress}</div>
    </div>
  `).join("");
}

function renderList(id, items) {
  document.getElementById(id).innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function setScreen(name) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  document.querySelectorAll(".tab").forEach((el) => el.classList.remove("active"));
  document.getElementById(name).classList.add("active");
  document.querySelector(`[data-screen="${name}"]`).classList.add("active");
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => setScreen(tab.dataset.screen));
});

document.getElementById("search-input").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  const all = [...data.continueWatching.map((v) => v.title), ...data.history, ...data.entitled];
  const filtered = all.filter((v) => v.toLowerCase().includes(q));
  document.getElementById("search-results").innerHTML = filtered.map((v) => `
    <div class="card"><strong>${v}</strong></div>
  `).join("");
});

document.getElementById("profile-btn").addEventListener("click", () => {
  const current = document.getElementById("profile-btn").textContent.includes("Main") ? "Kids" : "Main";
  document.getElementById("profile-btn").textContent = `Viewer Profile: ${current}`;
});

renderCards("continue-list", data.continueWatching);
renderList("category-list", data.categories);
renderList("favorites-list", data.favorites);
renderList("watch-later-list", data.watchLater);
renderList("history-list", data.history);
renderList("playlist-list", data.playlists);
renderList("entitled-list", data.entitled);
renderList("following-list", data.following);
EOF

echo "============================================================"
echo "DONE"
echo "Generated:"
echo "- $ROOT/README_STREAMING_IMPLEMENTATION.md"
echo "- $STUDIO/web"
echo "- $STUDIO/supabase/functions/stream-studio-phase1"
echo "- $STUDIO/sql"
echo "- $STUDIO/scripts"
echo "- $WATCH/web"
echo "- $WATCH/docs"
echo "============================================================"

