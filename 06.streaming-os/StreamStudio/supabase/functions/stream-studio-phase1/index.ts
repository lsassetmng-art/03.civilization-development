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
