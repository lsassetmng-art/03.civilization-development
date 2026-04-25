import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type JsonRecord = Record<string, unknown>;

const corsHeaders: HeadersInit = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "content-type": "application/json; charset=utf-8"
};

function json(status: number, body: JsonRecord): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: corsHeaders
  });
}

function ok(body: JsonRecord): Response {
  return json(200, { ok: true, ...body });
}

function badRequest(message: string): Response {
  return json(400, { ok: false, error: message });
}

function notFound(pathname: string): Response {
  return json(404, { ok: false, error: `Route not found: ${pathname}` });
}

async function readJsonSafe(request: Request): Promise<JsonRecord> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function dashboard(): Response {
  return ok({
    summary: {
      draft_projects: 3,
      uploads_processing: 1,
      approval_waiting: 2,
      scheduled_today: 1
    }
  });
}

function projects(): Response {
  return ok({
    items: [
      {
        creator_project_id: "cp_001",
        project_title: "Spring Launch Stream",
        project_status: "project_draft"
      },
      {
        creator_project_id: "cp_002",
        project_title: "Creator Interview Archive",
        project_status: "project_publish_ready"
      }
    ]
  });
}

function uploadQueue(): Response {
  return ok({
    items: [
      {
        creator_upload_job_id: "up_001",
        upload_target_type: "project_asset",
        upload_status: "processing"
      }
    ]
  });
}

async function projectCreate(request: Request): Promise<Response> {
  const payload = await readJsonSafe(request);
  const projectTitle = String(payload.project_title ?? "");

  if (!projectTitle) {
    return badRequest("project_title is required");
  }

  return ok({
    accepted: true,
    project: {
      creator_project_id: "cp_new_001",
      project_title: projectTitle,
      project_status: "project_draft"
    }
  });
}

async function uploadCreate(request: Request): Promise<Response> {
  const payload = await readJsonSafe(request);

  return ok({
    accepted: true,
    upload_job: {
      creator_upload_job_id: "up_new_001",
      upload_target_type: String(payload.upload_target_type ?? "project_asset"),
      upload_status: "queued"
    }
  });
}

async function approvalRequest(request: Request): Promise<Response> {
  const payload = await readJsonSafe(request);
  const creatorProjectId = String(payload.creator_project_id ?? "");

  if (!creatorProjectId) {
    return badRequest("creator_project_id is required");
  }

  return ok({
    accepted: true,
    approval_request: {
      creator_project_id: creatorProjectId,
      approval_type: String(payload.approval_type ?? "publish_gate"),
      request_status: "waiting_review"
    }
  });
}

async function publishRequest(request: Request): Promise<Response> {
  const payload = await readJsonSafe(request);
  const creatorProjectId = String(payload.creator_project_id ?? "");

  if (!creatorProjectId) {
    return badRequest("creator_project_id is required");
  }

  return ok({
    accepted: true,
    publish_request: {
      creator_project_id: creatorProjectId,
      publish_mode: String(payload.publish_mode ?? "publish_now"),
      publish_status: "requested"
    }
  });
}

serve(async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  if (request.method === "GET" && pathname.endsWith("/api/v1/streamstudio/dashboard")) {
    return dashboard();
  }

  if (request.method === "GET" && pathname.endsWith("/api/v1/streamstudio/projects")) {
    return projects();
  }

  if (request.method === "GET" && pathname.endsWith("/api/v1/streamstudio/upload-queue")) {
    return uploadQueue();
  }

  if (request.method === "POST" && pathname.endsWith("/api/v1/streamstudio/project/create")) {
    return await projectCreate(request);
  }

  if (request.method === "POST" && pathname.endsWith("/api/v1/streamstudio/upload/create")) {
    return await uploadCreate(request);
  }

  if (request.method === "POST" && pathname.endsWith("/api/v1/streamstudio/approval/request")) {
    return await approvalRequest(request);
  }

  if (request.method === "POST" && pathname.endsWith("/api/v1/streamstudio/publish/request")) {
    return await publishRequest(request);
  }

  return notFound(pathname);
});
