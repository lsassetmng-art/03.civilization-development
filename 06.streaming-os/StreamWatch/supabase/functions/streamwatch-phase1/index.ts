import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type Payload = Record<string, unknown>;

function json(status: number, body: Payload) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type, authorization, apikey, x-client-info"
    }
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return json(200, { ok: true });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  let body: Payload = {};
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const action = String(body.action ?? "");

  switch (action) {
    case "profile_list":
      return json(200, {
        profiles: [
          { viewer_profile_id: "profile-main", display_name: "Boss", restriction_mode: "standard" },
          { viewer_profile_id: "profile-kid", display_name: "Kid", restriction_mode: "family_safe" }
        ]
      });

    case "profile_select":
      return json(200, {
        result: "ok",
        active_viewer_profile_id: body.viewer_profile_id ?? null,
        effective_restriction_context: "standard"
      });

    case "home_feed_read":
      return json(200, {
        feed_scope: body.feed_scope ?? "personalized",
        feed_items: [
          { target_type: "video_asset", target_id: "uuid-demo-1", display_reason: "continue_watching" },
          { target_type: "live_session", target_id: "uuid-demo-2", display_reason: "live_now" }
        ]
      });

    case "category_tree_read":
      return json(200, {
        nodes: [
          { category_node_id: "cat-ent", label: "Entertainment", depth: 0 },
          { category_node_id: "cat-movie", label: "Movies", depth: 1 },
          { category_node_id: "cat-live", label: "Live Events", depth: 1 }
        ]
      });

    case "library_read":
      return json(200, {
        sections: {
          favorites: [{ target_id: "fav-1", title: "Archived Special Event" }],
          watch_later: [{ target_id: "wl-1", title: "Science Documentary" }],
          history: [{ target_id: "his-1", title: "Travel Clip" }],
          entitled: [{ target_id: "ent-1", title: "Membership Live Show" }]
        }
      });

    case "progress_upsert":
      return json(200, {
        result: "ok",
        continuity_state: "in_progress",
        device_mode: body.device_mode ?? null,
        target_id: body.target_id ?? null
      });

    case "tv_handoff_start":
      return json(200, {
        result: "ok",
        handoff_session_id: "handoff-demo-1",
        claim_code: "SW-4821"
      });

    case "tv_handoff_claim":
      return json(200, {
        result: "ok",
        handoff_session_id: body.handoff_session_id ?? null,
        claimed: true
      });

    case "entitlement_read":
      return json(200, {
        target_type: body.target_type ?? "video_asset",
        target_id: body.target_id ?? null,
        entitlement_state: "membership_entitled",
        playback_cta: "watch_live",
        archive_access_flag: true
      });

    case "membership_join_execute":
      return json(200, {
        result: "ok",
        transaction_state: "confirmed",
        entitlement_refresh_required: true
      });

    default:
      return json(400, {
        error: "unknown_action",
        allowed_actions: [
          "profile_list",
          "profile_select",
          "home_feed_read",
          "category_tree_read",
          "library_read",
          "progress_upsert",
          "tv_handoff_start",
          "tv_handoff_claim",
          "entitlement_read",
          "membership_join_execute"
        ]
      });
  }
});
