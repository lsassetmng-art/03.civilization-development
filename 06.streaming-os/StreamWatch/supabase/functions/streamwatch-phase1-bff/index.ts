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

function profileBootstrap(): Response {
  return ok({
    viewer_profile: {
      viewer_profile_id: "vp_demo_primary",
      display_name: "Primary Viewer",
      restriction_level: "standard"
    }
  });
}

function home(): Response {
  return ok({
    continue_watching: [
      {
        content_id: "cw_001",
        title: "Space Talk Episode 1",
        resume_ratio: 0.42
      }
    ],
    featured: [
      {
        content_id: "ft_001",
        title: "Creator Spotlight Live",
        access_state: "membership_cta"
      },
      {
        content_id: "ft_002",
        title: "Open Documentary",
        access_state: "playable"
      }
    ]
  });
}

function categoryTree(): Response {
  return ok({
    nodes: [
      {
        category_node_id: "cat_root_live",
        category_name: "Live",
        depth: 0
      },
      {
        category_node_id: "cat_root_archive",
        category_name: "Archive",
        depth: 0
      },
      {
        category_node_id: "cat_root_membership",
        category_name: "Membership",
        depth: 0
      }
    ]
  });
}

function library(): Response {
  return ok({
    history_preview: [
      {
        content_id: "hist_001",
        title: "Archive Concert",
        last_position_seconds: 932
      }
    ],
    playlists: [],
    favorites: [],
    watch_later: []
  });
}

async function progressUpsert(request: Request): Promise<Response> {
  const payload = await readJsonSafe(request);
  const viewerProfileId = String(payload.viewer_profile_id ?? "");
  const contentId = String(payload.content_id ?? "");

  if (!viewerProfileId || !contentId) {
    return badRequest("viewer_profile_id and content_id are required");
  }

  return ok({
    accepted: true,
    saved_progress: {
      viewer_profile_id: viewerProfileId,
      content_id: contentId,
      progress_ratio: Number(payload.progress_ratio ?? 0)
    }
  });
}

async function tvHandoffStart(request: Request): Promise<Response> {
  const payload = await readJsonSafe(request);
  const viewerProfileId = String(payload.viewer_profile_id ?? "");
  const contentId = String(payload.content_id ?? "");
  const targetDeviceRoute = String(payload.target_device_route ?? "");

  if (!viewerProfileId || !contentId || !targetDeviceRoute) {
    return badRequest("viewer_profile_id, content_id, target_device_route are required");
  }

  return ok({
    accepted: true,
    handoff_session: {
      handoff_session_id: "handoff_demo_001",
      viewer_profile_id: viewerProfileId,
      content_id: contentId,
      target_device_route: targetDeviceRoute,
      handoff_status: "pending"
    }
  });
}

async function membershipJoin(request: Request): Promise<Response> {
  const payload = await readJsonSafe(request);
  const membershipId = String(payload.membership_id ?? "membership_demo_001");

  return ok({
    accepted: true,
    membership_join_result: {
      membership_id: membershipId,
      result_status: "join_requested"
    }
  });
}

serve(async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  if (request.method === "GET" && pathname.endsWith("/api/v1/streamwatch/profile/bootstrap")) {
    return profileBootstrap();
  }

  if (request.method === "GET" && pathname.endsWith("/api/v1/streamwatch/home")) {
    return home();
  }

  if (request.method === "GET" && pathname.endsWith("/api/v1/streamwatch/category-tree")) {
    return categoryTree();
  }

  if (request.method === "GET" && pathname.endsWith("/api/v1/streamwatch/library")) {
    return library();
  }

  if (request.method === "POST" && pathname.endsWith("/api/v1/streamwatch/progress/upsert")) {
    return await progressUpsert(request);
  }

  if (request.method === "POST" && pathname.endsWith("/api/v1/streamwatch/tv-handoff/start")) {
    return await tvHandoffStart(request);
  }

  if (request.method === "POST" && pathname.endsWith("/api/v1/streamwatch/membership/join")) {
    return await membershipJoin(request);
  }

  return notFound(pathname);
});
